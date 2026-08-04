"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Eye,
  FlaskConical,
  Loader2,
  Play,
  X,
} from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import {
  MiseEnPageLaboratoire,
  type UtilisateurLaboratoire,
} from "@/features/laboratoire/mise-en-page-laboratoire";
import {
  PanneauDroitLaboratoire,
  SectionsMobileLaboratoire,
} from "@/features/laboratoire/panneau-droit-laboratoire";
import type { IdActionRapideLabo } from "@/features/laboratoire/actions-rapides-laboratoire";
import { BarreFiltresLaboratoire } from "@/features/laboratoire/barre-filtres-laboratoire";
import {
  FILTRES_LABORATOIRE_VIDES,
  patientCorrespondFiltresLabo,
  type FiltresLaboratoireUi,
} from "@/features/laboratoire/formulaire-filtres-laboratoire";
import {
  codeTransfertLaboratoire,
  libellesExamensDemandes,
  statutFileLabo,
} from "@/features/laboratoire/utils-affichage";
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
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [brouillonFiltres, setBrouillonFiltres] = useState<FiltresLaboratoireUi>(
    FILTRES_LABORATOIRE_VIDES
  );
  const [filtresAppliques, setFiltresAppliques] = useState<FiltresLaboratoireUi>(
    FILTRES_LABORATOIRE_VIDES
  );
  const [selectionId, setSelectionId] = useState<string | null>(dossierUrl);
  const [orientation, setOrientation] = useState<string | null>(null);
  const [detail, setDetail] = useState<DetailPatientLaboratoire | null>(null);
  const [chargementDetail, setChargementDetail] = useState(false);
  const [demarrage, setDemarrage] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageAction, setMessageAction] = useState<string | null>(null);

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

  const filtrés = useMemo(
    () =>
      patients.filter((p) => patientCorrespondFiltresLabo(p, filtresAppliques)),
    [patients, filtresAppliques]
  );

  const patientSelectionne = useMemo(
    () => filtrés.find((p) => p.dossierId === selectionId) ?? null,
    [filtrés, selectionId]
  );

  const selectionner = (dossierId: string) => {
    setSelectionId(dossierId);
    setMessageAction(null);
    router.replace(`/sigh/laboratoire/patients?dossier=${dossierId}`, {
      scroll: false,
    });
  };

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
        setSelectionId(dossierId);
        router.replace(`/sigh/laboratoire/patients?dossier=${dossierId}`, {
          scroll: false,
        });
      } finally {
        setChargementDetail(false);
      }
    },
    [router, t]
  );

  useEffect(() => {
    if (dossierUrl) setSelectionId(dossierUrl);
  }, [dossierUrl]);

  const commencerAnalyses = async (dossierId?: string) => {
    const id = dossierId ?? selectionId;
    if (!id) return;
    setDemarrage(true);
    setMessage(null);
    setMessageAction(null);
    try {
      const res = await fetch("/api/laboratoire/examens/commencer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dossierId: id }),
      });
      const data = (await res.json()) as { erreur?: string; message?: string };
      if (!res.ok) {
        setMessageAction(data.erreur ?? t("laboratoire.patients.erreurDemarrage"));
        return;
      }
      setMessage(data.message ?? t("laboratoire.patients.analysesDemarrees"));
      setMessageAction(data.message ?? t("laboratoire.patients.analysesDemarrees"));
      await charger();
      if (detail?.dossierId === id) await ouvrirDetail(id);
    } catch {
      setMessageAction(t("laboratoire.patients.erreurDemarrage"));
    } finally {
      setDemarrage(false);
    }
  };

  const onAction = (id: IdActionRapideLabo) => {
    setMessageAction(null);
    if (id === "rechercher") {
      setFiltresOuverts(true);
      return;
    }
    if (!selectionId) {
      setMessageAction(t("laboratoire.panneau.selectionnerPatient"));
      return;
    }
    if (id === "commencer") {
      void commencerAnalyses(selectionId);
      return;
    }
    if (id === "detail") {
      void ouvrirDetail(selectionId);
      return;
    }
    if (id === "imprimer") {
      setMessageAction(t("laboratoire.actions.aVenir"));
    }
  };

  const fermerDetail = () => setDetail(null);

  const formatHeure = (iso: string) =>
    new Date(iso).toLocaleString(i18n.language || "fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const propsPanneau = {
    variante: "patients" as const,
    patient: patientSelectionne,
    orientation,
    onOrientationChange: setOrientation,
    onAction,
  };

  return (
    <MiseEnPageLaboratoire
      utilisateur={utilisateur}
      titre={t("laboratoire.patients.titre")}
      sousTitre={t("laboratoire.patients.sousTitre")}
    >
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-4 xl:flex-row xl:items-start">
        <div className="min-w-0 flex-1 space-y-4">
          <BarreFiltresLaboratoire
            idPrefix="filtre-patients-labo"
            titre={t("laboratoire.patients.titreListe")}
            sousTitre={t("laboratoire.patients.sousTitreListe", {
              count: filtrés.length,
            })}
            filtresOuverts={filtresOuverts}
            onToggle={() => setFiltresOuverts((o) => !o)}
            brouillon={brouillonFiltres}
            onChangeBrouillon={setBrouillonFiltres}
            appliques={filtresAppliques}
            onRechercher={() => {
              setFiltresAppliques(brouillonFiltres);
              setFiltresOuverts(false);
            }}
            onReinitialiser={() => {
              setBrouillonFiltres(FILTRES_LABORATOIRE_VIDES);
              setFiltresAppliques(FILTRES_LABORATOIRE_VIDES);
            }}
          />

          {erreur && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {erreur}
            </p>
          )}
          {messageAction && (
            <p className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-800">
              {messageAction}
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
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[820px] text-left text-sm">
                    <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-texte-secondaire">
                      <tr>
                        <th className="px-3 py-3 font-semibold">
                          {t("laboratoire.patients.colonnes.patient")}
                        </th>
                        <th className="px-3 py-3 font-semibold">
                          {t("laboratoire.patients.colonnes.service")}
                        </th>
                        <th className="px-3 py-3 font-semibold">
                          {t("laboratoire.patients.colonnes.examensDemandes")}
                        </th>
                        <th className="px-3 py-3 font-semibold">
                          {t("laboratoire.patients.colonnes.statut")}
                        </th>
                        <th className="px-3 py-3 font-semibold">
                          {t("laboratoire.patients.colonnes.transfert")}
                        </th>
                        <th className="px-3 py-3 font-semibold">
                          {t("laboratoire.patients.colonnes.actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gris-bordure">
                      {filtrés.map((p) => {
                        const statut = statutFileLabo(p);
                        const selectionne = selectionId === p.dossierId;
                        return (
                          <tr
                            key={p.dossierId}
                            onClick={() => selectionner(p.dossierId)}
                            className={cn(
                              "cursor-pointer transition-colors",
                              selectionne
                                ? "bg-bleu-medical-clair/40"
                                : "hover:bg-slate-50/80"
                            )}
                          >
                            <td className="px-3 py-3">
                              <p className="font-semibold text-texte-principal">
                                {p.nom} {p.prenom}
                              </p>
                              <p className="text-[11px] text-texte-secondaire">
                                {p.age != null ? `${p.age} ans` : "—"}
                                {p.sexe ? ` / ${p.sexe}` : ""}
                              </p>
                            </td>
                            <td className="px-3 py-3 text-xs text-texte-secondaire">
                              {p.provenance || "—"}
                            </td>
                            <td className="max-w-[200px] px-3 py-3 text-xs font-medium text-texte-principal">
                              {libellesExamensDemandes(p)}
                            </td>
                            <td className="px-3 py-3">
                              <span
                                className={cn(
                                  "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
                                  statut === "EN_COURS"
                                    ? "bg-amber-50 text-amber-800"
                                    : "bg-emerald-50 text-emerald-700"
                                )}
                              >
                                {statut === "EN_COURS"
                                  ? t("laboratoire.dashboard.statutEnCours")
                                  : t("laboratoire.dashboard.statutRecu")}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <button
                                type="button"
                                className="font-mono text-xs font-semibold text-bleu-medical hover:underline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void ouvrirDetail(p.dossierId);
                                }}
                              >
                                {codeTransfertLaboratoire(p)}
                              </button>
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    void ouvrirDetail(p.dossierId);
                                  }}
                                  className="inline-flex rounded-lg border border-gris-bordure p-1.5 text-texte-secondaire hover:text-bleu-medical"
                                  title={t("laboratoire.patients.ouvrirDossier")}
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    selectionner(p.dossierId);
                                    void commencerAnalyses(p.dossierId);
                                  }}
                                  disabled={demarrage}
                                  className="inline-flex rounded-lg border border-gris-bordure p-1.5 text-amber-700 hover:bg-amber-50"
                                  title={t("laboratoire.patients.commencerAnalyses")}
                                >
                                  <FlaskConical className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <ul className="space-y-3 lg:hidden">
                {filtrés.map((p) => {
                  const statut = statutFileLabo(p);
                  return (
                    <li key={p.dossierId}>
                      <button
                        type="button"
                        onClick={() => selectionner(p.dossierId)}
                        className={cn(
                          "w-full rounded-xl border bg-white p-4 text-left shadow-sm",
                          selectionId === p.dossierId
                            ? "border-bleu-medical ring-1 ring-bleu-medical/30"
                            : "border-gris-bordure"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-texte-principal">
                              {p.nom} {p.prenom}
                            </p>
                            <p className="font-mono text-xs text-bleu-medical">
                              {codeTransfertLaboratoire(p)}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                              statut === "EN_COURS"
                                ? "bg-amber-50 text-amber-800"
                                : "bg-emerald-50 text-emerald-700"
                            )}
                          >
                            {statut === "EN_COURS"
                              ? t("laboratoire.dashboard.statutEnCours")
                              : t("laboratoire.dashboard.statutRecu")}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-texte-secondaire">
                          {formatHeure(p.arriveeLe)} · {p.provenance}
                        </p>
                        <p className="mt-1 text-xs font-medium">
                          {libellesExamensDemandes(p, 3)}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          <SectionsMobileLaboratoire {...propsPanneau} />
        </div>

        <div className="hidden xl:block">
          <PanneauDroitLaboratoire {...propsPanneau} />
        </div>
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
                  onClick={() => void commencerAnalyses(detail.dossierId)}
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
