"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Eye, FlaskConical, Loader2 } from "lucide-react";
import { telechargerCsv } from "@/components/ui/boutons-outils-liste";
import {
  PaginationListe,
  paginerListe,
} from "@/components/ui/pagination-liste";
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
import {
  BarreFiltresLaboratoire,
  BoutonsOutilsListeLaboratoire,
} from "@/features/laboratoire/barre-filtres-laboratoire";
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
  cheminSaisieResultatsPatient,
  couleurStatutAnalyse,
  libellesExamensDemandes,
  numeroEnregistrementLaboratoire,
  patientCorrespondPageStatut,
  trierPatientsParArriveeDesc,
} from "@/features/laboratoire/utils-affichage";
import {
  CelluleBadgesStatutExamens,
  CelluleListeExamens,
} from "@/features/laboratoire/cellule-examens-statut-laboratoire";
import { LignesTableauDrApprouve } from "@/features/laboratoire/lignes-tableau-dr-approuve";
import { EVENT_RAFRAICHIR_NOTIFICATIONS } from "@/features/notifications/utilitaires-notifications";
import { imprimerResultatExamenLaboratoire } from "@/lib/laboratoire/imprimer-resultat-examen";
import type { ExamenFileLaboratoire, PatientFileLaboratoire } from "@/lib/laboratoire/types";
import { cn } from "@/lib/utils";
import { CaseCocheLigne } from "@/components/ui/case-coche-ligne";

