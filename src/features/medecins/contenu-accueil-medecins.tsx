"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  ArrowRightLeft,
  CalendarDays,
  FlaskConical,
  Loader2,
  Pill,
  Printer,
  Stethoscope,
  Users,
} from "lucide-react";
import {
  MiseEnPageMedecins,
  type UtilisateurMedecins,
} from "@/features/medecins/mise-en-page-medecins";
import type {
  ActiviteRecenteMedecins,
  ApercuDashboardMedecins,
  DetailPatientMedecins,
} from "@/lib/medecins/types";
import { cn } from "@/lib/utils";

interface PropsContenuAccueilMedecins {
  utilisateur: UtilisateurMedecins;
}

function resumeConstantes(p: DetailPatientMedecins | null) {
  const c = p?.constantesVitales;
  if (!c) return null;
  const parts: string[] = [];
  if (c.temperature != null) parts.push(`T° ${c.temperature}°C`);
  if (c.tensionSystolique != null && c.tensionDiastolique != null) {
    parts.push(`TA ${c.tensionSystolique}/${c.tensionDiastolique}`);
  }
  if (c.frequenceCardiaque != null) parts.push(`FC ${c.frequenceCardiaque}`);
  if (c.saturationO2 != null) parts.push(`SpO₂ ${c.saturationO2}%`);
  return parts.length ? parts.join(" · ") : null;
}

function libelleActivite(
  a: ActiviteRecenteMedecins,
  t: (k: string) => string
) {
  if (a.type === "ORDONNANCE") return t("medecins.dashboard.activiteOrdonnance");
  if (a.type === "EXAMEN") return a.libelle;
  if (a.type === "TRANSFERT_CAISSE") {
    return t("medecins.dashboard.activiteTransfertCaisse");
  }
  return a.libelle;
}

