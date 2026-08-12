"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import {
  MiseEnPagePharmacie,
  type UtilisateurPharmacie,
} from "@/features/pharmacie/mise-en-page-pharmacie";
import type { LotResume, FournisseurResume } from "@/lib/pharmacie/types";
import { CLASSE_CHAMP_RECEPTION, CLASSE_LABEL_RECEPTION } from "@/constants/reception";

export function ContenuStockPharmacie({
  utilisateur,
  vue = "stock",
}: {
  utilisateur: UtilisateurPharmacie;
  vue?: "stock" | "lots" | "peremptions" | "fournisseurs" | "achats" | "retours" | "rapports";
}) {
  const { t } = useTranslation();
  const [lots, setLots] = useState<LotResume[]>([]);
  const [fournisseurs, setFournisseurs] = useState<FournisseurResume[]>([]);
  const [rapport, setRapport] = useState<Record<string, unknown> | null>(null);
  const [chargement, setChargement] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [nomFourn, setNomFourn] = useState("");
  const [fournisseurId, setFournisseurId] = useState("");
  const [medicamentId, setMedicamentId] = useState("");
  const [numeroLot, setNumeroLot] = useState("");
  const [quantite, setQuantite] = useState(10);
  const [prixAchat, setPrixAchat] = useState(100);
  const [expirationLe, setExpirationLe] = useState("");
  const [medicaments, setMedicaments] = useState<{ id: string; nom: string }[]>([]);

  const charger = useCallback(async () => {
    setChargement(true);
    try {
      if (vue === "fournisseurs" || vue === "achats") {
        const rf = await fetch("/api/pharmacie/stock?type=fournisseurs");
        const df = (await rf.json()) as { fournisseurs?: FournisseurResume[] };
        setFournisseurs((df.fournisseurs as FournisseurResume[]) ?? []);
      }
      if (vue === "rapports") {
        const rr = await fetch("/api/pharmacie/stock?type=rapport-ventes");
        const dr = (await rr.json()) as { rapport?: Record<string, unknown> };
        setRapport(dr.rapport ?? null);
      } else {
        const rl = await fetch("/api/pharmacie/stock?type=lots");
        const dl = (await rl.json()) as { lots?: LotResume[] };
        let lotsData = dl.lots ?? [];
        if (vue === "peremptions") {
          const lim = new Date();
          lim.setDate(lim.getDate() + 30);
          lotsData = lotsData.filter(
            (l) => new Date(l.expirationLe) <= lim && l.quantite > 0
          );
        }
        setLots(lotsData);
      }
      const rm = await fetch("/api/pharmacie/medicaments");
      const dm = (await rm.json()) as { medicaments?: { id: string; nom: string }[] };
      setMedicaments(dm.medicaments ?? []);
    } finally {
      setChargement(false);
    }
  }, [vue]);

  useEffect(() => {
    void charger();
  }, [charger]);

  const sauverFournisseur = async () => {
    const res = await fetch("/api/pharmacie/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "fournisseur", nom: nomFourn }),
    });
    const data = (await res.json()) as { message?: string };
    setMessage(data.message ?? "");
    setNomFourn("");
    await charger();
  };

  const recevoirAchat = async () => {
    const res = await fetch("/api/pharmacie/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "achat",
        fournisseurId,
        lignes: [
          {
            medicamentId,
            numeroLot,
            quantite,
            prixAchat,
            expirationLe,
          },
        ],
      }),
    });
    const data = (await res.json()) as { message?: string };
    setMessage(data.message ?? "");
    await charger();
  };

  const titres: Record<string, string> = {
    stock: t("pharmacie.stock.titre"),
    lots: t("pharmacie.stock.lots"),
    peremptions: t("pharmacie.stock.peremptions"),
    fournisseurs: t("pharmacie.stock.fournisseurs"),
    achats: t("pharmacie.stock.achats"),
    retours: t("pharmacie.stock.retours"),
    rapports: t("pharmacie.stock.rapports"),
  };

  return (
    <MiseEnPagePharmacie
      utilisateur={utilisateur}
      titre={titres[vue] ?? t("pharmacie.stock.titre")}
      sousTitre={t("pharmacie.stock.sousTitre")}
    >
      {message && <p className="mb-3 text-sm text-emerald-700">{message}</p>}
      {chargement ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : vue === "fournisseurs" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <input
              className={CLASSE_CHAMP_RECEPTION}
              placeholder={t("pharmacie.stock.nomFournisseur")}
              value={nomFourn}
              onChange={(e) => setNomFourn(e.target.value)}
            />
            <button
              type="button"
              onClick={() => void sauverFournisseur()}
              className="rounded-lg bg-bleu-medical px-3 py-2 text-xs text-white"
            >
              {t("pharmacie.stock.ajouter")}
            </button>
          </div>
          <ul className="space-y-2 text-sm">
            {fournisseurs.map((f) => (
              <li key={f.id} className="rounded-lg border border-gris-bordure bg-white p-3">
                {f.nom}
              </li>
            ))}
          </ul>
        </div>
      ) : vue === "achats" ? (
        <div className="max-w-xl space-y-3 rounded-xl border border-gris-bordure bg-white p-4">
          <div>
            <label className={CLASSE_LABEL_RECEPTION}>{t("pharmacie.stock.fournisseur")}</label>
            <select
              className={CLASSE_CHAMP_RECEPTION}
              value={fournisseurId}
              onChange={(e) => setFournisseurId(e.target.value)}
            >
              <option value="">—</option>
              {fournisseurs.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={CLASSE_LABEL_RECEPTION}>{t("pharmacie.vente.medicament")}</label>
            <select
              className={CLASSE_CHAMP_RECEPTION}
              value={medicamentId}
              onChange={(e) => setMedicamentId(e.target.value)}
            >
              <option value="">—</option>
              {medicaments.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={CLASSE_LABEL_RECEPTION}>{t("pharmacie.stock.numeroLot")}</label>
              <input className={CLASSE_CHAMP_RECEPTION} value={numeroLot} onChange={(e) => setNumeroLot(e.target.value)} />
            </div>
            <div>
              <label className={CLASSE_LABEL_RECEPTION}>{t("pharmacie.vente.qte")}</label>
              <input type="number" className={CLASSE_CHAMP_RECEPTION} value={quantite} onChange={(e) => setQuantite(Number(e.target.value) || 0)} />
            </div>
            <div>
              <label className={CLASSE_LABEL_RECEPTION}>{t("pharmacie.stock.prixAchat")}</label>
              <input type="number" className={CLASSE_CHAMP_RECEPTION} value={prixAchat} onChange={(e) => setPrixAchat(Number(e.target.value) || 0)} />
            </div>
            <div>
              <label className={CLASSE_LABEL_RECEPTION}>{t("pharmacie.stock.expiration")}</label>
              <input type="date" className={CLASSE_CHAMP_RECEPTION} value={expirationLe} onChange={(e) => setExpirationLe(e.target.value)} />
            </div>
          </div>
          <button
            type="button"
            onClick={() => void recevoirAchat()}
            className="rounded-lg bg-bleu-medical px-3 py-2 text-xs font-semibold text-white"
          >
            {t("pharmacie.stock.recevoirAchat")}
          </button>
        </div>
      ) : vue === "rapports" ? (
        <div className="space-y-3 text-sm">
          <a
            href="/api/pharmacie/stock?type=rapport-ventes&format=csv"
            className="inline-block rounded-lg border border-gris-bordure px-3 py-2 text-xs font-semibold"
          >
            {t("pharmacie.stock.exportCsv")}
          </a>
          <a
            href="/api/pharmacie/stock?type=rapport-ventes&format=pdf"
            className="ml-2 inline-block rounded-lg border border-gris-bordure px-3 py-2 text-xs font-semibold"
          >
            {t("pharmacie.stock.exportPdf")}
          </a>
          <pre className="overflow-auto rounded-xl border border-gris-bordure bg-white p-4 text-xs">
            {JSON.stringify(rapport, null, 2)}
          </pre>
        </div>
      ) : vue === "retours" ? (
        <p className="text-sm text-texte-secondaire">{t("pharmacie.stock.retoursAide")}</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gris-bordure bg-white">
          <table className="tableau-sigh">
            <thead className="border-b bg-slate-50 text-xs uppercase text-texte-secondaire">
              <tr>
                <th className="px-3 py-2">{t("pharmacie.vente.medicament")}</th>
                <th className="px-3 py-2">{t("pharmacie.stock.numeroLot")}</th>
                <th className="px-3 py-2">{t("pharmacie.vente.qte")}</th>
                <th className="px-3 py-2">{t("pharmacie.stock.expiration")}</th>
              </tr>
            </thead>
            <tbody>
              {lots.map((l) => (
                <tr key={l.id} className="border-b border-gris-bordure/50">
                  <td className="px-3 py-2">{l.medicamentNom}</td>
                  <td className="px-3 py-2 font-mono text-xs">{l.numeroLot}</td>
                  <td className="px-3 py-2">{l.quantite}</td>
                  <td className="px-3 py-2 text-xs">
                    {new Date(l.expirationLe).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </MiseEnPagePharmacie>
  );
}
