"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  Activity,
  CalendarDays,
  History,
  Loader2,
  Share2,
  Users,
} from "lucide-react";
import {
  MiseEnPageInfirmiers,
  type UtilisateurInfirmiers,
} from "@/features/infirmiers/mise-en-page-infirmiers";
import type { StatsInfirmiersJour } from "@/lib/infirmiers/types";

interface PropsContenuAccueilInfirmiers {
  utilisateur: UtilisateurInfirmiers;
}

export function ContenuAccueilInfirmiers({ utilisateur }: PropsContenuAccueilInfirmiers) {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState<StatsInfirmiersJour | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        const res = await fetch("/api/infirmiers/stats");
        const data = (await res.json()) as {
          stats?: StatsInfirmiersJour;
          erreur?: string;
        };
        if (!annule) {
          if (!res.ok || !data.stats) {
            setErreur(data.erreur ?? t("infirmiers.dashboard.erreur"));
          } else {
            setStats(data.stats);
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
      href: "/sigh/infirmiers/constantes",
    },
    {
      label: t("infirmiers.dashboard.transfertsSortantsAujourdhui"),
      valeur: stats?.transfertsSortantsAujourdhui ?? 0,
      icone: Share2,
      couleur: "bg-blue-50 text-blue-700",
      href: "/sigh/infirmiers/patients",
    },
  ];

  const raccourcis = [
    {
      href: "/sigh/infirmiers/patients",
      titre: t("infirmiers.dashboard.raccourciPatients"),
      desc: t("infirmiers.dashboard.raccourciPatientsDesc"),
      icone: Users,
    },
    {
      href: "/sigh/infirmiers/constantes",
      titre: t("infirmiers.dashboard.raccourciConstantes"),
      desc: t("infirmiers.dashboard.raccourciConstantesDesc"),
      icone: Activity,
    },
    {
      href: "/sigh/infirmiers/historique",
      titre: t("infirmiers.dashboard.raccourciHistorique"),
      desc: t("infirmiers.dashboard.raccourciHistoriqueDesc"),
      icone: History,
    },
  ];

  return (
    <MiseEnPageInfirmiers
      utilisateur={utilisateur}
      titre={t("infirmiers.dashboard.titre")}
      sousTitre={t("infirmiers.dashboard.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1200px] space-y-6">
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
            <div className="grid gap-3 sm:grid-cols-3">
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

            <div className="grid gap-3 sm:grid-cols-3">
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
    </MiseEnPageInfirmiers>
  );
}
