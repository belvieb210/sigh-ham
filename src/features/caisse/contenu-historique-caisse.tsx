"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Printer,
  SlidersHorizontal,
} from "lucide-react";
import {
  compterFiltresHistorique,
  filtresHistoriqueVides,
  FormulaireFiltresHistoriqueCaisse,
  type FiltresHistoriqueCaisseUi,
} from "@/features/caisse/formulaire-filtres-historique-caisse";
import { MiseEnPageCaisse, type UtilisateurCaisse } from "@/features/caisse/mise-en-page-caisse";
import { ResumeRapportCaisse } from "@/features/caisse/resume-rapport-caisse";
import { formaterDate, formaterMontantCaisse } from "@/features/caisse/utils-format";
import type { RapportCaissePayload } from "@/lib/caisse/types";
import { cn } from "@/lib/utils";

interface Props {
  utilisateur: UtilisateurCaisse;
}

const PAR_PAGE = 15;

function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function ContenuHistoriqueCaisse({ utilisateur }: Props) {
  const { t } = useTranslation();
  const plageDefaut = useMemo(() => {
    const au = new Date();
    const du = new Date();
    du.setDate(du.getDate() - 29);
    return { dateDu: isoDate(du), dateAu: isoDate(au) };
  }, []);
  const [rapport, setRapport] = useState<RapportCaissePayload | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [brouillon, setBrouillon] = useState<FiltresHistoriqueCaisseUi>(() =>
    filtresHistoriqueVides(plageDefaut.dateDu, plageDefaut.dateAu)
  );
  const [appliques, setAppliques] = useState<FiltresHistoriqueCaisseUi>(() =>
    filtresHistoriqueVides(plageDefaut.dateDu, plageDefaut.dateAu)
  );
  const [page, setPage] = useState(1);

  const charger = useCallback(
    async (f: FiltresHistoriqueCaisseUi) => {
      setChargement(true);
      setErreur(null);
      try {
        const params = new URLSearchParams({ periode: "plage" });
        if (f.dateDu) params.set("dateDu", f.dateDu);
        if (f.dateAu) params.set("dateAu", f.dateAu);
        if (f.mode) params.set("mode", f.mode);
        if (f.caissierId) params.set("caissierId", f.caissierId);
        if (f.q.trim()) params.set("q", f.q.trim());
        const res = await fetch(`/api/caisse/rapports?${params}`);
        const data = (await res.json()) as {
          rapport?: RapportCaissePayload;
          erreur?: string;
        };
        if (!res.ok || !data.rapport) {
          throw new Error(data.erreur ?? t("caisse.historique.erreur"));
        }
        setRapport(data.rapport);
        setPage(1);
      } catch (e) {
        setErreur(e instanceof Error ? e.message : t("caisse.historique.erreur"));
        setRapport(null);
      } finally {
        setChargement(false);
      }
    },
    [t]
  );

  useEffect(() => {
    void charger(appliques);
  }, [appliques, charger]);

  const nbFiltres = compterFiltresHistorique(appliques, plageDefaut);
  const ledger = rapport?.ledger ?? [];
  const totalPages = Math.max(1, Math.ceil(ledger.length / PAR_PAGE));
  const pageCourante = Math.min(page, totalPages);
  const debut = (pageCourante - 1) * PAR_PAGE;
  const pageLedger = ledger.slice(debut, debut + PAR_PAGE);

  return (
    <MiseEnPageCaisse
      utilisateur={utilisateur}
      titre={t("caisse.historique.titre")}
      sousTitre={t("caisse.historique.sousTitre")}
    >
      <div className="mx-auto w-full max-w-7xl space-y-4 pb-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-texte-principal">
              {t("caisse.historique.titre")}
            </h2>
            <p className="mt-1 text-sm text-texte-secondaire">
              {rapport?.labelPeriode ?? t("caisse.historique.sousTitre")}
            </p>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-gris-bordure bg-white px-3 text-sm font-medium text-texte-principal hover:bg-gris-tres-clair"
            >
              <Printer className="h-4 w-4" />
              {t("caisse.historique.imprimer")}
            </button>
            <button
              type="button"
              onClick={() => setFiltresOuverts((o) => !o)}
              aria-expanded={filtresOuverts}
              className={cn(
                "relative inline-flex h-11 w-11 items-center justify-center rounded-lg border transition-colors",
                filtresOuverts
                  ? "border-bleu-medical bg-bleu-medical-clair text-bleu-medical"
                  : "border-gris-bordure bg-white text-texte-principal hover:bg-gris-tres-clair"
              )}
            >
              <SlidersHorizontal className="h-5 w-5" strokeWidth={2} />
              <span
                className={cn(
                  "absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white shadow-sm",
                  nbFiltres > 0 ? "bg-red-500" : "bg-slate-400"
                )}
              >
                {nbFiltres}
              </span>
            </button>
          </div>
        </div>

        {filtresOuverts && (
          <FormulaireFiltresHistoriqueCaisse
            valeurs={brouillon}
            onChange={setBrouillon}
            optionsCaissiers={rapport?.optionsCaissiers ?? []}
            onRechercher={() => setAppliques(brouillon)}
            onReinitialiser={() => {
              const vides = filtresHistoriqueVides(plageDefaut.dateDu, plageDefaut.dateAu);
              setBrouillon(vides);
              setAppliques(vides);
            }}
          />
        )}

        {chargement ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-gris-bordure bg-white py-16 text-sm text-texte-secondaire">
            <Loader2 className="h-5 w-5 animate-spin" />
            {t("caisse.historique.chargement")}
          </div>
        ) : erreur ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center">
            <p className="text-sm text-red-700">{erreur}</p>
            <button
              type="button"
              onClick={() => void charger(appliques)}
              className="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700"
            >
              {t("caisse.historique.reessayer")}
            </button>
          </div>
        ) : rapport ? (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <section className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
              <div className="border-b border-gris-bordure px-4 py-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-texte-secondaire">
                  {t("caisse.historique.ledger")}
                </h3>
              </div>
              {pageLedger.length === 0 ? (
                <p className="px-4 py-12 text-center text-sm text-texte-secondaire">
                  {t("caisse.historique.vide")}
                </p>
              ) : (
                <>
                  <ul className="divide-y divide-gris-bordure 2xl:hidden">
                    {pageLedger.map((l) => (
                      <li key={l.id} className="px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/sigh/caisse/facturation?dossier=${l.dossierId}`}
                              className="block truncate text-sm font-semibold text-bleu-medical"
                            >
                              {l.numeroFacture}
                            </Link>
                            <p className="mt-0.5 truncate text-sm font-medium text-texte-principal">
                              {l.patient}
                            </p>
                            <p className="mt-1 text-xs text-texte-secondaire">
                              {formaterDate(l.payeLe)} · {t(`caisse.modesPaiement.${l.mode}`)}
                            </p>
                          </div>
                          <p className="shrink-0 text-sm font-bold tabular-nums text-texte-principal">
                            {formaterMontantCaisse(l.montant, l.devise)}
                          </p>
                        </div>
                      </li>
                    ))}
                    <li className="flex items-center justify-between gap-3 bg-gris-tres-clair/40 px-4 py-3">
                      <span className="text-xs font-bold uppercase tracking-wide text-texte-secondaire">
                        {t("caisse.historique.totalPeriode")}
                      </span>
                      <span className="text-sm font-bold tabular-nums">
                        {formaterMontantCaisse(
                          rapport.agregats.encaissementsMontant,
                          rapport.devise
                        )}
                      </span>
                    </li>
                  </ul>
                  <div className="hidden overflow-hidden 2xl:block">
                  <table className="tableau-sigh">
                    <thead className="bg-gris-tres-clair/80 text-[11px] uppercase tracking-wider text-texte-secondaire">
                      <tr>
                        <th className="px-4 py-3 font-semibold">{t("caisse.historique.date")}</th>
                        <th className="px-4 py-3 font-semibold">{t("caisse.historique.facture")}</th>
                        <th className="px-4 py-3 font-semibold">{t("caisse.historique.patient")}</th>
                        <th className="px-4 py-3 font-semibold">{t("caisse.historique.mode")}</th>
                        <th className="px-4 py-3 font-semibold">{t("caisse.historique.caissier")}</th>
                        <th className="px-4 py-3 text-right font-semibold">
                          {t("caisse.historique.montant")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageLedger.map((l) => (
                        <tr
                          key={l.id}
                          className="border-t border-gris-bordure/80 hover:bg-gris-tres-clair/50"
                        >
                          <td className="px-4 py-3 tabular-nums text-texte-secondaire">
                            {formaterDate(l.payeLe)}
                          </td>
                          <td className="px-4 py-3">
                            <Link
                              href={`/sigh/caisse/facturation?dossier=${l.dossierId}`}
                              className="font-semibold text-bleu-medical hover:underline"
                            >
                              {l.numeroFacture}
                            </Link>
                          </td>
                          <td className="px-4 py-3 font-medium text-texte-principal">
                            {l.patient}
                          </td>
                          <td className="px-4 py-3 text-texte-secondaire">
                            {t(`caisse.modesPaiement.${l.mode}`)}
                          </td>
                          <td className="px-4 py-3 text-texte-secondaire">{l.caissier}</td>
                          <td className="px-4 py-3 text-right font-bold tabular-nums">
                            {formaterMontantCaisse(l.montant, l.devise)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gris-bordure bg-gris-tres-clair/40">
                        <td
                          colSpan={5}
                          className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-texte-secondaire"
                        >
                          {t("caisse.historique.totalPeriode")}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-bold tabular-nums">
                          {formaterMontantCaisse(
                            rapport.agregats.encaissementsMontant,
                            rapport.devise
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                  </div>
                </>
              )}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gris-bordure px-4 py-3 text-xs text-texte-secondaire print:hidden">
                <p>
                  {t("caisse.historique.pagination", {
                    debut: ledger.length === 0 ? 0 : debut + 1,
                    fin: Math.min(debut + PAR_PAGE, ledger.length),
                    total: ledger.length,
                  })}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={pageCourante <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="inline-flex items-center gap-1 rounded-lg border border-gris-bordure px-3 py-1.5 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    {t("caisse.historique.prec")}
                  </button>
                  <button
                    type="button"
                    disabled={pageCourante >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="inline-flex items-center gap-1 rounded-lg border border-gris-bordure px-3 py-1.5 disabled:opacity-40"
                  >
                    {t("caisse.historique.suiv")}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </section>
            <ResumeRapportCaisse rapport={rapport} />
          </div>
        ) : null}
      </div>
    </MiseEnPageCaisse>
  );
}
