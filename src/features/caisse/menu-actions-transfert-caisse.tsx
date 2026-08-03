"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Check, MoreVertical, RotateCcw, X } from "lucide-react";
import { useMonteClient } from "@/hooks/use-monte-client";
import { EVENEMENT_CAISSE_PATIENTS_MODIFIES } from "@/constants/caisse";
import type { PatientTransfertCaisse } from "@/lib/caisse/types";

interface PropsMenuActionsTransfertCaisse {
  patient: PatientTransfertCaisse;
  onRafraichir?: () => void;
}

export function MenuActionsTransfertCaisse({
  patient,
  onRafraichir,
}: PropsMenuActionsTransfertCaisse) {
  const { t } = useTranslation();
  const monte = useMonteClient();
  const [ouvert, setOuvert] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const boutonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const peutConfirmer =
    patient.factureOuverte &&
    patient.statutTransfertSortant === "EN_ATTENTE" &&
    !patient.enRecuperation;
  const peutRejeter =
    patient.factureOuverte &&
    patient.statutTransfertSortant === "EN_ATTENTE" &&
    !patient.enRecuperation;
  const peutRestaurer =
    patient.factureOuverte &&
    patient.enRecuperation === true &&
    patient.statutTransfertSortant === "REFUSE";

  const mettreAJourPosition = useCallback(() => {
    const bouton = boutonRef.current;
    if (!bouton) return;

    const rect = bouton.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight ?? 140;
    const menuWidth = menuRef.current?.offsetWidth ?? 180;
    const marge = 8;
    const espaceSous = window.innerHeight - rect.bottom;
    const ouvrirVersLeHaut = espaceSous < menuHeight + marge && rect.top > menuHeight + marge;

    setPosition({
      top: ouvrirVersLeHaut ? rect.top - menuHeight - 4 : rect.bottom + 4,
      left: Math.max(marge, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - marge)),
    });
  }, []);

  useLayoutEffect(() => {
    if (!ouvert) return;
    mettreAJourPosition();
  }, [ouvert, mettreAJourPosition, peutConfirmer, peutRejeter, peutRestaurer, erreur]);

  useEffect(() => {
    if (!ouvert) return;

    const fermer = (event: MouseEvent) => {
      const cible = event.target as Node;
      if (boutonRef.current?.contains(cible) || menuRef.current?.contains(cible)) return;
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

  const executerAction = async (action: "confirmer" | "rejeter" | "recuperer") => {
    if (!patient.transfertSortantId || enCours) return;

    setEnCours(true);
    setErreur(null);

    try {
      const res = await fetch(
        `/api/caisse/transferts/${encodeURIComponent(patient.transfertSortantId)}/actions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        }
      );

      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? t("caisse.transferts.actionImpossible"));

      setOuvert(false);
      onRafraichir?.();
      window.dispatchEvent(new CustomEvent(EVENEMENT_CAISSE_PATIENTS_MODIFIES));
    } catch (error) {
      setErreur(
        error instanceof Error ? error.message : t("caisse.transferts.erreurInattendue")
      );
    } finally {
      setEnCours(false);
    }
  };

  const transfere =
    patient.statut === "Transféré" ||
    patient.statutTransfertSortant === "ACCEPTE" ||
    patient.statutTransfertSortant === "TERMINE";

  if (transfere || !patient.factureOuverte || !patient.transfertSortantId) {
    return null;
  }

  const menu =
    monte &&
    ouvert &&
    createPortal(
      <div
        ref={menuRef}
        style={{ top: position.top, left: position.left }}
        className="fixed z-[100] min-w-[180px] rounded-lg border border-gris-bordure bg-white py-1 shadow-lg"
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
            {t("caisse.transferts.confirmer")}
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
            {t("caisse.transferts.rejeter")}
          </button>
        )}
        {peutRestaurer && (
          <button
            type="button"
            disabled={enCours}
            onClick={(e) => {
              e.stopPropagation();
              void executerAction("recuperer");
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-bleu-medical transition-colors hover:bg-bleu-medical-clair/40 disabled:opacity-50"
            role="menuitem"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {t("caisse.transferts.restaurer")}
          </button>
        )}
        {!peutConfirmer && !peutRejeter && !peutRestaurer && (
          <p className="px-3 py-2 text-xs text-texte-secondaire">
            {t("caisse.transferts.aucuneAction")}
          </p>
        )}
        {erreur && (
          <p className="border-t border-gris-bordure px-3 py-2 text-xs text-red-600">{erreur}</p>
        )}
      </div>,
      document.body
    );

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
        aria-label={t("caisse.transferts.plusActions", { nom: patient.nomComplet })}
        aria-expanded={ouvert ? "true" : "false"}
        aria-haspopup="menu"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {menu}
    </>
  );
}
