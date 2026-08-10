"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  Activity,
  ArrowRightLeft,
  CalendarDays,
  ClipboardList,
  History,
  Loader2,
  Share2,
  Users,
} from "lucide-react";
import {
  MiseEnPageInfirmiers,
  type UtilisateurInfirmiers,
} from "@/features/infirmiers/mise-en-page-infirmiers";
import type {
  ActiviteRecenteInfirmiers,
  ApercuDashboardInfirmiers,
  DetailPatientInfirmiers,
} from "@/lib/infirmiers/types";
import { cn } from "@/lib/utils";

interface PropsContenuAccueilInfirmiers {
  utilisateur: UtilisateurInfirmiers;
}

function resumeConstantes(p: DetailPatientInfirmiers | null) {
  const c = p?.derniereConstante;
  if (!c) return null;
  const parts: string[] = [];
  if (c.temperature != null) parts.push(`T° ${c.temperature}°C`);
  if (c.tensionSystolique != null && c.tensionDiastolique != null) {
    parts.push(`TA ${c.tensionSystolique}/${c.tensionDiastolique}`);
  }
  if (c.frequenceCardiaque != null) parts.push(`FC ${c.frequenceCardiaque}`);
  if (c.saturationO2 != null) parts.push(`SpO₂ ${c.saturationO2}%`);
  if (c.poidsKg != null) parts.push(`Poids ${c.poidsKg} kg`);
  return parts.length ? parts.join(" · ") : null;
}

function libelleActivite(a: ActiviteRecenteInfirmiers, t: (k: string) => string) {
  if (a.type === "CONSTANTES") return t("infirmiers.dashboard.activiteConstantes");
  if (a.type === "FICHE_TRAITEMENT") return t("infirmiers.dashboard.activiteFicheTraitement");
  return a.libelle;
}

