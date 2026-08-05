"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  ArrowRightLeft,
  FlaskConical,
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

interface Props {
  utilisateur: UtilisateurMedecins;
}

export function ContenuRapportsMedecins({ utilisateur }: Props) {
  const { t } = useTranslation();
  const [stats, setStats] = useState<StatsMedecinsJour | null>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        const res = await fetch("/api/medecins/stats");
        const data = (await res.json()) as { stats?: StatsMedecinsJour };
        if (!annule && res.ok && data.stats) setStats(data.stats);
      } catch {
        /* ignore */
      } finally {
        if (!annule) setChargement(false);
      }
    })();
    return () => {
      annule = true;
    };
  }, []);

  const liens = [
    {
      href: "/sigh/medecins/file-attente",
      label: t("medecins.dashboard.patientsEnAttente"),
      valeur: stats?.patientsEnFile ?? 0,
      icone: Users,
    },
    {
      href: "/sigh/medecins/patients-du-jour",
      label: t("medecins.dashboard.consultationsDuJour"),
      valeur: stats?.consultationsAujourdhui ?? 0,
      icone: Stethoscope,
    },
    {
      href: "/sigh/medecins/ordonnances",
      label: t("medecins.dashboard.ordonnancesEmises"),
      valeur: stats?.ordonnancesAujourdhui ?? 0,
      icone: Pill,
    },
    {
      href: "/sigh/medecins/examens",
      label: t("medecins.dashboard.examensDemandes"),
      valeur: stats?.examensAujourdhui ?? 0,
      icone: FlaskConical,
    },
    {
      href: "/sigh/medecins/patients-transferes",
      label: t("medecins.dashboard.patientsTransferes"),
      valeur: stats?.patientsTransferesCaisse ?? 0,
      icone: ArrowRightLeft,
    },
  ];

  return (
    <MiseEnPageMedecins
      utilisateur={utilisateur}
      titre={t("medecins.rapports.titre")}
      sousTitre={t("medecins.rapports.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[900px] space-y-4">
        <p className="text-sm text-texte-secondaire">
          {t("medecins.rapports.description")}
        </p>
        {chargement ? (
          <div className="flex items-center gap-2 text-sm text-texte-secondaire">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("medecins.dashboard.chargement")}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {liens.map((l) => {
              const Icone = l.icone;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className="flex items-center gap-3 rounded-xl border border-gris-bordure bg-white p-4 shadow-sm transition-colors hover:border-bleu-medical/40"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-bleu-medical-clair text-bleu-medical">
                    <Icone className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-texte-secondaire">{l.label}</p>
                    <p className="text-xl font-bold text-texte-principal">
                      {l.valeur}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </MiseEnPageMedecins>
  );
}
