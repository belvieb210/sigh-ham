"use client";

import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Loader2 } from "lucide-react";
import { CarteCampagne } from "@/features/campagnes/components/carte-campagne";
import { useCampagnes } from "@/hooks/use-campagnes";
import {
  useCampagnesTraduits,
  useContenuCampagnes,
} from "@/hooks/use-contenu-page";
import type { CategorieCampagne, StatutCampagne } from "@/types/campagnes";
import { EnTeteSection } from "@/components/ui/en-tete-section";
import { cn } from "@/lib/utils";

type FiltreStatut = "tous" | StatutCampagne;
type FiltreCategorie = "toutes" | CategorieCampagne;

const CATEGORIES: CategorieCampagne[] = [
  "depistage",
  "vaccination",
  "sensibilisation",
  "evenement",
];

export function SectionGrilleCampagnes() {
  const { data: campagnes, isLoading, isError } = useCampagnes();
  const campagnesTraduits = useCampagnesTraduits();
  const { grille } = useContenuCampagnes();

  const filtresStatut = useMemo(
    () =>
      [
        { id: "tous" as const, etiquette: grille.filtres.tous },
        { id: "en_cours" as const, etiquette: grille.statuts.en_cours },
        { id: "a_venir" as const, etiquette: grille.statuts.a_venir },
        { id: "terminee" as const, etiquette: grille.statuts.terminee },
      ],
    [grille]
  );

  const filtresCategorie = useMemo(
    () => [
      { id: "toutes" as const, etiquette: grille.filtres.toutes },
      ...CATEGORIES.map((id) => ({
        id,
        etiquette: grille.filtres[id],
      })),
    ],
    [grille]
  );

  const [filtreStatut, setFiltreStatut] = useState<FiltreStatut>("tous");
  const [filtreCategorie, setFiltreCategorie] =
    useState<FiltreCategorie>("toutes");

  const traductionsParSlug = useMemo(
    () => Object.fromEntries(campagnesTraduits.map((c) => [c.slug, c])),
    [campagnesTraduits]
  );

  const appliquerTraduction = useCallback(
    (campagne: NonNullable<typeof campagnes>[number]) => {
      const trad = traductionsParSlug[campagne.slug];
      return {
        ...campagne,
        titre: trad?.titre ?? campagne.titre,
        description: trad?.extrait ?? campagne.description,
      };
    },
    [traductionsParSlug]
  );

  const campagnesFiltrees = useMemo(() => {
    if (!campagnes) return [];
    return campagnes.filter((c) => {
      const matchStatut =
        filtreStatut === "tous" || c.statut === filtreStatut;
      const matchCategorie =
        filtreCategorie === "toutes" || c.categorie === filtreCategorie;
      return matchStatut && matchCategorie;
    });
  }, [campagnes, filtreStatut, filtreCategorie]);

  const premiereEnCours = campagnesFiltrees.find(
    (c) => c.statut === "en_cours" && filtreStatut === "tous"
  );
  const autresCampagnes = premiereEnCours
    ? campagnesFiltrees.filter((c) => c.id !== premiereEnCours.id)
    : campagnesFiltrees;

  return (
    <section
      id="toutes-campagnes"
      className="section-grille-campagnes bg-gris-tres-clair py-12 sm:py-16 lg:py-20"
      aria-labelledby="titre-toutes-campagnes"
    >
      <div className="conteneur-principal">
        <EnTeteSection
          idTitre="titre-toutes-campagnes"
          titre={grille.titre}
          sousTitre={grille.sousTitre}
        />

        {/* Barre de filtres */}
        <div className="sticky top-16 z-30 mt-8 rounded-2xl border border-gris-bordure bg-white p-4 shadow-sm sm:mt-10 sm:p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-texte-principal">
            <Filter className="h-4 w-4 text-bleu-medical" />
            {grille.filtrerPublications}
            {!isLoading && campagnes && (
              <span className="ml-auto rounded-full bg-bleu-medical/10 px-2.5 py-0.5 text-xs font-bold text-bleu-medical">
                {campagnesFiltrees.length}{" "}
                {campagnesFiltrees.length > 1
                  ? grille.resultatPluriel
                  : grille.resultatSingulier}
              </span>
            )}
          </div>

          <div
            className="flex gap-2 overflow-x-auto pb-1 scrollbar-masquee sm:flex-wrap"
            role="tablist"
            aria-label={grille.filtrerStatutAria}
          >
            {filtresStatut.map((filtre) => (
              <button
                key={filtre.id}
                type="button"
                role="tab"
                aria-selected={filtreStatut === filtre.id ? "true" : "false"}
                onClick={() => setFiltreStatut(filtre.id)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all",
                  filtreStatut === filtre.id
                    ? "bg-[#7a1f4e] text-white shadow-md"
                    : "border border-gris-bordure bg-gris-tres-clair text-texte-secondaire hover:border-[#7a1f4e]/30"
                )}
              >
                {filtre.etiquette}
              </button>
            ))}
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-masquee sm:flex-wrap">
            {filtresCategorie.map((filtre) => (
              <button
                key={filtre.id}
                type="button"
                onClick={() => setFiltreCategorie(filtre.id)}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                  filtreCategorie === filtre.id
                    ? "bg-bleu-medical text-white shadow-sm"
                    : "bg-gris-tres-clair text-texte-secondaire ring-1 ring-gris-bordure hover:ring-bleu-medical/30"
                )}
              >
                {filtre.etiquette}
              </button>
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="mt-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-bleu-medical" />
          </div>
        )}

        {isError && (
          <p className="mt-12 text-center text-texte-secondaire">
            {grille.erreurChargement}
          </p>
        )}

        {!isLoading && !isError && campagnesFiltrees.length === 0 && (
          <div className="mt-12 rounded-2xl border border-dashed border-gris-bordure bg-white p-12 text-center">
            <p className="font-semibold text-texte-principal">
              {grille.aucunePublication}
            </p>
            <p className="mt-2 text-sm text-texte-secondaire">
              {grille.modifierFiltres}
            </p>
          </div>
        )}

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          <AnimatePresence mode="popLayout">
            {premiereEnCours && (
              <motion.div
                key={premiereEnCours.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="sm:col-span-2 lg:col-span-2"
              >
                <CarteCampagne campagne={appliquerTraduction(premiereEnCours)} variante="large" />
              </motion.div>
            )}
            {autresCampagnes.map((campagne, index) => (
              <motion.div
                key={campagne.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.25, delay: index * 0.03 }}
              >
                <CarteCampagne campagne={appliquerTraduction(campagne)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {!isLoading && campagnes && campagnesFiltrees.length > 0 && (
          <p className="mt-8 text-center text-xs text-texte-secondaire">
            {campagnesFiltrees.length}{" "}
            {campagnesFiltrees.length > 1
              ? grille.compteurPluriel
              : grille.compteurSingulier}{" "}
            {campagnes.length} {grille.auTotal}
          </p>
        )}
      </div>
    </section>
  );
}
