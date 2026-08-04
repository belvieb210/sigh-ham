"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Plus, Trash2 } from "lucide-react";
import {
  MiseEnPagePharmacie,
  type UtilisateurPharmacie,
} from "@/features/pharmacie/mise-en-page-pharmacie";
import type { MedicamentResume, VenteResume } from "@/lib/pharmacie/types";
import { CLASSE_CHAMP_RECEPTION, CLASSE_LABEL_RECEPTION } from "@/constants/reception";

export function ContenuVentePharmacie({
  utilisateur,
  mode = "vente",
}: {
  utilisateur: UtilisateurPharmacie;
  mode?: "vente" | "attente" | "payees" | "remise" | "nouveau";
}) {
  const { t } = useTranslation();
  const [medicaments, setMedicaments] = useState<MedicamentResume[]>([]);
  const [ventes, setVentes] = useState<VenteResume[]>([]);
  const [dossierId, setDossierId] = useState("");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [lignes, setLignes] = useState<
    { medicamentId: string; quantite: number }[]
  >([{ medicamentId: "", quantite: 1 }]);
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
      const [rm, rv] = await Promise.all([
        fetch("/api/pharmacie/medicaments"),
        fetch(
          `/api/pharmacie/ventes${statutFiltre ? `?statut=${statutFiltre}` : ""}`
        ),
      ]);
      const dm = (await rm.json()) as { medicaments?: MedicamentResume[] };
      const dv = (await rv.json()) as { ventes?: VenteResume[] };
      setMedicaments(dm.medicaments ?? []);
      setVentes(dv.ventes ?? []);
    } finally {
      setChargement(false);
    }
  }, [statutFiltre]);

  useEffect(() => {
    void charger();
  }, [charger]);

  const creerClient = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/pharmacie/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prenom, nom, telephone }),
      });
      const data = (await res.json()) as {
        message?: string;
        dossierId?: string;
      };
      if (!res.ok) {
        setMessage(data.message ?? t("pharmacie.common.erreur"));
        return;
      }
      setDossierId(data.dossierId ?? "");
      setMessage(data.message ?? "");
    } finally {
      setBusy(false);
    }
  };

  const creerVente = async () => {
    if (!dossierId) {
      setMessage(t("pharmacie.vente.besoinClient"));
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/pharmacie/ventes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dossierId,
          lignes: lignes.filter((l) => l.medicamentId && l.quantite > 0),
        }),
      });
      const data = (await res.json()) as {
        message?: string;
        vente?: { id: string };
      };
      if (!res.ok) {
        setMessage(data.message ?? t("pharmacie.common.erreur"));
        return;
      }
      if (data.vente?.id) {
        const tr = await fetch("/api/pharmacie/ventes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "transmettre", venteId: data.vente.id }),
        });
        const td = (await tr.json()) as { message?: string };
        setMessage(td.message ?? data.message ?? "");
      }
      setLignes([{ medicamentId: "", quantite: 1 }]);
      await charger();
    } finally {
      setBusy(false);
    }
  };

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
    mode === "nouveau"
      ? t("pharmacie.vente.nouveauClient")
      : mode === "attente"
        ? t("pharmacie.vente.attentePaiement")
        : mode === "payees"
          ? t("pharmacie.vente.paiementsValides")
          : mode === "remise"
            ? t("pharmacie.vente.remise")
            : t("pharmacie.vente.titre");

  return (
    <MiseEnPagePharmacie
      utilisateur={utilisateur}
      titre={titre}
      sousTitre={t("pharmacie.vente.sousTitre")}
    >
      {message && <p className="mb-3 text-sm text-emerald-700">{message}</p>}

      {(mode === "vente" || mode === "nouveau") && (
        <div className="mb-6 space-y-4 rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold">{t("pharmacie.vente.client")}</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className={CLASSE_LABEL_RECEPTION}>{t("pharmacie.vente.prenom")}</label>
              <input className={CLASSE_CHAMP_RECEPTION} value={prenom} onChange={(e) => setPrenom(e.target.value)} />
            </div>
            <div>
              <label className={CLASSE_LABEL_RECEPTION}>{t("pharmacie.vente.nom")}</label>
              <input className={CLASSE_CHAMP_RECEPTION} value={nom} onChange={(e) => setNom(e.target.value)} />
            </div>
            <div>
              <label className={CLASSE_LABEL_RECEPTION}>{t("pharmacie.vente.telephone")}</label>
              <input className={CLASSE_CHAMP_RECEPTION} value={telephone} onChange={(e) => setTelephone(e.target.value)} />
            </div>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => void creerClient()}
            className="rounded-lg border border-gris-bordure px-3 py-2 text-xs font-semibold"
          >
            {t("pharmacie.vente.enregistrerClient")}
          </button>
          {dossierId && (
            <p className="text-xs text-texte-secondaire">
              {t("pharmacie.vente.dossier")}: {dossierId}
            </p>
          )}

          <h2 className="pt-2 text-sm font-semibold">{t("pharmacie.vente.panier")}</h2>
          {lignes.map((l, i) => (
            <div key={i} className="flex flex-wrap items-end gap-2">
              <div className="min-w-[200px] flex-1">
                <label className={CLASSE_LABEL_RECEPTION}>{t("pharmacie.vente.medicament")}</label>
                <select
                  className={CLASSE_CHAMP_RECEPTION}
                  value={l.medicamentId}
                  onChange={(e) => {
                    const next = [...lignes];
                    next[i] = { ...l, medicamentId: e.target.value };
                    setLignes(next);
                  }}
                >
                  <option value="">{t("pharmacie.vente.choisir")}</option>
                  {medicaments.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nom} ({m.stockDisponible}) — {m.prixUnitaire} CDF
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                <label className={CLASSE_LABEL_RECEPTION}>{t("pharmacie.vente.qte")}</label>
                <input
                  type="number"
                  min={1}
                  className={CLASSE_CHAMP_RECEPTION}
                  value={l.quantite}
                  onChange={(e) => {
                    const next = [...lignes];
                    next[i] = { ...l, quantite: Number(e.target.value) || 1 };
                    setLignes(next);
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => setLignes(lignes.filter((_, j) => j !== i))}
                className="rounded-lg border border-gris-bordure p-2"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setLignes([...lignes, { medicamentId: "", quantite: 1 }])}
              className="inline-flex items-center gap-1 rounded-lg border border-gris-bordure px-3 py-2 text-xs"
            >
              <Plus className="h-3.5 w-3.5" /> {t("pharmacie.vente.ajouterLigne")}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void creerVente()}
              className="rounded-lg bg-bleu-medical px-3 py-2 text-xs font-semibold text-white"
            >
              {t("pharmacie.vente.creerTransmettre")}
            </button>
          </div>
        </div>
      )}

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
                <p className="font-semibold">{v.numero} — {v.nomComplet}</p>
                <p className="text-xs text-texte-secondaire">
                  {v.statut} · {v.montantTotal.toLocaleString("fr-FR")} CDF · {v.type}
                </p>
              </div>
              <div className="flex gap-2">
                {v.statut === "BROUILLON" && (
                  <button
                    type="button"
                    className="rounded-lg bg-bleu-medical px-3 py-1.5 text-xs text-white"
                    onClick={() => void actionVente("transmettre", v.id)}
                  >
                    {t("pharmacie.vente.transmettre")}
                  </button>
                )}
                {v.statut === "PAYEE" && mode === "remise" && (
                  <button
                    type="button"
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs text-white"
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
