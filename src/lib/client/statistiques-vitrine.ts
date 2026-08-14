import "server-only";

import { INFORMATIONS_HOPITAL } from "@/constants/navigation";
import type { StatistiquesVitrine } from "@/lib/client/statistiques-vitrine-utils";
import { prisma } from "@/lib/prisma";

export type { StatistiquesVitrine } from "@/lib/client/statistiques-vitrine-utils";

export async function chargerStatistiquesVitrine(): Promise<StatistiquesVitrine> {
  const debutAnnee = new Date(new Date().getFullYear(), 0, 1);

  try {
    const [
      patientsTotal,
      patientsAnnee,
      medecinsVitrine,
      professionnels,
      servicesVitrine,
      typesAnalyses,
      examensTermines,
      campagnesPubliees,
      campagnesAnnee,
      campagnesDepistage,
      campagnesVaccination,
      medecinsExternes,
      agentsEglise,
      lieuxCampagnes,
      demandesRdv,
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.patient.count({ where: { createdAt: { gte: debutAnnee } } }),
      prisma.medecinVitrine.count({
        where: {
          actif: true,
          categorie: { in: ["MEDECIN", "MEDECIN_EXTERNE", "RESPONSABLE_LABO"] },
        },
      }),
      prisma.medecinVitrine.count({
        where: { actif: true, NOT: { categorie: "SERVICE_EGLISE" } },
      }),
      prisma.serviceVitrine.count({ where: { actif: true } }),
      prisma.typeExamen.count({ where: { actif: true } }),
      prisma.examenLaboratoire.count({ where: { statut: "TERMINE" } }),
      prisma.campagnePublique.count({ where: { publie: true } }),
      prisma.campagnePublique.count({
        where: { publie: true, createdAt: { gte: debutAnnee } },
      }),
      prisma.campagnePublique.count({
        where: { publie: true, categorie: "depistage" },
      }),
      prisma.campagnePublique.count({
        where: { publie: true, categorie: "vaccination" },
      }),
      prisma.medecinExterne.count({ where: { actif: true } }),
      prisma.utilisateur.count({
        where: { role: { code: "AGENT_EGLISE" }, statut: "ACTIF" },
      }),
      prisma.campagnePublique.findMany({
        where: { publie: true, lieu: { not: null } },
        select: { lieu: true },
        distinct: ["lieu"],
      }),
      prisma.demandeRendezVous.count(),
    ]);

    const communesCampagnes = lieuxCampagnes.filter(
      (c) => c.lieu && c.lieu.trim().length > 0
    ).length;

    return {
      patientsTotal,
      patientsAnnee,
      medecinsVitrine,
      professionnels,
      servicesVitrine,
      typesAnalyses,
      examensTermines,
      campagnesPubliees,
      campagnesAnnee,
      campagnesDepistage,
      campagnesVaccination,
      partenaires: medecinsExternes + agentsEglise,
      communesCampagnes,
      demandesRdv,
      certification: INFORMATIONS_HOPITAL.certification,
    };
  } catch (error) {
    console.error("[statistiques-vitrine] Erreur agrégation:", error);
    return {
      patientsTotal: 0,
      patientsAnnee: 0,
      medecinsVitrine: 0,
      professionnels: 0,
      servicesVitrine: 0,
      typesAnalyses: 0,
      examensTermines: 0,
      campagnesPubliees: 0,
      campagnesAnnee: 0,
      campagnesDepistage: 0,
      campagnesVaccination: 0,
      partenaires: 0,
      communesCampagnes: 0,
      demandesRdv: 0,
      certification: INFORMATIONS_HOPITAL.certification,
    };
  }
}
