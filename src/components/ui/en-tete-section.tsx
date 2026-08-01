import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PropsEnTeteSection {
  idTitre: string;
  titre: string;
  sousTitre?: string;
  lienVoirTout?: {
    href: string;
    etiquette: string;
  };
  variante?: "claire" | "sombre";
  classNameTitre?: string;
}

export function EnTeteSection({
  idTitre,
  titre,
  sousTitre,
  lienVoirTout,
  variante = "claire",
  classNameTitre,
}: PropsEnTeteSection) {
  return (
    <div className="en-tete-section flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2
          id={idTitre}
          className={cn(
            "titre-section",
            variante === "sombre" ? "text-white" : "text-texte-principal",
            classNameTitre
          )}
        >
          {titre}
        </h2>
        {sousTitre && (
          <p
            className={cn(
              "mt-2 text-texte-secondaire",
              variante === "sombre" && "text-white/70"
            )}
          >
            {sousTitre}
          </p>
        )}
      </div>
      {lienVoirTout && (
        <Link
          href={lienVoirTout.href}
          className={cn(
            "lien-voir-tout shrink-0",
            variante === "sombre" && "text-white/90 hover:text-white"
          )}
        >
          {lienVoirTout.etiquette}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
