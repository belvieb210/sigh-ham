"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  CheckCircle2,
  FlaskConical,
  Loader2,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  MiseEnPageLaboratoire,
  type UtilisateurLaboratoire,
} from "@/features/laboratoire/mise-en-page-laboratoire";
import type { StatsLaboratoireJour } from "@/lib/laboratoire/types";

interface PropsContenuAccueilLaboratoire {
  utilisateur: UtilisateurLaboratoire;
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
      label: t("laboratoire.dashboard.patientsRecus"),
      valeur: stats?.patientsRecusAujourdhui ?? 0,
      icone: Users,
      couleur: "bg-blue-50 text-blue-700",
    },
    {
      label: t("laboratoire.dashboard.examensEnCours"),
      valeur: stats?.examensEnCours ?? 0,
      icone: FlaskConical,
      couleur: "bg-amber-50 text-amber-700",
    },
    {
      label: t("laboratoire.dashboard.resultatsAValider"),
      valeur: stats?.resultatsAValider ?? 0,
      icone: ShieldCheck,
      couleur: "bg-violet-50 text-violet-700",
    },
    {
      label: t("laboratoire.dashboard.resultatsValides"),
      valeur: stats?.resultatsValidesAujourdhui ?? 0,
      icone: CheckCircle2,
      couleur: "bg-emerald-50 text-emerald-700",
    },
    {
      label: t("laboratoire.dashboard.fileActive"),
      valeur: stats?.patientsEnFile ?? 0,
      icone: Users,
      couleur: "bg-cyan-50 text-cyan-800",
    },
  ];

  return (
    <MiseEnPageLaboratoire
      utilisateur={utilisateur}
      titre={t("laboratoire.dashboard.titre")}
      sousTitre={t("laboratoire.dashboard.sousTitre")}
    >
      <div className="mx-auto w-full max-w-6xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm capitalize text-texte-secondaire">{dateLabel}</p>
          <Link
            href="/sigh/laboratoire/patients"
            className="rounded-lg bg-bleu-medical px-3 py-2 text-sm font-semibold text-white hover:bg-bleu-medical/90"
          >
            {t("laboratoire.dashboard.raccourciPatients")}
          </Link>
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
                    key={k.label}
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
                  </div>
                );
              })}
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
              <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-sm font-bold uppercase tracking-wide text-texte-principal">
                    {t("laboratoire.dashboard.derniersArrives")}
                  </h2>
                  <Link
                    href="/sigh/laboratoire/patients"
                    className="text-xs font-semibold text-bleu-medical hover:underline"
                  >
                    {t("laboratoire.dashboard.voirTous")}
                  </Link>
                </div>
                {!stats?.derniersArrives.length ? (
                  <p className="py-8 text-center text-sm text-texte-secondaire">
                    {t("laboratoire.dashboard.aucunPatient")}
                  </p>
                ) : (
                  <ul className="divide-y divide-gris-bordure">
                    {stats.derniersArrives.map((p) => (
                      <li key={p.dossierId}>
                        <Link
                          href={`/sigh/laboratoire/patients?dossier=${p.dossierId}`}
                          className="flex items-center justify-between gap-3 py-3 hover:bg-gris-tres-clair/60"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-texte-principal">
                              {p.nom} {p.prenom}
                            </p>
                            <p className="truncate text-xs text-texte-secondaire">
                              {p.numeroDossier} · {p.nombreExamens} examen(s) ·{" "}
                              {p.provenance}
                            </p>
                          </div>
                          <span className="shrink-0 text-[11px] text-texte-secondaire">
                            {new Date(p.arriveeLe).toLocaleTimeString(
                              i18n.language || "fr-FR",
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-texte-principal">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  {t("laboratoire.dashboard.alertes")}
                </h2>
                <div
                  className={`rounded-lg px-3 py-3 text-sm ${
                    (stats?.patientsEnFile ?? 0) > 0
                      ? "border border-amber-200 bg-amber-50 text-amber-900"
                      : "border border-emerald-200 bg-emerald-50 text-emerald-800"
                  }`}
                >
                  {(stats?.patientsEnFile ?? 0) > 0
                    ? t("laboratoire.dashboard.alerteFile", {
                        count: stats?.patientsEnFile ?? 0,
                      })
                    : t("laboratoire.dashboard.alerteVide")}
                </div>
                <Link
                  href="/sigh/laboratoire/patients"
                  className="mt-4 block rounded-lg border border-gris-bordure px-3 py-3 text-sm hover:bg-gris-tres-clair"
                >
                  <p className="font-semibold text-texte-principal">
                    {t("laboratoire.dashboard.raccourciPatients")}
                  </p>
                  <p className="mt-0.5 text-xs text-texte-secondaire">
                    {t("laboratoire.dashboard.raccourciPatientsDesc")}
                  </p>
                </Link>
              </section>
            </div>
          </>
        )}
      </div>
    </MiseEnPageLaboratoire>
  );
}
