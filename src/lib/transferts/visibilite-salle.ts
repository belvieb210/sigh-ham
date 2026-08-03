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

/**
 * Patients visibles dans la file d'attente d'une salle (transfert confirmé uniquement).
 */
export async function listerPatientsFileAttenteSalle(codeSalle: CodeSalle) {
  return prisma.fileAttente.findMany({
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
                include: { typeExamen: true },
              },
              enregistrementsReception: {
                orderBy: { enregistreLe: "desc" },
                take: 1,
                select: { medecinResponsable: true },
              },
            },
          },
          transferts: {
            where: filtreTransfertVisibleSalle(codeSalle),
            orderBy: { emisLe: "desc" },
            take: 1,
            include: {
              salleOrigine: { select: { code: true, nom: true } },
            },
          },
        },
      },
    },
    orderBy: { numeroOrdre: "asc" },
  });
}

/**
 * Supprime les files d'attente créées avant la confirmation obligatoire
 * (transfert encore EN_ATTENTE à la réception).
 */
export async function nettoyerFilesAttenteNonConfirmees(): Promise<number> {
  const orphelines = await prisma.fileAttente.findMany({
    where: {
      passage: {
        transferts: {
          some: { statut: "EN_ATTENTE" },
        },
      },
    },
    select: { id: true },
  });

  if (orphelines.length === 0) return 0;

  const result = await prisma.fileAttente.deleteMany({
    where: { id: { in: orphelines.map((f) => f.id) } },
  });

  return result.count;
}
