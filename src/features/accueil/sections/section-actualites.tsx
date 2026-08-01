"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { EnTeteSection } from "@/components/ui/en-tete-section";

const ARTICLES_RECENTS = [
  {
    id: "1",
    titre: "Nouveau plateau technique au laboratoire",
    extrait:
      "L'hôpital investit dans des équipements de dernière génération pour améliorer la qualité des analyses.",
    datePublication: "28 Juillet 2026",
    categorie: "Équipement",
    href: "/actualites/nouveau-plateau-technique",
  },
  {
    id: "2",
    titre: "Campagne de vaccination antigrippe 2026",
    extrait:
      "Protégez-vous et vos proches. La campagne de vaccination démarre le 15 avril.",
    datePublication: "25 Juillet 2026",
    categorie: "Campagne",
    href: "/actualites/campagne-vaccination-2026",
  },
  {
    id: "3",
    titre: "Ouverture du service de cardiologie",
    extrait:
      "Un nouveau département dédié aux maladies cardiovasculaires ouvre ses portes.",
    datePublication: "20 Juillet 2026",
    categorie: "Service",
    href: "/actualites/ouverture-cardiologie",
  },
] as const;

export function SectionActualites() {
  return (
    <section
      className="section-actualites bg-gris-tres-clair py-16 lg:py-24"
      aria-labelledby="titre-actualites"
    >
      <div className="conteneur-principal">
        <EnTeteSection
          idTitre="titre-actualites"
          titre="Actualités"
          lienVoirTout={{ href: "/actualites", etiquette: "Voir toutes les actualités" }}
        />

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {ARTICLES_RECENTS.map((article, index) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={article.href}
                className="carte-actualite group block h-full overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm transition-all hover:shadow-md"
              >
                <div className="aspect-video bg-gradient-to-br from-bleu-medical/20 to-vert-sante/20" />
                <div className="p-5">
                  <span className="text-xs font-medium text-bleu-medical">
                    {article.categorie}
                  </span>
                  <h3 className="mt-2 font-semibold text-texte-principal group-hover:text-bleu-medical">
                    {article.titre}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-texte-secondaire">
                    {article.extrait}
                  </p>
                  <time className="mt-3 block text-xs text-texte-secondaire">
                    {article.datePublication}
                  </time>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
