"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Banknote,
  Download,
  FileText,
  Loader2,
  Package,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import {
  MiseEnPagePharmacie,
  type UtilisateurPharmacie,
} from "@/features/pharmacie/mise-en-page-pharmacie";
import type { RapportVentesPharmacie } from "@/lib/pharmacie/types";
import { cn } from "@/lib/utils";

function formaterMontant(v: number) {
  return `${Math.round(v).toLocaleString("fr-FR")} FC`;
}

function formaterDateIso(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function formaterDateHeure(iso: string) {
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function debutJourIso() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function finJourIso() {
  return new Date().toISOString().slice(0, 10);
}

function libelleStatut(statut: string, t: (k: string) => string) {
  if (statut === "PAYEE") return t("pharmacie.rapports.statutPayee");
  if (statut === "DELIVREE") return t("pharmacie.rapports.statutDelivree");
  if (statut === "TRANSMISE") return t("pharmacie.rapports.statutTransmise");
  return statut;
}

function badgeStatut(statut: string) {
  if (statut === "PAYEE" || statut === "DELIVREE") {
    return "bg-emerald-100 text-emerald-800";
  }
  if (statut === "TRANSMISE") {
    return "bg-amber-100 text-amber-800";
  }
  return "bg-slate-100 text-slate-700";
}

export function ContenuRapportsPharmacie({
  utilisateur,
}: {
  utilisateur: UtilisateurPharmacie;
}) {
  const { t } = useTranslation();
  const [depuis, setDepuis] = useState(debutJourIso);
  const [jusqua, setJusqua] = useState(finJourIso);
  const [rapport, setRapport] = useState<RapportVentesPharmacie | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const params = new URLSearchParams({ type: "rapport-ventes" });
      if (depuis) params.set("depuis", `${depuis}T00:00:00.000Z`);
      if (jusqua) params.set("jusqua", `${jusqua}T23:59:59.999Z`);
      const res = await fetch(`/api/pharmacie/stock?${params}`);
      const data = (await res.json()) as {
        rapport?: RapportVentesPharmacie;
        erreur?: string;
      };
      if (!res.ok || !data.rapport) {
        throw new Error(data.erreur ?? t("pharmacie.rapports.erreur"));
      }
      setRapport(data.rapport);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : t("pharmacie.rapports.erreur"));
      setRapport(null);
    } finally {
      setChargement(false);
    }
  }, [depuis, jusqua, t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  const ventesTransmises = useMemo(
    () => rapport?.ventes.filter((v) => v.statut === "TRANSMISE").length ?? 0,
    [rapport]
  );

  const urlExport = (format: "csv" | "pdf") => {
    const params = new URLSearchParams({
      type: "rapport-ventes",
      format,
    });
    if (depuis) params.set("depuis", `${depuis}T00:00:00.000Z`);
    if (jusqua) params.set("jusqua", `${jusqua}T23:59:59.999Z`);
    return `/api/pharmacie/stock?${params}`;
  };

  return (
    <MiseEnPagePharmacie
      utilisateur={utilisateur}
      titre={t("pharmacie.rapports.titre")}
      sousTitre={t("pharmacie.rapports.sousTitre")}
    >
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col gap-3 rounded-xl border border-gris-bordure bg-white p-4 shadow-sm lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-texte-secondaire">
                {t("pharmacie.rapports.periodeDu")}
              </label>
              <input
                type="date"
                value={depuis}
                onChange={(e) => setDepuis(e.target.value)}
                className="rounded-lg border border-gris-bordure px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-texte-secondaire">
                {t("pharmacie.rapports.periodeAu")}
              </label>
              <input
                type="date"
                value={jusqua}
                onChange={(e) => setJusqua(e.target.value)}
                className="rounded-lg border border-gris-bordure px-3 py-2 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => void charger()}
              disabled={chargement}
              className="rounded-lg bg-bleu-medical px-4 py-2 text-sm font-semibold text-white hover:bg-bleu-medical/90 disabled:opacity-60"
            >
              {t("pharmacie.rapports.appliquer")}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={urlExport("csv")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gris-bordure bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-50"
            >
              <Download className="h-4 w-4" />
              {t("pharmacie.rapports.exportCsv")}
            </a>
            <a
              href={urlExport("pdf")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gris-bordure bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-50"
            >
              <FileText className="h-4 w-4" />
              {t("pharmacie.rapports.exportPdf")}
            </a>
          </div>
        </div>

        {erreur && (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {erreur}
          </p>
        )}

        {chargement ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-bleu-medical" />
          </div>
        ) : rapport ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-texte-secondaire">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {t("pharmacie.rapports.nombreVentes")}
                  </span>
                </div>
                <p className="text-2xl font-bold text-texte-principal">
                  {rapport.nombreVentes}
                </p>
                <p className="mt-1 text-xs text-texte-secondaire">
                  {formaterDateIso(rapport.depuis)} — {formaterDateIso(rapport.jusqua)}
                </p>
              </article>
              <article className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-emerald-800">
                  <Banknote className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {t("pharmacie.rapports.chiffreAffaires")}
                  </span>
                </div>
                <p className="text-2xl font-bold text-emerald-900">
                  {formaterMontant(rapport.chiffreAffaires)}
                </p>
              </article>
              <article className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-amber-800">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {t("pharmacie.rapports.ventesTransmises")}
                  </span>
                </div>
                <p className="text-2xl font-bold text-amber-900">{ventesTransmises}</p>
              </article>
              <article className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-texte-secondaire">
                  <Package className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {t("pharmacie.rapports.topProduits")}
                  </span>
                </div>
                <p className="truncate text-sm font-semibold text-texte-principal">
                  {rapport.topProduits[0]?.nom ?? "—"}
                </p>
                {rapport.topProduits[0] && (
                  <p className="mt-1 text-xs text-texte-secondaire">
                    {t("pharmacie.rapports.quantite", {
                      count: rapport.topProduits[0].quantite,
                    })}
                  </p>
                )}
              </article>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
              <section className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
                <div className="border-b border-gris-bordure bg-slate-50 px-4 py-3">
                  <h2 className="text-sm font-semibold text-texte-principal">
                    {t("pharmacie.dashboard.colVente")} / {t("pharmacie.dashboard.colClient")}
                  </h2>
                </div>
                {rapport.ventes.length === 0 ? (
                  <p className="px-4 py-12 text-center text-sm text-texte-secondaire">
                    {t("pharmacie.rapports.vide")}
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="tableau-sigh w-full min-w-[640px]">
                      <thead className="border-b bg-slate-50 text-[10px] uppercase tracking-wide text-texte-secondaire">
                        <tr>
                          <th className="px-3 py-2 text-left">{t("pharmacie.rapports.colNumero")}</th>
                          <th className="px-3 py-2 text-left">{t("pharmacie.rapports.colClient")}</th>
                          <th className="px-3 py-2 text-left">{t("pharmacie.rapports.colStatut")}</th>
                          <th className="px-3 py-2 text-right">{t("pharmacie.rapports.colMontant")}</th>
                          <th className="px-3 py-2 text-left">{t("pharmacie.rapports.colDate")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gris-bordure/60">
                        {rapport.ventes.map((v) => (
                          <tr key={v.numero} className="text-sm hover:bg-slate-50/80">
                            <td className="px-3 py-2 font-mono text-xs">{v.numero}</td>
                            <td className="px-3 py-2 font-medium">{v.client}</td>
                            <td className="px-3 py-2">
                              <span
                                className={cn(
                                  "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                                  badgeStatut(v.statut)
                                )}
                              >
                                {libelleStatut(v.statut, t)}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right font-medium">
                              {formaterMontant(v.montant)}
                            </td>
                            <td className="px-3 py-2 text-xs text-texte-secondaire">
                              {formaterDateHeure(v.creeLe)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <aside className="space-y-4">
                <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
                    {t("pharmacie.rapports.topProduits")}
                  </h3>
                  <ol className="space-y-2">
                    {rapport.topProduits.slice(0, 10).map((p, i) => (
                      <li
                        key={`${p.nom}-${i}`}
                        className="flex items-start justify-between gap-2 text-sm"
                      >
                        <span className="min-w-0">
                          <span className="mr-1.5 text-xs font-bold text-bleu-medical">
                            {i + 1}.
                          </span>
                          <span className="font-medium">{p.nom}</span>
                        </span>
                        <span className="shrink-0 text-right text-xs text-texte-secondaire">
                          {p.quantite} · {formaterMontant(p.montant)}
                        </span>
                      </li>
                    ))}
                    {rapport.topProduits.length === 0 && (
                      <li className="text-sm text-texte-secondaire">—</li>
                    )}
                  </ol>
                </section>

                {rapport.flopProduits.length > 0 && (
                  <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
                    <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
                      {t("pharmacie.rapports.flopProduits")}
                    </h3>
                    <ul className="space-y-1.5 text-sm text-texte-secondaire">
                      {rapport.flopProduits.slice(0, 5).map((p) => (
                        <li key={p.nom} className="flex justify-between gap-2">
                          <span className="truncate">{p.nom}</span>
                          <span className="shrink-0">{p.quantite}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </aside>
            </div>
          </>
        ) : null}
      </div>
    </MiseEnPagePharmacie>
  );
}
