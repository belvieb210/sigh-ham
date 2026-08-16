import "server-only";
import type { CodeSalle } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { ResultatRecherchePatientReception } from "@/lib/reception/types";

export type { ResultatRecherchePatientReception };

export async function rechercherPatientsReception(
  recherche: string,
  limite = 8,
  options?: { medecinExterneId?: string; salleEnregistrement?: CodeSalle }
): Promise<ResultatRecherchePatientReception[]> {
  const terme = recherche.trim();
  if (terme.length < 2) return [];

  const salleEnregistrement = options?.salleEnregistrement ?? "RECEPTION";

  const patients = await prisma.patient.findMany({
    where: {
      ...(options?.medecinExterneId
        ? { medecinExterneId: options.medecinExterneId }
        : salleEnregistrement === "RECEPTION"
          ? { medecinExterneId: null }
          : {}),
      dossiers: {
        some: { salleEnregistrement },
      },
      OR: [
        { numeroPatient: { contains: terme, mode: "insensitive" } },
        { nom: { contains: terme, mode: "insensitive" } },
        { prenom: { contains: terme, mode: "insensitive" } },
        { telephone: { contains: terme, mode: "insensitive" } },
        {
          dossiers: {
            some: {
              salleEnregistrement,
              numeroDossier: { contains: terme, mode: "insensitive" },
            },
          },
        },
      ],
    },
    orderBy: { updatedAt: "desc" },
    take: limite,
    include: {
      dossiers: {
        where: { salleEnregistrement },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, statut: true },
      },
    },
  });

  const { dossierEstReutilisableAccueil } = await import("@/lib/visites/etat-visite");

  return Promise.all(
    patients.map(async (patient) => {
      const dernier = patient.dossiers[0];
      const reutilisable = dernier
        ? await dossierEstReutilisableAccueil(dernier.id)
        : false;
      return {
        numeroPatient: patient.numeroPatient,
        nomComplet: `${patient.nom} ${patient.prenom}`.trim(),
        telephone: patient.telephone ?? "—",
        dossierId: reutilisable ? dernier?.id : undefined,
      };
    })
  );
}
