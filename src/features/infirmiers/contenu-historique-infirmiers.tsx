"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import {
  MiseEnPageInfirmiers,
  type UtilisateurInfirmiers,
} from "@/features/infirmiers/mise-en-page-infirmiers";
import type { HistoriqueConstanteInfirmiers } from "@/lib/infirmiers/types";

interface Props {
  utilisateur: UtilisateurInfirmiers;
}

export function ContenuHistoriqueInfirmiers({ utilisateur }: Props) {
  const { t, i18n } = useTranslation();
  const [liste, setListe] = useState<HistoriqueConstanteInfirmiers[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const res = await fetch("/api/infirmiers/historique");
      const data = (await res.json()) as {
        historique?: HistoriqueConstanteInfirmiers[];
        erreur?: string;
      };
      if (!res.ok) {
        setErreur(data.erreur ?? t("infirmiers.historique.erreur"));
        return;
      }
      setListe(data.historique ?? []);
    } catch {
      setErreur(t("infirmiers.historique.erreur"));
    } finally {
      setChargement(false);
    }
  }, [t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  const formater = (iso: string) => {
    try {
      return new Date(iso).toLocaleString(i18n.language || "fr-FR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  return (
    <MiseEnPageInfirmiers
      utilisateur={utilisateur}
      titre={t("infirmiers.historique.titre")}
      sousTitre={t("infirmiers.historique.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1100px] space-y-4">
        {chargement ? (
          <div className="flex items-center gap-2 text-sm text-texte-secondaire">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("infirmiers.historique.chargement")}
          </div>
        ) : erreur ? (
          <p className="text-sm text-red-600">{erreur}</p>
        ) : liste.length === 0 ? (
          <p className="text-sm text-texte-secondaire">{t("infirmiers.historique.vide")}</p>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {liste.map((c) => (
                <Link
                  key={c.id}
                  href={`/sigh/infirmiers/consultation?dossier=${c.dossierId}`}
                  className="block rounded-xl border border-gris-bordure bg-white p-4 shadow-sm"
                >
                  <p className="font-semibold text-texte-principal">{c.nomComplet}</p>
                  <p className="font-mono text-xs text-texte-secondaire">
                    {c.numeroDossier} · {formater(c.mesureLe)}
                  </p>
                  <p className="mt-2 text-xs text-texte-secondaire">
                    T° {c.temperature ?? "—"} · TA {c.tensionSystolique ?? "—"}/
                    {c.tensionDiastolique ?? "—"} · FC {c.frequenceCardiaque ?? "—"} · SpO₂{" "}
                    {c.saturationO2 ?? "—"}
                  </p>
                </Link>
              ))}
            </div>
            <div className="hidden overflow-x-auto rounded-xl border border-gris-bordure bg-white md:block">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-gris-bordure bg-slate-50 text-xs uppercase text-texte-secondaire">
                  <tr>
                    <th className="px-4 py-3">{t("infirmiers.historique.colonnes.patient")}</th>
                    <th className="px-4 py-3">{t("infirmiers.historique.colonnes.mesure")}</th>
                    <th className="px-4 py-3">{t("infirmiers.historique.colonnes.resume")}</th>
                    <th className="px-4 py-3">{t("infirmiers.historique.colonnes.infirmier")}</th>
                  </tr>
                </thead>
                <tbody>
                  {liste.map((c) => (
                    <tr key={c.id} className="border-b border-gris-bordure/60">
                      <td className="px-4 py-3">
                        <Link
                          href={`/sigh/infirmiers/consultation?dossier=${c.dossierId}`}
                          className="font-medium text-bleu-medical hover:underline"
                        >
                          {c.nomComplet}
                        </Link>
                        <p className="font-mono text-xs text-texte-secondaire">
                          {c.numeroDossier}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-texte-secondaire">
                        {formater(c.mesureLe)}
                      </td>
                      <td className="px-4 py-3 text-xs text-texte-secondaire">
                        T° {c.temperature ?? "—"} · TA {c.tensionSystolique ?? "—"}/
                        {c.tensionDiastolique ?? "—"} · FC {c.frequenceCardiaque ?? "—"} ·
                        SpO₂ {c.saturationO2 ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-texte-secondaire">
                        {c.infirmier ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </MiseEnPageInfirmiers>
  );
}
