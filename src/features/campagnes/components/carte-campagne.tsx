"use client";

import Link from "next/link";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { CARTE_ICONES_CAMPAGNES } from "@/components/icones/icones-medicales";
import { Bouton } from "@/components/ui/bouton";
import { CarrouselImagesVitrine } from "@/components/ui/carrousel-images-vitrine";
import { ImageVitrine } from "@/components/ui/image-vitrine";
import {
  LIBELLES_CATEGORIE,
  LIBELLES_STATUT,
} from "@/lib/campagnes-utils";
import {
  classeAccentCampagne,
  styleFondCampagne,
} from "@/lib/client/couleurs-campagne";
import type { CampagneAvecStatut } from "@/services/service-campagnes-sync";
import { cn } from "@/lib/utils";

const STYLES_STATUT = {
  en_cours: "bg-vert-sante/95 text-white",
  a_venir: "bg-bleu-medical/95 text-white",
  terminee: "bg-gray-900/70 text-white backdrop-blur-sm",
} as const;

interface PropsCarteCampagne {
  campagne: CampagneAvecStatut;
  variante?: "standard" | "vedette" | "large";
}

export function CarteCampagne({
  campagne,
  variante = "standard",
}: PropsCarteCampagne) {
  const Icone = CARTE_ICONES_CAMPAGNES[campagne.icone];
  const estLarge = variante === "large";
  const galerie =
    campagne.images && campagne.images.length > 0
      ? campagne.images
      : campagne.imageUrl
        ? [{ url: campagne.imageUrl }]
        : [];
  const fond = styleFondCampagne(campagne.couleurIllustration);

  return (
    <article
      className={cn(
        "carte-campagne group relative flex flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-300",
        estLarge
          ? "border-bleu-medical/20 shadow-md hover:shadow-xl lg:col-span-2"
          : "border-gris-bordure/70 shadow-sm hover:-translate-y-1 hover:border-bleu-medical/25 hover:shadow-lg"
      )}
    >
      {/* Bande accent au survol */}
      <div
        className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-[#7a1f4e] to-bleu-medical transition-all duration-300 group-hover:w-full"
        aria-hidden="true"
      />

      <div
        className={cn(
          "relative overflow-hidden",
          estLarge ? "h-52 sm:h-60" : "h-40 sm:h-44"
        )}
      >
        {galerie.length > 1 ? (
          <>
            <CarrouselImagesVitrine
              images={galerie}
              className="absolute inset-0"
              sizes={estLarge ? "(max-width: 1024px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
              showNav={false}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          </>
        ) : galerie[0]?.url ? (
          <>
            <ImageVitrine
              src={galerie[0].url}
              alt=""
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes={estLarge ? "(max-width: 1024px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          </>
        ) : (
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br",
              fond.className
            )}
            style={fond.style}
          >
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 40%)",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={cn(
                  "rounded-2xl bg-white/40 p-4 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110",
                  classeAccentCampagne(campagne.couleurAccent)
                )}
              >
                <Icone />
              </div>
            </div>
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide shadow-sm",
              STYLES_STATUT[campagne.statut]
            )}
          >
            {LIBELLES_STATUT[campagne.statut]}
          </span>
          {campagne.typePublication === "publicite" && (
            <span className="rounded-full bg-[#7a1f4e] px-2.5 py-0.5 text-[10px] font-bold uppercase text-white shadow-sm">
              Publicité
            </span>
          )}
        </div>
      </div>

      <div className={cn("flex flex-1 flex-col", estLarge ? "p-6 sm:p-7" : "p-5")}>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-bleu-medical">
          {LIBELLES_CATEGORIE[campagne.categorie]}
        </span>

        <h3
          className={cn(
            "mt-1 font-bold leading-snug text-texte-principal transition-colors group-hover:text-bleu-medical",
            estLarge ? "text-xl sm:text-2xl" : "text-base"
          )}
        >
          {campagne.titre}
        </h3>

        <p
          className={cn(
            "mt-2 flex-1 text-texte-secondaire",
            estLarge
              ? "text-sm leading-relaxed line-clamp-3"
              : "text-xs leading-relaxed sm:text-sm line-clamp-2"
          )}
        >
          {estLarge ? campagne.description : campagne.extrait}
        </p>

        <div className="mt-4 space-y-1.5 text-xs text-texte-secondaire">
          <p className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-bleu-medical" />
            {campagne.periode}
          </p>
          {campagne.lieu && (
            <p className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-bleu-medical" />
              {campagne.lieu}
            </p>
          )}
        </div>

        <Link href={campagne.href} className="mt-4">
          <Bouton
            variante={estLarge ? "primaire" : "contour"}
            taille="petit"
            className={cn(
              "w-full transition-colors",
              !estLarge && "border-gris-bordure group-hover:border-bleu-medical group-hover:text-bleu-medical"
            )}
            enTantQueEnfant
          >
            En savoir plus
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Bouton>
        </Link>
      </div>
    </article>
  );
}
