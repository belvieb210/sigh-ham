"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter } from "lucide-react";
import { CarteService } from "@/features/services/components/carte-service";
import type { IdCategorieService } from "@/constants/services";
import { useContenuServices } from "@/hooks/use-contenu-page";
import { EnTeteSection } from "@/components/ui/en-tete-section";
import { cn } from "@/lib/utils";

export function SectionGrilleServices() {
  const { categories, services, grille } = useContenuServices();
  const [categorieActive, setCategorieActive] =
    useState<IdCategorieService>("tous");

  const servicesFiltres =
    categorieActive === "tous"
      ? services
      : services.filter((s) => s.categorie === categorieActive);

  const servicesAffiches =
    categorieActive === "tous"
      ? servicesFiltres.filter((s) => !("badge" in s))
      : servicesFiltres;

  return (
    <section
      id="catalogue-services"
      className="section-grille-services bg-gris-tres-clair py-12 sm:py-16 lg:py-20"
      aria-labelledby="titre-catalogue-services"
    >
      <div className="conteneur-principal">
        <EnTeteSection
          idTitre="titre-catalogue-services"
          titre={grille.titre}
          sousTitre={grille.sousTitre}
        />

        <div className="sticky top-16 z-30 mt-8 rounded-2xl border border-gris-bordure bg-white p-4 shadow-sm sm:mt-10 sm:p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-texte-principal">
            <Filter className="h-4 w-4 text-bleu-medical" />
            Filtrer par catégorie
            <span className="ml-auto rounded-full bg-bleu-medical/10 px-2.5 py-0.5 text-xs font-bold text-bleu-medical">
              {servicesAffiches.length} service
              {servicesAffiches.length > 1 ? "s" : ""}
            </span>
          </div>

          <div
            className="flex gap-2 overflow-x-auto pb-1 scrollbar-masquee sm:flex-wrap"
            role="tablist"
            aria-label="Filtrer les services"
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={categorieActive === cat.id ? "true" : "false"}
                onClick={() => setCategorieActive(cat.id)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200",
                  categorieActive === cat.id
                    ? "bg-bleu-medical text-white shadow-md"
                    : "border border-gris-bordure bg-gris-tres-clair text-texte-secondaire hover:border-bleu-medical/30"
                )}
              >
                {cat.etiquette}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          <AnimatePresence mode="popLayout">
            {servicesAffiches.map((service, index) => (
              <motion.div
                key={service.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
              >
                <CarteService service={service} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
