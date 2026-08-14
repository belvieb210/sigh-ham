"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { useDemanderConfirmation } from "@/components/ui/fournisseur-modale-confirmation";
import { formaterMontantCaisse } from "@/features/caisse/utils-format";
import type { SessionCaisseActive } from "@/lib/caisse/types";

export function PanneauSessionCaisse() {
  const { t } = useTranslation();
  const demanderConfirmation = useDemanderConfirmation();
  const [session, setSession] = useState<SessionCaisseActive | null>(null);
  const [chargement, setChargement] = useState(true);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [soldeSaisi, setSoldeSaisi] = useState("0");

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      // Sans auto=1 : ne pas ouvrir une session à 0 sans saisie du solde
      const res = await fetch("/api/caisse/session");
      const data = (await res.json()) as {
        session?: SessionCaisseActive | null;
        erreur?: string;
      };
      if (!res.ok) throw new Error(data.erreur ?? "Erreur session");
      setSession(data.session ?? null);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur session");
      setSession(null);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    void charger();
  }, [charger]);

  const cloturer = () => {
    if (!session || enCours) return;
    demanderConfirmation({
      titre: t("caisse.layout.cloturerSession"),
      description: t("caisse.layout.confirmerCloture"),
      libelleConfirmer: t("caisse.layout.cloturerSession"),
      libelleAnnuler: t("client.common.annuler"),
      variante: "avertissement",
      onConfirmer: async () => {
        setEnCours(true);
        setErreur(null);
        try {
          const res = await fetch("/api/caisse/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "cloturer" }),
          });
          const data = (await res.json()) as { erreur?: string };
          if (!res.ok) throw new Error(data.erreur ?? "Clôture impossible");
          setSession(null);
          setSoldeSaisi("0");
        } catch (e) {
          setErreur(e instanceof Error ? e.message : "Clôture impossible");
          throw e;
        } finally {
          setEnCours(false);
        }
      },
    });
  };

  const ouvrir = async () => {
    setEnCours(true);
    setErreur(null);
    try {
      const soldeOuverture = Math.max(
        0,
        Math.round((Number.parseFloat(soldeSaisi.replace(",", ".")) || 0) * 100) /
          100
      );
      const res = await fetch("/api/caisse/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ouvrir", soldeOuverture }),
      });
      const data = (await res.json()) as {
        session?: SessionCaisseActive;
        erreur?: string;
      };
      if (!res.ok || !data.session) {
        throw new Error(data.erreur ?? "Ouverture impossible");
      }
      setSession(data.session);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Ouverture impossible");
    } finally {
      setEnCours(false);
    }
  };

  const heure =
    session?.ouverteLe != null
      ? new Date(session.ouverteLe).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  return (
    <div className="rounded-xl border border-bleu-medical/20 bg-bleu-medical-clair/30 p-3">
      {chargement ? (
        <div className="flex items-center justify-center gap-2 py-3 text-xs text-texte-secondaire">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          {t("caisse.layout.sessionChargement")}
        </div>
      ) : session ? (
        <>
          <p className="text-xs font-semibold text-bleu-medical">
            {t("caisse.layout.sessionEnCours")}
          </p>
          <p className="mt-1 text-[11px] text-texte-secondaire">
            {t("caisse.layout.ouverteA", { heure })} ·{" "}
            {t("caisse.layout.caisseNumero", { numero: session.numeroCaisse })}
          </p>
          <p className="mt-2 text-[11px] text-texte-secondaire">
            {t("caisse.layout.soldeOuverture")}
          </p>
          <p className="text-sm font-bold text-texte-principal">
            {formaterMontantCaisse(session.soldeOuverture)}
          </p>
          {erreur && <p className="mt-1 text-[10px] text-red-600">{erreur}</p>}
          <button
            type="button"
            disabled={enCours}
            onClick={cloturer}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
          >
            {enCours ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            {t("caisse.layout.cloturerSession")}
          </button>
        </>
      ) : (
        <>
          <p className="text-xs font-semibold text-texte-principal">
            {t("caisse.layout.aucuneSession")}
          </p>
          <p className="mt-1 text-[11px] text-texte-secondaire">
            {t("caisse.layout.ouvrirSessionAide")}
          </p>
          <label className="mt-2 block text-[11px] text-texte-secondaire">
            {t("caisse.layout.soldeOuverture")}
            <input
              type="number"
              min={0}
              step="0.01"
              value={soldeSaisi}
              onChange={(e) => setSoldeSaisi(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gris-bordure bg-white px-2 py-1.5 text-sm font-semibold text-texte-principal outline-none focus:border-bleu-medical"
              placeholder="0.00"
            />
          </label>
          {erreur && <p className="mt-1 text-[10px] text-red-600">{erreur}</p>}
          <button
            type="button"
            disabled={enCours}
            onClick={() => void ouvrir()}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-bleu-medical/30 bg-white px-2 py-1.5 text-xs font-semibold text-bleu-medical hover:bg-bleu-medical-clair/40 disabled:opacity-50"
          >
            {enCours ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            {t("caisse.layout.ouvrirSession")}
          </button>
        </>
      )}
    </div>
  );
}
