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
  compterFiltresJournalier,
  filtresJournalierVides,
  FormulaireFiltresRapportJournalierCaisse,
  type FiltresRapportJournalierUi,
} from "@/features/caisse/formulaire-filtres-rapport-journalier-caisse";
import { MiseEnPageCaisse, type UtilisateurCaisse } from "@/features/caisse/mise-en-page-caisse";
import { ResumeRapportCaisse } from "@/features/caisse/resume-rapport-caisse";
import { formaterHeure, formaterMontantCaisse } from "@/features/caisse/utils-format";
import { BadgeTypePersonneCaisse } from "@/features/caisse/badge-type-personne-caisse";
import type { RapportCaissePayload } from "@/lib/caisse/types";
import { cn } from "@/lib/utils";

interface Props {
  utilisateur: UtilisateurCaisse;
}

const PAR_PAGE = 15;

function dateAujourdhuiIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function ContenuEncaissementsCaisse({ utilisateur }: Props) {
  const { t } = useTranslation();
  const dateDefaut = useMemo(() => dateAujourdhuiIso(), []);
  const [rapport, setRapport] = useState<RapportCaissePayload | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [brouillon, setBrouillon] = useState<FiltresRapportJournalierUi>(() =>
    filtresJournalierVides(dateDefaut)
  );
  const [appliques, setAppliques] = useState<FiltresRapportJournalierUi>(() =>
    filtresJournalierVides(dateDefaut)
  );
  const [page, setPage] = useState(1);

  const charger = useCallback(
    async (f: FiltresRapportJournalierUi) => {
      setChargement(true);
      setErreur(null);
      try {
        const params = new URLSearchParams({ periode: "journalier" });
        if (f.date) params.set("date", f.date);
        if (f.mode) params.set("mode", f.mode);
        if (f.caissierId) params.set("caissierId", f.caissierId);
        if (f.q.trim()) params.set("q", f.q.trim());
        const res = await fetch(`/api/caisse/rapports?${params}`);
        const data = (await res.json()) as {
          rapport?: RapportCaissePayload;
          erreur?: string;
        };
        if (!res.ok || !data.rapport) {
          throw new Error(data.erreur ?? t("caisse.encaissements.erreur"));
        }
        setRapport(data.rapport);
        setPage(1);
      } catch (e) {
        setErreur(e instanceof Error ? e.message : t("caisse.encaissements.erreur"));
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

  const nbFiltres = compterFiltresJournalier(appliques, dateDefaut);
  const ledger = rapport?.ledger ?? [];
  const totalPages = Math.max(1, Math.ceil(ledger.length / PAR_PAGE));
  const pageCourante = Math.min(page, totalPages);
  const debut = (pageCourante - 1) * PAR_PAGE;
  const pageLedger = ledger.slice(debut, debut + PAR_PAGE);

  return (
    <MiseEnPageCaisse
      utilisateur={utilisateur}
      titre={t("caisse.encaissements.titre")}
      sousTitre={t("caisse.encaissements.sousTitre")}
    >
      <div className="mx-auto w-full max-w-7xl space-y-4 pb-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-texte-principal">
              {t("caisse.encaissements.titre")}
            </h2>
            <p className="mt-1 text-sm text-texte-secondaire">
              {rapport?.labelPeriode ?? t("caisse.encaissements.sousTitre")}
            </p>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-gris-bordure bg-white px-3 text-sm font-medium text-texte-principal hover:bg-gris-tres-clair"
              aria-label={t("caisse.encaissements.imprimer")}
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">{t("caisse.encaissements.imprimer")}</span>
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
          <FormulaireFiltresRapportJournalierCaisse
            valeurs={brouillon}
            onChange={setBrouillon}
            optionsCaissiers={rapport?.optionsCaissiers ?? []}
            onRechercher={() => setAppliques(brouillon)}
            onReinitialiser={() => {
              const vides = filtresJournalierVides(dateDefaut);
              setBrouillon(vides);
              setAppliques(vides);
            }}
          />
        )}

        {chargement ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-gris-bordure bg-white py-16 text-sm text-texte-secondaire">
            <Loader2 className="h-5 w-5 animate-spin" />
            {t("caisse.encaissements.chargement")}
          </div>
        ) : erreur ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center">
            <p className="text-sm text-red-700">{erreur}</p>
            <button
              type="button"
              onClick={() => void charger(appliques)}
              className="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700"
            >
              {t("caisse.encaissements.reessayer")}
            </button>
          </div>
        ) : rapport ? (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <section className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
              <div className="border-b border-gris-bordure px-2 py-1.5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-texte-secondaire">
                  {t("caisse.encaissements.ledger")}
                </h3>
              </div>
              {pageLedger.length === 0 ? (
                <p className="px-4 py-12 text-center text-sm text-texte-secondaire">
                  {t("caisse.encaissements.vide")}
                </p>
              ) : (
                <>
                  <div className="conteneur-tableau-sigh">
        <table className="tableau-sigh">
                    <thead className="bg-gris-tres-clair/80 text-[11px] uppercase tracking-wider text-texte-secondaire">
                      <tr>
                        <th className="px-2 py-1.5 font-semibold">{t("caisse.encaissements.heure")}</th>
                        <th className="px-2 py-1.5 font-semibold">{t("caisse.encaissements.facture")}</th>
                        <th className="px-2 py-1.5 font-semibold">{t("caisse.encaissements.patient")}</th>
                        <th className="px-2 py-1.5 font-semibold">{t("caisse.encaissements.mode")}</th>
                        <th className="px-2 py-1.5 font-semibold">{t("caisse.encaissements.caissier")}</th>
                        <th className="px-2 py-1.5 text-right font-semibold">
                          {t("caisse.encaissements.montant")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageLedger.map((l) => (
                        <tr
                          key={l.id}
                          className="border-t border-gris-bordure/80 hover:bg-gris-tres-clair/50"
                        >
                          <td className="px-2 py-1.5 tabular-nums text-texte-secondaire">
                            {formaterHeure(l.payeLe)}
                          </td>
                          <td className="px-2 py-1.5">
                            <Link
                              href={`/sigh/caisse/facturation?dossier=${l.dossierId}`}
                              className="font-semibold text-bleu-medical hover:underline"
                            >
                              {l.numeroFacture}
                            </Link>
                          </td>
                          <td className="px-2 py-1.5 font-medium text-texte-principal">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span>{l.patient}</span>
                              <BadgeTypePersonneCaisse estClientWalkIn={l.estClientWalkIn} />
                            </div>
                          </td>
                          <td className="px-2 py-1.5 text-texte-secondaire">
                            {t(`caisse.modesPaiement.${l.mode}`)}
                          </td>
                          <td className="px-2 py-1.5 text-texte-secondaire">{l.caissier}</td>
                          <td className="px-2 py-1.5 text-right font-bold tabular-nums">
                            {formaterMontantCaisse(l.montant, l.devise)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gris-bordure bg-gris-tres-clair/40">
                        <td
                          colSpan={5}
                          className="px-2 py-1.5 text-right text-xs font-bold uppercase tracking-wide text-texte-secondaire"
                        >
                          {t("caisse.encaissements.totalJour")}
                        </td>
                        <td className="px-2 py-1.5 text-right text-sm font-bold tabular-nums">
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
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gris-bordure px-2 py-1.5 text-xs text-texte-secondaire print:hidden">
                <p>
                  {t("caisse.encaissements.pagination", {
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
                    {t("caisse.encaissements.prec")}
                  </button>
                  <button
                    type="button"
                    disabled={pageCourante >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="inline-flex items-center gap-1 rounded-lg border border-gris-bordure px-3 py-1.5 disabled:opacity-40"
                  >
                    {t("caisse.encaissements.suiv")}
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
