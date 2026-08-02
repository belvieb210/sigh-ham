"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Loader2, Receipt } from "lucide-react";
import { MiseEnPageCaisse, type UtilisateurCaisse } from "@/features/caisse/mise-en-page-caisse";
import { formaterMontantCaisse } from "@/features/caisse/utils-format";
import type { PatientFileCaisse } from "@/lib/caisse/types";

interface PropsContenuPatientsAttenteCaisse {
  utilisateur: UtilisateurCaisse;
}

export function ContenuPatientsAttenteCaisse({ utilisateur }: PropsContenuPatientsAttenteCaisse) {
  const { t } = useTranslation();
  const [patients, setPatients] = useState<PatientFileCaisse[]>([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        const res = await fetch("/api/caisse/patients");
        const data = (await res.json()) as { patients?: PatientFileCaisse[] };
        if (!annule && res.ok) setPatients(data.patients ?? []);
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
      titre={t("caisse.patients.titre")}
      sousTitre={t("caisse.patients.sousTitre")}
    >
      <div className="mx-auto w-full max-w-5xl space-y-4">
        <div>
          <h2 className="text-xl font-bold text-texte-principal">{t("caisse.patients.titre")}</h2>
          <p className="mt-1 text-sm text-texte-secondaire">{t("caisse.patients.sousTitre")}</p>
        </div>

        {chargement ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-texte-secondaire">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : patients.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gris-bordure bg-white px-6 py-14 text-center text-sm text-texte-secondaire">
            {t("caisse.patients.vide")}
          </div>
        ) : (
          <ul className="space-y-2">
            {patients.map((p) => (
              <li
                key={p.fileAttenteId}
                className="flex flex-col gap-3 rounded-xl border border-gris-bordure bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                      {t("caisse.patients.ordre", { n: p.numeroOrdre })}
                    </span>
                    <p className="truncate text-sm font-semibold text-texte-principal">
                      {p.prenom} {p.nom}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-texte-secondaire">
                    {p.numeroPatient} · {p.numeroDossier}
                  </p>
                  <p className="mt-1 text-xs text-texte-secondaire">
                    {t("caisse.patients.examens", { count: p.nombreExamens })} ·{" "}
                    {t("caisse.patients.montantEstime")}{" "}
                    {formaterMontantCaisse(p.montantEstime)}
                  </p>
                </div>
                <Link
                  href={`/sigh/caisse/facturation?dossier=${p.dossierId}`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-bleu-medical px-4 py-2.5 text-sm font-semibold text-white hover:bg-bleu-medical/90"
                >
                  <Receipt className="h-4 w-4" />
                  {t("caisse.patients.facturer")}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </MiseEnPageCaisse>
  );
}
