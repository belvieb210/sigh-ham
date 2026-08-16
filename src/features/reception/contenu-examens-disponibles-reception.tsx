"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ClipboardList, Loader2 } from "lucide-react";
import { telechargerCsv } from "@/components/ui/boutons-outils-liste";
import {
  PaginationListe,
  paginerListe,
} from "@/components/ui/pagination-liste";
import { CaseCocheLigne } from "@/components/ui/case-coche-ligne";
import {
  BarreFiltresLaboratoire,
  BoutonsOutilsListeLaboratoire,
} from "@/features/laboratoire/barre-filtres-laboratoire";
import {
  FILTRES_LABORATOIRE_VIDES,
  patientCorrespondFiltresLabo,
  type FiltresLaboratoireUi,
} from "@/features/laboratoire/formulaire-filtres-laboratoire";
import { LignesTableauDrApprouve } from "@/features/laboratoire/lignes-tableau-dr-approuve";
import {
  examensPourPageStatut,
  libellesExamensDemandes,
  numeroPermanentPatientLaboratoire,
  patientCorrespondPageStatut,
  trierPatientsParArriveeDesc,
} from "@/features/laboratoire/utils-affichage";
import { useEspaceApi } from "@/features/reception/contexte-espace-api";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import {
  MiseEnPageReception,
  type UtilisateurReception,
} from "@/features/reception/mise-en-page-reception";
import {
  PanneauExamensDisponiblesReception,
  SectionsMobileExamensDisponiblesReception,
} from "@/features/reception/panneau-examens-disponibles-reception";
import { EVENT_RAFRAICHIR_NOTIFICATIONS } from "@/features/notifications/utilitaires-notifications";
import { imprimerResultatExamenLaboratoire } from "@/lib/laboratoire/imprimer-resultat-examen";
import type { ExamenFileLaboratoire, PatientFileLaboratoire } from "@/lib/laboratoire/types";

const PAR_PAGE = 30;
const PAGE_STATUT = "DR_APPROUVE" as const;

interface PropsContenuExamensDisponiblesReception {
  utilisateur: UtilisateurReception;
}

