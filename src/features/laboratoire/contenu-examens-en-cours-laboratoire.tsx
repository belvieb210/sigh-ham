"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Eye, FlaskConical, Loader2, Search } from "lucide-react";
import {
  MiseEnPageLaboratoire,
  type UtilisateurLaboratoire,
} from "@/features/laboratoire/mise-en-page-laboratoire";
import type { PatientFileLaboratoire } from "@/lib/laboratoire/types";

interface PropsContenuExamensEnCoursLaboratoire {
  utilisateur: UtilisateurLaboratoire;
}

export function ContenuExamensEnCoursLaboratoire({
  utilisateur,
}: PropsContenuExamensEnCoursLaboratoire) {
  const { t, i18n } = useTranslation();
  const searchParams = useSearchParams();
  const dossierUrl = searchParams.get("dossier");

  const [patients, setPatients] = useState<PatientFileLaboratoire[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [recherche, setRecherche] = useState("");

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const res = await fetch("/api/laboratoire/patients");
      const data = (await res.json()) as {
        patients?: PatientFileLaboratoire[];
        erreur?: string;
      };
      if (!res.ok) {
        setErreur(data.erreur ?? t("laboratoire.examensEnCours.erreur"));
        setPatients([]);
        return;
      }
      setPatients(data.patients ?? []);
    } catch {
      setErreur(t("laboratoire.examensEnCours.erreur"));
    } finally {
      setChargement(false);
    }
  }, [t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  const enCours = useMemo(
    () =>
      patients.filter((p) =>
        p.examens.some((e) => e.statut === "EN_ANALYSE")
      ),
    [patients]
  );

  const filtres = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q) return enCours;
    return enCours.filter((p) => {
      const blob = [
        p.nom,
        p.prenom,
        p.numeroDossier,
        p.numeroPatient,
        p.telephone ?? "",
        ...p.examens.map((e) => e.libelle),
      ]
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [enCours, recherche]);

  useEffect(() => {
    if (!dossierUrl || !filtres.length) return;
    const el = document.getElementById(`analyse-${dossierUrl}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [dossierUrl, filtres.length]);

  return (
    <MiseEnPageLaboratoire
      utilisateur={utilisateur}
      titre={t("laboratoire.examensEnCours.titre")}
      sousTitre={t("laboratoire.examensEnCours.sousTitre")}
    >
      <div className="mx-auto w-full max-w-6xl space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-texte-secondaire" />
          <input
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder={t("laboratoire.examensEnCours.recherche")}
            className="w-full rounded-xl border border-gris-bordure bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-bleu-medical"
          />
        </div>

        {chargement ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-bleu-medical" />
          </div>
        ) : erreur ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {erreur}
          </p>
        ) : !filtres.length ? (
          <p className="rounded-xl border border-gris-bordure bg-white px-4 py-12 text-center text-sm text-texte-secondaire">
            {t("laboratoire.examensEnCours.vide")}
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-texte-secondaire">
                  <tr>
                    <th className="px-4 py-3 font-semibold">
                      {t("laboratoire.dashboard.colPatient")}
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      {t("laboratoire.patients.colonnes.examens")}
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      {t("laboratoire.dashboard.colStatut")}
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      {t("laboratoire.dashboard.colHeure")}
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      {t("laboratoire.dashboard.colActions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gris-bordure">
                  {filtres.map((p) => {
                    const examensAnalyse = p.examens.filter(
                      (e) => e.statut === "EN_ANALYSE"
                    );
                    return (
                      <tr
                        key={p.dossierId}
                        id={`analyse-${p.dossierId}`}
                        className={
                          dossierUrl === p.dossierId
                            ? "bg-bleu-medical-clair/30"
                            : "hover:bg-slate-50/80"
                        }
                      >
                        <td className="px-4 py-3">
                          <p className="font-semibold text-texte-principal">
                            {p.nom} {p.prenom}
                          </p>
                          <p className="text-xs text-texte-secondaire">
                            {p.numeroDossier}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-xs text-texte-secondaire">
                          {examensAnalyse.map((e) => e.libelle).join(", ") ||
                            "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                            <FlaskConical className="h-3 w-3" />
                            {t("laboratoire.dashboard.statutEnCours")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-texte-secondaire">
                          {new Date(p.arriveeLe).toLocaleTimeString(
                            i18n.language || "fr-FR",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/sigh/laboratoire/patients?dossier=${p.dossierId}`}
                            className="inline-flex rounded-lg border border-gris-bordure p-1.5 text-texte-secondaire hover:text-bleu-medical"
                            title={t("laboratoire.patients.ouvrirDossier")}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </MiseEnPageLaboratoire>
  );
}
