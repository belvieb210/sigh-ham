"use client";

import { Hash, Users } from "lucide-react";
import type { TypeConversation } from "@/generated/prisma/enums";
import {
  couleurAvatarConversation,
  initialesParticipant,
} from "@/features/messagerie/utilitaires-messagerie";
import { cn } from "@/lib/utils";

interface PropsAvatarMessagerie {
  type?: TypeConversation;
  prenom?: string;
  nom?: string;
  libelle?: string;
  imageUrl?: string | null;
  taille?: "sm" | "md" | "liste" | "lg";
  enLigne?: boolean;
  className?: string;
}

const TAILLES = {
  sm: "h-8 w-8 text-[10px]",
  md: "h-10 w-10 text-xs",
  liste: "h-11 w-11 text-xs",
  lg: "h-14 w-14 text-base",
};

export function AvatarMessagerie({
  type,
  prenom,
  nom,
  libelle,
  imageUrl,
  taille = "md",
  enLigne,
  className,
}: PropsAvatarMessagerie) {
  const initiales =
    prenom && nom
      ? initialesParticipant(prenom, nom)
      : (libelle?.charAt(0).toUpperCase() ?? "?");

  return (
    <div className={cn("relative shrink-0", className)}>
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden rounded-full font-bold",
          TAILLES[taille],
          !imageUrl && (type ? couleurAvatarConversation(type) : "bg-degrade-ham text-white")
        )}
      >
        {imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : type === "CANAL_SALLE" ? (
          <Hash className="h-4 w-4" />
        ) : type === "GROUPE" ? (
          <Users className="h-4 w-4" />
        ) : (
          initiales
        )}
      </div>
      {enLigne !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white",
            enLigne ? "bg-emerald-500" : "bg-slate-300"
          )}
          aria-hidden
        />
      )}
    </div>
  );
}
