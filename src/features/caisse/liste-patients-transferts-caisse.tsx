"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";
import { EVENEMENT_CAISSE_PATIENTS_MODIFIES } from "@/constants/caisse";
import {
  BoutonsOutilsListe,
  telechargerCsv,
} from "@/components/ui/boutons-outils-liste";
import { CaseCocheLigne } from "@/components/ui/case-coche-ligne";
import { useSelectionTransfertCaisse } from "@/features/caisse/contexte-selection-transfert-caisse";
import {
  compterFiltresActifs,
  FILTRES_FACTURATION_VIDES,
  FormulaireFiltresFacturationCaisse,
  type FiltresFacturationCaisse,
} from "@/features/caisse/formulaire-filtres-facturation-caisse";
import { MenuActionsTransfertCaisse } from "@/features/caisse/menu-actions-transfert-caisse";
import { ModaleExamensCaisse } from "@/features/caisse/modale-examens-caisse";
import { formaterMontantCaisse } from "@/features/caisse/utils-format";
import { BadgeTypePersonneCaisse } from "@/features/caisse/badge-type-personne-caisse";
import type { PatientTransfertCaisse, StatsTransfertsCaisse } from "@/lib/caisse/types";
import { cn } from "@/lib/utils";

const PAR_PAGE = 15;

function filtrerPatients(
  patients: PatientTransfertCaisse[],
  filtres: FiltresFacturationCaisse
) {
  return patients.filter((p) => {
    if (filtres.nom.trim() && !p.nom.toLowerCase().includes(filtres.nom.trim().toLowerCase())) {
      return false;
    }
    if (
      filtres.prenom.trim() &&
      !p.prenom.toLowerCase().includes(filtres.prenom.trim().toLowerCase())
    ) {
      return false;
    }
    if (filtres.telephone.trim()) {
      const tel = (p.telephone ?? "").replace(/\s+/g, "");
      if (!tel.includes(filtres.telephone.trim().replace(/\s+/g, ""))) return false;
    }
    if (filtres.numeroEnreg.trim()) {
      const enreg = filtres.numeroEnreg.trim().toLowerCase();
      if (
        !p.numeroDossier.toLowerCase().includes(enreg) &&
        !p.numeroPatient.toLowerCase().includes(enreg)
      ) {
        return false;
      }
    }
    if (filtres.idEntite.trim()) {
      const id = filtres.idEntite.trim().toLowerCase();
      if (
        !p.dossierId.toLowerCase().includes(id) &&
        !p.numeroPatient.toLowerCase().includes(id) &&
        !p.cleListe.toLowerCase().includes(id)
      ) {
        return false;
      }
    }
    if (filtres.dateDu || filtres.dateAu) {
      const jour = (p.arriveeLe ?? "").slice(0, 10);
      if (!jour) return false;
      if (filtres.dateDu && jour < filtres.dateDu) return false;
      if (filtres.dateAu && jour > filtres.dateAu) return false;
    }
    return true;
  });
}

interface PropsSectionTableau {
  titre: string;
  vide: string;
  patients: PatientTransfertCaisse[];
  page: number;
  onPageChange: (page: number) => void;
  afficherMenuSortant: boolean;
  selectionCochee: boolean;
  onBasculerSelectionPage: (coche: boolean) => void;
  patientSelectionne: PatientTransfertCaisse | null;
  dossiersCoches: string[];
  onSelectionner: (p: PatientTransfertCaisse) => void;
  onBasculerCoche: (dossierId: string) => void;
  onVoirExamens: (p: PatientTransfertCaisse) => void;
  onRafraichir: () => void;
}

