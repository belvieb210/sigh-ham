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
import { idOrientationDepuisCodeSalle } from "@/constants/laboratoire-orientations";
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
import { MenuActionsTransfertLaboratoire } from "@/features/laboratoire/menu-actions-transfert-laboratoire";
import {
  CelluleBadgesStatutExamens,
  CelluleExamensStatutLaboratoire,
  CelluleListeExamens,
} from "@/features/laboratoire/cellule-examens-statut-laboratoire";
import {
  libelleStatutLigneLabo,
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
  const [orientations, setOrientations] = useState<string[]>([]);
  const [orientationEnCours, setOrientationEnCours] = useState(false);
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

  useEffect(() => {
    if (!patientSelectionne) {
      setOrientations([]);
      return;
    }
    const codes =
      patientSelectionne.codesSalleDestination?.length
        ? patientSelectionne.codesSalleDestination
        : patientSelectionne.codeSalleDestination
          ? [patientSelectionne.codeSalleDestination]
          : [];
    setOrientations(
      codes
        .map((c) => idOrientationDepuisCodeSalle(c))
        .filter((id): id is NonNullable<typeof id> => Boolean(id))
    );
  }, [
    patientSelectionne?.dossierId,
    patientSelectionne?.codeSalleDestination,
    patientSelectionne?.codesSalleDestination,
    patientSelectionne,
  ]);

  const selectionner = (dossierId: string) => {
    setSelectionId(dossierId);
    setMessageAction(null);
    router.replace(`/sigh/laboratoire/patients?dossier=${dossierId}`, {
      scroll: false,
    });
  };

  const changerOrientations = async (ids: string[]) => {
    const idsAOrienter =
      idsCoches.size > 0
        ? [...idsCoches]
        : selectionId
          ? [selectionId]
          : [];
    if (idsAOrienter.length === 0 || orientationEnCours) return;
    if (ids.length === 0) {
      setMessageAction(t("laboratoire.transferts.selectionnerDestination"));
      return;
    }
    setOrientations(ids);
    setMessageAction(null);
    setOrientationEnCours(true);
    try {
      const resultats = await Promise.allSettled(
        idsAOrienter.map(async (dossierId) => {
          const res = await fetch("/api/laboratoire/transferts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dossierId, orientations: ids }),
          });
          const data = (await res.json()) as { message?: string };
          if (!res.ok) {
            throw new Error(
              data.message ?? t("laboratoire.transferts.erreurOrientation")
            );
          }
          return data;
        })
      );
      const ok = resultats.filter((r) => r.status === "fulfilled").length;
      const echecs = resultats.length - ok;
      if (ok === 0) {
        setMessageAction(t("laboratoire.transferts.erreurOrientation"));
        await charger();
        return;
      }
      setMessageAction(
        echecs > 0
          ? t("laboratoire.transferts.orienteLotPartiel", { ok, echecs })
          : idsAOrienter.length > 1
            ? t("laboratoire.transferts.orienteLotOk", { count: ok })
            : t("laboratoire.transferts.orienteOk")
      );
      setIdsCoches(new Set());
      await charger();
    } catch {
      setMessageAction(t("laboratoire.transferts.erreurOrientation"));
    } finally {
      setOrientationEnCours(false);
    }
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
    orientation: orientations[0] ?? null,
    onOrientationChange: () => undefined,
    orientations,
    onOrientationsChange: (ids: string[]) => {
      if (orientationEnCours) return;
      void changerOrientations(ids);
    },
    peutOrienter: Boolean(patientSelectionne) || idsCoches.size > 0,
    aideOrientation:
      idsCoches.size > 1
        ? t("laboratoire.panneau.aideOrientationLotPatients", {
            count: idsCoches.size,
          })
        : idsCoches.size === 1 || patientSelectionne
          ? t("laboratoire.panneau.aideOrientationPatientMulti")
          : t("laboratoire.panneau.selectionnerPatientOuCocher"),
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
              <div className="hidden overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm xl:block">
                  <table className="w-full table-fixed text-left text-sm">
                    <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-texte-secondaire">
                      <tr>
                        <th className="w-10 px-3 py-3">
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
                      {filtrés.map((p) => {
                        const statut = libelleStatutLigneLabo(p);
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
                            <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
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
                            <td className="px-3 py-3">
                              <button
                                type="button"
                                className="font-mono text-xs font-semibold text-bleu-medical hover:underline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void ouvrirDetail(p.dossierId);
                                }}
                              >
                                {numeroEnregistrementLaboratoire(p)}
                              </button>
                            </td>
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
                            <td className="max-w-[220px] px-3 py-3">
                              <CelluleListeExamens examens={p.examens} />
                            </td>
                            <td className="px-3 py-3">
                              {statut.type === "transfert" ? (
                                <span
                                  className={cn(
                                    "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
                                    statut.couleur
                                  )}
                                >
                                  {t(`laboratoire.transferts.statut.${statut.cle}`)}
                                </span>
                              ) : (
                                <CelluleBadgesStatutExamens examens={p.examens} />
                              )}
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    void ouvrirDetail(p.dossierId);
                                  }}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gris-bordure text-texte-secondaire hover:text-bleu-medical"
                                  title={t("laboratoire.patients.ouvrirDossier")}
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <MenuActionsTransfertLaboratoire
                                  patient={p}
                                  onRafraichir={() => void charger()}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
              </div>

              <ul className="space-y-3 xl:hidden">
                {filtrés.map((p) => {
                  const statut = libelleStatutLigneLabo(p);
                  return (
                    <li key={p.dossierId}>
                      <div
                        className={cn(
                          "w-full rounded-xl border bg-white p-4 text-left shadow-sm",
                          selectionId === p.dossierId
                            ? "border-bleu-medical ring-1 ring-bleu-medical/30"
                            : "border-gris-bordure"
                        )}
                        onContextMenu={(e) => ouvrirSurPatient(e, p.dossierId)}
                      >
                        <div className="mb-2 flex items-center gap-2">
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
                          <span className="text-xs text-texte-secondaire">
                            {idsCoches.has(p.dossierId)
                              ? t("laboratoire.selection.coche")
                              : t("laboratoire.selection.cocher")}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => selectionner(p.dossierId)}
                          className="w-full text-left"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-bold text-texte-principal">
                                {p.nom} {p.prenom}
                              </p>
                              <p className="font-mono text-xs text-bleu-medical">
                                {numeroEnregistrementLaboratoire(p)}
                              </p>
                            </div>
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                statut.couleur
                              )}
                            >
                              {statut.type === "transfert"
                                ? t(`laboratoire.transferts.statut.${statut.cle}`)
                                : t(
                                    `laboratoire.orientationsStatut.${statut.statutAnalyse}.label`
                                  )}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-texte-secondaire">
                            {formatHeure(p.arriveeLe)} · {p.provenance}
                          </p>
                          <div className="mt-2">
                            <CelluleExamensStatutLaboratoire
                              examens={p.examens}
                              max={4}
                            />
                          </div>
                        </button>
                        <div className="mt-3 flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => void ouvrirDetail(p.dossierId)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gris-bordure text-texte-secondaire hover:text-bleu-medical"
                            title={t("laboratoire.patients.ouvrirDossier")}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <MenuActionsTransfertLaboratoire
                            patient={p}
                            onRafraichir={() => void charger()}
                          />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
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
