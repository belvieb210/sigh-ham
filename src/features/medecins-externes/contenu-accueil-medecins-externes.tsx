"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  ClipboardList,
  FlaskConical,
  Loader2,
  Stethoscope,
  Users,
} from "lucide-react";
import {
  MiseEnPageMedecinsExternes,
  type UtilisateurMedecinsExternes,
} from "@/features/medecins-externes/mise-en-page-medecins-externes";
import type { StatsMedecinsExternesJour } from "@/lib/medecins-externes/lister-patients";

export function ContenuAccueilMedecinsExternes({
  utilisateur,
}: {
  utilisateur: UtilisateurMedecinsExternes;
}) {
  const { t } = useTranslation();
  const [stats, setStats] = useState<StatsMedecinsExternesJour | null>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    let a = false;
    (async () => {
      try {
        const res = await fetch("/api/medecins-externes/stats");
        const data = (await res.json()) as { stats?: StatsMedecinsExternesJour };
        if (!a && res.ok) setStats(data.stats ?? null);
      } finally {
        if (!a) setChargement(false);
      }
    })();
    return () => {
      a = true;
    };
  }, []);

  const kpis = [
    {
      label: t("medecinsExternes.dashboard.patientsEnFile"),
      valeur: stats?.patientsEnFile ?? 0,
      href: "/sigh/medecins-externes/patients",
      icone: Users,
    },
    {
      label: t("medecinsExternes.dashboard.consultations"),
      valeur: stats?.consultationsAujourdhui ?? 0,
      href: "/sigh/medecins-externes/consultation",
      icone: Stethoscope,
    },
    {
      label: t("medecinsExternes.dashboard.examens"),
      valeur: stats?.examensPrescritsAujourdhui ?? 0,
      href: "/sigh/medecins-externes/examens",
      icone: FlaskConical,
    },
    {
      label: t("medecinsExternes.dashboard.ordonnances"),
      valeur: stats?.ordonnancesAujourdhui ?? 0,
      href: "/sigh/medecins-externes/ordonnances",
      icone: ClipboardList,
    },
  ];

  return (
    <MiseEnPageMedecinsExternes
      utilisateur={utilisateur}
      titre={t("medecinsExternes.dashboard.titre")}
      sousTitre={t("medecinsExternes.dashboard.sousTitre")}
    >
      {chargement ? (
        <div className="flex items-center gap-2 text-sm text-texte-secondaire">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("medecinsExternes.common.chargement")}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((k) => {
            const Icone = k.icone;
            return (
              <Link
                key={k.href}
                href={k.href}
                className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm transition hover:border-bleu-medical"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-texte-secondaire">
                    {k.label}
                  </p>
                  <Icone className="h-4 w-4 text-bleu-medical" />
                </div>
                <p className="mt-2 text-2xl font-bold text-texte-principal">
                  {k.valeur}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </MiseEnPageMedecinsExternes>
  );
}
