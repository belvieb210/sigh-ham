"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Stethoscope,
  UserRound,
  Wallet,
  Church,
  BriefcaseMedical,
} from "lucide-react";
import { ORIENTATIONS_RAPIDES } from "@/constants/reception";
import { cn } from "@/lib/utils";

const ICONES: Record<string, React.ComponentType<{ className?: string }>> = {
  INFIRMIERS: Stethoscope,
  MEDECINS: UserRound,
  CAISSE: Wallet,
  MEDECINS_EXTERNES: BriefcaseMedical,
  EGLISE: Church,
};

interface PropsOrientationRapide {
  variante?: "liste" | "grille-mobile";
  orientation?: string;
  onOrientationChange?: (value: string) => void;
  orientations?: string[];
  onOrientationsChange?: (values: string[]) => void;
  multiple?: boolean;
  desactive?: boolean;
}

export function OrientationRapide({
  variante = "liste",
  orientation: orientationControlee,
  onOrientationChange,
  orientations: orientationsControlees,
  onOrientationsChange,
  multiple = true,
  desactive = false,
}: PropsOrientationRapide) {
  const { t } = useTranslation();
  const [orientationInterne, setOrientationInterne] = useState("INFIRMIERS");
  const [orientationsInternes, setOrientationsInternes] = useState<string[]>([
    "INFIRMIERS",
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

  if (variante === "grille-mobile") {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {ORIENTATIONS_RAPIDES.map((opt) => {
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
                "flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-all",
                desactive && "cursor-not-allowed opacity-60",
                selectionne
                  ? "border-bleu-medical bg-bleu-medical-clair ring-2 ring-bleu-medical/20"
                  : "border-gris-bordure bg-white hover:bg-gris-tres-clair"
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  selectionne ? "bg-bleu-medical text-white" : "bg-gris-tres-clair text-bleu-medical"
                )}
              >
                <Icone className="h-5 w-5" />
              </span>
              <span className="text-xs font-semibold text-texte-principal">
                {t(`reception.orientations.${opt.value}.label`)}
              </span>
              <span className="text-[10px] leading-tight text-texte-secondaire">
                {t(`reception.orientations.${opt.value}.description`)}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {ORIENTATIONS_RAPIDES.map((opt) => {
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
                selectionne ? "border-current bg-current" : "border-gris-bordure"
              )}
            >
              {selectionne &&
                (multiple ? (
                  <span className="text-[10px] font-bold leading-none text-white">✓</span>
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                ))}
            </span>
            <Icone className="h-4 w-4 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block">{t(`reception.orientations.${opt.value}.label`)}</span>
              <span className="block text-xs font-normal text-texte-secondaire">
                {t(`reception.orientations.${opt.value}.description`)}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