export function ContenuAccueilInfirmiers({ utilisateur }: PropsContenuAccueilInfirmiers) {
  const { t, i18n } = useTranslation();
  const [apercu, setApercu] = useState<ApercuDashboardInfirmiers | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        const res = await fetch("/api/infirmiers/stats?apercu=1");
        const data = (await res.json()) as {
          apercu?: ApercuDashboardInfirmiers;
          erreur?: string;
        };
        if (!annule) {
          if (!res.ok || !data.apercu) {
            setErreur(data.erreur ?? t("infirmiers.dashboard.erreur"));
          } else {
            setApercu(data.apercu);
          }
        }
      } catch {
        if (!annule) setErreur(t("infirmiers.dashboard.erreur"));
      } finally {
        if (!annule) setChargement(false);
      }
    })();
    return () => {
      annule = true;
    };
  }, [t]);

  const stats = apercu?.stats ?? null;
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
      label: t("infirmiers.dashboard.patientsEnFile"),
      valeur: stats?.patientsEnFile ?? 0,
      icone: Users,
      couleur: "bg-violet-50 text-violet-700",
      href: "/sigh/infirmiers/patients",
    },
    {
      label: t("infirmiers.dashboard.constantesAujourdhui"),
      valeur: stats?.constantesAujourdhui ?? 0,
      icone: Activity,
      couleur: "bg-emerald-50 text-emerald-700",
      href: "/sigh/infirmiers/consultation",
    },
    {
      label: t("infirmiers.dashboard.transfertsSortantsAujourdhui"),
      valeur: stats?.transfertsSortantsAujourdhui ?? 0,
      icone: Share2,
      couleur: "bg-blue-50 text-blue-700",
      href: "/sigh/infirmiers/historique",
    },
    {
      label: t("infirmiers.dashboard.fichesTraitementActives"),
      valeur: stats?.fichesTraitementActives ?? 0,
      icone: ClipboardList,
      couleur: "bg-amber-50 text-amber-700",
      href: "/sigh/infirmiers/fiche-traitement",
    },
    {
      label: t("infirmiers.dashboard.consultationEnAttente"),
      valeur: stats?.patientsConsultationEnAttente ?? 0,
      icone: ArrowRightLeft,
      couleur: "bg-cyan-50 text-cyan-800",
      href: "/sigh/infirmiers/consultation",
    },
  ];

  const patientCours = apercu?.patientEnCours ?? null;
  const hrefConsult = patientCours
    ? `/sigh/infirmiers/consultation?dossier=${encodeURIComponent(patientCours.dossierId)}`
    : "/sigh/infirmiers/consultation";
  const constantesLabel = resumeConstantes(patientCours);

  return (
    <MiseEnPageInfirmiers
      utilisateur={utilisateur}
      titre={t("infirmiers.dashboard.titre")}
      sousTitre={t("infirmiers.dashboard.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1280px] space-y-5">
        <div className="flex flex-wrap items-center gap-2 text-sm text-texte-secondaire">
          <CalendarDays className="h-4 w-4" />
          <span className="capitalize">{dateLabel}</span>
        </div>

        {chargement ? (
          <div className="flex items-center gap-2 text-sm text-texte-secondaire">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("infirmiers.dashboard.chargement")}
          </div>
        ) : erreur ? (
          <p className="text-sm text-red-600">{erreur}</p>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {kpis.map((kpi) => {
                const Icone = kpi.icone;
                return (
                  <Link
                    key={kpi.href + kpi.label}
                    href={kpi.href}
                    className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm transition-colors hover:border-bleu-medical/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-texte-secondaire">
                          {kpi.label}
                        </p>
                        <p className="mt-2 text-2xl font-bold text-texte-principal">
                          {kpi.valeur}
                        </p>
                      </div>
                      <span
                        className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${kpi.couleur}`}
                      >
                        <Icone className="h-5 w-5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-texte-principal">
                    {t("infirmiers.dashboard.fileAttente")}
                  </h2>
                  <Link
                    href="/sigh/infirmiers/consultation"
                    className="text-xs font-medium text-bleu-medical hover:underline"
                  >
                    {t("infirmiers.dashboard.voirTout")}
                  </Link>
                </div>
                {(apercu?.file.length ?? 0) === 0 ? (
                  <p className="text-sm text-texte-secondaire">
                    {t("infirmiers.dashboard.aucuneFile")}
                  </p>
                ) : (
                  <ul className="divide-y divide-gris-bordure">
                    {apercu!.file.map((p) => (
                      <li key={p.cleListe}>
                        <Link
                          href={`/sigh/infirmiers/consultation?dossier=${encodeURIComponent(p.dossierId)}`}
                          className="flex items-center gap-3 py-2.5 transition-colors hover:bg-gris-tres-clair/60"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-texte-principal">
                              {p.nomComplet}
                            </p>
                            <p className="truncate text-xs text-texte-secondaire">
                              {p.motif || p.numeroDossier} · {p.heure}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold",
                              p.hasConstantesAujourdhui
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            )}
                          >
                            {p.hasConstantesAujourdhui
                              ? t("infirmiers.dashboard.constantesPrises")
                              : t("infirmiers.dashboard.enAttente")}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-texte-principal">
                    {t("infirmiers.dashboard.patientEnCours")}
                  </h2>
                  {patientCours ? (
                    <Link
                      href={hrefConsult}
                      className="text-xs font-medium text-bleu-medical hover:underline"
                    >
                      {t("infirmiers.dashboard.voirDossierComplet")}
                    </Link>
                  ) : null}
                </div>

                {!patientCours ? (
                  <p className="text-sm text-texte-secondaire">
                    {t("infirmiers.dashboard.aucunPatientEnCours")}
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <p className="text-base font-semibold text-texte-principal">
                        {patientCours.nomComplet}
                      </p>
                      <p className="text-xs text-texte-secondaire">
                        {patientCours.numeroDossier}
                        {patientCours.age != null ? ` · ${patientCours.age} ans` : ""}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1 border-b border-gris-bordure pb-2">
                      {(
                        [
                          ["ongletConsultation", hrefConsult],
                          [
                            "ongletFicheTraitement",
                            `/sigh/infirmiers/fiche-traitement?dossier=${encodeURIComponent(patientCours.dossierId)}`,
                          ],
                          ["ongletHistorique", "/sigh/infirmiers/historique"],
                        ] as const
                      ).map(([cle, href], i) => (
                        <Link
                          key={cle}
                          href={href}
                          className={cn(
                            "rounded-md px-2 py-1 text-[11px] font-medium",
                            i === 0
                              ? "bg-bleu-medical text-white"
                              : "text-texte-secondaire hover:bg-gris-tres-clair"
                          )}
                        >
                          {t(`infirmiers.dashboard.${cle}`)}
                        </Link>
                      ))}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-texte-secondaire">
                          {t("infirmiers.dashboard.motif")}
                        </p>
                        <p className="text-texte-principal">
                          {patientCours.motif || "—"}
                        </p>
                      </div>
                      {constantesLabel ? (
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-texte-secondaire">
                            {t("infirmiers.dashboard.signesVitaux")}
                          </p>
                          <p className="text-texte-principal">{constantesLabel}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-texte-secondaire">
                          {t("infirmiers.dashboard.aucuneConstante")}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <Link
                        href={hrefConsult}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-bleu-medical px-3 py-1.5 text-xs font-medium text-white hover:bg-bleu-medical/90"
                      >
                        <Activity className="h-3.5 w-3.5" />
                        {t("infirmiers.dashboard.prendreConstantes")}
                      </Link>
                      <Link
                        href={`/sigh/infirmiers/fiche-traitement?dossier=${encodeURIComponent(patientCours.dossierId)}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gris-bordure px-3 py-1.5 text-xs font-medium text-texte-principal hover:bg-gris-tres-clair"
                      >
                        <ClipboardList className="h-3.5 w-3.5" />
                        {t("infirmiers.dashboard.ouvrirFicheTraitement")}
                      </Link>
                      <Link
                        href="/sigh/infirmiers/patients"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gris-bordure px-3 py-1.5 text-xs font-medium text-texte-principal hover:bg-gris-tres-clair"
                      >
                        <ArrowRightLeft className="h-3.5 w-3.5" />
                        {t("infirmiers.dashboard.orienterPatient")}
                      </Link>
                    </div>
                  </div>
                )}
              </section>

              <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-texte-principal">
                    {t("infirmiers.dashboard.activitesRecentes")}
                  </h2>
                  <Link
                    href="/sigh/infirmiers/historique"
                    className="text-xs font-medium text-bleu-medical hover:underline"
                  >
                    {t("infirmiers.dashboard.voirTout")}
                  </Link>
                </div>
                {(apercu?.activites.length ?? 0) === 0 ? (
                  <p className="text-sm text-texte-secondaire">
                    {t("infirmiers.dashboard.aucuneActivite")}
                  </p>
                ) : (
                  <ul className="space-y-2.5">
                    {apercu!.activites.map((a) => (
                      <li
                        key={a.id}
                        className="flex items-start gap-2 border-b border-gris-bordure/70 pb-2 last:border-0"
                      >
                        <span
                          className={cn(
                            "mt-0.5 h-2 w-2 shrink-0 rounded-full",
                            a.type === "CONSTANTES" && "bg-emerald-500",
                            a.type === "TRANSFERT" && "bg-blue-500",
                            a.type === "FICHE_TRAITEMENT" && "bg-amber-500"
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-texte-principal">
                            {libelleActivite(a, t)}
                          </p>
                          <p className="text-xs text-texte-secondaire">
                            {a.patient} · {a.heure}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-4 grid grid-cols-1 gap-2 border-t border-gris-bordure pt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-texte-secondaire">
                    {t("infirmiers.dashboard.actionsRapides")}
                  </p>
                  <Link
                    href="/sigh/infirmiers/consultation"
                    className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-medium text-violet-800 hover:bg-violet-100"
                  >
                    {t("infirmiers.dashboard.actionConsultation")}
                  </Link>
                  <Link
                    href="/sigh/infirmiers/fiche-traitement"
                    className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900 hover:bg-amber-100"
                  >
                    {t("infirmiers.dashboard.actionFicheTraitement")}
                  </Link>
                  <Link
                    href="/sigh/infirmiers/historique"
                    className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-900 hover:bg-blue-100"
                  >
                    {t("infirmiers.dashboard.actionHistorique")}
                  </Link>
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </MiseEnPageInfirmiers>
  );
}
