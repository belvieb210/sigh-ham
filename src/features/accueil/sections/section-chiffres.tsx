"use client";

import { EnTeteSection } from "@/components/ui/en-tete-section";
import { useStatistiquesVitrine } from "@/hooks/use-statistiques-vitrine";
import { formaterNombreVitrine } from "@/lib/client/formater-valeur-vitrine";

const CHIFFRES_FALLBACK = [
  { id: "patients", valeur: "24 000+", libelle: "Patients pris en charge" },
  { id: "medecins", valeur: "50+", libelle: "Médecins spécialistes" },
  { id: "departements", valeur: "12", libelle: "Départements médicaux" },
  { id: "satisfaction", valeur: "98%", libelle: "Satisfaction patient" },
  { id: "experience", valeur: "15+", libelle: "Années d'expérience" },
  { id: "iso", valeur: "ISO 9001", libelle: "Certification qualité" },
] as const;

export function SectionChiffres() {
  const { data: stats } = useStatistiquesVitrine();

  const chiffres = CHIFFRES_FALLBACK.map((c) => {
    if (!stats) return c;
    switch (c.id) {
      case "patients":
        return {
          ...c,
          valeur:
            stats.patientsTotal > 0
              ? formaterNombreVitrine(stats.patientsTotal)
              : c.valeur,
        };
      case "medecins":
        return {
          ...c,
          valeur:
            stats.medecinsVitrine > 0
              ? formaterNombreVitrine(stats.medecinsVitrine)
              : c.valeur,
        };
      case "departements":
        return {
          ...c,
          valeur:
            stats.servicesVitrine > 0
              ? String(stats.servicesVitrine)
              : c.valeur,
        };
      case "iso":
        return {
          ...c,
          valeur: stats.certification.replace(":2015", "").split(":")[0] ?? c.valeur,
        };
      default:
        return c;
    }
  });

  return (
    <section
      className="section-chiffres bg-bleu-medical py-16 lg:py-20"
      aria-labelledby="titre-chiffres"
    >
      <div className="conteneur-principal">
        <EnTeteSection
          idTitre="titre-chiffres"
          titre="Nos chiffres"
          variante="sombre"
          classNameTitre="text-white"
        />

        <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          {chiffres.map((chiffre) => (
            <div key={chiffre.id} className="text-center">
              <p className="text-3xl font-bold text-white lg:text-4xl">
                {chiffre.valeur}
              </p>
              <p className="mt-2 text-sm text-white/70">{chiffre.libelle}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
