import { Shield, Clock, Users, Award } from "lucide-react";
import { EnTeteSection } from "@/components/ui/en-tete-section";

const RAISONS_CHOIX = [
  {
    id: "qualite",
    titre: "Qualité des soins",
    description:
      "Des protocoles médicaux rigoureux et une équipe hautement qualifiée.",
    icone: Award,
  },
  {
    id: "equipements",
    titre: "Équipements modernes",
    description:
      "Technologies de pointe pour un diagnostic précis et rapide.",
    icone: Shield,
  },
  {
    id: "disponibilite",
    titre: "Disponibilité 24h/24",
    description:
      "Service d'urgences et prise de rendez-vous en ligne à tout moment.",
    icone: Clock,
  },
  {
    id: "equipe",
    titre: "Équipe pluridisciplinaire",
    description:
      "Plus de 50 spécialistes travaillant en collaboration pour votre santé.",
    icone: Users,
  },
] as const;

export function SectionPourquoiNous() {
  return (
    <section
      className="section-pourquoi-nous py-16 lg:py-24"
      aria-labelledby="titre-pourquoi"
    >
      <div className="conteneur-principal">
        <EnTeteSection
          idTitre="titre-pourquoi"
          titre="Pourquoi nous choisir"
          sousTitre="L'excellence médicale au service de votre bien-être"
        />

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {RAISONS_CHOIX.map((raison) => (
            <div
              key={raison.id}
              className="text-center sm:text-left"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-vert-sante-clair text-vert-sante sm:mx-0">
                <raison.icone className="h-7 w-7" />
              </div>
              <h3 className="mb-2 font-semibold text-texte-principal">
                {raison.titre}
              </h3>
              <p className="text-sm text-texte-secondaire">
                {raison.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
