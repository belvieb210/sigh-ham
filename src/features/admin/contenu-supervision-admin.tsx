"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Activity } from "lucide-react";
import {
  MiseEnPageAdmin,
  type UtilisateurAdmin,
} from "@/features/admin/mise-en-page-admin";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";

interface StatsAdmin {
  kpis: Record<string, number>;
  salles: { code: string; nom: string; enFile: number }[];
  genereLe: string;
}

export function ContenuSupervisionAdmin({
  utilisateur,
}: {
  utilisateur: UtilisateurAdmin;
}) {
  const { t } = useTranslation();
  const [stats, setStats] = useState<StatsAdmin | null>(null);

  const charger = useCallback(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data: StatsAdmin) => setStats(data));
  }, []);

  useEffect(() => {
    charger();
    const id = window.setInterval(charger, 15000);
    return () => window.clearInterval(id);
  }, [charger]);

  return (
    <MiseEnPageAdmin
      utilisateur={utilisateur}
      titre={t("admin.supervision.titre")}
      sousTitre={t("admin.layout.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1100px]">
        <EnTetePageReception
          icone={Activity}
          titre={t("admin.supervision.titre")}
          description={t("admin.supervision.description")}
          fil={[
            { label: t("admin.common.salle"), href: "/sigh/admin" },
            { label: t("admin.supervision.fil") },
          ]}
        />
        {!stats ? (
          <p className="mt-4 text-sm text-texte-secondaire">
            {t("admin.common.chargement")}
          </p>
        ) : (
          <>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["sessionsActives", stats.kpis.sessionsActives],
                ["connexionsJour", stats.kpis.connexionsJour],
                ["messagesJour", stats.kpis.messagesJour],
                ["conversationsActives", stats.kpis.conversationsActives],
                ["facturesJour", stats.kpis.facturesJour],
                ["examensPrescrits", stats.kpis.examensPrescrits],
                ["examensTermines", stats.kpis.examensTermines],
                ["dossiersOuverts", stats.kpis.dossiersOuverts],
              ].map(([cle, val]) => (
                <div
                  key={cle}
                  className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm"
                >
                  <p className="text-xs uppercase text-texte-secondaire">
                    {t(`admin.dashboard.${cle}`)}
                  </p>
                  <p className="mt-1 text-2xl font-bold">{val}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-gris-tres-clair text-xs uppercase text-texte-secondaire">
                  <tr>
                    <th className="px-4 py-3">{t("admin.services.colonnes.service")}</th>
                    <th className="px-4 py-3">{t("admin.services.enFile")}</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.salles.map((s) => (
                    <tr key={s.code} className="border-t border-gris-bordure">
                      <td className="px-4 py-3">
                        <p className="font-medium">{s.nom}</p>
                        <p className="text-xs text-texte-secondaire">{s.code}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold">{s.enFile}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-texte-secondaire">
              {t("admin.dashboard.majAuto")}{" "}
              {new Date(stats.genereLe).toLocaleTimeString()}
            </p>
          </>
        )}
      </div>
    </MiseEnPageAdmin>
  );
}
