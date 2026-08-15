"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useEspaceApi } from "@/features/reception/contexte-espace-api";
import { filtrerOrientationsMedecinsExternes } from "@/constants/medecins-externes";
import { filtrerOrientationsEglise } from "@/constants/eglise";
import {
  Search,
  Printer,
  CalendarPlus,
  ArrowRightLeft,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { useOrientationRapide } from "@/features/reception/contexte-orientation-rapide";
import { useResumePatient } from "@/features/reception/contexte-resume-patient";
import { cn } from "@/lib/utils";

interface PropsActionsRapidesReception {
  className?: string;
  variante?: "compacte" | "grille";
  /** Visible uniquement sur la page d'accueil réception */
  afficherTransfertManuel?: boolean;
}

export function ActionsRapidesReception({
  className,
  variante = "grille",
  afficherTransfertManuel = false,
}: PropsActionsRapidesReception) {
  const espace = useEspaceApi();
  const { t } = useTranslation();
  const router = useRouter();
  const { resume } = useResumePatient();
  const { orientation, orientations } = useOrientationRapide();
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const actionsRapides = useMemo(
    () =>
      [
        { id: "rechercher", label: t("reception.actions.rechercherPatient"), icone: Search },
        { id: "imprimer", label: t("reception.actions.imprimerFiche"), icone: Printer },
        { id: "rdv", label: t("reception.actions.prendreRdv"), icone: CalendarPlus },
        {
          id: "transfert-manuel",
          label: t("reception.actions.transfertManuel"),
          icone: ArrowRightLeft,
        },
      ] satisfies { id: string; label: string; icone: LucideIcon }[],
    [t]
  );

  const executerTransfertManuel = async () => {
    if (enCours) return;

    if (!resume.numeroPatient || resume.vide) {
      setErreur(t("reception.actions.selectionRequise"));
      setMessage(null);
      return;
    }

    const brutes = [
      ...new Set(
        (orientations.length > 0 ? orientations : [orientation]).filter(Boolean)
      ),
    ];
    const codes = espace.prefixeApi.includes("medecins-externes")
      ? filtrerOrientationsMedecinsExternes(brutes)
      : espace.prefixeApi.includes("eglise")
        ? filtrerOrientationsEglise(brutes)
        : brutes;
    if (codes.length === 0) {
      setErreur(t("reception.actions.destinationRequise"));
      setMessage(null);
      return;
    }

    setEnCours(true);
    setErreur(null);
    setMessage(null);

    try {
      const res = await fetch(`${espace.prefixeApi}/transferts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transfertManuel: true,
          numeroPatient: resume.numeroPatient,
          dossierId: resume.dossierId ?? undefined,
          orientations: codes,
          orientation: codes[0],
        }),
      });

      const data = (await res.json()) as {
        message?: string;
        numeroPatient?: string;
        salleDestination?: string;
      };

      if (!res.ok) throw new Error(data.message ?? "Transfert manuel impossible.");

      setMessage(
        data.message ??
          t("reception.actions.transfertManuelOk", {
            salles: data.salleDestination ?? codes.join(", "),
          })
      );
      window.dispatchEvent(new CustomEvent(espace.evenementPatientsModifies));

      router.push(
        `${espace.cheminBase}/transferts?transfere=${encodeURIComponent(data.numeroPatient ?? resume.numeroPatient)}`
      );
      router.refresh();
    } catch (error) {
      setErreur(error instanceof Error ? error.message : "Erreur inattendue.");
    } finally {
      setEnCours(false);
    }
  };

  const onAction = (id: string) => {
    if (id === "transfert-manuel") {
      void executerTransfertManuel();
      return;
    }

    if (id === "rechercher") {
      window.dispatchEvent(new CustomEvent(espace.evenementFocusRecherche));
    }
  };

  const actionsAffichees = afficherTransfertManuel
    ? actionsRapides
    : actionsRapides.filter((action) => action.id !== "transfert-manuel");

  return (
    <section
      className={cn(
        "rounded-xl border border-gris-bordure bg-white p-4 shadow-sm",
        className
      )}
    >
      <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
        {t("reception.panneau.actionsRapides")}
      </h2>
      <div
        className={cn(
          "grid gap-2",
          variante === "grille" ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"
        )}
      >
        {actionsAffichees.map((action) => {
          const Icone = action.icone;
          const estTransfertManuel = action.id === "transfert-manuel";
          const desactive = estTransfertManuel && enCours;

          return (
            <button
              key={action.id}
              type="button"
              disabled={desactive}
              onClick={() => onAction(action.id)}
              className={cn(
                "flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl border border-gris-bordure bg-[#f8fafc] p-3 text-center text-xs font-medium leading-tight text-texte-principal transition-colors hover:border-bleu-medical hover:bg-bleu-medical-clair active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
                estTransfertManuel && "ring-1 ring-transparent hover:ring-bleu-medical/20"
              )}
            >
              {estTransfertManuel && enCours ? (
                <Loader2 className="h-6 w-6 shrink-0 animate-spin text-bleu-medical" />
              ) : (
                <Icone className="h-6 w-6 shrink-0 text-bleu-medical" strokeWidth={1.75} />
              )}
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
      {erreur && <p className="mt-3 text-xs text-red-600">{erreur}</p>}
      {message && !erreur && <p className="mt-3 text-xs text-emerald-700">{message}</p>}
      {afficherTransfertManuel && (
        <p className="mt-3 text-[11px] leading-relaxed text-red-600">
          {t("reception.actions.aideTransfertManuel")}
        </p>
      )}
    </section>
  );
}
