import { EnTeteSection } from "@/components/ui/en-tete-section";

const CHIFFRES_cles = [
  { valeur: "24 000+", libelle: "Patients pris en charge" },
  { valeur: "50+", libelle: "Médecins spécialistes" },
  { valeur: "12", libelle: "Départements médicaux" },
  { valeur: "98%", libelle: "Satisfaction patient" },
  { valeur: "15+", libelle: "Années d'expérience" },
  { valeur: "ISO 9001", libelle: "Certification qualité" },
] as const;

export function SectionChiffres() {
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
          {CHIFFRES_cles.map((chiffre) => (
            <div key={chiffre.libelle} className="text-center">
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
