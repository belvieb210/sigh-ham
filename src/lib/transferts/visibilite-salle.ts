import "server-only";
import type { CodeSalle, StatutTransfert } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Statuts de transfert pour lesquels un patient est visible dans la salle destination.
 * EN_ATTENTE = en attente de confirmation à la réception → invisible ailleurs.
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
 * Patients visibles dans la file d'attente d'une salle (transfert confirmé uniquement).
 */
export async function listerPatientsFileAttenteSalle(codeSalle: CodeSalle) {
  const files = await prisma.fileAttente.findMany({
    where: {
      salle: { code: codeSalle },
      serviLe: null,
      passage: {
        transferts: {
          some: filtreTransfertVisibleSalle(codeSalle),
        },
      },
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
 * Supprime les files d'attente créées trop tôt sur la salle *destination*
 * d'un transfert encore EN_ATTENTE (invisible tant que non confirmé).
 * Ne touche pas la file de la salle d'origine (ex. patient encore à la caisse).
 */
export async function nettoyerFilesAttenteNonConfirmees(): Promise<number> {
  const candidates = await prisma.fileAttente.findMany({
    where: {
      serviLe: null,
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
            select: { salleDestinationId: true },
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

  const ids = candidates
    .filter((f) =>
      f.passage.transferts.some((t) => t.salleDestinationId === f.salleId)
    )
    .filter((f) => !dejaVisibles.has(`${f.passageId}:${f.salleId}`))
    .map((f) => f.id);

  if (ids.length === 0) return 0;

  const result = await prisma.fileAttente.deleteMany({
    where: { id: { in: ids } },
  });

  return result.count;
}
