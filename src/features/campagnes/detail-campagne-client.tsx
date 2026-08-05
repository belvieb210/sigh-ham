"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Calendar, MapPin } from "lucide-react";
import type { CampagnePublication } from "@/types/campagnes";
import type { StatutCampagne } from "@/types/campagnes";
import { useCampagnesTraduits, useContenuCampagnes } from "@/hooks/use-contenu-page";
import { CARTE_ICONES_CAMPAGNES } from "@/components/icones/icones-medicales";
import { Bouton } from "@/components/ui/bouton";

interface PropsDetailCampagne {
  slug: string;
  statut: StatutCampagne;
}

export function DetailCampagneClient({ slug, statut }: PropsDetailCampagne) {
  const { t } = useTranslation();
  const campagnesTraduits = useCampagnesTraduits();
  const { grille } = useContenuCampagnes();

  const campagne = campagnesTraduits.find(
    (c) => c.slug === slug && c.publie
  ) as CampagnePublication | undefined;

  useEffect(() => {
    if (campagne) {
      document.title = `${campagne.titre} | ${t("meta.site")}`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", campagne.extrait);
    }
  }, [campagne, t]);

  if (!campagne) return null;

  const Icone = CARTE_ICONES_CAMPAGNES[campagne.icone];
  const libelleCategorie =
    grille.filtres[campagne.categorie as keyof typeof grille.filtres] ??
    campagne.categorie;
  const libelleStatut =
    grille.statuts[statut as keyof typeof grille.statuts] ?? statut;

  return (
    <article className="pb-16">
      <div
        className={`bg-gradient-to-br ${campagne.couleurIllustration} py-16 sm:py-20`}
      >
        <div className="conteneur-principal">
          <Link
            href="/campagnes"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-bleu-medical hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("campagnesDetail.retour")}
          </Link>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {campagne.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={campagne.imageUrl}
                alt=""
                className="h-28 w-40 shrink-0 rounded-xl object-cover shadow-md sm:h-32 sm:w-48"
              />
            ) : (
              <div className={`${campagne.couleurAccent}`}>
                <Icone />
              </div>
            )}
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white/80 px-3 py-0.5 text-xs font-bold uppercase text-bleu-medical">
                  {libelleCategorie}
                </span>
                <span className="rounded-full bg-white/80 px-3 py-0.5 text-xs font-bold uppercase text-texte-secondaire">
                  {libelleStatut}
                </span>
              </div>
              <h1 className="mt-3 text-2xl font-extrabold text-[#2d2a6e] sm:text-4xl">
                {campagne.titre}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="conteneur-principal -mt-6">
        <div className="rounded-2xl border border-gris-bordure bg-white p-6 shadow-lg sm:p-8 lg:p-10">
          <p className="text-base leading-relaxed text-texte-secondaire sm:text-lg">
            {campagne.description}
          </p>

          <div className="mt-6 flex flex-col gap-3 border-t border-gris-bordure pt-6 sm:flex-row sm:gap-8">
            <p className="flex items-center gap-2 text-sm text-texte-secondaire">
              <Calendar className="h-4 w-4 text-bleu-medical" />
              {campagne.periode}
            </p>
            {campagne.lieu && (
              <p className="flex items-center gap-2 text-sm text-texte-secondaire">
                <MapPin className="h-4 w-4 text-bleu-medical" />
                {campagne.lieu}
              </p>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/rendez-vous">
              <Bouton taille="grand" className="w-full sm:w-auto" enTantQueEnfant>
                {t("campagnesDetail.prendreRdv")}
              </Bouton>
            </Link>
            <Link href="/contact">
              <Bouton
                variante="contour"
                taille="grand"
                className="w-full sm:w-auto"
                enTantQueEnfant
              >
                {t("campagnesDetail.nousContacter")}
              </Bouton>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
