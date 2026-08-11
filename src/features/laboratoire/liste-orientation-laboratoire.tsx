"use client";

import { useTranslation } from "react-i18next";
import {
  BriefcaseMedical,
  ClipboardCheck,
  FlaskConical,
  Inbox,
  Pill,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Wallet,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface OptionOrientationLabo {
  id: string;
  icone: LucideIcon;
  couleur: string;
}

interface PropsListeOrientationLaboratoire {
  options: OptionOrientationLabo[];
  cleTraduction: "orientationsDestination" | "orientationsStatut";
  /** Mode simple (radio) — statut analyse */
  valeur?: string | null;
  onChange?: (id: string) => void;
  /** Mode multi (cases à cocher) — destinations */
  valeurs?: string[];
  onChangeMulti?: (ids: string[]) => void;
  multiple?: boolean;
  desactive?: boolean;
  aide?: string;
}

const ICONES_PAR_NOM: Record<string, LucideIcon> = {
  Stethoscope,
  UserRound,
  Wallet,
  BriefcaseMedical,
  Pill,
  Inbox,
  FlaskConical,
  ClipboardCheck,
  XCircle,
  ShieldCheck,
};

export function iconeDepuisNom(nom: string): LucideIcon {
  return ICONES_PAR_NOM[nom] ?? FlaskConical;
}

export function ListeOrientationLaboratoire({
  options,
  cleTraduction,
  valeur = null,
  onChange,
  valeurs = [],
  onChangeMulti,
  multiple = false,
  desactive = false,
  aide,
}: PropsListeOrientationLaboratoire) {
  const { t } = useTranslation();

  const basculer = (id: string) => {
    if (desactive) return;
    if (multiple && onChangeMulti) {
      const deja = valeurs.includes(id);
      onChangeMulti(
        deja ? valeurs.filter((v) => v !== id) : [...valeurs, id]
      );
      return;
    }
    onChange?.(id);
  };

  return (
    <div className="space-y-2">
      {aide && (
        <p className="mb-1 text-xs text-texte-secondaire">{aide}</p>
      )}
      {options.map((opt) => {
        const Icone = opt.icone;
        const selectionne = multiple
          ? valeurs.includes(opt.id)
          : valeur === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            disabled={desactive}
            onClick={() => basculer(opt.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-all",
              desactive && "cursor-not-allowed opacity-60",
              selectionne
                ? cn(opt.couleur, "ring-2 ring-bleu-medical/25")
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
              <span className="block break-words">
                {t(`laboratoire.${cleTraduction}.${opt.id}.label`)}
              </span>
              <span className="block break-words text-xs font-normal text-texte-secondaire">
                {t(`laboratoire.${cleTraduction}.${opt.id}.description`)}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
