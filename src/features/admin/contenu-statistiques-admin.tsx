"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BarChart3, Download } from "lucide-react";
import {
  MiseEnPageAdmin,
  type UtilisateurAdmin,
} from "@/features/admin/mise-en-page-admin";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import { Bouton } from "@/components/ui/bouton";

type Periode = "jour" | "7j" | "30j";

interface StatsData {
  periode: Periode;
  depuis: string;
  jusqua: string;
  indicateurs: Record<string, number>;
}

export function ContenuStatistiquesAdmin({
  utilisateur,
}: {
  utilisateur: UtilisateurAdmin;
}) {
  const { t } = useTranslation();
  const [periode, setPeriode] = useState<Periode>("jour");
  const [data, setData] = useState<StatsData | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(() => {
    setErreur(null);
    fetch(`/api/admin/rapports?periode=${periode}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.message ?? t("admin.common.erreur"));
        setData(json as StatsData);
      })
      .catch((e: unknown) =>
        setErreur(e instanceof Error ? e.message : t("admin.common.erreur"))
      );
  }, [periode, t]);

  useEffect(() => {
    charger();
  }, [charger]);

  return (
    <MiseEnPageAdmin
      utilisateur={utilisateur}
      titre={t("admin.statistiques.titre")}
      sousTitre={t("admin.layout.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1100px]">
        <EnTetePageReception
          icone={BarChart3}
          titre={t("admin.statistiques.titre")}
          description={t("admin.statistiques.description")}
          fil={[
            { label: t("admin.common.salle"), href: "/sigh/admin" },
            { label: t("admin.statistiques.fil") },
          ]}
        />

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {(["jour", "7j", "30j"] as Periode[]).map((p) => (
            <Bouton
              key={p}
              type="button"
              taille="petit"
              variante={periode === p ? "primaire" : "secondaire"}
              onClick={() => setPeriode(p)}
            >
              {t(`admin.statistiques.periode.${p}`)}
            </Bouton>
          ))}
          <a
            href={`/api/admin/rapports?periode=${periode}&format=csv`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gris-bordure px-3 py-1.5 text-xs font-medium hover:bg-gris-tres-clair"
          >
            <Download className="h-4 w-4" />
            {t("admin.statistiques.exporter")}
          </a>
        </div>

        {erreur ? (
          <p className="mt-4 text-sm text-red-700">{erreur}</p>
        ) : null}

        {data ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(data.indicateurs).map(([cle, valeur]) => (
              <div
                key={cle}
                className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm"
              >
                <p className="text-xs uppercase tracking-wide text-texte-secondaire">
                  {t(`admin.statistiques.kpi.${cle}`, { defaultValue: cle })}
                </p>
                <p className="mt-2 text-2xl font-bold text-texte-principal">
                  {valeur}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm text-texte-secondaire">
            {t("admin.common.chargement")}
          </p>
        )}
      </div>
    </MiseEnPageAdmin>
  );
}
