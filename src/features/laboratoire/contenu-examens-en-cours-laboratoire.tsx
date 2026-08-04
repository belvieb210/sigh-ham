"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Eye, FlaskConical, Loader2 } from "lucide-react";
import {
  CHEMINS_STATUT_ANALYSE_LABO,
  type IdOrientationStatutAnalyse,
} from "@/constants/laboratoire-orientations";
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
  libellesExamensDemandes,
  numeroEnregistrementLaboratoire,
} from "@/features/laboratoire/utils-affichage";
import type { PatientFileLaboratoire } from "@/lib/laboratoire/types";
import { cn } from "@/lib/utils";

function patientCorrespondStatut(
  p: PatientFileLaboratoire,
  statut: IdOrientationStatutAnalyse
) {
  return (p.statutAnalyse || "RECUS") === statut;
}

interface PropsContenuExamensEnCoursLaboratoire {
  utilisateur: UtilisateurLaboratoire;
  /** Page dédiée (Reçus, En cours, …) — sinon vue générale examens en cours */
  pageStatut?: IdOrientationStatutAnalyse;
  cheminBase?: string;
}

export function ContenuExamensEnCoursLaboratoire({
  utilisateur,
  pageStatut,
  cheminBase = "/sigh/laboratoire/examens-en-cours",
}: PropsContenuExamensEnCoursLaboratoire) {
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
  const [orientationEnCours, setOrientationEnCours] = useState(false);
  const [messageAction, setMessageAction] = useState<string | null>(null);

  const titrePage = pageStatut
    ? t(`laboratoire.orientationsStatut.${pageStatut}.label`)
    : t("laboratoire.examensEnCours.titre");
  const sousTitrePage = pageStatut
    ? t(`laboratoire.orientationsStatut.${pageStatut}.description`)
    : t("laboratoire.examensEnCours.sousTitre");

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

  const enCours = useMemo(() => {
    if (pageStatut) {
      return patients.filter((p) => patientCorrespondStatut(p, pageStatut));
    }
    return patients.filter((p) => p.statutAnalyse === "EN_COURS");
  }, [patients, pageStatut]);

  const filtres = useMemo(() => {
    return enCours.filter((p) =>
      patientCorrespondFiltresLabo(p, filtresAppliques)
    );
  }, [enCours, filtresAppliques]);

  const patientSelectionne = useMemo(
    () => filtres.find((p) => p.dossierId === selectionId) ?? null,
    [filtres, selectionId]
  );

  const orientationCourante =
    (patientSelectionne?.statutAnalyse as IdOrientationStatutAnalyse | undefined) ||
    pageStatut ||
    "EN_COURS";

  useEffect(() => {
    if (dossierUrl) setSelectionId(dossierUrl);
  }, [dossierUrl]);

  const selectionner = (dossierId: string) => {
    setSelectionId(dossierId);
    setMessageAction(null);
    router.replace(`${cheminBase}?dossier=${dossierId}`, {
      scroll: false,
    });
  };

  const changerOrientation = async (id: string) => {
    if (!selectionId || orientationEnCours) {
      if (!selectionId) {
        setMessageAction(t("laboratoire.panneau.selectionnerPatient"));
      }
      return;
    }

    setOrientationEnCours(true);
    setMessageAction(null);

    try {
      const res = await fetch("/api/laboratoire/examens/orienter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dossierId: selectionId, orientation: id }),
      });
      const data = (await res.json()) as {
        message?: string;
        chemin?: string;
      };
      if (!res.ok) {
        setMessageAction(
          data.message ?? t("laboratoire.panneau.erreurOrientationStatut")
        );
        return;
      }

      const chemin =
        data.chemin ||
        CHEMINS_STATUT_ANALYSE_LABO[id as IdOrientationStatutAnalyse] ||
        cheminBase;

      setMessageAction(
        t("laboratoire.panneau.statutAttribue", {
          statut: t(`laboratoire.orientationsStatut.${id}.label`),
        })
      );

      router.push(`${chemin}?dossier=${selectionId}`);
      if (chemin === cheminBase || pageStatut === id) {
        await charger();
      }
    } catch {
      setMessageAction(t("laboratoire.panneau.erreurOrientationStatut"));
    } finally {
      setOrientationEnCours(false);
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
    if (id === "saisie") {
      router.push("/sigh/laboratoire/saisie-resultats");
      return;
    }
    if (id === "valider") {
      router.push("/sigh/laboratoire/resultats-a-valider");
      return;
    }
    if (id === "imprimer") {
      setMessageAction(t("laboratoire.actions.aVenir"));
    }
  };

  const formatHeure = (iso: string) =>
    new Date(iso).toLocaleString(i18n.language || "fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const libelleStatutOrientation = (p: PatientFileLaboratoire) => {
    const id = p.statutAnalyse || "EN_COURS";
    return t(`laboratoire.orientationsStatut.${id}.label`);
  };

  const propsPanneau = {
    variante: "examens" as const,
    patient: patientSelectionne,
    orientation: selectionId ? orientationCourante : null,
    onOrientationChange: (id: string) => {
      if (orientationEnCours) return;
      void changerOrientation(id);
    },
    onAction,
  };

  return (
    <MiseEnPageLaboratoire
      utilisateur={utilisateur}
      titre={titrePage}
      sousTitre={sousTitrePage}
    >
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-4 xl:flex-row xl:items-start">
        <div className="min-w-0 flex-1 space-y-4">
          <BarreFiltresLaboratoire
            idPrefix={
              pageStatut
                ? `filtre-labo-${pageStatut.toLowerCase()}`
                : "filtre-examens-labo"
            }
            titre={titrePage}
            sousTitre={t("laboratoire.examensEnCours.sousTitreListe", {
              count: filtres.length,
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
          ) : !filtres.length ? (
            <p className="rounded-xl border border-gris-bordure bg-white px-4 py-12 text-center text-sm text-texte-secondaire">
              {t("laboratoire.examensEnCours.vide")}
            </p>
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm lg:block">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[820px] text-left text-sm">
                    <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-texte-secondaire">
                      <tr>
                        <th className="px-3 py-3 font-semibold">
                          {t("laboratoire.patients.colonnes.enregistrement")}
                        </th>
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
                          {t("laboratoire.patients.colonnes.actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gris-bordure">
                      {filtres.map((p) => {
                        const selectionne = selectionId === p.dossierId;
                        const examensAnalyse = p.examens.filter(
                          (e) => e.statut === "EN_ANALYSE"
                        );
                        return (
                          <tr
                            key={p.dossierId}
                            id={`analyse-${p.dossierId}`}
                            onClick={() => selectionner(p.dossierId)}
                            className={cn(
                              "cursor-pointer transition-colors",
                              selectionne
                                ? "bg-bleu-medical-clair/40"
                                : "hover:bg-slate-50/80"
                            )}
                          >
                            <td className="px-3 py-3 font-mono text-xs font-semibold text-bleu-medical">
                              {numeroEnregistrementLaboratoire(p)}
                            </td>
                            <td className="px-3 py-3">
                              <p className="font-semibold">
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
                            <td className="max-w-[200px] px-3 py-3 text-xs font-medium">
                              {examensAnalyse.length
                                ? examensAnalyse.map((e) => e.libelle).join(", ")
                                : libellesExamensDemandes(p)}
                            </td>
                            <td className="px-3 py-3">
                              <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                                {libelleStatutOrientation(p)}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(
                                      `/sigh/laboratoire/patients?dossier=${p.dossierId}`
                                    );
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
                                    router.push(
                                      "/sigh/laboratoire/saisie-resultats"
                                    );
                                  }}
                                  className="inline-flex rounded-lg border border-gris-bordure p-1.5 text-amber-700 hover:bg-amber-50"
                                  title={t("laboratoire.actions.saisirResultat")}
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
                {filtres.map((p) => (
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
                          <p className="font-bold">
                            {p.nom} {p.prenom}
                          </p>
                          <p className="font-mono text-xs text-bleu-medical">
                            {numeroEnregistrementLaboratoire(p)}
                          </p>
                        </div>
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                          {libelleStatutOrientation(p)}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-texte-secondaire">
                        {libellesExamensDemandes(p, 3)} · {formatHeure(p.arriveeLe)}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          <SectionsMobileLaboratoire {...propsPanneau} />
        </div>

        <div className="hidden xl:block">
          <PanneauDroitLaboratoire {...propsPanneau} />
        </div>
      </div>
    </MiseEnPageLaboratoire>
  );
}
