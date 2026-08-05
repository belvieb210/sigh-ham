"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ArrowRightLeft, Loader2 } from "lucide-react";
import {
  MiseEnPageMedecins,
  type UtilisateurMedecins,
} from "@/features/medecins/mise-en-page-medecins";
import type { PatientTransfereCaisse } from "@/lib/medecins/types";
import { cn } from "@/lib/utils";

interface Props {
  utilisateur: UtilisateurMedecins;
}

function libelleStatut(statut: string, t: (k: string) => string) {
  if (statut === "EN_ATTENTE") return t("medecins.patientsTransferes.statutEnAttente");
  return t("medecins.patientsTransferes.statutAccepte");
}

export function ContenuPatientsTransferesMedecins({ utilisateur }: Props) {
  const { t } = useTranslation();
  const [patients, setPatients] = useState<PatientTransfereCaisse[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const res = await fetch("/api/medecins/patients-transferes");
      const data = (await res.json()) as {
        patients?: PatientTransfereCaisse[];
        erreur?: string;
      };
      if (!res.ok || !data.patients) {
        setErreur(data.erreur ?? t("medecins.patientsTransferes.erreur"));
        return;
      }
      setPatients(data.patients);
    } catch {
      setErreur(t("medecins.patientsTransferes.erreur"));
    } finally {
      setChargement(false);
    }
  }, [t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  return (
    <MiseEnPageMedecins
      utilisateur={utilisateur}
      titre={t("medecins.patientsTransferes.titre")}
      sousTitre={t("medecins.patientsTransferes.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1100px] space-y-4">
        <p className="text-sm text-texte-secondaire">
          {t("medecins.patientsTransferes.description")}
        </p>

        {chargement ? (
          <div className="flex items-center gap-2 text-sm text-texte-secondaire">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("medecins.patientsTransferes.chargement")}
          </div>
        ) : erreur ? (
          <p className="text-sm text-red-600">{erreur}</p>
        ) : patients.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gris-bordure bg-white p-8 text-center text-sm text-texte-secondaire">
            {t("medecins.patientsTransferes.vide")}
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gris-tres-clair text-xs uppercase text-texte-secondaire">
                <tr>
                  <th className="px-4 py-3 font-semibold">Patient</th>
                  <th className="hidden px-4 py-3 font-semibold sm:table-cell">
                    {t("medecins.patientsTransferes.destination")}
                  </th>
                  <th className="px-4 py-3 font-semibold">Statut</th>
                  <th className="px-4 py-3 font-semibold">
                    {t("medecins.patientsTransferes.emisLe")}
                  </th>
                  <th className="px-4 py-3 font-semibold"> </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gris-bordure">
                {patients.map((p) => (
                  <tr key={p.id} className="hover:bg-gris-tres-clair/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-texte-principal">
                        {p.nomComplet}
                      </p>
                      <p className="text-xs text-texte-secondaire">
                        {p.numeroDossier}
                        {p.telephone ? ` · ${p.telephone}` : ""}
                      </p>
                    </td>
                    <td className="hidden px-4 py-3 text-texte-secondaire sm:table-cell">
                      {p.destination}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold",
                          p.statut === "EN_ATTENTE"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        )}
                      >
                        {libelleStatut(p.statut, t)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-texte-secondaire">{p.heure}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/sigh/medecins/consultation?dossier=${encodeURIComponent(p.dossierId)}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-bleu-medical hover:underline"
                      >
                        <ArrowRightLeft className="h-3.5 w-3.5" />
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
