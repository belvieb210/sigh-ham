import { formaterNombreVitrine } from "@/lib/client/formater-valeur-vitrine";

export type StatistiquesVitrine = {
  patientsTotal: number;
  patientsAnnee: number;
  medecinsVitrine: number;
  professionnels: number;
  servicesVitrine: number;
  typesAnalyses: number;
  examensTermines: number;
  campagnesPubliees: number;
  campagnesAnnee: number;
  campagnesDepistage: number;
  campagnesVaccination: number;
  partenaires: number;
  communesCampagnes: number;
  demandesRdv: number;
  certification: string;
};

/** Valeur affichée pour un indicateur CMS à partir des stats DB. */
export function valeurIndicateurVitrine(
  id: string,
  stats: StatistiquesVitrine
): string | null {
  switch (id) {
    case "patients":
      return formaterNombreVitrine(
        stats.patientsAnnee > 0 ? stats.patientsAnnee : stats.patientsTotal
      );
    case "analyses":
      return formaterNombreVitrine(stats.typesAnalyses);
    case "equipe":
      return formaterNombreVitrine(stats.professionnels);
    case "iso":
    case "qualite":
      return stats.certification.replace(":2015", "").split(":")[0] ?? "ISO 9001";
    case "depistages":
      return formaterNombreVitrine(
        stats.examensTermines > 0
          ? stats.examensTermines
          : stats.campagnesDepistage
      );
    case "vaccinations":
      return formaterNombreVitrine(stats.campagnesVaccination);
    case "partenaires":
      return formaterNombreVitrine(stats.partenaires);
    case "communes":
      return stats.communesCampagnes > 0
        ? String(stats.communesCampagnes)
        : formaterNombreVitrine(stats.campagnesPubliees);
    case "delai":
      return null;
    default:
      return null;
  }
}

export function statistiquesHeroAccueil(stats: StatistiquesVitrine) {
  return {
    medecins: formaterNombreVitrine(stats.medecinsVitrine),
    departements: String(stats.servicesVitrine > 0 ? stats.servicesVitrine : 0),
    patients: formaterNombreVitrine(stats.patientsTotal),
    certification: stats.certification,
  };
}

export function statistiquesHeroCampagnes(stats: StatistiquesVitrine) {
  const sensibilises =
    stats.patientsAnnee + stats.demandesRdv + stats.examensTermines;
  return {
    sensibilises: formaterNombreVitrine(
      sensibilises > 0 ? sensibilises : stats.campagnesPubliees
    ),
    actions: String(
      stats.campagnesAnnee > 0 ? stats.campagnesAnnee : stats.campagnesPubliees
    ),
    satisfaction: "98%",
    iso: stats.certification.replace(":2015", "").split(":")[0] ?? "ISO 9001",
  };
}

export function fusionnerIndicateursAvecStats<
  T extends { id: string; valeur: string; libelle: string; description: string },
>(indicateurs: T[], stats: StatistiquesVitrine | undefined): T[] {
  if (!stats) return indicateurs;
  return indicateurs.map((ind) => {
    const dynamique = valeurIndicateurVitrine(ind.id, stats);
    if (!dynamique || dynamique === "0") return ind;
    return { ...ind, valeur: dynamique };
  });
}