function SectionTableauTransferts({
  titre,
  vide,
  patients,
  page,
  onPageChange,
  afficherMenuSortant,
  selectionCochee,
  onBasculerSelectionPage,
  patientSelectionne,
  dossiersCoches,
  onSelectionner,
  onBasculerCoche,
  onVoirExamens,
  onRafraichir,
}: PropsSectionTableau) {
  const { t } = useTranslation();
  const totalPages = Math.max(1, Math.ceil(patients.length / PAR_PAGE));
  const pageCourante = Math.min(page, totalPages);
  const debut = (pageCourante - 1) * PAR_PAGE;
  const pagePatients = patients.slice(debut, debut + PAR_PAGE);

  return (
    <section className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
      <div className="border-b border-gris-bordure px-2 py-1.5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-texte-secondaire">
          {titre}
        </h3>
      </div>

      {pagePatients.length === 0 ? (
        <p className="px-4 py-12 text-center text-sm text-texte-secondaire">{vide}</p>
      ) : (
        <div className="conteneur-tableau-sigh">
          <table className="tableau-sigh">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-texte-secondaire">
              <tr>
                <th className="w-8 px-3 py-2.5">
                  {afficherMenuSortant && (
                    <CaseCocheLigne
                      coche={selectionCochee}
                      onChange={onBasculerSelectionPage}
                      ariaLabel={t("caisse.transferts.selectionnerTout")}
                    />
                  )}
                </th>
                <th className="px-2 py-1.5 font-semibold">ID</th>
                <th className="px-2 py-1.5 font-semibold">{t("caisse.transferts.colNom")}</th>
                <th className="hidden px-2 py-1.5 font-semibold md:table-cell">
                  {t("caisse.transferts.colTelephone")}
                </th>
                <th className="hidden px-2 py-1.5 font-semibold lg:table-cell">
                  {t("caisse.transferts.colProvenance")}
                </th>
                <th className="px-2 py-1.5 font-semibold">
                  {afficherMenuSortant
                    ? t("caisse.transferts.colOrientation")
                    : t("caisse.transferts.colDestination")}
                </th>
                <th className="px-2 py-1.5 font-semibold">{t("caisse.transferts.colStatut")}</th>
                <th className="px-2 py-1.5 font-semibold">{t("caisse.transferts.colHeure")}</th>
                <th className="px-2 py-1.5 font-semibold">{t("caisse.transferts.colActions")}</th>
              </tr>
            </thead>
            <tbody>
              {pagePatients.map((p) => {
                const selectionne = patientSelectionne?.cleListe === p.cleListe;
                return (
                  <tr
                    key={p.cleListe}
                    onClick={() => onSelectionner(p)}
                    className={cn(
                      "cursor-pointer border-t border-gris-bordure/70 transition-colors",
                      selectionne ? "bg-bleu-medical-clair/40" : "hover:bg-slate-50"
                    )}
                  >
                    <td className="px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
                      {afficherMenuSortant && (
                        <CaseCocheLigne
                          coche={dossiersCoches.includes(p.dossierId)}
                          onChange={() => onBasculerCoche(p.dossierId)}
                        />
                      )}
                    </td>
                    <td className="px-2 py-1.5 font-mono text-xs text-texte-secondaire">
                      {p.numeroPatient}
                    </td>
                    <td className="px-2 py-1.5">
                      <span className="block font-semibold text-texte-principal">
                        <span className="inline-flex flex-wrap items-center gap-1.5">
                          {p.nomComplet}
                          <BadgeTypePersonneCaisse estClientWalkIn={p.estClientWalkIn} />
                        </span>
                      </span>
                      <span className="block text-[11px] text-texte-secondaire">
                        {p.estClientWalkIn
                          ? t("caisse.facturation.nbMedicaments", {
                              count: p.nombreMedicaments,
                            })
                          : `${p.nombreExamens} examen(s)`}{" "}
                        · {formaterMontantCaisse(p.montantEstime)}
                      </span>
                    </td>
                    <td className="hidden px-2 py-1.5 text-texte-secondaire md:table-cell">
                      {p.telephone}
                    </td>
                    <td className="hidden max-w-[160px] truncate px-2 py-1.5 text-texte-secondaire lg:table-cell">
                      {p.provenance}
                    </td>
                    <td className="px-2 py-1.5">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          p.orientationCouleur
                        )}
                      >
                        {p.orientation}
                      </span>
                    </td>
                    <td className="px-2 py-1.5">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          p.statutCouleur
                        )}
                      >
                        {p.statut}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 tabular-nums text-texte-secondaire">{p.heure}</td>
                    <td className="px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectionner(p);
                            onVoirExamens(p);
                          }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gris-bordure text-texte-secondaire hover:border-bleu-medical/40 hover:text-bleu-medical"
                          aria-label={t("caisse.transferts.voirExamens")}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {(afficherMenuSortant
                          ? p.transfertSortantId
                          : p.transfertId &&
                            (p.statutTransfertEntrant === "EN_ATTENTE" ||
                              p.statutTransfertEntrant === "REFUSE")) ? (
                          <MenuActionsTransfertCaisse
                            patient={p}
                            onRafraichir={onRafraichir}
                          />
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gris-bordure px-2 py-1.5 text-xs text-texte-secondaire">
        <p>
          {t("caisse.transferts.pagination", {
            debut: patients.length === 0 ? 0 : debut + 1,
            fin: Math.min(debut + PAR_PAGE, patients.length),
            total: patients.length,
          })}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={pageCourante <= 1}
            onClick={() => onPageChange(Math.max(1, pageCourante - 1))}
            className="inline-flex items-center gap-1 rounded-lg border border-gris-bordure px-3 py-1.5 disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            {t("caisse.transferts.prec")}
          </button>
          <button
            type="button"
            disabled={pageCourante >= totalPages}
            onClick={() => onPageChange(Math.min(totalPages, pageCourante + 1))}
            className="inline-flex items-center gap-1 rounded-lg border border-gris-bordure px-3 py-1.5 disabled:opacity-40"
          >
            {t("caisse.transferts.suiv")}
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}

export function ListePatientsTransfertsCaisse() {
  const { t } = useTranslation();
  const {
    patientSelectionne,
    selectionnerPatient,
    synchroniserSelection,
    dossiersCoches,
    basculerDossierCoche,
    definirCoches,
  } = useSelectionTransfertCaisse();
  const [patientsEntrants, setPatientsEntrants] = useState<PatientTransfertCaisse[]>([]);
  const [patientsFacturesPayes, setPatientsFacturesPayes] = useState<PatientTransfertCaisse[]>(
    []
  );
  const [stats, setStats] = useState<StatsTransfertsCaisse>({
    enAttente: 0,
    enCours: 0,
    transferesAujourdhui: 0,
    versLaboratoire: 0,
  });
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [brouillonFiltres, setBrouillonFiltres] = useState<FiltresFacturationCaisse>(
    FILTRES_FACTURATION_VIDES
  );
  const [filtresAppliques, setFiltresAppliques] = useState<FiltresFacturationCaisse>(
    FILTRES_FACTURATION_VIDES
  );
  const [pageEntrants, setPageEntrants] = useState(1);
  const [pagePayes, setPagePayes] = useState(1);
  const [patientExamens, setPatientExamens] = useState<PatientTransfertCaisse | null>(null);
  const [modaleExamensOuverte, setModaleExamensOuverte] = useState(false);

  const charger = useCallback(
    async (options?: { silencieux?: boolean }) => {
      const silencieux = options?.silencieux ?? false;
      if (!silencieux) {
        setChargement(true);
        setErreur(null);
      }
      try {
        const res = await fetch("/api/caisse/transferts");
        const data = (await res.json()) as {
          patientsEntrants?: PatientTransfertCaisse[];
          patientsFacturesPayes?: PatientTransfertCaisse[];
          patients?: PatientTransfertCaisse[];
          stats?: StatsTransfertsCaisse;
          message?: string;
        };
        if (!res.ok) throw new Error(data.message ?? "Chargement impossible.");
        const entrants = data.patientsEntrants ?? [];
        const payes = data.patientsFacturesPayes ?? data.patients ?? [];
        setPatientsEntrants(entrants);
        setPatientsFacturesPayes(payes);
        synchroniserSelection([...entrants, ...payes]);
        setStats(
          data.stats ?? {
            enAttente: 0,
            enCours: 0,
            transferesAujourdhui: 0,
            versLaboratoire: 0,
          }
        );
      } catch (error) {
        if (!silencieux) {
          setErreur(
            error instanceof Error ? error.message : "Impossible de charger la liste."
          );
        }
      } finally {
        if (!silencieux) setChargement(false);
      }
    },
    [synchroniserSelection]
  );

  useEffect(() => {
    void charger();
  }, [charger]);

  useEffect(() => {
    const onModifie = () => {
      void charger({ silencieux: true });
    };
    window.addEventListener(EVENEMENT_CAISSE_PATIENTS_MODIFIES, onModifie);
    return () => window.removeEventListener(EVENEMENT_CAISSE_PATIENTS_MODIFIES, onModifie);
  }, [charger]);

  const entrantsFiltres = useMemo(
    () => filtrerPatients(patientsEntrants, filtresAppliques),
    [patientsEntrants, filtresAppliques]
  );
  const payesFiltres = useMemo(
    () => filtrerPatients(patientsFacturesPayes, filtresAppliques),
    [patientsFacturesPayes, filtresAppliques]
  );

  const nbFiltresActifs = compterFiltresActifs(filtresAppliques, {
    ignorerNumeroFacture: true,
  });

  useEffect(() => {
    setPageEntrants(1);
    setPagePayes(1);
  }, [filtresAppliques]);

  const appliquerFiltres = () => {
    setFiltresAppliques(brouillonFiltres);
    setPageEntrants(1);
    setPagePayes(1);
  };

  const reinitialiserFiltres = () => {
    setBrouillonFiltres(FILTRES_FACTURATION_VIDES);
    setFiltresAppliques(FILTRES_FACTURATION_VIDES);
    setPageEntrants(1);
    setPagePayes(1);
  };

  const toutSelectionnePayes =
    payesFiltres.length > 0 &&
    payesFiltres.every((p) => dossiersCoches.includes(p.dossierId));

  const exporterSelection = () => {
    const cibles =
      dossiersCoches.length > 0
        ? payesFiltres.filter((p) => dossiersCoches.includes(p.dossierId))
        : [...entrantsFiltres, ...payesFiltres];
    if (cibles.length === 0) return;
    telechargerCsv(
      `caisse-patients-${new Date().toISOString().slice(0, 10)}.csv`,
      ["numeroPatient", "nom", "telephone", "provenance", "orientation", "statut", "heure"],
      cibles.map((p) => [
        p.numeroPatient,
        p.nomComplet,
        p.telephone ?? "",
        p.provenance ?? "",
        p.orientation,
        p.statut,
        p.heure,
      ])
    );
  };

  if (chargement) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-gris-bordure bg-white py-16 text-sm text-texte-secondaire">
        <Loader2 className="h-5 w-5 animate-spin" />
        {t("caisse.transferts.chargement")}
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center">
        <p className="text-sm text-red-700">{erreur}</p>
        <button
          type="button"
          onClick={() => void charger()}
          className="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700"
        >
          {t("caisse.transferts.reessayer")}
        </button>
      </div>
    );
  }

  const cartes = [
    {
      label: t("caisse.transferts.stats.transferesAujourdhui"),
      valeur: stats.transferesAujourdhui,
      accent: "text-emerald-600",
    },
    {
      label: t("caisse.transferts.stats.entrants"),
      valeur: entrantsFiltres.length,
      accent: "text-bleu-medical",
    },
    {
      label: t("caisse.transferts.stats.facturesPayees"),
      valeur: payesFiltres.length,
      accent: "text-texte-principal",
    },
    {
      label: t("caisse.transferts.stats.enCours"),
      valeur: stats.enCours,
      accent: "text-texte-principal",
    },
  ];

  const debutPagePayes = (Math.min(pagePayes, Math.max(1, Math.ceil(payesFiltres.length / PAR_PAGE))) - 1) * PAR_PAGE;
  const pagePatientsPayes = payesFiltres.slice(debutPagePayes, debutPagePayes + PAR_PAGE);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cartes.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-gris-bordure bg-white px-2 py-1.5 shadow-sm"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-texte-secondaire">
              {c.label}
            </p>
            <p className={cn("mt-1 text-2xl font-bold", c.accent)}>{c.valeur}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setFiltresOuverts((o) => !o)}
          aria-expanded={filtresOuverts}
          aria-label={
            filtresOuverts
              ? t("caisse.facturation.fermerFiltres")
              : t("caisse.facturation.ouvrirFiltres")
          }
          className={cn(
            "relative inline-flex h-11 w-11 items-center justify-center rounded-lg border transition-colors",
            filtresOuverts
              ? "border-bleu-medical bg-bleu-medical-clair text-bleu-medical"
              : "border-gris-bordure bg-white text-texte-principal hover:bg-gris-tres-clair"
          )}
        >
          <SlidersHorizontal className="h-5 w-5" strokeWidth={2} />
          <span
            className={cn(
              "absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white shadow-sm",
              nbFiltresActifs > 0 ? "bg-red-500" : "bg-slate-400"
            )}
          >
            {nbFiltresActifs}
          </span>
        </button>
        <BoutonsOutilsListe
          toutSelectionne={toutSelectionnePayes}
          onSelectionnerTout={() =>
            definirCoches(
              payesFiltres.map((p) => p.dossierId),
              !toutSelectionnePayes
            )
          }
          onExporter={exporterSelection}
          labelSelectionnerTout={t("caisse.transferts.selectionnerTout")}
          labelExporter={t("caisse.transferts.exporterSelection")}
        />
      </div>

      {filtresOuverts && (
        <FormulaireFiltresFacturationCaisse
          valeurs={brouillonFiltres}
          onChange={setBrouillonFiltres}
          onRechercher={appliquerFiltres}
          onReinitialiser={reinitialiserFiltres}
          idPrefix="filtre-transferts"
          masquerNumeroFacture
        />
      )}

      <SectionTableauTransferts
        titre={t("caisse.transferts.tableauEntrants")}
        vide={
          nbFiltresActifs > 0
            ? t("caisse.facturation.filtres.aucunResultat")
            : t("caisse.transferts.videEntrants")
        }
        patients={entrantsFiltres}
        page={pageEntrants}
        onPageChange={setPageEntrants}
        afficherMenuSortant={false}
        selectionCochee={false}
        onBasculerSelectionPage={() => undefined}
        patientSelectionne={patientSelectionne}
        dossiersCoches={dossiersCoches}
        onSelectionner={selectionnerPatient}
        onBasculerCoche={basculerDossierCoche}
        onVoirExamens={(p) => {
          setPatientExamens(p);
          setModaleExamensOuverte(true);
        }}
        onRafraichir={() => void charger({ silencieux: true })}
      />

      <SectionTableauTransferts
        titre={t("caisse.transferts.tableauFacturesPayees")}
        vide={
          nbFiltresActifs > 0
            ? t("caisse.facturation.filtres.aucunResultat")
            : t("caisse.transferts.videFacturesPayees")
        }
        patients={payesFiltres}
        page={pagePayes}
        onPageChange={setPagePayes}
        afficherMenuSortant
        selectionCochee={
          pagePatientsPayes.length > 0 &&
          pagePatientsPayes.every((p) => dossiersCoches.includes(p.dossierId))
        }
        onBasculerSelectionPage={(coche) =>
          definirCoches(
            pagePatientsPayes.map((p) => p.dossierId),
            coche
          )
        }
        patientSelectionne={patientSelectionne}
        dossiersCoches={dossiersCoches}
        onSelectionner={selectionnerPatient}
        onBasculerCoche={basculerDossierCoche}
        onVoirExamens={(p) => {
          setPatientExamens(p);
          setModaleExamensOuverte(true);
        }}
        onRafraichir={() => void charger({ silencieux: true })}
      />

      <ModaleExamensCaisse
        patient={patientExamens}
        ouverte={modaleExamensOuverte}
        onFermer={() => {
          setModaleExamensOuverte(false);
          setPatientExamens(null);
        }}
      />
    </div>
  );
}
