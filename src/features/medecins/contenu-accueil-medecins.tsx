"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  BedDouble,
  CalendarDays,
  ClipboardList,
  FlaskConical,
  History,
  Loader2,
  Pill,
  Stethoscope,
  Users,
} from "lucide-react";
import {
  MiseEnPageMedecins,
  type UtilisateurMedecins,
} from "@/features/medecins/mise-en-page-medecins";
import type { StatsMedecinsJour } from "@/lib/medecins/types";

interface PropsContenuAccueilMedecins {
  utilisateur: UtilisateurMedecins;
}

export function ContenuAccueilMedecins({ utilisateur }: PropsContenuAccueilMedecins) {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState<StatsMedecinsJour | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        const res = await fetch("/api/medecins/stats");
        const data = (await res.json()) as {
          stats?: StatsMedecinsJour;
          erreur?: string;
        };
        if (!annule) {
          if (!res.ok || !data.stats) {
            setErreur(data.erreur ?? t("medecins.dashboard.erreur"));
          } else {
            setStats(data.stats);
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
      label: t("medecins.dashboard.patientsEnFile"),
      valeur: stats?.patientsEnFile ?? 0,
      icone: Users,
      couleur: "bg-blue-50 text-blue-700",
      href: "/sigh/medecins/patients",
    },
    {
      label: t("medecins.dashboard.consultationsAujourdhui"),
      valeur: stats?.consultationsAujourdhui ?? 0,
      icone: Stethoscope,
      couleur: "bg-emerald-50 text-emerald-700",
      href: "/sigh/medecins/consultation",
    },
    {
      label: t("medecins.dashboard.ordonnancesAujourdhui"),
      valeur: stats?.ordonnancesAujourdhui ?? 0,
      icone: Pill,
      couleur: "bg-amber-50 text-amber-700",
      href: "/sigh/medecins/ordonnances",
    },
    {
      label: t("medecins.dashboard.admissionsActives"),
      valeur: stats?.admissionsActives ?? 0,
      icone: BedDouble,
      couleur: "bg-indigo-50 text-indigo-700",
      href: "/sigh/medecins/hospitalisations",
    },
  ];

  const raccourcis = [
    {
      href: "/sigh/medecins/patients",
      titre: t("medecins.dashboard.raccourciPatients"),
      desc: t("medecins.dashboard.raccourciPatientsDesc"),
      icone: Users,
    },
    {
      href: "/sigh/medecins/consultation",
      titre: t("medecins.dashboard.raccourciConsultation"),
      desc: t("medecins.dashboard.raccourciConsultationDesc"),
      icone: Stethoscope,
    },
    {
      href: "/sigh/medecins/examens",
      titre: t("medecins.dashboard.raccourciExamens"),
      desc: t("medecins.dashboard.raccourciExamensDesc"),
      icone: FlaskConical,
    },
    {
      href: "/sigh/medecins/ordonnances",
      titre: t("medecins.dashboard.raccourciOrdonnances"),
      desc: t("medecins.dashboard.raccourciOrdonnancesDesc"),
      icone: Pill,
    },
    {
      href: "/sigh/medecins/hospitalisations",
      titre: t("medecins.dashboard.raccourciHospitalisations"),
      desc: t("medecins.dashboard.raccourciHospitalisationsDesc"),
      icone: BedDouble,
    },
    {
      href: "/sigh/medecins/rendez-vous",
      titre: t("medecins.dashboard.raccourciRdv"),
      desc: t("medecins.dashboard.raccourciRdvDesc"),
      icone: ClipboardList,
    },
    {
      href: "/sigh/medecins/historique",
      titre: t("medecins.dashboard.raccourciHistorique"),
      desc: t("medecins.dashboard.raccourciHistoriqueDesc"),
      icone: History,
    },
  ];

  return (
    <MiseEnPageMedecins
      utilisateur={utilisateur}
      titre={t("medecins.dashboard.titre")}
      sousTitre={t("medecins.dashboard.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1200px] space-y-6">
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
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {raccourcis.map((r) => {
                const Icone = r.icone;
                return (
                  <Link
                    key={r.href}
                    href={r.href}
                    className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm transition-colors hover:border-bleu-medical hover:bg-bleu-medical-clair/30"
                  >
                    <Icone className="h-5 w-5 text-bleu-medical" />
                    <p className="mt-3 text-sm font-semibold text-texte-principal">
                      {r.titre}
                    </p>
                    <p className="mt-1 text-xs text-texte-secondaire">{r.desc}</p>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </MiseEnPageMedecins>
  );
}
