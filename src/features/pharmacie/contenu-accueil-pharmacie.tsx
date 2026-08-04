"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  ClipboardList,
  Loader2,
  Package,
  Pill,
  Users,
  Wallet,
} from "lucide-react";
import {
  MiseEnPagePharmacie,
  type UtilisateurPharmacie,
} from "@/features/pharmacie/mise-en-page-pharmacie";
import type { StatsPharmacieJour } from "@/lib/pharmacie/types";

export function ContenuAccueilPharmacie({
  utilisateur,
}: {
  utilisateur: UtilisateurPharmacie;
}) {
  const { t } = useTranslation();
  const [stats, setStats] = useState<StatsPharmacieJour | null>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    let a = false;
    (async () => {
      try {
        const res = await fetch("/api/pharmacie/stats");
        const data = (await res.json()) as { stats?: StatsPharmacieJour };
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
      label: t("pharmacie.dashboard.patientsEnFile"),
      valeur: stats?.patientsEnFile ?? 0,
      href: "/sigh/pharmacie/patients",
      icone: Users,
    },
    {
      label: t("pharmacie.dashboard.ordonnances"),
      valeur: stats?.ordonnancesEnAttente ?? 0,
      href: "/sigh/pharmacie/ordonnances",
      icone: ClipboardList,
    },
    {
      label: t("pharmacie.dashboard.ventesJour"),
      valeur: stats?.ventesDuJour ?? 0,
      href: "/sigh/pharmacie/vente",
      icone: Pill,
    },
    {
      label: t("pharmacie.dashboard.caJour"),
      valeur: `${Math.round(stats?.chiffreAffairesJour ?? 0).toLocaleString("fr-FR")} CDF`,
      href: "/sigh/pharmacie/rapports",
      icone: Wallet,
    },
    {
      label: t("pharmacie.dashboard.stockFaible"),
      valeur: stats?.stockFaible ?? 0,
      href: "/sigh/pharmacie/stock",
      icone: Package,
    },
    {
      label: t("pharmacie.dashboard.peremptions"),
      valeur: stats?.lotsExpirantBientot ?? 0,
      href: "/sigh/pharmacie/peremptions",
      icone: AlertTriangle,
    },
  ];

  return (
    <MiseEnPagePharmacie
      utilisateur={utilisateur}
      titre={t("pharmacie.dashboard.titre")}
      sousTitre={t("pharmacie.dashboard.sousTitre")}
    >
      {chargement ? (
        <div className="flex items-center gap-2 text-sm text-texte-secondaire">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("pharmacie.common.chargement")}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {kpis.map((k) => {
            const Icone = k.icone;
            return (
              <Link
                key={k.href + k.label}
                href={k.href}
                className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm hover:border-bleu-medical/40"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-texte-secondaire">{k.label}</p>
                    <p className="mt-2 text-xl font-bold text-texte-principal">
                      {k.valeur}
                    </p>
                  </div>
                  <Icone className="h-5 w-5 text-bleu-medical" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </MiseEnPagePharmacie>
  );
}
