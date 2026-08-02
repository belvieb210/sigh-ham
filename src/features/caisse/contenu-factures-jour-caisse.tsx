"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { MiseEnPageCaisse, type UtilisateurCaisse } from "@/features/caisse/mise-en-page-caisse";
import { formaterMontantCaisse } from "@/features/caisse/utils-format";
import type { FactureResumeJour } from "@/lib/caisse/types";

interface PropsContenuFacturesJourCaisse {
  utilisateur: UtilisateurCaisse;
}

export function ContenuFacturesJourCaisse({ utilisateur }: PropsContenuFacturesJourCaisse) {
  const { t } = useTranslation();
  const [factures, setFactures] = useState<FactureResumeJour[]>([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        const res = await fetch("/api/caisse/factures");
        const data = (await res.json()) as { factures?: FactureResumeJour[] };
        if (!annule && res.ok) setFactures(data.factures ?? []);
      } finally {
        if (!annule) setChargement(false);
      }
    })();
    return () => {
      annule = true;
    };
  }, []);

  return (
    <MiseEnPageCaisse
      utilisateur={utilisateur}
      titre={t("caisse.factures.titre")}
      sousTitre={t("caisse.factures.sousTitre")}
    >
      <div className="mx-auto w-full max-w-5xl space-y-4">
        <div>
          <h2 className="text-xl font-bold text-texte-principal">{t("caisse.factures.titre")}</h2>
          <p className="mt-1 text-sm text-texte-secondaire">{t("caisse.factures.sousTitre")}</p>
        </div>

        {chargement ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-texte-secondaire">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : factures.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gris-bordure bg-white px-6 py-14 text-center text-sm text-texte-secondaire">
            {t("caisse.factures.vide")}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-gris-tres-clair/80 text-[11px] uppercase tracking-wider text-texte-secondaire">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">{t("caisse.factures.numero")}</th>
                    <th className="px-4 py-2.5 font-semibold">{t("caisse.factures.patient")}</th>
                    <th className="px-4 py-2.5 font-semibold text-right">
                      {t("caisse.factures.total")}
                    </th>
                    <th className="px-4 py-2.5 font-semibold text-right">
                      {t("caisse.factures.paye")}
                    </th>
                    <th className="px-4 py-2.5 font-semibold">{t("caisse.factures.statut")}</th>
                  </tr>
                </thead>
                <tbody>
                  {factures.map((f) => (
                    <tr key={f.id} className="border-t border-gris-bordure">
                      <td className="px-4 py-3">
                        <Link
                          href={`/sigh/caisse/facturation?dossier=${f.dossierId}`}
                          className="font-medium text-bleu-medical hover:underline"
                        >
                          {f.numeroFacture}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-texte-principal">{f.patient}</p>
                        <p className="text-xs text-texte-secondaire">{f.numeroPatient}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formaterMontantCaisse(f.montantTotal, f.devise)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formaterMontantCaisse(f.montantPaye, f.devise)}
                      </td>
                      <td className="px-4 py-3">
                        {t(`caisse.statutsFacture.${f.statut}`)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </MiseEnPageCaisse>
  );
}
