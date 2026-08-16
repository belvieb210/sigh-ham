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
import { CaseCocheLigne } from "@/components/ui/case-coche-ligne";
import { telechargerCsv } from "@/components/ui/boutons-outils-liste";
import {
  MiseEnPageLaboratoire,
  type UtilisateurLaboratoire,
} from "@/features/laboratoire/mise-en-page-laboratoire";
import {
  PanneauDroitLaboratoire,
  SectionsMobileLaboratoire,
} from "@/features/laboratoire/panneau-droit-laboratoire";
import type { IdActionRapideLabo } from "@/features/laboratoire/actions-rapides-laboratoire";
import { BarreFiltresLaboratoire, BoutonsOutilsListeLaboratoire } from "@/features/laboratoire/barre-filtres-laboratoire";
import {
  MenuContextuelLaboratoire,
  useMenuContextuelLabo,
  type IdActionContextuelleLabo,
} from "@/features/laboratoire/menu-contextuel-laboratoire";
import {
  FILTRES_LABORATOIRE_VIDES,
  patientCorrespondFiltresLabo,
  type FiltresLaboratoireUi,
} from "@/features/laboratoire/formulaire-filtres-laboratoire";
import {
  CelluleBadgesStatutExamens,
  CelluleListeExamens,
} from "@/features/laboratoire/cellule-examens-statut-laboratoire";
import {
  libellesExamensDemandes,
  numeroEnregistrementLaboratoire,
  trierPatientsParArriveeDesc,
} from "@/features/laboratoire/utils-affichage";
import type {
  DetailPatientLaboratoire,
  PatientFileLaboratoire,
} from "@/lib/laboratoire/types";
import { cheminSaisieResultats } from "@/lib/laboratoire/saisie-resultats-types";
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
  const [idsCoches, setIdsCoches] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<DetailPatientLaboratoire | null>(null);
  const [chargementDetail, setChargementDetail] = useState(false);
  const [demarrage, setDemarrage] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageAction, setMessageAction] = useState<string | null>(null);
  const { menu, ouvrirSurPatient, fermer } = useMenuContextuelLabo();

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
      trierPatientsParArriveeDesc(
        patients.filter((p) => patientCorrespondFiltresLabo(p, filtresAppliques))
      ),
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

  const onActionContextuelle = (id: IdActionContextuelleLabo) => {
    const dossierId = menu?.dossierId;
    if (!dossierId) return;
    setSelectionId(dossierId);
    if (id === "voirDonneesRapport" || id === "ficheTravail") {
      void ouvrirDetail(dossierId);
      return;
    }
    if (id === "ajouterResultat") {
      router.push(cheminSaisieResultats(dossierId));
      return;
    }
    if (id === "historiqueRapport") {
      router.push(`/sigh/laboratoire/verifies?dossier=${dossierId}`);
      return;
    }
    setMessageAction(t("laboratoire.actions.aVenir"));
  };

  const toutSelectionne =
    filtrés.length > 0 && filtrés.every((p) => idsCoches.has(p.dossierId));

  const basculerSelectionTout = () => {
    if (toutSelectionne) {
      setIdsCoches(new Set());
      return;
    }
    setIdsCoches(new Set(filtrés.map((p) => p.dossierId)));
  };

  const exporterSelection = () => {
    const cibles =
      idsCoches.size > 0
        ? filtrés.filter((p) => idsCoches.has(p.dossierId))
        : filtrés;
    if (cibles.length === 0) {
      setMessageAction(t("laboratoire.outils.rienAExporter"));
      return;
    }
    telechargerCsv(
      `laboratoire-patients-${new Date().toISOString().slice(0, 10)}.csv`,
      ["numeroEnregistrement", "nom", "prenom", "destination", "statut", "examens"],
      cibles.map((p) => [
        numeroEnregistrementLaboratoire(p),
        p.nom,
        p.prenom,
        p.orientation,
        p.statutAnalyse,
        libellesExamensDemandes(p),
      ])
    );
    setMessageAction(t("laboratoire.outils.exportOk", { count: cibles.length }));
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
    orientation: null,
    onOrientationChange: () => undefined,
    onAction,
  };

  return (
    <MiseEnPageLaboratoire
      utilisateur={utilisateur}
      titre={t("laboratoire.patients.titre")}
      sousTitre={t("laboratoire.patients.sousTitre")}
      panneauDroit={<PanneauDroitLaboratoire {...propsPanneau} />}
    >
      <div className="mx-auto w-full max-w-[1280px] space-y-4">
          <BarreFiltresLaboratoire
            idPrefix="filtre-patients-labo"
            titre={t("laboratoire.patients.titreListe")}
            sousTitre={
              idsCoches.size > 0
                ? t("laboratoire.patients.sousTitreListeSelection", {
                    count: filtrés.length,
                    selection: idsCoches.size,
                  })
                : t("laboratoire.patients.sousTitreListe", {
                    count: filtrés.length,
                  })
            }
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
            actionsApresFiltre={
              <BoutonsOutilsListeLaboratoire
                toutSelectionne={toutSelectionne}
                onSelectionnerTout={basculerSelectionTout}
                onExporter={exporterSelection}
              />
            }
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
              <div className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
                  <table className="tableau-liste-labo">
                    <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-texte-secondaire">
                      <tr>
                        <th className="w-8 px-1.5 py-1.5">
                          <CaseCocheLigne
                            coche={
                              filtrés.length > 0 &&
                              filtrés.every((p) => idsCoches.has(p.dossierId))
                            }
                            onChange={(coche) => {
                              setIdsCoches((prev) => {
                                const next = new Set(prev);
                                for (const p of filtrés) {
                                  if (coche) next.add(p.dossierId);
                                  else next.delete(p.dossierId);
                                }
                                return next;
                              });
                            }}
                            ariaLabel={t("laboratoire.selection.tout")}
                          />
                        </th>
                        <th className="px-2 py-1.5 font-semibold">
                          {t("laboratoire.patients.colonnes.enregistrement")}
                        </th>
                        <th className="px-2 py-1.5 font-semibold">
                          {t("laboratoire.patients.colonnes.patient")}
                        </th>
                        <th className="hidden px-2 py-1.5 font-semibold lg:table-cell">
                          {t("laboratoire.patients.colonnes.service")}
                        </th>
                        <th className="px-2 py-1.5 font-semibold">
                          {t("laboratoire.patients.colonnes.examensDemandes")}
                        </th>
                        <th className="w-[72px] px-2 py-1.5 font-semibold">
                          {t("laboratoire.patients.colonnes.statut")}
                        </th>
                        <th className="w-[72px] px-1.5 py-1.5 font-semibold">
                          {t("laboratoire.patients.colonnes.actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gris-bordure">
                      {filtrés.map((p) => {
                        const selectionne = selectionId === p.dossierId;
                        return (
                          <tr
                            key={p.dossierId}
                            onClick={() => selectionner(p.dossierId)}
                            onContextMenu={(e) => ouvrirSurPatient(e, p.dossierId)}
                            className={cn(
                              "cursor-pointer transition-colors",
                              selectionne
                                ? "bg-bleu-medical-clair/40"
                                : "hover:bg-slate-50/80"
                            )}
                          >
                            <td className="px-1.5 py-1.5" onClick={(e) => e.stopPropagation()}>
                              <CaseCocheLigne
                                coche={idsCoches.has(p.dossierId)}
                                onChange={(coche) => {
                                  setIdsCoches((prev) => {
                                    const next = new Set(prev);
                                    if (coche) next.add(p.dossierId);
                                    else next.delete(p.dossierId);
                                    return next;
                                  });
                                }}
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <button
                                type="button"
                                className="font-mono text-[11px] font-semibold text-bleu-medical hover:underline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void ouvrirDetail(p.dossierId);
                                }}
                              >
                                {numeroEnregistrementLaboratoire(p)}
                              </button>
                            </td>
                            <td className="px-2 py-1.5">
                              <p className="truncate text-xs font-semibold leading-tight text-texte-principal">
                                {p.nom} {p.prenom}
                              </p>
                              <p className="truncate text-[10px] text-texte-secondaire">
                                {p.age != null ? `${p.age} ans` : "—"}
                                {p.sexe ? ` / ${p.sexe}` : ""}
                              </p>
                            </td>
                            <td className="hidden px-2 py-1.5 text-[11px] text-texte-secondaire lg:table-cell">
                              {p.provenance || "—"}
                            </td>
                            <td className="px-2 py-1.5">
                              <CelluleListeExamens examens={p.examens} />
                            </td>
                            <td className="px-2 py-1.5">
                              <CelluleBadgesStatutExamens examens={p.examens} />
                            </td>
                            <td className="px-1.5 py-1.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void ouvrirDetail(p.dossierId);
                                }}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gris-bordure text-texte-secondaire hover:text-bleu-medical"
                                title={t("laboratoire.patients.ouvrirDossier")}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
              </div>
            </>
          )}

          <SectionsMobileLaboratoire {...propsPanneau} />
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

      <MenuContextuelLaboratoire
        ouvert={Boolean(menu)}
        x={menu?.x ?? 0}
        y={menu?.y ?? 0}
        onFermer={fermer}
        onAction={onActionContextuelle}
      />
    </MiseEnPageLaboratoire>
  );
}
