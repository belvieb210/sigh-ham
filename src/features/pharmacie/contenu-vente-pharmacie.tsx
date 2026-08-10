"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import {
  MiseEnPagePharmacie,
  type UtilisateurPharmacie,
} from "@/features/pharmacie/mise-en-page-pharmacie";
import type { VenteResume } from "@/lib/pharmacie/types";

export function ContenuVentePharmacie({
  utilisateur,
  mode = "attente",
}: {
  utilisateur: UtilisateurPharmacie;
  mode?: "attente" | "payees" | "remise" | "historique";
}) {
  const { t } = useTranslation();
  const [ventes, setVentes] = useState<VenteResume[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);
  const [busy, setBusy] = useState(false);

  const statutFiltre =
    mode === "attente"
      ? "TRANSMISE"
      : mode === "payees" || mode === "remise"
        ? "PAYEE"
        : undefined;

  const charger = useCallback(async () => {
    setChargement(true);
    try {
      const rv = await fetch(
        `/api/pharmacie/ventes${statutFiltre ? `?statut=${statutFiltre}` : ""}`
      );
      const dv = (await rv.json()) as { ventes?: VenteResume[] };
      setVentes(dv.ventes ?? []);
    } finally {
      setChargement(false);
    }
  }, [statutFiltre]);

  useEffect(() => {
    void charger();
  }, [charger]);

  const actionVente = async (action: "transmettre" | "delivrer", venteId: string) => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/pharmacie/ventes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, venteId }),
      });
      const data = (await res.json()) as { message?: string };
      setMessage(data.message ?? (res.ok ? "OK" : t("pharmacie.common.erreur")));
      await charger();
    } finally {
      setBusy(false);
    }
  };

  const titre =
    mode === "attente"
      ? t("pharmacie.vente.attentePaiement")
      : mode === "payees"
        ? t("pharmacie.vente.paiementsValides")
        : mode === "remise"
          ? t("pharmacie.vente.remise")
          : t("pharmacie.historique.titre");

  return (
    <MiseEnPagePharmacie
      utilisateur={utilisateur}
      titre={titre}
      sousTitre={t("pharmacie.vente.sousTitre")}
    >
      {message && <p className="mb-3 text-sm text-emerald-700">{message}</p>}

      {chargement ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <div className="space-y-2">
          {ventes.map((v) => (
            <div
              key={v.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gris-bordure bg-white p-3 text-sm"
            >
              <div>
                <p className="font-semibold">
                  {v.numero} — {v.nomComplet}
                </p>
                <p className="text-xs text-texte-secondaire">
                  {v.statut} · {v.montantTotal.toLocaleString("fr-FR")} CDF · {v.type}
                </p>
              </div>
              <div className="flex gap-2">
                {v.statut === "BROUILLON" && (
                  <button
                    type="button"
                    disabled={busy}
                    className="rounded-lg bg-bleu-medical px-3 py-1.5 text-xs text-white disabled:opacity-50"
                    onClick={() => void actionVente("transmettre", v.id)}
                  >
                    {t("pharmacie.vente.transmettre")}
                  </button>
                )}
                {v.statut === "PAYEE" && mode === "remise" && (
                  <button
                    type="button"
                    disabled={busy}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs text-white disabled:opacity-50"
                    onClick={() => void actionVente("delivrer", v.id)}
                  >
                    {t("pharmacie.vente.remettre")}
                  </button>
                )}
              </div>
            </div>
          ))}
          {ventes.length === 0 && (
            <p className="text-sm text-texte-secondaire">{t("pharmacie.vente.vide")}</p>
          )}
        </div>
      )}
    </MiseEnPagePharmacie>
  );
}
