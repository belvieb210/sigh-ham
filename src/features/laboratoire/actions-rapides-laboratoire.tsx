"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  FlaskConical,
  Printer,
  Search,
  ClipboardEdit,
  ShieldCheck,
  Play,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type IdActionRapideLabo =
  | "rechercher"
  | "commencer"
  | "imprimer"
  | "saisie"
  | "valider"
  | "detail";

interface PropsActionsRapidesLaboratoire {
  variante: "patients" | "examens";
  onAction: (id: IdActionRapideLabo) => void;
  patientSelectionne: boolean;
  className?: string;
}

export function ActionsRapidesLaboratoire({
  variante,
  onAction,
  patientSelectionne,
  className,
}: PropsActionsRapidesLaboratoire) {
  const { t } = useTranslation();

  const actions = useMemo(() => {
    if (variante === "patients") {
      return [
        {
          id: "rechercher" as const,
          label: t("laboratoire.actions.rechercherPatient"),
          icone: Search,
        },
        {
          id: "commencer" as const,
          label: t("laboratoire.actions.commencerAnalyses"),
          icone: Play,
          requiertPatient: true,
        },
        {
          id: "imprimer" as const,
          label: t("laboratoire.actions.imprimerFiche"),
          icone: Printer,
          requiertPatient: true,
        },
        {
          id: "detail" as const,
          label: t("laboratoire.actions.voirDossier"),
          icone: FlaskConical,
          requiertPatient: true,
        },
      ];
    }
    return [
      {
        id: "rechercher" as const,
        label: t("laboratoire.actions.rechercherPatient"),
        icone: Search,
      },
      {
        id: "saisie" as const,
        label: t("laboratoire.actions.saisirResultat"),
        icone: ClipboardEdit,
        requiertPatient: true,
      },
      {
        id: "valider" as const,
        label: t("laboratoire.actions.validerResultat"),
        icone: ShieldCheck,
        requiertPatient: true,
      },
      {
        id: "imprimer" as const,
        label: t("laboratoire.actions.imprimerResultat"),
        icone: Printer,
        requiertPatient: true,
      },
    ];
  }, [t, variante]);

  return (
    <section
      className={cn(
        "rounded-xl border border-gris-bordure bg-white p-4 shadow-sm",
        className
      )}
    >
      <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
        {t("laboratoire.panneau.actionsRapides")}
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => {
          const Icone = action.icone as LucideIcon;
          const desactive =
            "requiertPatient" in action &&
            action.requiertPatient &&
            !patientSelectionne;
          return (
            <button
              key={action.id}
              type="button"
              disabled={desactive}
              onClick={() => onAction(action.id)}
              className="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl border border-gris-bordure bg-[#f8fafc] p-3 text-center text-xs font-medium leading-tight text-texte-principal transition-colors hover:border-bleu-medical hover:bg-bleu-medical-clair active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icone
                className="h-6 w-6 shrink-0 text-bleu-medical"
                strokeWidth={1.75}
              />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
