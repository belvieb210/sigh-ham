"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ArrowRight, FileText, Loader2, Users, Wallet } from "lucide-react";
import { MiseEnPageCaisse, type UtilisateurCaisse } from "@/features/caisse/mise-en-page-caisse";
import { formaterMontantCaisse } from "@/features/caisse/utils-format";
import type { StatsCaisseJour } from "@/lib/caisse/types";

interface PropsContenuAccueilCaisse {
  utilisateur: UtilisateurCaisse;
}

export function ContenuAccueilCaisse({ utilisateur }: PropsContenuAccueilCaisse) {
  const { t } = useTranslation();
  const [stats, setStats] = useState<StatsCaisseJour | null>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        const res = await fetch("/api/caisse/stats");
        const data = (await res.json()) as { stats?: StatsCaisseJour };
        if (!annule && res.ok && data.stats) setStats(data.stats);
      } finally {
        if (!annule) setChargement(false);
      }
    })();
    return () => {
      annule = true;
    };
  }, []);

  const cartes = [
    {
      id: "attente",
      label: t("caisse.dashboard.patientsEnAttente"),
      valeur: stats?.patientsEnAttente ?? 0,
      icone: Users,
      couleur: "text-amber-600 bg-amber-50",
    },
    {
      id: "factures",
      label: t("caisse.dashboard.facturesDuJour"),
      valeur: stats?.facturesDuJour ?? 0,
      icone: FileText,
      couleur: "text-bleu-medical bg-bleu-medical-clair/40",
    },
    {
      id: "encaissements",
      label: t("caisse.dashboard.encaissementsDuJour"),
      valeur: stats?.encaissementsDuJour ?? 0,
      icone: Wallet,
      couleur: "text-vert-sante bg-emerald-50",
    },
  ];

  return (
    <MiseEnPageCaisse
      utilisateur={utilisateur}
      titre={t("caisse.layout.titre")}
      sousTitre={t("caisse.layout.sousTitre")}
    >
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div>
          <h2 className="text-xl font-bold text-texte-principal">{t("caisse.dashboard.titre")}</h2>
          <p className="mt-1 text-sm text-texte-secondaire">{t("caisse.dashboard.sousTitre")}</p>
        </div>

        {chargement ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-texte-secondaire">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              {cartes.map((carte) => {
                const Icone = carte.icone;
                return (
                  <div
                    key={carte.id}
                    className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-texte-secondaire">{carte.label}</p>
                      <span className={`rounded-lg p-2 ${carte.couleur}`}>
                        <Icone className="h-4 w-4" />
                      </span>
                    </div>
                    <p className="mt-3 text-2xl font-bold text-texte-principal">{carte.valeur}</p>
                  </div>
                );
              })}
            </div>

            <div className="rounded-xl border border-gris-bordure bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-texte-secondaire">
                {t("caisse.dashboard.montantEncaisse")}
              </p>
              <p className="mt-2 text-3xl font-bold text-bleu-medical">
                {formaterMontantCaisse(stats?.montantEncaisseDuJour ?? 0)}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/sigh/caisse/facturation"
                  className="inline-flex items-center gap-2 rounded-lg bg-bleu-medical px-4 py-2.5 text-sm font-semibold text-white hover:bg-bleu-medical/90"
                >
                  {t("caisse.dashboard.allerFacturation")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/sigh/caisse/patients"
                  className="inline-flex items-center gap-2 rounded-lg border border-gris-bordure bg-white px-4 py-2.5 text-sm font-semibold text-texte-principal hover:bg-gris-tres-clair"
                >
                  {t("caisse.dashboard.voirFile")}
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </MiseEnPageCaisse>
  );
}
