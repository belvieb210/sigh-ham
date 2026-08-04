"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import {
  MiseEnPageMedecins,
  type UtilisateurMedecins,
} from "@/features/medecins/mise-en-page-medecins";
import type { ConsultationHistoriqueMedecins } from "@/lib/medecins/types";

interface Props {
  utilisateur: UtilisateurMedecins;
}

export function ContenuHistoriqueMedecins({ utilisateur }: Props) {
  const { t } = useTranslation();
  const [periode, setPeriode] = useState<"jour" | "semaine">("jour");
  const [liste, setListe] = useState<ConsultationHistoriqueMedecins[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    let annule = false;
    setChargement(true);
    (async () => {
      try {
        const res = await fetch(
          `/api/medecins/consultations?periode=${periode}`
        );
        const data = (await res.json()) as {
          consultations?: ConsultationHistoriqueMedecins[];
          erreur?: string;
        };
        if (annule) return;
        if (!res.ok) {
          setErreur(data.erreur ?? t("medecins.historique.erreur"));
          return;
        }
        setListe(data.consultations ?? []);
        setErreur(null);
      } catch {
        if (!annule) setErreur(t("medecins.historique.erreur"));
      } finally {
        if (!annule) setChargement(false);
      }
    })();
    return () => {
      annule = true;
    };
  }, [periode, t]);

  return (
    <MiseEnPageMedecins
      utilisateur={utilisateur}
      titre={t("medecins.historique.titre")}
      sousTitre={t("medecins.historique.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1100px] space-y-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPeriode("jour")}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
              periode === "jour"
                ? "bg-bleu-medical text-white"
                : "border border-gris-bordure bg-white"
            }`}
          >
            {t("medecins.historique.aujourdhui")}
          </button>
          <button
            type="button"
            onClick={() => setPeriode("semaine")}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
              periode === "semaine"
                ? "bg-bleu-medical text-white"
                : "border border-gris-bordure bg-white"
            }`}
          >
            {t("medecins.historique.semaine")}
          </button>
        </div>

        {chargement ? (
          <div className="flex items-center gap-2 text-sm text-texte-secondaire">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("medecins.historique.chargement")}
          </div>
        ) : erreur ? (
          <p className="text-sm text-red-600">{erreur}</p>
        ) : liste.length === 0 ? (
          <p className="text-sm text-texte-secondaire">
            {t("medecins.historique.vide")}
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gris-fond text-xs text-texte-secondaire">
                <tr>
                  <th className="px-3 py-2">{t("medecins.historique.colonnes.patient")}</th>
                  <th className="px-3 py-2">{t("medecins.historique.colonnes.motif")}</th>
                  <th className="px-3 py-2">{t("medecins.historique.colonnes.medecin")}</th>
                  <th className="px-3 py-2">{t("medecins.historique.colonnes.fin")}</th>
                  <th className="px-3 py-2">{t("medecins.historique.colonnes.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {liste.map((c) => (
                  <tr key={c.id} className="border-t border-gris-bordure">
                    <td className="px-3 py-2">
                      <p className="font-medium">{c.patient}</p>
                      <p className="text-xs text-texte-secondaire">
                        {c.numeroDossier}
                      </p>
                    </td>
                    <td className="px-3 py-2">{c.motif}</td>
                    <td className="px-3 py-2">{c.medecin}</td>
                    <td className="px-3 py-2 text-xs">
                      {new Date(c.finLe).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/sigh/medecins/consultation?dossier=${c.dossierId}`}
                        className="text-xs font-semibold text-bleu-medical"
                      >
                        {t("medecins.historique.voir")}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MiseEnPageMedecins>
  );
}
