"use client";

import {
  FlaskConical,
  Stethoscope,
  Scan,
  HeartPulse,
  Syringe,
  Check,
} from "lucide-react";
import { useContenuRendezVous } from "@/hooks/use-contenu-page";
import { cn } from "@/lib/utils";
import type { IdTypePrestation } from "@/constants/rendez-vous";

const ICONES = {
  flask: FlaskConical,
  stethoscope: Stethoscope,
  scan: Scan,
  "heart-pulse": HeartPulse,
  syringe: Syringe,
} as const;

interface PropsCarteTypePrestation {
  id: IdTypePrestation;
  selectionne: boolean;
  onSelectionner: (id: IdTypePrestation) => void;
}

export function CarteTypePrestation({
  id,
  selectionne,
  onSelectionner,
}: PropsCarteTypePrestation) {
  const { typesPrestation, form } = useContenuRendezVous();
  const prestation = typesPrestation.find((t) => t.id === id);
  if (!prestation) return null;

  const Icone = ICONES[prestation.icone];

  return (
    <button
      type="button"
      onClick={() => onSelectionner(id)}
      className={cn(
        "group relative flex w-full flex-col rounded-2xl border p-5 text-left transition-all sm:p-6",
        selectionne
          ? "border-bleu-medical bg-bleu-medical-clair/60 shadow-md ring-2 ring-bleu-medical/30"
          : "border-gris-bordure bg-white hover:border-bleu-medical/40 hover:shadow-sm"
      )}
      aria-pressed={selectionne}
    >
      {selectionne && (
        <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-bleu-medical text-white">
          <Check className="h-3.5 w-3.5" />
        </span>
      )}

      <div
        className={cn(
          "mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br",
          prestation.accent
        )}
      >
        <Icone className="h-6 w-6 text-bleu-medical" />
      </div>

      <h3 className="font-bold text-texte-principal">{prestation.titre}</h3>
      <p className="mt-2 text-sm leading-relaxed text-texte-secondaire">
        {prestation.description}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-gris-tres-clair px-3 py-1 text-xs font-semibold text-texte-secondaire">
          {prestation.duree}
        </span>
        {prestation.sansRdv && (
          <span className="rounded-full bg-vert-sante-clair px-3 py-1 text-xs font-semibold text-vert-sante">
            {form.sansRdv}
          </span>
        )}
      </div>
    </button>
  );
}
