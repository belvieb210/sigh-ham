"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Check, MoreVertical, RotateCcw, X } from "lucide-react";
import { useMonteClient } from "@/hooks/use-monte-client";
import { EVENEMENT_MEDECINS_EXTERNES_PATIENTS_MODIFIES } from "@/constants/medecins-externes";
import type { PatientFileMedecinsExternes } from "@/lib/medecins-externes/types";

interface PropsMenuActionsTransfertMedecinsExternes {
  patient: PatientFileMedecinsExternes;
  onRafraichir?: () => void;
}

export function MenuActionsTransfertMedecinsExternes({
  patient,
  onRafraichir,
}: PropsMenuActionsTransfertMedecinsExternes) {
  const { t } = useTranslation();
  const monte = useMonteClient();
  const [ouvert, setOuvert] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const boutonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const peutConfirmer =
    patient.statutTransfertSortant === "EN_ATTENTE" && !patient.enRecuperation;
  const peutRejeter =
    patient.statutTransfertSortant === "EN_ATTENTE" && !patient.enRecuperation;
  const peutRestaurer =
    patient.enRecuperation === true && patient.statutTransfertSortant === "REFUSE";

  const mettreAJourPosition = useCallback(() => {
    const bouton = boutonRef.current;
    if (!bouton) return;

    const rect = bouton.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight ?? 140;
    const menuWidth = menuRef.current?.offsetWidth ?? 180;
    const marge = 8;
    const espaceSous = window.innerHeight - rect.bottom;
    const ouvrirVersLeHaut =
      espaceSous < menuHeight + marge && rect.top > menuHeight + marge;

    setPosition({
      top: ouvrirVersLeHaut ? rect.top - menuHeight - 4 : rect.bottom + 4,
      left: Math.max(
        marge,
        Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - marge)
      ),
    });
  }, []);

  useEffect(() => {
    if (!patient.transfertSortantId) setOuvert(false);
  }, [patient.transfertSortantId]);

  useLayoutEffect(() => {
    if (!ouvert) return;
    mettreAJourPosition();
  }, [ouvert, mettreAJourPosition, peutConfirmer, peutRejeter, peutRestaurer, erreur]);

  useEffect(() => {
    if (!ouvert) return;

    const fermer = (event: MouseEvent) => {
      const cible = event.target as Node;
      if (boutonRef.current?.contains(cible) || menuRef.current?.contains(cible)) {
        return;
      }
      setOuvert(false);
    };

    const repositionner = () => mettreAJourPosition();

    document.addEventListener("mousedown", fermer);
    window.addEventListener("scroll", repositionner, true);
    window.addEventListener("resize", repositionner);

    return () => {
      document.removeEventListener("mousedown", fermer);
      window.removeEventListener("scroll", repositionner, true);
      window.removeEventListener("resize", repositionner);
    };
  }, [ouvert, mettreAJourPosition]);

  const executerAction = async (action: "confirmer" | "rejeter" | "restaurer") => {
    if (!patient.transfertSortantId || enCours) return;

    setEnCours(true);
    setErreur(null);

    try {
      const res = await fetch(
        `/api/medecins-externes/transferts/${encodeURIComponent(patient.transfertSortantId)}/actions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        }
      );

      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? t("medecinsExternes.actions.actionImpossible"));

      setOuvert(false);
      onRafraichir?.();
      window.dispatchEvent(new CustomEvent(EVENEMENT_MEDECINS_EXTERNES_PATIENTS_MODIFIES));
    } catch (error) {
      setErreur(
        error instanceof Error ? error.message : t("medecinsExternes.actions.erreurInattendue")
      );
    } finally {
      setEnCours(false);
    }
  };

  if (!patient.transfertSortantId) {
    return null;
  }

  return (
    <>
      <button
        ref={boutonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOuvert((v) => !v);
          setErreur(null);
        }}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gris-bordure text-texte-secondaire transition-colors hover:border-bleu-medical/40 hover:text-bleu-medical"
        aria-label={t("medecinsExternes.actions.plusActions", { nom: patient.nomComplet })}
        aria-expanded={ouvert ? "true" : "false"}
        aria-haspopup="menu"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {monte &&
        ouvert &&
        createPortal(
          <div
            ref={menuRef}
            style={{ top: position.top, left: position.left }}
            className="fixed z-[100] min-w-[200px] rounded-lg border border-gris-bordure bg-white py-1 shadow-lg"
            role="menu"
          >
            {peutConfirmer && (
              <button
                type="button"
                disabled={enCours}
                onClick={(e) => {
                  e.stopPropagation();
                  void executerAction("confirmer");
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-50"
                role="menuitem"
              >
                <Check className="h-3.5 w-3.5" />
                <span>{t("medecinsExternes.actions.confirmer")}</span>
              </button>
            )}
            {peutRejeter && (
              <button
                type="button"
                disabled={enCours}
                onClick={(e) => {
                  e.stopPropagation();
                  void executerAction("rejeter");
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
                role="menuitem"
              >
                <X className="h-3.5 w-3.5" />
                <span>{t("medecinsExternes.actions.rejeter")}</span>
              </button>
            )}
            {peutRestaurer && (
              <button
                type="button"
                disabled={enCours}
                onClick={(e) => {
                  e.stopPropagation();
                  void executerAction("restaurer");
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-bleu-medical transition-colors hover:bg-bleu-medical-clair/40 disabled:opacity-50"
                role="menuitem"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{t("medecinsExternes.actions.restaurer")}</span>
              </button>
            )}
            {!peutConfirmer && !peutRejeter && !peutRestaurer && (
              <span className="block px-3 py-2 text-xs text-texte-secondaire">
                {t("medecinsExternes.actions.aucuneAction")}
              </span>
            )}
            {erreur && (
              <span className="block border-t border-gris-bordure px-3 py-2 text-xs text-red-600">
                {erreur}
              </span>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
