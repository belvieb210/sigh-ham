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
} from "lucide-react";
import { ORIENTATIONS_RAPIDES } from "@/constants/reception";
import { basculerOrientationsMulti } from "@/features/transferts/utilitaires-orientation-lot";
import { cn } from "@/lib/utils";

type OptionOrientation = {
  value: string;
  label: string;
  description: string;
  couleur: string;
  couleurMobile?: string;
};

const ICONES: Record<string, React.ComponentType<{ className?: string }>> = {
  INFIRMIERS: Stethoscope,
  MEDECINS: UserRound,
  CAISSE: Wallet,
  LABORATOIRE: FlaskConical,
  PHARMACIE: Pill,
  HOSPITALISATION: BedDouble,
  MEDECINS_EXTERNES: BriefcaseMedical,
  EGLISE: Church,
};

function libelleOrientation(
  t: (key: string, options?: { defaultValue?: string }) => string,
  opt: OptionOrientation
) {
  return {
    label: t(`reception.orientations.${opt.value}.label`, {
      defaultValue: opt.label,
    }),
    description: t(`reception.orientations.${opt.value}.description`, {
      defaultValue: opt.description,
    }),
  };
}

interface PropsOrientationRapide {
  variante?: "liste" | "grille-mobile";
  orientation?: string;
  onOrientationChange?: (value: string) => void;
  orientations?: string[];
  onOrientationsChange?: (values: string[]) => void;
  multiple?: boolean;
  desactive?: boolean;
  /** Sous-ensemble de destinations (ex. Caisse seule pour médecins externes) */
  options?: readonly OptionOrientation[];
}

export function OrientationRapide({
  variante = "liste",
  orientation: orientationControlee,
  onOrientationChange,
  orientations: orientationsControlees,
  onOrientationsChange,
  multiple = true,
  desactive = false,
  options: optionsProp,
}: PropsOrientationRapide) {
  const { t } = useTranslation();
  const optionsListe = optionsProp ?? ORIENTATIONS_RAPIDES;
  const [orientationInterne, setOrientationInterne] = useState<string>(
    () => optionsListe[0]?.value ?? "INFIRMIERS"
  );
  const [orientationsInternes, setOrientationsInternes] = useState<string[]>([
    optionsListe[0]?.value ?? "INFIRMIERS",
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

  if (variante === "grille-mobile") {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {optionsListe.map((opt) => {
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
                {libelleOrientation(t, opt).label}
              </span>
              <span className="text-[10px] leading-tight text-texte-secondaire">
                {libelleOrientation(t, opt).description}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {optionsListe.map((opt) => {
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
              <span className="block">{libelleOrientation(t, opt).label}</span>
              <span className="block text-xs font-normal text-texte-secondaire">
                {libelleOrientation(t, opt).description}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
