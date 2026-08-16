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
  BedDouble,
  Building2,
} from "lucide-react";
import { ORIENTATIONS_RAPIDES_INFIRMIERS } from "@/constants/infirmiers";
import { basculerOrientationsMulti } from "@/features/transferts/utilitaires-orientation-lot";
import { cn } from "@/lib/utils";

const ICONES: Record<string, React.ComponentType<{ className?: string }>> = {
  MEDECINS: Stethoscope,
  RECEPTION: Building2,
  CAISSE: Wallet,
  LABORATOIRE: FlaskConical,
  PHARMACIE: Pill,
  HOSPITALISATION: BedDouble,
  EGLISE: Church,
  MEDECINS_EXTERNES: BriefcaseMedical,
};

interface PropsOrientationRapideInfirmiers {
  orientation?: string;
  onOrientationChange?: (value: string) => void;
  orientations?: string[];
  onOrientationsChange?: (values: string[]) => void;
  multiple?: boolean;
  desactive?: boolean;
}

export function OrientationRapideInfirmiers({
  orientation: orientationControlee,
  onOrientationChange,
  orientations: orientationsControlees,
  onOrientationsChange,
  multiple = true,
  desactive = false,
}: PropsOrientationRapideInfirmiers) {
  const { t } = useTranslation();
  const [orientationInterne, setOrientationInterne] = useState("MEDECINS");
  const [orientationsInternes, setOrientationsInternes] = useState<string[]>([
    "MEDECINS",
  ]);

  const orientations = orientationsControlees ?? orientationsInternes;
  const orientation = orientationControlee ?? orientationInterne;

  const basculer = (value: string) => {
    if (desactive) return;
    if (multiple && onOrientationsChange) {
      const suivant = basculerOrientationsMulti(orientations, value);
      setOrientationsInternes(suivant);
      onOrientationsChange(suivant);
      return;
    }
    setOrientationInterne(value);
    onOrientationChange?.(value);
  };

  return (
    <div className="space-y-2">
      {ORIENTATIONS_RAPIDES_INFIRMIERS.map((opt) => {
        const Icone = ICONES[opt.value] ?? UserRound;
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
                {t(`infirmiers.orientations.${opt.value}.label`, {
                  defaultValue: opt.label,
                })}
              </span>
              <span className="block text-xs font-normal text-texte-secondaire">
                {t(`infirmiers.orientations.${opt.value}.description`, {
                  defaultValue: opt.description,
                })}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
