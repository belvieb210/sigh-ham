"use client";

import { cn } from "@/lib/utils";

interface PropsAvatarUtilisateur {
  prenom: string;
  nom: string;
  photoUrl?: string | null;
  className?: string;
  taille?: "sm" | "md" | "lg" | "xl";
  forme?: "rond" | "carre";
}

const TAILLES = {
  sm: "h-9 w-9 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
  xl: "h-24 w-24 text-2xl",
} as const;

export function AvatarUtilisateur({
  prenom,
  nom,
  photoUrl,
  className,
  taille = "md",
  forme = "rond",
}: PropsAvatarUtilisateur) {
  const initiales = `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase();

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden bg-degrade-ham font-bold text-white",
        TAILLES[taille],
        forme === "rond" ? "rounded-full" : "rounded-lg",
        className
      )}
    >
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt={`${prenom} ${nom}`}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center">{initiales}</span>
      )}
    </div>
  );
}
