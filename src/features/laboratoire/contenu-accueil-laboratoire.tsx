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
  MiseEnPageLaboratoire,
  type UtilisateurLaboratoire,
} from "@/features/laboratoire/mise-en-page-laboratoire";
import {
  couleurStatutAnalyse,
  libelleStatutLigneLabo,
} from "@/features/laboratoire/utils-affichage";
import type {
  PatientFileLaboratoire,
  StatsLaboratoireJour,
} from "@/lib/laboratoire/types";
import { cn } from "@/lib/utils";

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
  return p.numeroEnregistrement || p.numeroDossier;
}

export function ContenuAccueilLaboratoire({
  utilisateur,
}: PropsContenuAccueilLaboratoire) {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState<StatsLaboratoireJour | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

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
      href: "/sigh/laboratoire/patients",
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
      href: "/sigh/laboratoire/resultats-a-valider",
    },
    {
      id: "valides",
      label: t("laboratoire.dashboard.resultatsValides"),
      valeur: stats?.resultatsValidesAujourdhui ?? 0,
      icone: CheckCircle2,
      couleur: "bg-emerald-50 text-emerald-700",
      href: "/sigh/laboratoire/resultats-valides",
    },
    {
      id: "imprimes",
      label: t("laboratoire.dashboard.imprimesEnvoyes"),
      valeur: stats?.imprimesEnvoyes ?? 0,
      icone: FileCheck2,
      couleur: "bg-rose-50 text-rose-700",
      href: "/sigh/laboratoire/historique",
    },
  ];

  const actionsRapides = [
    {
      href: "/sigh/laboratoire/saisie-resultats",
      label: t("laboratoire.dashboard.actionEnregistrer"),
      icone: FlaskConical,
    },
    {
      href: "/sigh/laboratoire/resultats-a-valider",
      label: t("laboratoire.dashboard.actionValider"),
      icone: ClipboardCheck,
    },
    {
      href: "/sigh/laboratoire/resultats-valides",
      label: t("laboratoire.dashboard.actionImprimer"),
      icone: Printer,
    },
    {
      href: "/sigh/laboratoire/patients",
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
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {kpis.map((k) => {
                const Icone = k.icone;
                return (
                  <div
                    key={k.id}
                    className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm"
                  >
                    <div
                      className={`mb-3 inline-flex rounded-lg p-2 ${k.couleur}`}
                    >
                      <Icone className="h-5 w-5" aria-hidden />
                    </div>
                    <p className="text-2xl font-bold text-texte-principal">
                      {k.valeur}
                    </p>
                    <p className="mt-1 text-xs font-medium text-texte-secondaire">
                      {k.label}
                    </p>
                    <Link
                      href={k.href}
                      className="mt-3 inline-block text-xs font-semibold text-bleu-medical hover:underline"
                    >
                      {t("laboratoire.dashboard.voirListe")}
                    </Link>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <section className="rounded-xl border border-gris-bordure bg-white shadow-sm">
                <div className="flex items-center justify-between gap-2 border-b border-gris-bordure px-4 py-3">
                  <h2 className="text-sm font-bold text-texte-principal">
                    {t("laboratoire.dashboard.tablePatients")}
                  </h2>
                  <Link
                    href="/sigh/laboratoire/patients"
                    className="text-xs font-semibold text-bleu-medical hover:underline"
                  >
                    {t("laboratoire.dashboard.voirTous")}
                  </Link>
                </div>
                {!patientsTransferes.length ? (
                  <p className="px-4 py-8 text-center text-sm text-texte-secondaire">
                    {t("laboratoire.dashboard.aucunPatient")}
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left text-sm">
                      <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-texte-secondaire">
                        <tr>
                          <th className="px-3 py-2 font-semibold">
                            {t("laboratoire.dashboard.colEnregistrement")}
                          </th>
                          <th className="px-3 py-2 font-semibold">
                            {t("laboratoire.dashboard.colPatient")}
                          </th>
                          <th className="px-3 py-2 font-semibold">
                            {t("laboratoire.dashboard.colService")}
                          </th>
                          <th className="px-3 py-2 font-semibold">
                            {t("laboratoire.dashboard.colExamens")}
                          </th>
                          <th className="px-3 py-2 font-semibold">
                            {t("laboratoire.dashboard.colHeure")}
                          </th>
                          <th className="px-3 py-2 font-semibold">
                            {t("laboratoire.dashboard.colStatut")}
                          </th>
                          <th className="px-3 py-2 font-semibold">
                            {t("laboratoire.dashboard.colActions")}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gris-bordure">
                        {patientsTransferes.map((p) => (
                          <tr key={p.dossierId} className="hover:bg-slate-50/80">
                            <td className="px-3 py-2.5 font-mono text-xs text-texte-principal">
                              {numeroEnregistrement(p)}
                            </td>
                            <td className="px-3 py-2.5">
                              <p className="font-semibold text-texte-principal">
                                {p.nom} {p.prenom}
                              </p>
                              <p className="text-[11px] text-texte-secondaire">
                                {p.age != null ? `${p.age} ans` : "—"}
                                {p.sexe ? ` · ${p.sexe}` : ""}
                              </p>
                            </td>
                            <td className="px-3 py-2.5 text-xs text-texte-secondaire">
                              {p.provenance || "—"}
                            </td>
                            <td className="px-3 py-2.5 text-xs font-medium">
                              {p.nombreExamens}
                            </td>
                            <td className="px-3 py-2.5 text-xs text-texte-secondaire">
                              {formatHeure(p.arriveeLe, i18n.language)}
                            </td>
                            <td className="px-3 py-2.5">
                              {(() => {
                                const statut = libelleStatutLigneLabo(p);
                                return (
                                  <span
                                    className={cn(
                                      "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
                                      statut.couleur
                                    )}
                                  >
                                    {statut.type === "transfert"
                                      ? t(
                                          `laboratoire.transferts.statut.${statut.cle}`
                                        )
                                      : t(
                                          `laboratoire.orientationsStatut.${statut.statutAnalyse}.label`
                                        )}
                                  </span>
                                );
                              })()}
                            </td>
                            <td className="px-3 py-2.5">
                              <Link
                                href={`/sigh/laboratoire/patients?dossier=${p.dossierId}`}
                                className="inline-flex rounded-lg border border-gris-bordure p-1.5 text-texte-secondaire hover:bg-white hover:text-bleu-medical"
                                title={t("laboratoire.patients.ouvrirDossier")}
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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
                  <p className="px-4 py-8 text-center text-sm text-texte-secondaire">
                    {t("laboratoire.dashboard.aucuneAnalyse")}
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[480px] text-left text-sm">
                      <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-texte-secondaire">
                        <tr>
                          <th className="px-3 py-2 font-semibold">
                            {t("laboratoire.dashboard.colEchantillon")}
                          </th>
                          <th className="px-3 py-2 font-semibold">
                            {t("laboratoire.dashboard.colPatient")}
                          </th>
                          <th className="px-3 py-2 font-semibold">
                            {t("laboratoire.dashboard.colExamens")}
                          </th>
                          <th className="px-3 py-2 font-semibold">
                            {t("laboratoire.dashboard.colStatut")}
                          </th>
                          <th className="px-3 py-2 font-semibold">
                            {t("laboratoire.dashboard.colActions")}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gris-bordure">
                        {analysesListe.map((p) => (
                          <tr key={p.dossierId} className="hover:bg-slate-50/80">
                            <td className="px-3 py-2.5 font-mono text-xs">
                              {codeEchantillon(p)}
                            </td>
                            <td className="px-3 py-2.5 font-semibold">
                              {p.nom} {p.prenom}
                            </td>
                            <td className="max-w-[160px] truncate px-3 py-2.5 text-xs text-texte-secondaire">
                              {libellesExamens(p)}
                            </td>
                            <td className="px-3 py-2.5">
                              <span
                                className={cn(
                                  "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
                                  couleurStatutAnalyse(p.statutAnalyse)
                                )}
                              >
                                {t(
                                  `laboratoire.orientationsStatut.${p.statutAnalyse || "EN_COURS"}.label`
                                )}
                              </span>
                            </td>
                            <td className="px-3 py-2.5">
                              <Link
                                href={`/sigh/laboratoire/examens-en-cours?dossier=${p.dossierId}`}
                                className="inline-flex rounded-lg border border-gris-bordure p-1.5 text-amber-700 hover:bg-amber-50"
                              >
                                <FlaskConical className="h-4 w-4" />
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-texte-principal">
                    {t("laboratoire.dashboard.resultatsAValider")}
                  </h2>
                  <Link
                    href="/sigh/laboratoire/resultats-a-valider"
                    className="text-xs font-semibold text-bleu-medical hover:underline"
                  >
                    {t("laboratoire.dashboard.voirTous")}
                  </Link>
                </div>
                <p className="py-6 text-center text-sm text-texte-secondaire">
                  {t("laboratoire.dashboard.videValidation")}
                </p>
              </section>

              <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-texte-principal">
                    {t("laboratoire.dashboard.resultatsValidesAujourdhui")}
                  </h2>
                  <Link
                    href="/sigh/laboratoire/resultats-valides"
                    className="text-xs font-semibold text-bleu-medical hover:underline"
                  >
                    {t("laboratoire.dashboard.voirTous")}
                  </Link>
                </div>
                <p className="py-6 text-center text-sm text-texte-secondaire">
                  {(stats?.resultatsValidesAujourdhui ?? 0) > 0
                    ? t("laboratoire.dashboard.resumeValides", {
                        count: stats?.resultatsValidesAujourdhui ?? 0,
                      })
                    : t("laboratoire.dashboard.videValides")}
                </p>
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
              <div className="flex flex-wrap gap-2">
                {actionsRapides.map((a) => {
                  const Icone = a.icone;
                  return (
                    <Link
                      key={a.label}
                      href={a.href}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gris-bordure bg-slate-50 px-3 py-2.5 text-xs font-semibold text-texte-principal transition hover:border-bleu-medical/40 hover:bg-bleu-medical-clair/40 sm:flex-none sm:text-sm"
                    >
                      <Icone className="h-4 w-4 text-bleu-medical" />
                      {a.label}
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
