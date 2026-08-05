"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Loader2, Stethoscope } from "lucide-react";
import {
  MiseEnPageMedecins,
  type UtilisateurMedecins,
} from "@/features/medecins/mise-en-page-medecins";
import type { PatientDuJour } from "@/lib/medecins/types";

interface Props {
  utilisateur: UtilisateurMedecins;
}

export function ContenuPatientsDuJourMedecins({ utilisateur }: Props) {
  const { t, i18n } = useTranslation();
  const [patients, setPatients] = useState<PatientDuJour[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const res = await fetch("/api/medecins/patients-du-jour");
      const data = (await res.json()) as {
        patients?: PatientDuJour[];
        erreur?: string;
      };
      if (!res.ok || !data.patients) {
        setErreur(data.erreur ?? t("medecins.patientsDuJour.erreur"));
        return;
      }
      setPatients(data.patients);
    } catch {
      setErreur(t("medecins.patientsDuJour.erreur"));
    } finally {
      setChargement(false);
    }
  }, [t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  const formater = (iso: string) =>
    new Date(iso).toLocaleTimeString(i18n.language || "fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <MiseEnPageMedecins
      utilisateur={utilisateur}
      titre={t("medecins.patientsDuJour.titre")}
      sousTitre={t("medecins.patientsDuJour.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1100px] space-y-4">
        {chargement ? (
          <div className="flex items-center gap-2 text-sm text-texte-secondaire">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("medecins.patientsDuJour.chargement")}
          </div>
        ) : erreur ? (
          <p className="text-sm text-red-600">{erreur}</p>
        ) : patients.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gris-bordure bg-white p-8 text-center text-sm text-texte-secondaire">
            {t("medecins.patientsDuJour.vide")}
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gris-tres-clair text-xs uppercase text-texte-secondaire">
                <tr>
                  <th className="px-4 py-3 font-semibold">Patient</th>
                  <th className="hidden px-4 py-3 font-semibold sm:table-cell">
                    Motif
                  </th>
                  <th className="hidden px-4 py-3 font-semibold md:table-cell">
                    Médecin
                  </th>
                  <th className="px-4 py-3 font-semibold">Début</th>
                  <th className="px-4 py-3 font-semibold"> </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gris-bordure">
                {patients.map((p) => (
                  <tr key={p.consultationId ?? p.dossierId} className="hover:bg-gris-tres-clair/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-texte-principal">
                        {p.nomComplet}
                      </p>
                      <p className="text-xs text-texte-secondaire">
                        {p.numeroDossier}
                      </p>
                    </td>
                    <td className="hidden px-4 py-3 text-texte-secondaire sm:table-cell">
                      {p.motif || "—"}
                    </td>
                    <td className="hidden px-4 py-3 text-texte-secondaire md:table-cell">
                      {p.medecin}
                    </td>
                    <td className="px-4 py-3 text-texte-secondaire">
                      {formater(p.debutLe)}
                      {p.finLe ? (
                        <span className="ml-1 text-emerald-700">✓</span>
                      ) : (
                        <span className="ml-1 text-amber-600">…</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/sigh/medecins/consultation?dossier=${encodeURIComponent(p.dossierId)}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-bleu-medical px-2.5 py-1.5 text-xs font-medium text-white"
                      >
                        <Stethoscope className="h-3.5 w-3.5" />
                        {t("medecins.nav.consultation")}
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
