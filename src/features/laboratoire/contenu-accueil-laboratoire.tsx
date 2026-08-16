"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  Beaker,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FileCheck2,
  FileText,
  FlaskConical,
  Info,
  Loader2,
  Package,
  Printer,
  Search,
  ShieldCheck,
  UserSearch,
} from "lucide-react";
import {
  PaginationListe,
  paginerListe,
} from "@/components/ui/pagination-liste";
import {
  MiseEnPageLaboratoire,
  type UtilisateurLaboratoire,
} from "@/features/laboratoire/mise-en-page-laboratoire";
import {
  couleurStatutAnalyse,
  libelleStatutLigneLabo,
  numeroVisiteLaboratoire,
} from "@/features/laboratoire/utils-affichage";
import type {
  PatientFileLaboratoire,
  StatsLaboratoireJour,
} from "@/lib/laboratoire/types";
import { cn } from "@/lib/utils";

const PAR_PAGE_CARTES_PRINCIPALES = 4;
const PAR_PAGE_CARTES_RESULTATS = 3;

interface PropsContenuAccueilLaboratoire {
  utilisateur: UtilisateurLaboratoire;
}

function formatHeure(iso: string, locale: string) {
  return new Date(iso).toLocaleTimeString(locale || "fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function libellesExamens(p: PatientFileLaboratoire, max = 3) {
  const labels = p.examens.map((e) => e.libelle);
  if (labels.length <= max) return labels.join(", ") || "—";
  return `${labels.slice(0, max).join(", ")} +${labels.length - max}`;
}

function codeEchantillon(p: PatientFileLaboratoire) {
  const n = p.numeroDossier.replace(/\D/g, "").slice(-4) || "0000";
  const d = new Date(p.arriveeLe);
  const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  return `ECH-${ym}-${n.padStart(4, "0")}`;
}

function numeroEnregistrement(p: PatientFileLaboratoire) {
  return numeroVisiteLaboratoire(p);
}

export function ContenuAccueilLaboratoire({
  utilisateur,
}: PropsContenuAccueilLaboratoire) {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState<StatsLaboratoireJour | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [pageTransferes, setPageTransferes] = useState(1);
  const [pageAnalyses, setPageAnalyses] = useState(1);
  const [pageAValider, setPageAValider] = useState(1);
  const [pageValides, setPageValides] = useState(1);

  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        const res = await fetch("/api/laboratoire/stats");
        const data = (await res.json()) as {
          stats?: StatsLaboratoireJour;
          erreur?: string;
        };
        if (!annule) {
          if (!res.ok || !data.stats) {
            setErreur(data.erreur ?? t("laboratoire.dashboard.erreur"));
          } else {
            setStats(data.stats);
          }
        }
      } catch {
        if (!annule) setErreur(t("laboratoire.dashboard.erreur"));
      } finally {
        if (!annule) setChargement(false);
      }
    })();
    return () => {
      annule = true;
    };
  }, [t]);

  const dateLabel = useMemo(() => {
    const d = stats?.dateReference ? new Date(stats.dateReference) : new Date();
    return d.toLocaleDateString(i18n.language || "fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }, [stats?.dateReference, i18n.language]);

  const kpis = [
    {
      id: "patients",
      label: t("laboratoire.dashboard.patientsTransferes"),
      valeur: stats?.patientsRecusAujourdhui ?? 0,
      icone: UserSearch,
      couleur: "bg-blue-50 text-blue-700",
      href: "/sigh/laboratoire/recus",
    },
    {
      id: "analyses",
      label: t("laboratoire.dashboard.enCoursAnalyse"),
      valeur: stats?.analysesEnCours ?? stats?.examensEnCours ?? 0,
      icone: FlaskConical,
      couleur: "bg-amber-50 text-amber-700",
      href: "/sigh/laboratoire/examens-en-cours",
    },
    {
      id: "aValider",
      label: t("laboratoire.dashboard.resultatsAValider"),
      valeur: stats?.resultatsAValider ?? 0,
      icone: Beaker,
      couleur: "bg-violet-50 text-violet-700",
      href: "/sigh/laboratoire/verifies",
    },
    {
      id: "valides",
      label: t("laboratoire.dashboard.resultatsValides"),
      valeur: stats?.resultatsValidesAujourdhui ?? 0,
      icone: CheckCircle2,
      couleur: "bg-emerald-50 text-emerald-700",
      href: "/sigh/laboratoire/dr-approuve",
    },
    {
      id: "imprimes",
      label: t("laboratoire.dashboard.imprimesEnvoyes"),
      valeur: stats?.imprimesEnvoyes ?? 0,
      icone: FileCheck2,
      couleur: "bg-rose-50 text-rose-700",
      href: "/sigh/laboratoire/dr-approuve",
    },
  ];

  const actionsRapides = [
    {
      href: "/sigh/laboratoire/saisie-resultats",
      label: t("laboratoire.dashboard.actionEnregistrer"),
      icone: FlaskConical,
    },
    {
      href: "/sigh/laboratoire/verifies",
      label: t("laboratoire.dashboard.actionValider"),
      icone: ClipboardCheck,
    },
    {
      href: "/sigh/laboratoire/dr-approuve",
      label: t("laboratoire.dashboard.actionImprimer"),
      icone: Printer,
    },
    {
      href: "/sigh/laboratoire/recus",
      label: t("laboratoire.dashboard.actionRecherche"),
      icone: Search,
    },
    {
      href: "/sigh/laboratoire/rapports",
      label: t("laboratoire.dashboard.actionControle"),
      icone: ShieldCheck,
    },
    {
      href: "/sigh/laboratoire/stock-reactifs",
      label: t("laboratoire.dashboard.actionReactifs"),
      icone: Package,
    },
    {
      href: "/sigh/laboratoire/rapports",
      label: t("laboratoire.dashboard.actionRapport"),
      icone: FileText,
    },
  ];

  const patientsTransferes =
    stats?.patientsTransferes ?? stats?.derniersArrives ?? [];
  const analysesListe = stats?.analysesEnCoursListe ?? [];
  const aValiderListe = stats?.resultatsAValiderListe ?? [];
  const validesListe = stats?.resultatsValidesListe ?? [];

  const pageTransferesData = paginerListe(
    patientsTransferes,
    pageTransferes,
    PAR_PAGE_CARTES_PRINCIPALES
  );
  const pageAnalysesData = paginerListe(
    analysesListe,
    pageAnalyses,
    PAR_PAGE_CARTES_PRINCIPALES
  );
  const pageAValiderData = paginerListe(
    aValiderListe,
    pageAValider,
    PAR_PAGE_CARTES_RESULTATS
  );
  const pageValidesData = paginerListe(
    validesListe,
    pageValides,
    PAR_PAGE_CARTES_RESULTATS
  );

  return (
    <MiseEnPageLaboratoire
      utilisateur={utilisateur}
      titre={t("laboratoire.dashboard.titre")}
      sousTitre={t("laboratoire.dashboard.sousTitre")}
      afficherRechercheEnTete
    >
      <div className="mx-auto w-full max-w-7xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div
            className="inline-flex items-center gap-2 rounded-lg border border-gris-bordure bg-white px-3 py-1.5 text-sm capitalize text-texte-secondaire shadow-sm"
          >
            <CalendarDays className="h-4 w-4 text-bleu-medical" aria-hidden />
            {dateLabel}
          </div>
        </div>

        {chargement ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-bleu-medical" />
          </div>
        ) : erreur ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {erreur}
          </p>
        ) : (
          <>
            <div className="grille-kpi-sigh">
              {kpis.map((k) => {
                const Icone = k.icone;
                return (
                  <div
                    key={k.id}
                    className="rounded-xl border border-gris-bordure bg-white p-3 shadow-sm sm:p-4"
                  >
                    <div
                      className={`mb-2 inline-flex rounded-lg p-2 sm:mb-3 ${k.couleur}`}
                    >
                      <Icone className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
                    </div>
                    <p className="text-xl font-bold text-texte-principal sm:text-2xl">
                      {k.valeur}
                    </p>
                    <p className="mt-1 text-[11px] font-medium leading-snug text-texte-secondaire sm:text-xs">
                      {k.label}
                    </p>
                    <Link
                      href={k.href}
                      className="mt-2 inline-block text-[11px] font-semibold text-bleu-medical hover:underline sm:mt-3 sm:text-xs"
                    >
                      {t("laboratoire.dashboard.voirListe")}
                    </Link>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <section className="rounded-xl border border-gris-bordure bg-white shadow-sm">
                <div className="flex items-center justify-between gap-2 border-b border-gris-bordure px-3 py-2">
                  <h2 className="text-sm font-bold text-texte-principal">
                    {t("laboratoire.dashboard.tablePatients")}
                  </h2>
                  <Link
                    href="/sigh/laboratoire/recus"
                    className="text-xs font-semibold text-bleu-medical hover:underline"
                  >
                    {t("laboratoire.dashboard.voirTous")}
                  </Link>
                </div>
                {!patientsTransferes.length ? (
                  <p className="px-4 py-6 text-center text-sm text-texte-secondaire">
                    {t("laboratoire.dashboard.aucunPatient")}
                  </p>
                ) : (
                  <>
                    <div className="conteneur-tableau-sigh">
                    <table className="tableau-liste-labo">
                      <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-texte-secondaire">
                        <tr>
                          <th className="px-2 py-1.5 font-semibold">
                            {t("laboratoire.dashboard.colEnregistrement")}
                          </th>
                          <th className="px-2 py-1.5 font-semibold">
                            {t("laboratoire.dashboard.colPatient")}
                          </th>
                          <th className="hidden px-2 py-1.5 font-semibold lg:table-cell">
                            {t("laboratoire.dashboard.colService")}
                          </th>
                          <th className="px-2 py-1.5 font-semibold">
                            {t("laboratoire.dashboard.colExamens")}
                          </th>
                          <th className="hidden px-2 py-1.5 font-semibold md:table-cell">
                            {t("laboratoire.dashboard.colHeure")}
                          </th>
                          <th className="w-[72px] px-2 py-1.5 font-semibold">
                            {t("laboratoire.dashboard.colStatut")}
                          </th>
                          <th className="w-10 px-1.5 py-1.5 font-semibold">
                            {t("laboratoire.dashboard.colActions")}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gris-bordure">
                        {pageTransferesData.itemsPage.map((p) => (
                          <tr key={p.dossierId} className="hover:bg-slate-50/80">
                            <td className="whitespace-nowrap px-2 py-1.5 font-mono text-[11px] text-texte-principal">
                              {numeroEnregistrement(p)}
                            </td>
                            <td className="px-2 py-1.5">
                              <p className="truncate text-xs font-semibold leading-tight text-texte-principal">
                                {p.nom} {p.prenom}
                              </p>
                              <p className="truncate text-[10px] text-texte-secondaire">
                                {p.age != null ? `${p.age} ans` : "—"}
                                {p.sexe ? ` · ${p.sexe}` : ""}
                              </p>
                            </td>
                            <td className="hidden whitespace-nowrap px-2 py-1.5 text-[11px] text-texte-secondaire lg:table-cell">
                              {p.provenance || "—"}
                            </td>
                            <td className="px-2 py-1.5 text-[11px] font-medium">
                              {p.nombreExamens}
                            </td>
                            <td className="hidden whitespace-nowrap px-2 py-1.5 text-[11px] text-texte-secondaire md:table-cell">
                              {formatHeure(p.arriveeLe, i18n.language)}
                            </td>
                            <td className="px-2 py-1.5">
                              {(() => {
                                const statut = libelleStatutLigneLabo(p);
                                return (
                                  <span
                                    className={cn(
                                      "inline-flex rounded-full px-1.5 py-0 text-[10px] font-semibold leading-5",
                                      statut.couleur
                                    )}
                                  >
                                    {t(
                                      `laboratoire.orientationsStatut.${statut.statutAnalyse}.label`
                                    )}
                                  </span>
                                );
                              })()}
                            </td>
                            <td className="px-1.5 py-1.5">
                              <Link
                                href={`/sigh/laboratoire/recus?dossier=${p.dossierId}`}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gris-bordure text-texte-secondaire hover:bg-white hover:text-bleu-medical"
                                title={t("laboratoire.patients.ouvrirDossier")}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                  </>
                )}
                <PaginationListe
                  compact
                  page={pageTransferesData.pageCourante}
                  totalPages={pageTransferesData.totalPages}
                  totalItems={patientsTransferes.length}
                  parPage={PAR_PAGE_CARTES_PRINCIPALES}
                  onChange={setPageTransferes}
                  labelPrec={t("laboratoire.pagination.prec")}
                  labelSuiv={t("laboratoire.pagination.suiv")}
                />
              </section>

              <section className="rounded-xl border border-gris-bordure bg-white shadow-sm">
                <div className="flex items-center justify-between gap-2 border-b border-gris-bordure px-4 py-3">
                  <h2 className="text-sm font-bold text-texte-principal">
                    {t("laboratoire.dashboard.tableAnalyses")}
                  </h2>
                  <Link
                    href="/sigh/laboratoire/examens-en-cours"
                    className="text-xs font-semibold text-bleu-medical hover:underline"
                  >
                    {t("laboratoire.dashboard.voirTous")}
                  </Link>
                </div>
                {!analysesListe.length ? (
                  <p className="px-4 py-6 text-center text-sm text-texte-secondaire">
                    {t("laboratoire.dashboard.aucuneAnalyse")}
                  </p>
                ) : (
                  <>
                    <div className="conteneur-tableau-sigh">
                    <table className="tableau-liste-labo">
                      <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-texte-secondaire">
                        <tr>
                          <th className="px-2 py-1.5 font-semibold">
                            {t("laboratoire.dashboard.colEchantillon")}
                          </th>
                          <th className="px-2 py-1.5 font-semibold">
                            {t("laboratoire.dashboard.colPatient")}
                          </th>
                          <th className="px-2 py-1.5 font-semibold">
                            {t("laboratoire.dashboard.colExamens")}
                          </th>
                          <th className="w-[72px] px-2 py-1.5 font-semibold">
                            {t("laboratoire.dashboard.colStatut")}
                          </th>
                          <th className="w-10 px-1.5 py-1.5 font-semibold">
                            {t("laboratoire.dashboard.colActions")}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gris-bordure">
                        {pageAnalysesData.itemsPage.map((p) => (
                          <tr key={p.dossierId} className="hover:bg-slate-50/80">
                            <td className="whitespace-nowrap px-2 py-1.5 font-mono text-[11px]">
                              {codeEchantillon(p)}
                            </td>
                            <td className="px-2 py-1.5">
                              <p className="truncate text-xs font-semibold leading-tight">
                                {p.nom} {p.prenom}
                              </p>
                            </td>
                            <td className="px-2 py-1.5">
                              <p className="truncate text-[11px] text-texte-secondaire">
                                {libellesExamens(p)}
                              </p>
                            </td>
                            <td className="px-2 py-1.5">
                              <span
                                className={cn(
                                  "inline-flex rounded-full px-1.5 py-0 text-[10px] font-semibold leading-5",
                                  couleurStatutAnalyse(p.statutAnalyse)
                                )}
                              >
                                {t(
                                  `laboratoire.orientationsStatut.${p.statutAnalyse || "EN_COURS"}.label`
                                )}
                              </span>
                            </td>
                            <td className="px-1.5 py-1.5">
                              <Link
                                href={`/sigh/laboratoire/examens-en-cours?dossier=${p.dossierId}`}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gris-bordure text-amber-700 hover:bg-amber-50"
                              >
                                <FlaskConical className="h-3.5 w-3.5" />
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                  </>
                )}
                <PaginationListe
                  compact
                  page={pageAnalysesData.pageCourante}
                  totalPages={pageAnalysesData.totalPages}
                  totalItems={analysesListe.length}
                  parPage={PAR_PAGE_CARTES_PRINCIPALES}
                  onChange={setPageAnalyses}
                  labelPrec={t("laboratoire.pagination.prec")}
                  labelSuiv={t("laboratoire.pagination.suiv")}
                />
              </section>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <section className="rounded-xl border border-gris-bordure bg-white shadow-sm">
                <div className="flex items-center justify-between gap-2 border-b border-gris-bordure px-4 py-3">
                  <h2 className="text-sm font-bold text-texte-principal">
                    {t("laboratoire.dashboard.resultatsAValider")}
                  </h2>
                  <Link
                    href="/sigh/laboratoire/verifies"
                    className="text-xs font-semibold text-bleu-medical hover:underline"
                  >
                    {t("laboratoire.dashboard.voirTous")}
                  </Link>
                </div>
                {!aValiderListe.length ? (
                  <p className="px-4 py-6 text-center text-sm text-texte-secondaire">
                    {t("laboratoire.dashboard.videValidation")}
                  </p>
                ) : (
                  <ul className="divide-y divide-gris-bordure">
                    {pageAValiderData.itemsPage.map((p) => (
                      <li
                        key={p.dossierId}
                        className="flex items-center justify-between gap-2 px-4 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-texte-principal">
                            {p.nom} {p.prenom}
                          </p>
                          <p className="truncate text-[11px] text-texte-secondaire">
                            {libellesExamens(p, 2)}
                          </p>
                        </div>
                        <Link
                          href={`/sigh/laboratoire/verifies?dossier=${p.dossierId}`}
                          className="inline-flex shrink-0 rounded-lg border border-gris-bordure p-1.5 text-texte-secondaire hover:text-bleu-medical"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <PaginationListe
                  compact
                  page={pageAValiderData.pageCourante}
                  totalPages={pageAValiderData.totalPages}
                  totalItems={aValiderListe.length}
                  parPage={PAR_PAGE_CARTES_RESULTATS}
                  onChange={setPageAValider}
                  labelPrec={t("laboratoire.pagination.prec")}
                  labelSuiv={t("laboratoire.pagination.suiv")}
                />
              </section>

              <section className="rounded-xl border border-gris-bordure bg-white shadow-sm">
                <div className="flex items-center justify-between gap-2 border-b border-gris-bordure px-4 py-3">
                  <h2 className="text-sm font-bold text-texte-principal">
                    {t("laboratoire.dashboard.resultatsValidesAujourdhui")}
                  </h2>
                  <Link
                    href="/sigh/laboratoire/dr-approuve"
                    className="text-xs font-semibold text-bleu-medical hover:underline"
                  >
                    {t("laboratoire.dashboard.voirTous")}
                  </Link>
                </div>
                {!validesListe.length ? (
                  <p className="px-4 py-6 text-center text-sm text-texte-secondaire">
                    {(stats?.resultatsValidesAujourdhui ?? 0) > 0
                      ? t("laboratoire.dashboard.resumeValides", {
                          count: stats?.resultatsValidesAujourdhui ?? 0,
                        })
                      : t("laboratoire.dashboard.videValides")}
                  </p>
                ) : (
                  <ul className="divide-y divide-gris-bordure">
                    {pageValidesData.itemsPage.map((p) => (
                      <li
                        key={p.dossierId}
                        className="flex items-center justify-between gap-2 px-4 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-texte-principal">
                            {p.nom} {p.prenom}
                          </p>
                          <p className="truncate text-[11px] text-texte-secondaire">
                            {libellesExamens(p, 2)}
                          </p>
                        </div>
                        <Link
                          href={`/sigh/laboratoire/dr-approuve?dossier=${p.dossierId}`}
                          className="inline-flex shrink-0 rounded-lg border border-gris-bordure p-1.5 text-emerald-700 hover:bg-emerald-50"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <PaginationListe
                  compact
                  page={pageValidesData.pageCourante}
                  totalPages={pageValidesData.totalPages}
                  totalItems={validesListe.length}
                  parPage={PAR_PAGE_CARTES_RESULTATS}
                  onChange={setPageValides}
                  labelPrec={t("laboratoire.pagination.prec")}
                  labelSuiv={t("laboratoire.pagination.suiv")}
                />
              </section>

              <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-texte-principal">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  {t("laboratoire.dashboard.alertesNotifications")}
                </h2>
                <ul className="space-y-2 text-sm">
                  {(stats?.resultatsAValider ?? 0) > 0 && (
                    <li className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-800">
                      {t("laboratoire.dashboard.alerteValidation", {
                        count: stats?.resultatsAValider ?? 0,
                      })}
                    </li>
                  )}
                  {(stats?.patientsEnFile ?? 0) > 0 && (
                    <li className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
                      {t("laboratoire.dashboard.alerteFile", {
                        count: stats?.patientsEnFile ?? 0,
                      })}
                    </li>
                  )}
                  <li className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sky-900">
                    <span className="inline-flex items-center gap-1.5">
                      <Info className="h-3.5 w-3.5 shrink-0" />
                      {t("laboratoire.dashboard.alerteControle")}
                    </span>
                  </li>
                  {(stats?.patientsEnFile ?? 0) === 0 &&
                    (stats?.resultatsAValider ?? 0) === 0 && (
                      <li className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800">
                        {t("laboratoire.dashboard.alerteVide")}
                      </li>
                    )}
                </ul>
              </section>
            </div>

            <section className="rounded-xl border border-gris-bordure bg-white p-3 shadow-sm sm:p-4">
              <div className="grille-actions-sigh">
                {actionsRapides.map((a) => {
                  const Icone = a.icone;
                  return (
                    <Link
                      key={a.label}
                      href={a.href}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-gris-bordure bg-slate-50 px-3 py-2.5 text-xs font-semibold text-texte-principal transition hover:border-bleu-medical/40 hover:bg-bleu-medical-clair/40 sm:flex-none sm:text-sm"
                    >
                      <Icone className="h-4 w-4 shrink-0 text-bleu-medical" />
                      <span className="truncate">{a.label}</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </MiseEnPageLaboratoire>
  );
}