const PAR_PAGE_STATUT = 12;

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
  const pathname = usePathname();
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
  const [idsCoches, setIdsCoches] = useState<Set<string>>(new Set());
  const [dossiersDeveloppes, setDossiersDeveloppes] = useState<Set<string>>(new Set());
  const [examensCoches, setExamensCoches] = useState<Set<string>>(new Set());
  const [messageAction, setMessageAction] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const { menu, ouvrirSurPatient, fermer } = useMenuContextuelLabo();

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
  }, [charger, pathname]);

  useEffect(() => {
    const onRafraichir = () => void charger();
    window.addEventListener(EVENT_RAFRAICHIR_NOTIFICATIONS, onRafraichir);
    return () =>
      window.removeEventListener(EVENT_RAFRAICHIR_NOTIFICATIONS, onRafraichir);
  }, [charger]);

  const enCours = useMemo(() => {
    if (pageStatut) {
      return patients.filter((p) => patientCorrespondPageStatut(p, pageStatut));
    }
    return patients.filter((p) => p.statutAnalyse === "EN_COURS");
  }, [patients, pageStatut]);

  const filtres = useMemo(() => {
    return trierPatientsParArriveeDesc(
      enCours.filter((p) => patientCorrespondFiltresLabo(p, filtresAppliques))
    );
  }, [enCours, filtresAppliques]);

  useEffect(() => {
    setPage(1);
    setDossiersDeveloppes(new Set());
    setExamensCoches(new Set());
  }, [filtresAppliques, pageStatut]);

  const estPageDrApprouve = pageStatut === "DR_APPROUVE";

  const basculerDeveloppementPatient = (dossierId: string) => {
    setDossiersDeveloppes((prev) => {
      const next = new Set(prev);
      if (next.has(dossierId)) next.delete(dossierId);
      else next.add(dossierId);
      return next;
    });
    selectionner(dossierId);
  };

  const basculerCocheExamen = (examenId: string, coche: boolean) => {
    setExamensCoches((prev) => {
      const next = new Set(prev);
      if (coche) next.add(examenId);
      else next.delete(examenId);
      return next;
    });
  };

  const selectionnerTousExamensPatient = (
    patient: PatientFileLaboratoire,
    examens: ExamenFileLaboratoire[]
  ) => {
    const ids = examens.map((ex) => ex.id);
    const tousCoches = ids.length > 0 && ids.every((id) => examensCoches.has(id));
    setExamensCoches((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (tousCoches) next.delete(id);
        else next.add(id);
      }
      return next;
    });
    selectionner(patient.dossierId);
  };

  const imprimerExamenDrApprouve = async (
    patient: PatientFileLaboratoire,
    examen: ExamenFileLaboratoire
  ) => {
    setMessageAction(null);
    const resultat = await imprimerResultatExamenLaboratoire({
      dossierId: patient.dossierId,
      examenId: examen.id,
      numeroPatient: patient.numeroPatient,
      libelleExamen: examen.libelle,
    });
    if (!resultat.ok) {
      setMessageAction(t("laboratoire.actions.erreurImpression"));
    }
  };

  const pageData = paginerListe(filtres, page, PAR_PAGE_STATUT);

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
    const idsAOrienter =
      idsCoches.size > 0
        ? [...idsCoches]
        : selectionId
          ? [selectionId]
          : [];

    if (idsAOrienter.length === 0 || orientationEnCours) {
      if (idsAOrienter.length === 0) {
        setMessageAction(t("laboratoire.panneau.selectionnerPatient"));
      }
      return;
    }

    const etaitDernierOuTous =
      idsAOrienter.length === filtres.length &&
      filtres.every((p) => idsAOrienter.includes(p.dossierId));

    setOrientationEnCours(true);
    setMessageAction(null);

    try {
      const resultats = await Promise.allSettled(
        idsAOrienter.map(async (dossierId) => {
          const res = await fetch("/api/laboratoire/examens/orienter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dossierId, orientation: id }),
          });
          const data = (await res.json()) as {
            message?: string;
            chemin?: string;
          };
          if (!res.ok) {
            throw new Error(
              data.message ?? t("laboratoire.panneau.erreurOrientationStatut")
            );
          }
          return data;
        })
      );

      const ok = resultats.filter((r) => r.status === "fulfilled").length;
      const echecs = resultats.length - ok;
      if (ok === 0) {
        const premier =
          resultats.find((r) => r.status === "rejected") as
            | PromiseRejectedResult
            | undefined;
        setMessageAction(
          premier?.reason instanceof Error
            ? premier.reason.message
            : t("laboratoire.panneau.erreurOrientationStatut")
        );
        return;
      }

      const chemin =
        (resultats.find((r) => r.status === "fulfilled") as
          | PromiseFulfilledResult<{ chemin?: string }>
          | undefined)?.value.chemin ||
        CHEMINS_STATUT_ANALYSE_LABO[id as IdOrientationStatutAnalyse] ||
        cheminBase;

      setMessageAction(
        echecs > 0
          ? t("laboratoire.panneau.statutAttribueLotPartiel", {
              ok,
              echecs,
              statut: t(`laboratoire.orientationsStatut.${id}.label`),
            })
          : idsAOrienter.length > 1
            ? t("laboratoire.panneau.statutAttribueLot", {
                count: ok,
                statut: t(`laboratoire.orientationsStatut.${id}.label`),
              })
            : t("laboratoire.panneau.statutAttribue", {
                statut: t(`laboratoire.orientationsStatut.${id}.label`),
              })
      );

      window.dispatchEvent(new CustomEvent(EVENT_RAFRAICHIR_NOTIFICATIONS));
      setIdsCoches(new Set());

      const doitRediriger =
        etaitDernierOuTous &&
        chemin !== cheminBase &&
        pageStatut !== id;

      if (doitRediriger) {
        router.push(`${chemin}?dossier=${idsAOrienter[0]}`);
        return;
      }

      await charger();
      if (selectionId && idsAOrienter.includes(selectionId)) {
        setSelectionId(null);
        router.replace(cheminBase, { scroll: false });
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
      const patient = patients.find((p) => p.dossierId === selectionId);
      router.push(
        cheminSaisieResultatsPatient(
          selectionId,
          patient?.examens ?? [],
          pageStatut
        )
      );
      return;
    }
    if (id === "valider") {
      router.push("/sigh/laboratoire/verifies");
      return;
    }
    if (id === "imprimer") {
      setMessageAction(t("laboratoire.actions.aVenir"));
    }
  };

  const onActionContextuelle = (id: IdActionContextuelleLabo) => {
    const dossierId = menu?.dossierId;
    if (!dossierId) return;
    selectionner(dossierId);
    if (id === "ajouterResultat") {
      const patient = patients.find((p) => p.dossierId === dossierId);
      router.push(
        cheminSaisieResultatsPatient(
          dossierId,
          patient?.examens ?? [],
          pageStatut
        )
      );
      return;
    }
    if (id === "voirDonneesRapport" || id === "ficheTravail") {
      router.push(`/sigh/laboratoire/patients?dossier=${dossierId}`);
      return;
    }
    if (id === "historiqueRapport") {
      router.push(`/sigh/laboratoire/verifies?dossier=${dossierId}`);
      return;
    }
    setMessageAction(t("laboratoire.actions.aVenir"));
  };

  const toutSelectionne =
    filtres.length > 0 && filtres.every((p) => idsCoches.has(p.dossierId));

  const basculerSelectionTout = () => {
    if (toutSelectionne) {
      setIdsCoches(new Set());
      return;
    }
    setIdsCoches(new Set(filtres.map((p) => p.dossierId)));
  };

  const exporterSelection = () => {
    const cibles =
      idsCoches.size > 0
        ? filtres.filter((p) => idsCoches.has(p.dossierId))
        : filtres;
    if (cibles.length === 0) {
      setMessageAction(t("laboratoire.outils.rienAExporter"));
      return;
    }
    telechargerCsv(
      `laboratoire-${pageStatut?.toLowerCase() ?? "examens"}-${new Date().toISOString().slice(0, 10)}.csv`,
      ["numeroEnregistrement", "nom", "prenom", "service", "statut", "examens"],
      cibles.map((p) => [
        numeroEnregistrementLaboratoire(p),
        p.nom,
        p.prenom,
        p.provenance || p.orientation,
        p.statutAnalyse || "",
        libellesExamensDemandes(p),
      ])
    );
    setMessageAction(t("laboratoire.outils.exportOk", { count: cibles.length }));
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
    if (pageStatut) {
      return t(`laboratoire.orientationsStatut.${pageStatut}.label`);
    }
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
    modeDetailExamens: Boolean(pageStatut),
    statutPage: pageStatut ?? null,
    peutOrienter: Boolean(selectionId) || idsCoches.size > 0,
    onAction,
  };

  return (
    <MiseEnPageLaboratoire
      utilisateur={utilisateur}
      titre={titrePage}
      sousTitre={sousTitrePage}
      panneauDroit={<PanneauDroitLaboratoire {...propsPanneau} />}
    >
      <div className="mx-auto w-full max-w-[1280px] space-y-4">
          <BarreFiltresLaboratoire
            idPrefix={
              pageStatut
                ? `filtre-labo-${pageStatut.toLowerCase()}`
                : "filtre-examens-labo"
            }
            titre={titrePage}
            sousTitre={
              estPageDrApprouve && examensCoches.size > 0
                ? t("laboratoire.drApprouve.sousTitreSelectionExamens", {
                    count: filtres.length,
                    selection: examensCoches.size,
                  })
                : idsCoches.size > 0
                  ? t("laboratoire.examensEnCours.sousTitreListeSelection", {
                      count: filtres.length,
                      selection: idsCoches.size,
                    })
                  : t("laboratoire.examensEnCours.sousTitreListe", {
                      count: filtres.length,
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
          ) : !filtres.length ? (
            <p className="rounded-xl border border-gris-bordure bg-white px-4 py-12 text-center text-sm text-texte-secondaire">
              {t("laboratoire.examensEnCours.vide")}
            </p>
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
                  <table className="tableau-liste-labo">
                    <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-texte-secondaire">
                      <tr>
                        <th className="w-8 px-1.5 py-1.5">
                          <CaseCocheLigne
                            coche={
                              filtres.length > 0 &&
                              filtres.every((p) => idsCoches.has(p.dossierId))
                            }
                            onChange={(coche) => {
                              setIdsCoches((prev) => {
                                const next = new Set(prev);
                                for (const p of filtres) {
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
                      {pageData.itemsPage.map((p) => {
                        const selectionne = selectionId === p.dossierId;

                        if (estPageDrApprouve) {
                          return (
                            <LignesTableauDrApprouve
                              key={p.dossierId}
                              patient={p}
                              selectionne={selectionne}
                              developpe={dossiersDeveloppes.has(p.dossierId)}
                              patientCoche={idsCoches.has(p.dossierId)}
                              examensCoches={examensCoches}
                              onSelectionnerPatient={() => selectionner(p.dossierId)}
                              onBasculerCochePatient={(coche) => {
                                setIdsCoches((prev) => {
                                  const next = new Set(prev);
                                  if (coche) next.add(p.dossierId);
                                  else next.delete(p.dossierId);
                                  return next;
                                });
                              }}
                              onBasculerDeveloppement={() =>
                                basculerDeveloppementPatient(p.dossierId)
                              }
                              onBasculerCocheExamen={basculerCocheExamen}
                              onSelectionnerTousExamensPatient={(examens) =>
                                selectionnerTousExamensPatient(p, examens)
                              }
                              onImprimerExamen={(examen) =>
                                void imprimerExamenDrApprouve(p, examen)
                              }
                              onContextMenu={(e) => ouvrirSurPatient(e, p.dossierId)}
                            />
                          );
                        }

                        return (
                          <tr
                            key={p.dossierId}
                            id={`analyse-${p.dossierId}`}
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
                                ariaLabel={t("laboratoire.selection.patient", {
                                  nom: `${p.prenom} ${p.nom}`,
                                })}
                              />
                            </td>
                            <td className="px-2 py-1.5 font-mono text-[11px] font-semibold text-bleu-medical">
                              {numeroEnregistrementLaboratoire(p)}
                            </td>
                            <td className="px-2 py-1.5">
                              <p className="truncate text-xs font-semibold leading-tight">
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
                              <CelluleListeExamens
                                examens={p.examens}
                                pageStatut={pageStatut}
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <CelluleBadgesStatutExamens
                                examens={p.examens}
                                pageStatut={pageStatut}
                              />
                            </td>
                            <td className="px-1.5 py-1.5">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(
                                      `/sigh/laboratoire/patients?dossier=${p.dossierId}`
                                    );
                                  }}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gris-bordure text-texte-secondaire hover:text-bleu-medical"
                                  title={t("laboratoire.patients.ouvrirDossier")}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    selectionner(p.dossierId);
                                    router.push(
                                      cheminSaisieResultatsPatient(
                                        p.dossierId,
                                        p.examens,
                                        pageStatut
                                      )
                                    );
                                  }}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gris-bordure text-amber-700 hover:bg-amber-50"
                                  title={t("laboratoire.actions.saisirResultat")}
                                >
                                  <FlaskConical className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
              </div>

              <PaginationListe
                page={pageData.pageCourante}
                totalPages={pageData.totalPages}
                totalItems={filtres.length}
                parPage={PAR_PAGE_STATUT}
                onChange={setPage}
                labelPrec={t("laboratoire.pagination.prec")}
                labelSuiv={t("laboratoire.pagination.suiv")}
                className="rounded-xl border border-gris-bordure bg-white"
              />
            </>
          )}

          <SectionsMobileLaboratoire {...propsPanneau} />
      </div>

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
