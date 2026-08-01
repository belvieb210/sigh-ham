import { EnTeteSection } from "@/components/ui/en-tete-section";

const PARTENAIRES = [
  "OMS",
  "UNICEF",
  "Sanlam",
  "Rawbank",
  "Ministère Santé",
  "ISO",
] as const;

export function SectionPartenaires() {
  return (
    <section
      className="section-partenaires py-16 lg:py-20"
      aria-labelledby="titre-partenaires"
    >
      <div className="conteneur-principal">
        <EnTeteSection
          idTitre="titre-partenaires"
          titre="Nos partenaires"
          sousTitre="Ils nous font confiance"
        />

        <div className="mt-10 flex flex-wrap items-center justify-center gap-8 lg:gap-12">
          {PARTENAIRES.map((partenaire) => (
            <div
              key={partenaire}
              className="flex h-16 w-32 items-center justify-center rounded-lg border border-gris-bordure bg-gris-tres-clair px-4 text-sm font-semibold text-texte-secondaire"
            >
              {partenaire}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
