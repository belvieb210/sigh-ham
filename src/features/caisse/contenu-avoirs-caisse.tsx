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
  compterFiltresAvoirs,
  filtresAvoirsVides,
  FormulaireFiltresAvoirsCaisse,
  type FiltresAvoirsCaisseUi,
} from "@/features/caisse/formulaire-filtres-avoirs-caisse";
import { MiseEnPageCaisse, type UtilisateurCaisse } from "@/features/caisse/mise-en-page-caisse";
import { ResumeAvoirsCaisse } from "@/features/caisse/resume-avoirs-caisse";
import { formaterDate, formaterMontantCaisse } from "@/features/caisse/utils-format";
import type { RapportAvoirsPayload } from "@/lib/caisse/types";
import { cn } from "@/lib/utils";

interface Props {
  utilisateur: UtilisateurCaisse;
}

const PAR_PAGE = 5;

function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function ContenuAvoirsCaisse({ utilisateur }: Props) {
  const { t } = useTranslation();
  const plageDefaut = useMemo(() => {
    const au = new Date();
    const du = new Date();
    du.setDate(du.getDate() - 29);
    return { dateDu: isoDate(du), dateAu: isoDate(au) };
  }, []);
  const [rapport, setRapport] = useState<RapportAvoirsPayload | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [brouillon, setBrouillon] = useState<FiltresAvoirsCaisseUi>(() =>
    filtresAvoirsVides(plageDefaut.dateDu, plageDefaut.dateAu)
  );
  const [appliques, setAppliques] = useState<FiltresAvoirsCaisseUi>(() =>
    filtresAvoirsVides(plageDefaut.dateDu, plageDefaut.dateAu)
  );
  const [page, setPage] = useState(1);

  const charger = useCallback(
    async (f: FiltresAvoirsCaisseUi) => {
      setChargement(true);
      setErreur(null);
      try {
        const params = new URLSearchParams();
        if (f.dateDu) params.set("dateDu", f.dateDu);
        if (f.dateAu) params.set("dateAu", f.dateAu);
        if (f.type) params.set("type", f.type);
        if (f.caissierId) params.set("caissierId", f.caissierId);
        if (f.q.trim()) params.set("q", f.q.trim());
        const res = await fetch(`/api/caisse/avoirs?${params}`);
        const data = (await res.json()) as {
          rapport?: RapportAvoirsPayload;
          erreur?: string;
        };
        if (!res.ok || !data.rapport) {
          throw new Error(data.erreur ?? t("caisse.avoirs.erreur"));
        }
        setRapport(data.rapport);
        setPage(1);
      } catch (e) {
        setErreur(e instanceof Error ? e.message : t("caisse.avoirs.erreur"));
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

  const nbFiltres = compterFiltresAvoirs(appliques, plageDefaut);
  const ledger = rapport?.ledger ?? [];
  const totalPages = Math.max(1, Math.ceil(ledger.length / PAR_PAGE));
  const pageCourante = Math.min(page, totalPages);
  const debut = (pageCourante - 1) * PAR_PAGE;
  const pageLedger = ledger.slice(debut, debut + PAR_PAGE);

  return (
    <MiseEnPageCaisse
      utilisateur={utilisateur}
      titre={t("caisse.avoirs.titre")}
      sousTitre={t("caisse.avoirs.sousTitre")}
    >
      <div className="mx-auto w-full max-w-7xl space-y-4 pb-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-texte-principal">{t("caisse.avoirs.titre")}</h2>
            <p className="mt-1 text-sm text-texte-secondaire">
              {rapport?.labelPeriode ?? t("caisse.avoirs.sousTitre")}
            </p>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-gris-bordure bg-white px-3 text-sm font-medium text-texte-principal hover:bg-gris-tres-clair"
            >
              <Printer className="h-4 w-4" />
              {t("caisse.avoirs.imprimer")}
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
          <FormulaireFiltresAvoirsCaisse
            valeurs={brouillon}
            onChange={setBrouillon}
            optionsCaissiers={rapport?.optionsCaissiers ?? []}
            onRechercher={() => setAppliques(brouillon)}
            onReinitialiser={() => {
              const vides = filtresAvoirsVides(plageDefaut.dateDu, plageDefaut.dateAu);
              setBrouillon(vides);
              setAppliques(vides);
            }}
          />
        )}

        {chargement ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-gris-bordure bg-white py-16 text-sm text-texte-secondaire">
            <Loader2 className="h-5 w-5 animate-spin" />
            {t("caisse.avoirs.chargement")}
          </div>
        ) : erreur ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center">
            <p className="text-sm text-red-700">{erreur}</p>
            <button
              type="button"
              onClick={() => void charger(appliques)}
              className="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700"
            >
              {t("caisse.avoirs.reessayer")}
            </button>
          </div>
        ) : rapport ? (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <section className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
              <div className="border-b border-gris-bordure px-4 py-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-texte-secondaire">
                  {t("caisse.avoirs.ledger")}
                </h3>
              </div>
              {pageLedger.length === 0 ? (
                <p className="px-4 py-12 text-center text-sm text-texte-secondaire">
                  {t("caisse.avoirs.vide")}
                </p>
              ) : (
                <>
                  <ul className="divide-y divide-gris-bordure md:hidden">
                    {pageLedger.map((l) => (
                      <li key={l.id} className="px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <span
                                className={cn(
                                  "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                                  l.type === "AVANCE" && "bg-amber-50 text-amber-700",
                                  l.type === "SOLDE" && "bg-emerald-50 text-emerald-700",
                                  l.type === "OUVERT" && "bg-rose-50 text-rose-700"
                                )}
                              >
                                {t(`caisse.avoirs.types.${l.type}`)}
                              </span>
                              <span className="text-xs text-texte-secondaire">
                                {formaterDate(l.payeLe ?? l.emiseLe ?? "")}
                              </span>
                            </div>
                            <Link
                              href={`/sigh/caisse/facturation?dossier=${l.dossierId}`}
                              className="block truncate text-sm font-semibold text-bleu-medical"
                            >
                              {l.numeroFacture}
                            </Link>
                            <p className="mt-0.5 truncate text-sm font-medium text-texte-principal">
                              {l.patient}
                            </p>
                            {l.reste > 0 ? (
                              <p className="mt-1 text-xs text-amber-700">
                                {t("caisse.avoirs.reste")}:{" "}
                                {formaterMontantCaisse(l.reste, l.devise)}
                              </p>
                            ) : null}
                          </div>
                          <p className="shrink-0 text-sm font-bold tabular-nums text-texte-principal">
                            {formaterMontantCaisse(l.montant, l.devise)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[820px] text-left text-sm">
                    <thead className="bg-gris-tres-clair/80 text-[11px] uppercase tracking-wider text-texte-secondaire">
                      <tr>
                        <th className="px-4 py-3 font-semibold">{t("caisse.avoirs.date")}</th>
                        <th className="px-4 py-3 font-semibold">{t("caisse.avoirs.type")}</th>
                        <th className="px-4 py-3 font-semibold">{t("caisse.avoirs.facture")}</th>
                        <th className="px-4 py-3 font-semibold">{t("caisse.avoirs.patient")}</th>
                        <th className="px-4 py-3 font-semibold">{t("caisse.avoirs.mode")}</th>
                        <th className="px-4 py-3 text-right font-semibold">
                          {t("caisse.avoirs.montant")}
                        </th>
                        <th className="px-4 py-3 text-right font-semibold">
                          {t("caisse.avoirs.reste")}
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
                            {formaterDate(l.payeLe ?? l.emiseLe ?? "")}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                                l.type === "AVANCE" && "bg-amber-50 text-amber-700",
                                l.type === "SOLDE" && "bg-emerald-50 text-emerald-700",
                                l.type === "OUVERT" && "bg-rose-50 text-rose-700"
                              )}
                            >
                              {t(`caisse.avoirs.types.${l.type}`)}
                            </span>
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
                            {l.mode ? t(`caisse.modesPaiement.${l.mode}`) : "—"}
                          </td>
                          <td className="px-4 py-3 text-right font-bold tabular-nums">
                            {formaterMontantCaisse(l.montant, l.devise)}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums text-texte-secondaire">
                            {l.reste > 0
                              ? formaterMontantCaisse(l.reste, l.devise)
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </>
              )}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gris-bordure px-4 py-3 text-xs text-texte-secondaire print:hidden">
                <p>
                  {t("caisse.avoirs.pagination", {
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
                    {t("caisse.avoirs.prec")}
                  </button>
                  <button
                    type="button"
                    disabled={pageCourante >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="inline-flex items-center gap-1 rounded-lg border border-gris-bordure px-3 py-1.5 disabled:opacity-40"
                  >
                    {t("caisse.avoirs.suiv")}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </section>
            <ResumeAvoirsCaisse rapport={rapport} />
          </div>
        ) : null}
      </div>
    </MiseEnPageCaisse>
  );
}
