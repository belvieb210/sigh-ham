"use client";

import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { EnTeteSection } from "@/components/ui/en-tete-section";

const TEMOIGNAGES = [
  {
    id: "1",
    nom: "Marie Kabongo",
    role: "Patiente",
    contenu:
      "Un accueil chaleureux et des soins de qualité. L'équipe médicale est à l'écoute et professionnelle.",
    note: 5,
  },
  {
    id: "2",
    nom: "Jean-Paul Mputu",
    role: "Patient",
    contenu:
      "Le laboratoire est rapide et les résultats sont disponibles en ligne. Très pratique !",
    note: 5,
  },
  {
    id: "3",
    nom: "Grace Tshilombo",
    role: "Patiente",
    contenu:
      "J'ai pu prendre rendez-vous en ligne facilement. L'hôpital est moderne et bien organisé.",
    note: 4,
  },
] as const;

export function SectionTemoignages() {
  return (
    <section
      className="section-temoignages bg-gris-tres-clair py-16 lg:py-24"
      aria-labelledby="titre-temoignages"
    >
      <div className="conteneur-principal">
        <EnTeteSection
          idTitre="titre-temoignages"
          titre="Témoignages"
          sousTitre="Ce que nos patients disent de nous"
        />

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {TEMOIGNAGES.map((temoignage, index) => (
            <motion.blockquote
              key={temoignage.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="carte-temoignage rounded-xl border border-gris-bordure bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < temoignage.note ? "fill-amber-400 text-amber-400" : "text-gris-bordure"}`}
                  />
                ))}
              </div>
              <p className="mb-4 text-sm leading-relaxed text-texte-secondaire">
                &ldquo;{temoignage.contenu}&rdquo;
              </p>
              <footer>
                <cite className="not-italic">
                  <p className="font-semibold text-texte-principal">
                    {temoignage.nom}
                  </p>
                  <p className="text-xs text-texte-secondaire">
                    {temoignage.role}
                  </p>
                </cite>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
