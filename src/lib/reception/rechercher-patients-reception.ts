import "server-only";
import { prisma } from "@/lib/prisma";
import type { ResultatRecherchePatientReception } from "@/lib/reception/types";

export type { ResultatRecherchePatientReception };

export async function rechercherPatientsReception(
  recherche: string,
  limite = 8
): Promise<ResultatRecherchePatientReception[]> {
  const terme = recherche.trim();
  if (terme.length < 2) return [];

  const patients = await prisma.patient.findMany({
    where: {
      OR: [
        { numeroPatient: { contains: terme, mode: "insensitive" } },
        { nom: { contains: terme, mode: "insensitive" } },
        { prenom: { contains: terme, mode: "insensitive" } },
        { telephone: { contains: terme, mode: "insensitive" } },
      ],
    },
    orderBy: { updatedAt: "desc" },
    take: limite,
    include: {
      dossiers: {
        where: { statut: { in: ["OUVERT", "EN_COURS"] } },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true },
      },
    },
  });

  return patients.map((patient) => ({
    numeroPatient: patient.numeroPatient,
    nomComplet: `${patient.nom} ${patient.prenom}`.trim(),
    telephone: patient.telephone ?? "—",
    dossierId: patient.dossiers[0]?.id,
  }));
}
