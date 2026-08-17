import "server-only";
import type { CodeSalle, StatutTransfert } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Statuts de transfert pour lesquels un patient est visible dans la salle destination.
 * EN_ATTENTE = en attente de confirmation dans la salle d'origine (menu ⋮) → invisible ailleurs.
 */
export const STATUTS_TRANSFERT_VISIBLES_SALLE: StatutTransfert[] = [
  "ACCEPTE",
  "EN_TRAITEMENT",
  "TERMINE",
];

export function transfertVisibleEnSalleDestination(statut: StatutTransfert): boolean {
  return STATUTS_TRANSFERT_VISIBLES_SALLE.includes(statut);
}

/** Filtre Prisma réutilisable par Caisse, Infirmiers, Laboratoire, etc. */
export function filtreTransfertVisibleSalle(codeSalle: CodeSalle) {
  return {
    salleDestination: { code: codeSalle },
    statut: { in: STATUTS_TRANSFERT_VISIBLES_SALLE },
  } as const;
}

type FileAttenteAvecDossier = {
  id: string;
  arriveLe: Date;
  numeroOrdre: number;
  passage: { dossier: { id: string } };
};

/**
 * Une seule file par dossier patient dans une salle, même si plusieurs passages
 * ont été créés (transferts multi-origines).
 */
export function dedupliquerFilesAttenteParDossier<T extends FileAttenteAvecDossier>(
  files: T[]
): T[] {
  const parDossier = new Map<string, T>();

  const prefer = (a: T, b: T): T => {
    const ta = a.arriveLe.getTime();
    const tb = b.arriveLe.getTime();
    if (ta !== tb) return ta > tb ? a : b;
    return a.numeroOrdre <= b.numeroOrdre ? a : b;
  };

  for (const file of files) {
    const dossierId = file.passage.dossier.id;
    const existant = parDossier.get(dossierId);
    parDossier.set(dossierId, existant ? prefer(file, existant) : file);
  }

  return [...parDossier.values()].sort((a, b) => a.numeroOrdre - b.numeroOrdre);
}

/**
 * Patients visibles dans la file d'une salle :
 * — arrivée confirmée (origine a cliqué ⋮), ou
 * — patient originaire de cette salle (walk-in, encore sur place).
 * Un transfert EN_ATTENTE vers cette salle n'y apparaît jamais.
 */
export async function listerPatientsFileAttenteSalle(codeSalle: CodeSalle) {
  await nettoyerFilesAttenteNonConfirmees();

  const files = await prisma.fileAttente.findMany({
    where: {
      salle: { code: codeSalle },
      serviLe: null,
      AND: [
        {
          NOT: {
            passage: {
              transferts: {
                some: {
                  salleDestination: { code: codeSalle },
                  statut: "EN_ATTENTE",
                },
              },
            },
          },
        },
        {
          OR: [
            {
              passage: {
                transferts: { some: filtreTransfertVisibleSalle(codeSalle) },
              },
            },
            {
              passage: {
                transferts: { some: { salleOrigine: { code: codeSalle } } },
              },
            },
            {
              passage: { transferts: { none: {} } },
            },
          ],
        },
      ],
    },
    include: {
      passage: {
        include: {
          dossier: {
            include: {
              patient: true,
              examensLaboratoire: {
                where: { statut: { not: "ANNULE" } },
                include: { typeExamen: true, paquetBilan: true },
              },
              enregistrementsReception: {
                orderBy: { enregistreLe: "desc" },
                take: 1,
                select: {
                  medecinResponsable: true,
                  enregistreLe: true,
                  agent: { select: { prenom: true, nom: true } },
                },
              },
            },
          },
          transferts: {
            where: filtreTransfertVisibleSalle(codeSalle),
            orderBy: { emisLe: "desc" },
            take: 1,
            include: {
              salleOrigine: { select: { code: true, nom: true } },
              salleDestination: { select: { code: true, nom: true } },
              emetteur: { select: { prenom: true, nom: true } },
            },
          },
        },
      },
    },
    orderBy: { numeroOrdre: "asc" },
  });

  return dedupliquerFilesAttenteParDossier(files);
}

/**
 * Replace les files créées trop tôt sur la salle destination d'un transfert
 * encore EN_ATTENTE : le patient reste dans la salle d'origine jusqu'au ⋮.
 */
export async function nettoyerFilesAttenteNonConfirmees(): Promise<number> {
  const candidates = await prisma.fileAttente.findMany({
    where: {
      passage: {
        transferts: {
          some: { statut: "EN_ATTENTE" },
        },
      },
    },
    select: {
      id: true,
      salleId: true,
      passageId: true,
      passage: {
        select: {
          transferts: {
            where: { statut: "EN_ATTENTE" },
            select: { salleDestinationId: true, salleOrigineId: true },
          },
        },
      },
    },
  });

  const passageIds = [...new Set(candidates.map((f) => f.passageId))];
  const transfertsConfirmes =
    passageIds.length === 0
      ? []
      : await prisma.transfert.findMany({
          where: {
            passageId: { in: passageIds },
            statut: { in: STATUTS_TRANSFERT_VISIBLES_SALLE },
          },
          select: { passageId: true, salleDestinationId: true },
        });

  const dejaVisibles = new Set(
    transfertsConfirmes.map((t) => `${t.passageId}:${t.salleDestinationId}`)
  );

  const prematures = candidates.filter((f) => {
    const destEnAttente = f.passage.transferts.find(
      (t) => t.salleDestinationId === f.salleId
    );
    if (!destEnAttente) return false;
    return !dejaVisibles.has(`${f.passageId}:${f.salleId}`);
  });

  if (prematures.length === 0) return 0;

  let traites = 0;
  for (const f of prematures) {
    const destEnAttente = f.passage.transferts.find(
      (t) => t.salleDestinationId === f.salleId
    );
    if (!destEnAttente) continue;

    if (destEnAttente.salleOrigineId !== f.salleId) {
      await prisma.fileAttente.update({
        where: { id: f.id },
        data: {
          salleId: destEnAttente.salleOrigineId,
          serviLe: null,
          arriveLe: new Date(),
        },
      });
    } else {
      await prisma.fileAttente.delete({ where: { id: f.id } });
    }
    traites += 1;
  }

  return traites;
}
