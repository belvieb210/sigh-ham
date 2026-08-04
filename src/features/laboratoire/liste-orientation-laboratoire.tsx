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
  /** Préfixe i18n : laboratoire.orientationsDestination.XXX ou orientationsStatut.XXX */
  cleTraduction: "orientationsDestination" | "orientationsStatut";
  valeur: string | null;
  onChange: (id: string) => void;
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
  valeur,
  onChange,
  desactive = false,
  aide,
}: PropsListeOrientationLaboratoire) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      {aide && (
        <p className="mb-1 text-xs text-texte-secondaire">{aide}</p>
      )}
      {options.map((opt) => {
        const Icone = opt.icone;
        const selectionne = valeur === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            disabled={desactive}
            onClick={() => onChange(opt.id)}
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
                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
                selectionne ? "border-current bg-current" : "border-gris-bordure"
              )}
            >
              {selectionne && (
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              )}
            </span>
            <Icone className="h-4 w-4 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block">
                {t(`laboratoire.${cleTraduction}.${opt.id}.label`)}
              </span>
              <span className="block text-xs font-normal text-texte-secondaire">
                {t(`laboratoire.${cleTraduction}.${opt.id}.description`)}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
