"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Stethoscope,
  UserRound,
  Wallet,
  Church,
  BriefcaseMedical,
  FlaskConical,
  Pill,
} from "lucide-react";
import { ORIENTATIONS_RAPIDES_CAISSE } from "@/constants/caisse";
import { cn } from "@/lib/utils";

const ICONES: Record<string, React.ComponentType<{ className?: string }>> = {
  INFIRMIERS: Stethoscope,
  MEDECINS: UserRound,
  LABORATOIRE: FlaskConical,
  CAISSE: Wallet,
  MEDECINS_EXTERNES: BriefcaseMedical,
  EGLISE: Church,
  PHARMACIE: Pill,
};

interface PropsOrientationRapideCaisse {
  orientation?: string;
  onOrientationChange?: (value: string) => void;
  /** Multi-sélection */
  orientations?: string[];
  onOrientationsChange?: (values: string[]) => void;
  multiple?: boolean;
  desactive?: boolean;
}

export function OrientationRapideCaisse({
  orientation: orientationControlee,
  onOrientationChange,
  orientations: orientationsControlees,
  onOrientationsChange,
  multiple = true,
  desactive = false,
}: PropsOrientationRapideCaisse) {
  const { t } = useTranslation();
  const [orientationInterne, setOrientationInterne] = useState("LABORATOIRE");
  const [orientationsInternes, setOrientationsInternes] = useState<string[]>([
    "LABORATOIRE",
  ]);

  const orientations = orientationsControlees ?? orientationsInternes;
  const orientation = orientationControlee ?? orientationInterne;

  const basculer = (value: string) => {
    if (desactive) return;
    if (multiple && onOrientationsChange) {
      const deja = orientations.includes(value);
      const suivant = deja
        ? orientations.filter((v) => v !== value)
        : [...orientations, value];
      setOrientationsInternes(suivant);
      onOrientationsChange(suivant);
      return;
    }
    setOrientationInterne(value);
    onOrientationChange?.(value);
  };

  return (
    <div className="space-y-2">
      {ORIENTATIONS_RAPIDES_CAISSE.filter((o) => o.value !== "CAISSE").map(
        (opt) => {
          const Icone = ICONES[opt.value] ?? Stethoscope;
          const selectionne = multiple
            ? orientations.includes(opt.value)
            : orientation === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              disabled={desactive}
              onClick={() => basculer(opt.value)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-all",
                desactive && "cursor-not-allowed opacity-60",
                selectionne
                  ? cn(opt.couleur, "ring-2 ring-bleu-medical/30")
                  : "border-gris-bordure bg-white text-texte-principal hover:bg-gris-tres-clair"
              )}
            >
              <span
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center border-2",
                  multiple ? "rounded" : "rounded-full",
                  selectionne
                    ? "border-current bg-current"
                    : "border-gris-bordure"
                )}
              >
                {selectionne &&
                  (multiple ? (
                    <span className="text-[10px] font-bold leading-none text-white">
                      ✓
                    </span>
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  ))}
              </span>
              <Icone className="h-4 w-4 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block">
                  {t(`caisse.orientations.${opt.value}.label`, {
                    defaultValue: opt.label,
                  })}
                </span>
                <span className="block text-xs font-normal text-texte-secondaire">
                  {t(`caisse.orientations.${opt.value}.description`, {
                    defaultValue: opt.description,
                  })}
                </span>
              </span>
            </button>
          );
        }
      )}
    </div>
  );
}