export function ContenuAccueilMedecins({ utilisateur }: PropsContenuAccueilMedecins) {
  const { t, i18n } = useTranslation();
  const [apercu, setApercu] = useState<ApercuDashboardMedecins | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        const res = await fetch("/api/medecins/stats?apercu=1");
        const data = (await res.json()) as {
          apercu?: ApercuDashboardMedecins;
          erreur?: string;
        };
        if (!annule) {
          if (!res.ok || !data.apercu) {
            setErreur(data.erreur ?? t("medecins.dashboard.erreur"));
          } else {
            setApercu(data.apercu);
          }
        }
      } catch {
        if (!annule) setErreur(t("medecins.dashboard.erreur"));
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
      label: t("medecins.dashboard.patientsEnAttente"),
      valeur: stats?.patientsEnFile ?? 0,
      icone: Users,
      couleur: "bg-blue-50 text-blue-700",
      href: "/sigh/medecins/file-attente",
    },
    {
      label: t("medecins.dashboard.consultationsDuJour"),
      valeur: stats?.consultationsAujourdhui ?? 0,
      icone: Stethoscope,
      couleur: "bg-emerald-50 text-emerald-700",
      href: "/sigh/medecins/patients-du-jour",
    },
    {
      label: t("medecins.dashboard.ordonnancesEmises"),
      valeur: stats?.ordonnancesAujourdhui ?? 0,
      icone: Pill,
      couleur: "bg-amber-50 text-amber-700",
      href: "/sigh/medecins/ordonnances",
    },
    {
      label: t("medecins.dashboard.examensDemandes"),
      valeur: stats?.examensAujourdhui ?? 0,
      icone: FlaskConical,
      couleur: "bg-cyan-50 text-cyan-800",
      href: "/sigh/medecins/examens",
    },
    {
      label: t("medecins.dashboard.patientsTransferes"),
      valeur: stats?.patientsTransferesCaisse ?? 0,
      icone: ArrowRightLeft,
      couleur: "bg-rose-50 text-rose-700",
      href: "/sigh/medecins/patients-transferes",
    },
  ];

  const patientCours = apercu?.consultationEnCours ?? null;
  const hrefConsult = patientCours
    ? `/sigh/medecins/consultation?dossier=${encodeURIComponent(patientCours.dossierId)}`
    : "/sigh/medecins/consultation";
  const constantesLabel = resumeConstantes(patientCours);

  return (
    <MiseEnPageMedecins
      utilisateur={utilisateur}
      titre={t("medecins.dashboard.titre")}
      sousTitre={t("medecins.dashboard.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1280px] space-y-5">
        <div className="flex flex-wrap items-center gap-2 text-sm text-texte-secondaire">
          <CalendarDays className="h-4 w-4" />
          <span className="capitalize">{dateLabel}</span>
        </div>

        {chargement ? (
          <div className="flex items-center gap-2 text-sm text-texte-secondaire">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("medecins.dashboard.chargement")}
          </div>
        ) : erreur ? (
          <p className="text-sm text-red-600">{erreur}</p>
        ) : (
          <>
            <div className="grille-kpi-sigh">
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
              {/* File d'attente */}
              <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-texte-principal">
                    {t("medecins.dashboard.fileAttente")}
                  </h2>
                  <Link
                    href="/sigh/medecins/file-attente"
                    className="text-xs font-medium text-bleu-medical hover:underline"
                  >
                    {t("medecins.dashboard.voirTout")}
                  </Link>
                </div>
                {(apercu?.file.length ?? 0) === 0 ? (
                  <p className="text-sm text-texte-secondaire">
                    {t("medecins.dashboard.aucuneFile")}
                  </p>
                ) : (
                  <ul className="divide-y divide-gris-bordure">
                    {apercu!.file.map((p) => (
                      <li key={p.cleListe}>
                        <Link
                          href={`/sigh/medecins/consultation?dossier=${encodeURIComponent(p.dossierId)}`}
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
                          <span className="shrink-0 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                            {t("medecins.dashboard.aujourdhui")}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Consultation en cours */}
              <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-texte-principal">
                    {t("medecins.dashboard.consultationEnCours")}
                  </h2>
                  {patientCours ? (
                    <Link
                      href={hrefConsult}
                      className="text-xs font-medium text-bleu-medical hover:underline"
                    >
                      {t("medecins.dashboard.voirDossierComplet")}
                    </Link>
                  ) : null}
                </div>

                {!patientCours ? (
                  <p className="text-sm text-texte-secondaire">
                    {t("medecins.dashboard.aucuneConsultation")}
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
                            "ongletAntecedents",
                            `${hrefConsult}&onglet=antecedents`,
                          ],
                          ["ongletExamens", `/sigh/medecins/examens?dossier=${encodeURIComponent(patientCours.dossierId)}`],
                          [
                            "ongletOrdonnances",
                            `/sigh/medecins/ordonnances?dossier=${encodeURIComponent(patientCours.dossierId)}`,
                          ],
                          [
                            "ongletNotes",
                            `/sigh/medecins/notes?dossier=${encodeURIComponent(patientCours.dossierId)}`,
                          ],
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
                          {t(`medecins.dashboard.${cle}`)}
                        </Link>
                      ))}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-texte-secondaire">
                          {t("medecins.dashboard.motif")}
                        </p>
                        <p className="text-texte-principal">
                          {patientCours.motif || "—"}
                        </p>
                      </div>
                      {constantesLabel ? (
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-texte-secondaire">
                            {t("medecins.dashboard.examenClinique")}
                          </p>
                          <p className="text-texte-principal">{constantesLabel}</p>
                        </div>
                      ) : null}
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-texte-secondaire">
                          {t("medecins.dashboard.diagnostic")}
                        </p>
                        {(apercu?.diagnosticsEnCours.length ?? 0) === 0 ? (
                          <p className="text-texte-secondaire">—</p>
                        ) : (
                          <ul className="list-inside list-disc text-texte-principal">
                            {apercu!.diagnosticsEnCours.map((d) => (
                              <li key={d.id}>
                                {d.libelle}
                                {d.principal ? " ★" : ""}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <Link
                        href={`/sigh/medecins/ordonnances?dossier=${encodeURIComponent(patientCours.dossierId)}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gris-bordure px-3 py-1.5 text-xs font-medium text-texte-principal hover:bg-gris-tres-clair"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        {t("medecins.dashboard.imprimerOrdonnance")}
                      </Link>
                      <Link
                        href={`/sigh/medecins/examens?dossier=${encodeURIComponent(patientCours.dossierId)}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gris-bordure px-3 py-1.5 text-xs font-medium text-texte-principal hover:bg-gris-tres-clair"
                      >
                        <FlaskConical className="h-3.5 w-3.5" />
                        {t("medecins.dashboard.demanderExamens")}
                      </Link>
                      <Link
                        href={hrefConsult}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-bleu-medical px-3 py-1.5 text-xs font-medium text-white hover:bg-bleu-medical/90"
                      >
                        <ArrowRightLeft className="h-3.5 w-3.5" />
                        {t("medecins.dashboard.transmettreCaisse")}
                      </Link>
                    </div>
                  </div>
                )}
              </section>

              {/* Activités récentes */}
              <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
                <h2 className="mb-3 text-sm font-semibold text-texte-principal">
                  {t("medecins.dashboard.activitesRecentes")}
                </h2>
                {(apercu?.activites.length ?? 0) === 0 ? (
                  <p className="text-sm text-texte-secondaire">
                    {t("medecins.dashboard.aucuneActivite")}
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
                            a.type === "ORDONNANCE" && "bg-amber-500",
                            a.type === "EXAMEN" && "bg-cyan-500",
                            a.type === "TRANSFERT_CAISSE" && "bg-rose-500",
                            a.type === "NOTE" && "bg-slate-400"
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
              </section>
            </div>
          </>
        )}
      </div>
    </MiseEnPageMedecins>
  );
}
