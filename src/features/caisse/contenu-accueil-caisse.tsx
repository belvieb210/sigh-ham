"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  CalendarDays,
  Eye,
  FilePlus2,
  FileText,
  HandCoins,
  LayoutGrid,
  Loader2,
  Printer,
  Receipt,
  Search,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { GraphiqueEncaissements } from "@/features/caisse/graphique-encaissements";
import { MiseEnPageCaisse, type UtilisateurCaisse } from "@/features/caisse/mise-en-page-caisse";
import { formaterMontantCaisse } from "@/features/caisse/utils-format";
import type { StatutFactureAffiche, TableauDeBordAccueilCaisse } from "@/lib/caisse/types";

interface PropsContenuAccueilCaisse {
  utilisateur: UtilisateurCaisse;
}

function badgeStatut(statut: StatutFactureAffiche, labels: Record<StatutFactureAffiche, string>) {
  const styles: Record<StatutFactureAffiche, string> = {
    PAYEE: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    PARTIELLE: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    IMPAYEE: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[statut]}`}>
      {labels[statut]}
    </span>
  );
}

function Variation({ pct, label }: { pct: number | null; label: string }) {
  if (pct === null) return null;
  const positif = pct >= 0;
  return (
    <span className={`text-xs font-medium ${positif ? "text-emerald-600" : "text-rose-600"}`}>
      {positif ? "↑" : "↓"} {Math.abs(pct)}% {label}
    </span>
  );
}

export function ContenuAccueilCaisse({ utilisateur }: PropsContenuAccueilCaisse) {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState<TableauDeBordAccueilCaisse | null>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        const res = await fetch("/api/caisse/stats");
        const data = (await res.json()) as { stats?: TableauDeBordAccueilCaisse };
        if (!annule && res.ok && data.stats?.kpis) setStats(data.stats);
      } finally {
        if (!annule) setChargement(false);
      }
    })();
    return () => {
      annule = true;
    };
  }, []);

  const dateLabel = useMemo(() => {
    const d = stats?.dateReference ? new Date(stats.dateReference) : new Date();
    return d.toLocaleDateString(i18n.language || "fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }, [stats?.dateReference, i18n.language]);

  const labelsStatut: Record<StatutFactureAffiche, string> = {
    PAYEE: t("caisse.dashboard.statutPayee"),
    PARTIELLE: t("caisse.dashboard.statutPartielle"),
    IMPAYEE: t("caisse.dashboard.statutImpayee"),
  };

  const raccourcis = [
    {
      href: "/sigh/caisse/transferts",
      titre: t("caisse.dashboard.raccourciNouvelleFacture"),
      desc: t("caisse.dashboard.raccourciNouvelleFactureDesc"),
      icone: FilePlus2,
      couleur: "bg-violet-50 text-violet-700",
    },
    {
      href: "/sigh/caisse/facturation",
      titre: t("caisse.dashboard.raccourciPaiement"),
      desc: t("caisse.dashboard.raccourciPaiementDesc"),
      icone: HandCoins,
      couleur: "bg-emerald-50 text-emerald-700",
    },
    {
      href: "/sigh/caisse/facturation",
      titre: t("caisse.dashboard.raccourciDevis"),
      desc: t("caisse.dashboard.raccourciDevisDesc"),
      icone: FileText,
      couleur: "bg-amber-50 text-amber-700",
    },
    {
      href: "/sigh/caisse/avoirs",
      titre: t("caisse.dashboard.raccourciAvoir"),
      desc: t("caisse.dashboard.raccourciAvoirDesc"),
      icone: Receipt,
      couleur: "bg-rose-50 text-rose-700",
    },
    {
      href: "/sigh/caisse/factures",
      titre: t("caisse.dashboard.raccourciRecherche"),
      desc: t("caisse.dashboard.raccourciRechercheDesc"),
      icone: Search,
      couleur: "bg-sky-50 text-sky-700",
    },
    {
      href: "/sigh/caisse/encaissements",
      titre: t("caisse.dashboard.raccourciImprimer"),
      desc: t("caisse.dashboard.raccourciImprimerDesc"),
      icone: Printer,
      couleur: "bg-teal-50 text-teal-700",
    },
  ];

  return (
    <MiseEnPageCaisse
      utilisateur={utilisateur}
      titre={t("caisse.dashboard.titre")}
      sousTitre={t("caisse.dashboard.sousTitre")}
    >
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-texte-principal sm:text-2xl">
              {t("caisse.dashboard.titre")}
            </h2>
            <p className="mt-1 text-sm text-texte-secondaire">{t("caisse.dashboard.sousTitre")}</p>
          </div>
          <button
            type="button"
            className="inline-flex max-w-full items-center gap-2 self-start rounded-xl border border-gris-bordure bg-white px-3 py-2 text-left text-xs font-medium capitalize text-texte-principal shadow-sm sm:text-sm"
          >
            <CalendarDays className="h-4 w-4 shrink-0 text-bleu-medical" />
            <span className="truncate">{dateLabel}</span>
          </button>
        </div>

        {chargement ? (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-texte-secondaire">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-texte-secondaire">
                    {t("caisse.dashboard.facturesDuJour")}
                  </p>
                  <span className="rounded-lg bg-violet-50 p-2 text-violet-700">
                    <FilePlus2 className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-2 text-2xl font-bold text-texte-principal">
                  {stats?.kpis.facturesDuJour.count ?? 0}
                </p>
                <p className="mt-1 text-xs text-texte-secondaire">
                  {t("caisse.dashboard.total")} :{" "}
                  {formaterMontantCaisse(stats?.kpis.facturesDuJour.montantTotal ?? 0, "CDF")}
                </p>
                <div className="mt-1">
                  <Variation
                    pct={stats?.kpis.facturesDuJour.variationPct ?? null}
                    label={t("caisse.dashboard.vsHier")}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-texte-secondaire">
                    {t("caisse.dashboard.paiementsDuJour")}
                  </p>
                  <span className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
                    <Wallet className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-2 text-2xl font-bold text-texte-principal">
                  {stats?.kpis.paiementsDuJour.count ?? 0}
                </p>
                <p className="mt-1 text-xs text-texte-secondaire">
                  {t("caisse.dashboard.total")} :{" "}
                  {formaterMontantCaisse(stats?.kpis.paiementsDuJour.montantTotal ?? 0, "CDF")}
                </p>
                <div className="mt-1">
                  <Variation
                    pct={stats?.kpis.paiementsDuJour.variationPct ?? null}
                    label={t("caisse.dashboard.vsHier")}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-texte-secondaire">
                    {t("caisse.dashboard.montantEncaisse")}
                  </p>
                  <span className="rounded-lg bg-sky-50 p-2 text-sky-700">
                    <HandCoins className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-2 text-xl font-bold text-bleu-medical sm:text-2xl">
                  {formaterMontantCaisse(stats?.kpis.montantEncaisse.montant ?? 0, "CDF")}
                </p>
                <p className="mt-1 text-xs text-texte-secondaire">{t("caisse.dashboard.aujourdHui")}</p>
                <div className="mt-1">
                  <Variation
                    pct={stats?.kpis.montantEncaisse.variationPct ?? null}
                    label={t("caisse.dashboard.vsHier")}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-texte-secondaire">
                    {t("caisse.dashboard.patientsEnAttente")}
                  </p>
                  <span className="rounded-lg bg-amber-50 p-2 text-amber-700">
                    <Users className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-2 text-2xl font-bold text-texte-principal">
                  {stats?.kpis.patientsEnAttente.count ?? 0}
                </p>
                <p className="mt-1 text-xs text-texte-secondaire">
                  {t("caisse.dashboard.enAttenteFacturation")}
                </p>
              </div>

              <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm sm:col-span-2 xl:col-span-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-texte-secondaire">
                    {t("caisse.dashboard.facturesImpayees")}
                  </p>
                  <span className="rounded-lg bg-rose-50 p-2 text-rose-700">
                    <AlertTriangle className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-2 text-2xl font-bold text-texte-principal">
                  {stats?.kpis.facturesImpayees.count ?? 0}
                </p>
                <p className="mt-1 text-xs text-texte-secondaire">
                  {t("caisse.dashboard.total")} :{" "}
                  {formaterMontantCaisse(stats?.kpis.facturesImpayees.montantTotal ?? 0, "CDF")}
                </p>
                <Link
                  href="/sigh/caisse/factures"
                  className="mt-1 inline-block text-xs font-semibold text-bleu-medical hover:underline"
                >
                  {t("caisse.dashboard.voirListe")}
                </Link>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-5">
              <section className="rounded-xl border border-gris-bordure bg-white shadow-sm xl:col-span-3">
                <div className="flex items-center justify-between border-b border-gris-bordure px-2 py-1.5">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-bleu-medical" />
                    <h3 className="text-sm font-semibold text-texte-principal">
                      {t("caisse.dashboard.dernieresFactures")}
                    </h3>
                  </div>
                  <Link
                    href="/sigh/caisse/factures"
                    className="text-xs font-semibold text-bleu-medical hover:underline"
                  >
                    {t("caisse.dashboard.voirTout")}
                  </Link>
                </div>
                {(stats?.dernieresFactures ?? []).length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-texte-secondaire">
                    {t("caisse.dashboard.aucuneFacture")}
                  </p>
                ) : (
                  <>
                    <div className="overflow-hidden">
                      <table className="tableau-sigh">
                        <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-texte-secondaire">
                          <tr>
                            <th className="px-2 py-1.5 font-semibold">
                              {t("caisse.dashboard.colNumero")}
                            </th>
                            <th className="px-2 py-1.5 font-semibold">
                              {t("caisse.dashboard.colPatient")}
                            </th>
                            <th className="hidden px-2 py-1.5 font-semibold lg:table-cell">
                              {t("caisse.dashboard.colExamens")}
                            </th>
                            <th className="px-2 py-1.5 font-semibold">
                              {t("caisse.dashboard.colMontant")}
                            </th>
                            <th className="px-2 py-1.5 font-semibold">
                              {t("caisse.dashboard.colStatut")}
                            </th>
                            <th className="px-2 py-1.5 font-semibold">
                              {t("caisse.dashboard.colAction")}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats?.dernieresFactures.map((f) => (
                            <tr key={f.id} className="border-t border-gris-bordure/70">
                              <td className="px-2 py-1.5">
                                <Link
                                  href={`/sigh/caisse/facturation?dossier=${f.dossierId}`}
                                  className="font-semibold text-bleu-medical hover:underline"
                                >
                                  {f.numeroFacture}
                                </Link>
                              </td>
                              <td className="px-2 py-1.5 font-medium text-texte-principal">
                                {f.patient}
                              </td>
                              <td className="hidden max-w-[180px] truncate px-2 py-1.5 text-texte-secondaire lg:table-cell">
                                {f.examens}
                              </td>
                              <td className="px-2 py-1.5 font-semibold text-texte-principal">
                                {formaterMontantCaisse(
                                  f.montantTotal,
                                  f.devise === "USD" ? "USD" : "CDF"
                                )}
                              </td>
                              <td className="px-2 py-1.5">
                                {badgeStatut(f.statutAffiche, labelsStatut)}
                              </td>
                              <td className="px-2 py-1.5">
                                <Link
                                  href={`/sigh/caisse/facturation?dossier=${f.dossierId}`}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gris-bordure text-texte-secondaire hover:bg-slate-50 hover:text-bleu-medical"
                                  aria-label={t("caisse.dashboard.voirFacture")}
                                >
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </section>

              <section className="rounded-xl border border-gris-bordure bg-white shadow-sm xl:col-span-2">
                <div className="flex items-center justify-between gap-2 border-b border-gris-bordure px-2 py-1.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <TrendingUp className="h-4 w-4 shrink-0 text-bleu-medical" />
                    <h3 className="truncate text-sm font-semibold text-texte-principal">
                      {t("caisse.dashboard.evolutionEncaissements")}
                    </h3>
                  </div>
                  <span className="shrink-0 rounded-lg border border-gris-bordure bg-slate-50 px-2 py-1 text-[10px] font-medium text-texte-secondaire sm:px-2.5 sm:text-xs">
                    {t("caisse.dashboard.septDerniersJours")}
                  </span>
                </div>
                <div className="px-2 py-3 sm:px-3">
                  <GraphiqueEncaissements
                    points={stats?.evolutionEncaissements ?? []}
                    labelAxeY={t("caisse.dashboard.montantFcfa")}
                    labelSerie={t("caisse.dashboard.serieEncaissements")}
                  />
                </div>
              </section>
            </div>

            <div className="grid gap-4 xl:grid-cols-5">
              <section className="rounded-xl border border-gris-bordure bg-white shadow-sm xl:col-span-3">
                <div className="flex items-center justify-between border-b border-gris-bordure px-2 py-1.5">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-bleu-medical" />
                    <h3 className="text-sm font-semibold text-texte-principal">
                      {t("caisse.dashboard.patientsAttenteTitre")}
                    </h3>
                  </div>
                  <Link
                    href="/sigh/caisse/transferts"
                    className="text-xs font-semibold text-bleu-medical hover:underline"
                  >
                    {t("caisse.dashboard.voirListe")}
                  </Link>
                </div>
                {(stats?.patientsAttente ?? []).length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-texte-secondaire">
                    {t("caisse.dashboard.aucunPatient")}
                  </p>
                ) : (
                  <>
                    <div className="overflow-hidden">
                      <table className="tableau-sigh">
                        <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-texte-secondaire">
                          <tr>
                            <th className="px-2 py-1.5 font-semibold">
                              {t("caisse.dashboard.colPatient")}
                            </th>
                            <th className="px-2 py-1.5 font-semibold">
                              {t("caisse.dashboard.colService")}
                            </th>
                            <th className="hidden px-2 py-1.5 font-semibold lg:table-cell">
                              {t("caisse.dashboard.colExamensDemandes")}
                            </th>
                            <th className="px-2 py-1.5 font-semibold">
                              {t("caisse.dashboard.colTempsAttente")}
                            </th>
                            <th className="px-2 py-1.5 font-semibold">
                              {t("caisse.dashboard.colAction")}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats?.patientsAttente.map((p) => (
                            <tr key={p.dossierId} className="border-t border-gris-bordure/70">
                              <td className="px-2 py-1.5 font-medium text-texte-principal">
                                {p.patient}
                              </td>
                              <td className="px-2 py-1.5 text-texte-secondaire">{p.service}</td>
                              <td className="hidden max-w-[200px] truncate px-2 py-1.5 text-texte-secondaire lg:table-cell">
                                {p.examensDemandes}
                              </td>
                              <td
                                className={`px-2 py-1.5 font-semibold ${
                                  p.minutesAttente >= 40
                                    ? "text-rose-600"
                                    : "text-texte-principal"
                                }`}
                              >
                                {p.tempsAttenteLabel}
                              </td>
                              <td className="px-2 py-1.5">
                                <Link
                                  href={`/sigh/caisse/facturation?dossier=${p.dossierId}`}
                                  className="inline-flex rounded-lg bg-bleu-medical px-3 py-1.5 text-xs font-semibold text-white hover:bg-bleu-medical/90"
                                >
                                  {t("caisse.dashboard.facturer")}
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </section>

              <section className="rounded-xl border border-gris-bordure bg-white shadow-sm xl:col-span-2">
                <div className="flex items-center gap-2 border-b border-gris-bordure px-2 py-1.5">
                  <LayoutGrid className="h-4 w-4 text-bleu-medical" />
                  <h3 className="text-sm font-semibold text-texte-principal">
                    {t("caisse.dashboard.raccourcis")}
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3 p-4">
                  {raccourcis.map((r) => {
                    const Icone = r.icone;
                    return (
                      <Link
                        key={r.titre}
                        href={r.href}
                        className="rounded-xl border border-gris-bordure bg-white p-3 transition hover:border-bleu-medical/40 hover:bg-slate-50"
                      >
                        <span className={`inline-flex rounded-lg p-2 ${r.couleur}`}>
                          <Icone className="h-4 w-4" />
                        </span>
                        <p className="mt-2 text-sm font-semibold text-texte-principal">{r.titre}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-texte-secondaire">{r.desc}</p>
                      </Link>
                    );
                  })}
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </MiseEnPageCaisse>
  );
}
