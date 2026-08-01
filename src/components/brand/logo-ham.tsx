"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  CHEMIN_LOGO_HAM,
  INFORMATIONS_HOPITAL,
} from "@/constants/navigation";

interface PropsLogoHam {
  className?: string;
  afficherTexte?: boolean;
  taille?: "petit" | "moyen" | "grand";
  /** Sans lien — pour le pied de page */
  modeStatique?: boolean;
  /** Lien personnalisé (ex. accueil module SIGH) */
  href?: string;
}

const TAILLES_LOGO = {
  petit: { image: 36, texte: "text-sm" },
  moyen: { image: 44, texte: "text-base" },
  grand: { image: 52, texte: "text-lg" },
} as const;

/** Logo officiel HAM LABORATOIRE */
export function LogoHam({
  className,
  afficherTexte = true,
  taille = "moyen",
  modeStatique = false,
  href = "/",
}: PropsLogoHam) {
  const config = TAILLES_LOGO[taille];

  const contenu = (
    <>
      <Image
        src={CHEMIN_LOGO_HAM}
        alt="Logo HAM Laboratoire"
        width={config.image}
        height={config.image}
        className="rounded-full object-cover shadow-sm"
        priority={!modeStatique}
      />
      {afficherTexte && (
        <div className="min-w-0 max-w-[140px] sm:max-w-none">
          <p
            className={cn(
              "font-bold leading-tight",
              modeStatique ? "text-white" : "text-bleu-medical",
              config.texte
            )}
          >
            {INFORMATIONS_HOPITAL.nom}
          </p>
          <p
            className={cn(
              "truncate text-[10px] font-medium leading-snug sm:text-[11px] lg:text-xs",
              modeStatique ? "text-white/65" : "text-texte-secondaire"
            )}
          >
            {INFORMATIONS_HOPITAL.typeEtablissement}
          </p>
        </div>
      )}
    </>
  );

  if (modeStatique) {
    return (
      <div className={cn("logo-ham flex items-center gap-3 shrink-0", className)}>
        {contenu}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cn("logo-ham flex items-center gap-3 shrink-0", className)}
      aria-label={`${INFORMATIONS_HOPITAL.nomComplet} — Accueil`}
    >
      {contenu}
    </Link>
  );
}
