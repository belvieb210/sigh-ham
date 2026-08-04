"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import {
  MiseEnPagePharmacie,
  type UtilisateurPharmacie,
} from "@/features/pharmacie/mise-en-page-pharmacie";
import type { OrdonnanceInbox } from "@/lib/pharmacie/types";
import { EVENEMENT_PHARMACIE_MODIFIE } from "@/constants/pharmacie";

export function ContenuOrdonnancesPharmacie({
  utilisateur,
}: {
  utilisateur: UtilisateurPharmacie;
}) {
  const { t } = useTranslation();
  const [liste, setListe] = useState<OrdonnanceInbox[]>([]);
  const [chargement, setChargement] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [enCours, setEnCours] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setChargement(true);
    try {
      const res = await fetch("/api/pharmacie/ordonnances");
      const data = (await res.json()) as { ordonnances?: OrdonnanceInbox[] };
      setListe(data.ordonnances ?? []);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    void charger();
  }, [charger]);

  const preparer = async (ordonnanceId: string) => {
    setEnCours(ordonnanceId);
    setMessage(null);
    try {
      const res = await fetch("/api/pharmacie/ordonnances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ordonnanceId }),
      });
      const data = (await res.json()) as { message?: string; vente?: { id: string } };
      if (!res.ok) {
        setMessage(data.message ?? t("pharmacie.common.erreur"));
        return;
      }
      setMessage(data.message ?? t("pharmacie.ordonnances.preparee"));
      if (data.vente?.id) {
        const tr = await fetch("/api/pharmacie/ventes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "transmettre", venteId: data.vente.id }),
        });
        const td = (await tr.json()) as { message?: string };
        setMessage(td.message ?? data.message ?? "");
      }
      window.dispatchEvent(new CustomEvent(EVENEMENT_PHARMACIE_MODIFIE));
      await charger();
    } finally {
      setEnCours(null);
    }
  };

  return (
    <MiseEnPagePharmacie
      utilisateur={utilisateur}
      titre={t("pharmacie.ordonnances.titre")}
      sousTitre={t("pharmacie.ordonnances.sousTitre")}
    >
      {message && <p className="mb-3 text-sm text-emerald-700">{message}</p>}
      {chargement ? (
        <Loader2 className="h-5 w-5 animate-spin text-texte-secondaire" />
      ) : liste.length === 0 ? (
        <p className="text-sm text-texte-secondaire">{t("pharmacie.ordonnances.vide")}</p>
      ) : (
        <div className="space-y-3">
          {liste.map((o) => (
            <div
              key={o.id}
              className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-texte-principal">{o.nomComplet}</p>
                  <p className="text-xs text-texte-secondaire">
                    {o.numeroDossier} · Dr {o.medecin} · {o.statut}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={enCours === o.id}
                  onClick={() => void preparer(o.id)}
                  className="rounded-lg bg-bleu-medical px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                >
                  {enCours === o.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t("pharmacie.ordonnances.preparerTransmettre")
                  )}
                </button>
              </div>
              <ul className="mt-3 space-y-1 text-xs text-texte-secondaire">
                {o.lignes.map((l) => (
                  <li key={l.id}>
                    {l.medicamentNom} × {l.quantite}
                    {l.posologie ? ` — ${l.posologie}` : ""} · stock {l.stockDisponible}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </MiseEnPagePharmacie>
  );
}
