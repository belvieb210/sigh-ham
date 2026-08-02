"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { MiseEnPageCaisse, type UtilisateurCaisse } from "@/features/caisse/mise-en-page-caisse";
import { formaterHeure, formaterMontantCaisse } from "@/features/caisse/utils-format";
import type { EncaissementResumeJour } from "@/lib/caisse/types";

interface PropsContenuEncaissementsCaisse {
  utilisateur: UtilisateurCaisse;
}

export function ContenuEncaissementsCaisse({ utilisateur }: PropsContenuEncaissementsCaisse) {
  const { t } = useTranslation();
  const [encaissements, setEncaissements] = useState<EncaissementResumeJour[]>([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        const res = await fetch("/api/caisse/encaissements");
        const data = (await res.json()) as { encaissements?: EncaissementResumeJour[] };
        if (!annule && res.ok) setEncaissements(data.encaissements ?? []);
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
      titre={t("caisse.encaissements.titre")}
      sousTitre={t("caisse.encaissements.sousTitre")}
    >
      <div className="mx-auto w-full max-w-5xl space-y-4">
        <div>
          <h2 className="text-xl font-bold text-texte-principal">
            {t("caisse.encaissements.titre")}
          </h2>
          <p className="mt-1 text-sm text-texte-secondaire">
            {t("caisse.encaissements.sousTitre")}
          </p>
        </div>

        {chargement ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-texte-secondaire">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : encaissements.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gris-bordure bg-white px-6 py-14 text-center text-sm text-texte-secondaire">
            {t("caisse.encaissements.vide")}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-gris-tres-clair/80 text-[11px] uppercase tracking-wider text-texte-secondaire">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">
                      {t("caisse.encaissements.heure")}
                    </th>
                    <th className="px-4 py-2.5 font-semibold">
                      {t("caisse.encaissements.patient")}
                    </th>
                    <th className="px-4 py-2.5 font-semibold">
                      {t("caisse.encaissements.facture")}
                    </th>
                    <th className="px-4 py-2.5 font-semibold">
                      {t("caisse.encaissements.mode")}
                    </th>
                    <th className="px-4 py-2.5 font-semibold text-right">
                      {t("caisse.encaissements.montant")}
                    </th>
                    <th className="px-4 py-2.5 font-semibold">
                      {t("caisse.encaissements.caissier")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {encaissements.map((e) => (
                    <tr key={e.id} className="border-t border-gris-bordure">
                      <td className="px-4 py-3 text-texte-secondaire">
                        {formaterHeure(e.payeLe)}
                      </td>
                      <td className="px-4 py-3 font-medium text-texte-principal">{e.patient}</td>
                      <td className="px-4 py-3 text-texte-secondaire">{e.numeroFacture}</td>
                      <td className="px-4 py-3">{t(`caisse.modesPaiement.${e.mode}`)}</td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {formaterMontantCaisse(e.montant)}
                      </td>
                      <td className="px-4 py-3 text-texte-secondaire">{e.caissier}</td>
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