export function ContenuExamensDisponiblesReception({
  utilisateur,
}: PropsContenuExamensDisponiblesReception) {
  const { t } = useTranslation();
  const espace = useEspaceApi();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dossierUrl = searchParams.get("dossier");
  const cheminBase = `${espace.cheminBase}/examens-disponibles`;

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
  const [dossiersDeveloppes, setDossiersDeveloppes] = useState<Set<string>>(new Set());
  const [examensCoches, setExamensCoches] = useState<Set<string>>(new Set());
  const [messageAction, setMessageAction] = useState<string | null>(null);
  const [impressionEnCours, setImpressionEnCours] = useState(false);
  const [page, setPage] = useState(1);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const res = await fetch(`${espace.prefixeApi}/examens-disponibles`);
      const data = (await res.json()) as {
        patients?: PatientFileLaboratoire[];
        erreur?: string;
      };
      if (!res.ok) {
        setErreur(data.erreur ?? t("reception.examensDisponibles.erreur"));
        setPatients([]);
        return;
      }
      setPatients(data.patients ?? []);
    } catch {
      setErreur(t("reception.examensDisponibles.erreur"));
    } finally {
      setChargement(false);
    }
  }, [espace.prefixeApi, t]);

  useEffect(() => {
    void charger();
  }, [charger, pathname]);

  useEffect(() => {
    const onRafraichir = () => void charger();
    window.addEventListener(EVENT_RAFRAICHIR_NOTIFICATIONS, onRafraichir);
    return () =>
      window.removeEventListener(EVENT_RAFRAICHIR_NOTIFICATIONS, onRafraichir);
  }, [charger]);

  const filtres = useMemo(() => {
    const drApprouve = patients.filter((p) =>
      patientCorrespondPageStatut(p, PAGE_STATUT)
    );
    return trierPatientsParArriveeDesc(
      drApprouve.filter((p) => patientCorrespondFiltresLabo(p, filtresAppliques))
    );
  }, [patients, filtresAppliques]);

  useEffect(() => {
    setPage(1);
    setDossiersDeveloppes(new Set());
    setExamensCoches(new Set());
  }, [filtresAppliques]);

  const pageData = paginerListe(filtres, page, PAR_PAGE);

  const patientSelectionne = useMemo(
    () => filtres.find((p) => p.dossierId === selectionId) ?? null,
    [filtres, selectionId]
  );

  useEffect(() => {
    if (dossierUrl) setSelectionId(dossierUrl);
  }, [dossierUrl]);

  const selectionner = (dossierId: string) => {
    setSelectionId(dossierId);
    setMessageAction(null);
    router.replace(`${cheminBase}?dossier=${dossierId}`, { scroll: false });
  };

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

  const imprimerExamensDrApprouve = async (
    patient: PatientFileLaboratoire,
    examens: ExamenFileLaboratoire[]
  ) => {
    if (examens.length === 0) return;
    setMessageAction(null);
    setImpressionEnCours(true);
    const ids = examens.map((ex) => ex.id);
    const resultat = await imprimerResultatExamenLaboratoire({
      dossierId: patient.dossierId,
      examenId: ids[0]!,
      examenIds: ids.length > 1 ? ids : undefined,
      numeroPatient: patient.numeroPatient,
      libelleExamen:
        ids.length > 1 ? `${ids.length}-examens` : examens[0]!.libelle,
    });
    setImpressionEnCours(false);
    if (!resultat.ok) {
      setMessageAction(t("laboratoire.actions.erreurImpression"));
    }
  };

  const examensSelectionnesPatient = useMemo(() => {
    if (!patientSelectionne) return [];
    const examensDr = examensPourPageStatut(
      patientSelectionne.examens,
      PAGE_STATUT
    );
    const coches = examensDr.filter((ex) => examensCoches.has(ex.id));
    return coches.length > 0 ? coches : examensDr;
  }, [patientSelectionne, examensCoches]);

  const nbExamensSelectionnes = useMemo(() => {
    if (!patientSelectionne) return 0;
    const examensDr = examensPourPageStatut(
      patientSelectionne.examens,
      PAGE_STATUT
    );
    const coches = examensDr.filter((ex) => examensCoches.has(ex.id));
    return coches.length > 0 ? coches.length : examensDr.length;
  }, [patientSelectionne, examensCoches]);

  const imprimerDepuisPanneau = () => {
    if (!patientSelectionne || examensSelectionnesPatient.length === 0) {
      setMessageAction(t("laboratoire.panneau.selectionnerPatient"));
      return;
    }
    void imprimerExamensDrApprouve(
      patientSelectionne,
      examensSelectionnesPatient
    );
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
      `reception-examens-disponibles-${new Date().toISOString().slice(0, 10)}.csv`,
      ["numeroPatient", "nom", "prenom", "service", "statut", "examens"],
      cibles.map((p) => [
        numeroPermanentPatientLaboratoire(p),
        p.nom,
        p.prenom,
        p.provenance || p.orientation,
        PAGE_STATUT,
        libellesExamensDemandes(p),
      ])
    );
    setMessageAction(t("laboratoire.outils.exportOk", { count: cibles.length }));
  };

  const propsPanneau = {
    patient: patientSelectionne,
    nbExamensSelectionnes,
    peutImprimer: Boolean(
      patientSelectionne && examensSelectionnesPatient.length > 0
    ),
    onRechercher: () => setFiltresOuverts(true),
    onImprimer: imprimerDepuisPanneau,
    impressionEnCours,
  };

  return (
    <MiseEnPageReception
      utilisateur={utilisateur}
      titre={t("reception.examensDisponibles.titre")}
      sousTitre={t("reception.examensDisponibles.description")}
      panneauDroit={<PanneauExamensDisponiblesReception {...propsPanneau} />}
    >
      <div className="mx-auto w-full max-w-[1280px] space-y-4">
        <EnTetePageReception
          icone={ClipboardList}
          titre={t("reception.examensDisponibles.titre")}
          description={t("reception.examensDisponibles.description")}
          fil={[
            { label: t("reception.common.reception"), href: espace.cheminBase },
            { label: t("reception.examensDisponibles.fil") },
          ]}
        />

        <BarreFiltresLaboratoire
          idPrefix="filtre-reception-examens-disponibles"
          titre={t("laboratoire.orientationsStatut.DR_APPROUVE.label")}
          sousTitre={
            examensCoches.size > 0
              ? t("laboratoire.drApprouve.sousTitreSelectionExamens", {
                  count: filtres.length,
                  selection: examensCoches.size,
                })
              : t("reception.examensDisponibles.sousTitreListe", {
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
            {t("reception.examensDisponibles.vide")}
          </p>
        ) : (
          <>
            <div className="conteneur-tableau-sigh rounded-xl border border-gris-bordure bg-white shadow-sm">
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
                  {pageData.itemsPage.map((p) => (
                    <LignesTableauDrApprouve
                      key={p.dossierId}
                      patient={p}
                      selectionne={selectionId === p.dossierId}
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
                      onImprimerExamensSelectionnes={(examens) =>
                        void imprimerExamensDrApprouve(p, examens)
                      }
                      varianteNumero="salle"
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <PaginationListe
              page={pageData.pageCourante}
              totalPages={pageData.totalPages}
              totalItems={filtres.length}
              parPage={PAR_PAGE}
              onChange={setPage}
              labelPrec={t("laboratoire.pagination.prec")}
              labelSuiv={t("laboratoire.pagination.suiv")}
              className="rounded-xl border border-gris-bordure bg-white"
            />
          </>
        )}

        <SectionsMobileExamensDisponiblesReception {...propsPanneau} />
      </div>
    </MiseEnPageReception>
  );
}
