"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Eye,
  FlaskConical,
  Loader2,
  Play,
  Search,
  X,
} from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import {
  MiseEnPageLaboratoire,
  type UtilisateurLaboratoire,
} from "@/features/laboratoire/mise-en-page-laboratoire";
import type {
  DetailPatientLaboratoire,
  PatientFileLaboratoire,
} from "@/lib/laboratoire/types";
import { cn } from "@/lib/utils";

interface PropsContenuPatientsLaboratoire {
  utilisateur: UtilisateurLaboratoire;
}

export function ContenuPatientsLaboratoire({
  utilisateur,
}: PropsContenuPatientsLaboratoire) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dossierUrl = searchParams.get("dossier");

  const [patients, setPatients] = useState<PatientFileLaboratoire[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [recherche, setRecherche] = useState("");
  const [detail, setDetail] = useState<DetailPatientLaboratoire | null>(null);
  const [chargementDetail, setChargementDetail] = useState(false);
  const [demarrage, setDemarrage] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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
        setErreur(data.erreur ?? t("laboratoire.patients.erreur"));
        setPatients([]);
        return;
      }
      setPatients(data.patients ?? []);
    } catch {
      setErreur(t("laboratoire.patients.erreur"));
    } finally {
      setChargement(false);
    }
  }, [t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  const ouvrirDetail = useCallback(
    async (dossierId: string) => {
      setChargementDetail(true);
      setMessage(null);
      try {
        const res = await fetch(`/api/laboratoire/patients/${dossierId}`);
        const data = (await res.json()) as {
          patient?: DetailPatientLaboratoire;
          erreur?: string;
        };
        if (!res.ok || !data.patient) {
          setErreur(data.erreur ?? t("laboratoire.patients.erreur"));
          return;
        }
        setDetail(data.patient);
        router.replace(`/sigh/laboratoire/patients?dossier=${dossierId}`);
      } finally {
        setChargementDetail(false);
      }
    },
    [router, t]
  );

  useEffect(() => {
    if (dossierUrl && !detail) {
      void ouvrirDetail(dossierUrl);
    }
  }, [dossierUrl, detail, ouvrirDetail]);

  const filtrés = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) =>
      [
        p.nom,
        p.prenom,
        p.telephone,
        p.numeroDossier,
        p.numeroPatient,
        p.numeroFacture,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [patients, recherche]);

  const commencerAnalyses = async () => {
    if (!detail) return;
    setDemarrage(true);
    setMessage(null);
    try {
      const res = await fetch("/api/laboratoire/examens/commencer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dossierId: detail.dossierId }),
      });
      const data = (await res.json()) as { erreur?: string; message?: string };
      if (!res.ok) {
        setMessage(data.erreur ?? t("laboratoire.patients.erreurDemarrage"));
        return;
      }
      setMessage(data.message ?? t("laboratoire.patients.analysesDemarrees"));
      await charger();
      await ouvrirDetail(detail.dossierId);
    } catch {
      setMessage(t("laboratoire.patients.erreurDemarrage"));
    } finally {
      setDemarrage(false);
    }
  };

  const fermerDetail = () => {
    setDetail(null);
    router.replace("/sigh/laboratoire/patients");
  };

  const formatHeure = (iso: string) =>
    new Date(iso).toLocaleString(i18n.language || "fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <MiseEnPageLaboratoire
      utilisateur={utilisateur}
      titre={t("laboratoire.patients.titre")}
      sousTitre={t("laboratoire.patients.sousTitre")}
    >
      <div className="mx-auto w-full max-w-6xl space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-texte-secondaire" />
          <input
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder={t("laboratoire.patients.recherche")}
            className="w-full rounded-xl border border-gris-bordure bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-bleu-medical focus:ring-2 focus:ring-bleu-medical/20"
          />
        </div>

        {erreur && (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {erreur}
          </p>
        )}

        {chargement ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-bleu-medical" />
          </div>
        ) : filtrés.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gris-bordure bg-white px-6 py-14 text-center">
            <FlaskConical className="mx-auto h-10 w-10 text-texte-secondaire/50" />
            <p className="mt-3 font-semibold text-texte-principal">
              {t("laboratoire.patients.vide")}
            </p>
            <p className="mt-1 text-sm text-texte-secondaire">
              {t("laboratoire.patients.videAide")}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm lg:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-gris-tres-clair text-xs uppercase tracking-wide text-texte-secondaire">
                  <tr>
                    <th className="px-3 py-3">{t("laboratoire.patients.colonnes.ordre")}</th>
                    <th className="px-3 py-3">{t("laboratoire.patients.colonnes.patient")}</th>
                    <th className="px-3 py-3">{t("laboratoire.patients.colonnes.sexeAge")}</th>
                    <th className="px-3 py-3">{t("laboratoire.patients.colonnes.telephone")}</th>
                    <th className="px-3 py-3">{t("laboratoire.patients.colonnes.arrivee")}</th>
                    <th className="px-3 py-3">{t("laboratoire.patients.colonnes.provenance")}</th>
                    <th className="px-3 py-3">{t("laboratoire.patients.colonnes.examens")}</th>
                    <th className="px-3 py-3">{t("laboratoire.patients.colonnes.facture")}</th>
                    <th className="px-3 py-3">{t("laboratoire.patients.colonnes.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gris-bordure">
                  {filtrés.map((p) => (
                    <tr key={p.dossierId} className="hover:bg-gris-tres-clair/50">
                      <td className="px-3 py-3 font-semibold">{p.numeroOrdre}</td>
                      <td className="px-3 py-3">
                        <p className="font-semibold">
                          {p.nom} {p.prenom}
                        </p>
                        <p className="text-xs text-texte-secondaire">
                          {p.numeroDossier}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-texte-secondaire">
                        {p.sexe ?? "—"}
                        {p.age != null ? ` / ${p.age} ans` : ""}
                      </td>
                      <td className="px-3 py-3">{p.telephone || "—"}</td>
                      <td className="px-3 py-3">{formatHeure(p.arriveeLe)}</td>
                      <td className="px-3 py-3">{p.provenance}</td>
                      <td className="px-3 py-3">{p.nombreExamens}</td>
                      <td className="px-3 py-3 text-xs">{p.numeroFacture || "—"}</td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => void ouvrirDetail(p.dossierId)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gris-bordure px-2 py-1.5 text-xs font-medium hover:bg-white"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          {t("laboratoire.patients.ouvrirDossier")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="space-y-3 lg:hidden">
              {filtrés.map((p) => (
                <li
                  key={p.dossierId}
                  className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-texte-principal">
                        {p.nom} {p.prenom}
                      </p>
                      <p className="text-xs text-texte-secondaire">
                        #{p.numeroOrdre} · {p.numeroDossier}
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                      {t("laboratoire.patients.statutEnAttente")}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-texte-secondaire">
                    {formatHeure(p.arriveeLe)} · {p.provenance} ·{" "}
                    {p.nombreExamens} examen(s)
                  </p>
                  <Bouton
                    type="button"
                    className="mt-3 w-full justify-center"
                    onClick={() => void ouvrirDetail(p.dossierId)}
                  >
                    {t("laboratoire.patients.ouvrirDossier")}
                  </Bouton>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {(detail || chargementDetail) && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-gris-bordure bg-white px-4 py-3">
              <h2 className="text-sm font-bold text-texte-principal">
                {t("laboratoire.patients.detailTitre")}
              </h2>
              <button
                type="button"
                onClick={fermerDetail}
                className="rounded-lg p-2 hover:bg-gris-tres-clair"
                aria-label={t("laboratoire.patients.fermer")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {chargementDetail || !detail ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-bleu-medical" />
              </div>
            ) : (
              <div className="space-y-4 p-4">
                <div>
                  <p className="text-lg font-bold text-texte-principal">
                    {detail.nom} {detail.prenom}
                  </p>
                  <p className="text-sm text-texte-secondaire">
                    {detail.sexe ?? "—"}
                    {detail.age != null ? ` · ${detail.age} ans` : ""} ·{" "}
                    {detail.telephone || "—"}
                  </p>
                </div>

                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-texte-secondaire">
                      {t("laboratoire.patients.numeroDossier")}
                    </dt>
                    <dd className="font-semibold">{detail.numeroDossier}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-texte-secondaire">
                      {t("laboratoire.patients.numeroFacture")}
                    </dt>
                    <dd className="font-semibold">
                      {detail.numeroFacture || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-texte-secondaire">
                      {t("laboratoire.patients.medecin")}
                    </dt>
                    <dd className="font-semibold">
                      {detail.medecinResponsable || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-texte-secondaire">
                      {t("laboratoire.patients.modePaiement")}
                    </dt>
                    <dd className="font-semibold">
                      {detail.modePaiement || "—"}
                    </dd>
                  </div>
                </dl>

                <div>
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-texte-secondaire">
                    {t("laboratoire.patients.examensPrescrits")}
                  </h3>
                  {detail.examens.length === 0 ? (
                    <p className="text-sm text-texte-secondaire">
                      {t("laboratoire.patients.aucunExamen")}
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {detail.examens.map((ex) => (
                        <li
                          key={ex.id}
                          className="flex items-center justify-between rounded-lg border border-gris-bordure px-3 py-2 text-sm"
                        >
                          <span className="font-medium">{ex.libelle}</span>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                              ex.statut === "EN_ANALYSE"
                                ? "bg-amber-50 text-amber-700"
                                : ex.statut === "TERMINE"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                            )}
                          >
                            {t(`laboratoire.statutExamen.${ex.statut}`)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {message && (
                  <p className="rounded-lg bg-bleu-medical-clair/40 px-3 py-2 text-sm text-bleu-medical">
                    {message}
                  </p>
                )}

                <Bouton
                  type="button"
                  className="w-full justify-center"
                  disabled={
                    demarrage ||
                    !detail.examens.some((e) => e.statut === "PRESCRIT")
                  }
                  onClick={() => void commencerAnalyses()}
                >
                  {demarrage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {t("laboratoire.patients.commencerAnalyses")}
                </Bouton>
              </div>
            )}
          </div>
        </div>
      )}
    </MiseEnPageLaboratoire>
  );
}
