"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Calculator,
  Loader2,
  Pill,
  Printer,
  Save,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { BoutonsOutilsListe } from "@/components/ui/boutons-outils-liste";
import { CaseCocheLigne } from "@/components/ui/case-coche-ligne";
import { PaginationListe } from "@/components/ui/pagination-liste";
import {
  CLASSE_CHAMP_RECEPTION,
  CLASSE_LABEL_RECEPTION,
} from "@/constants/reception";
import { EVENEMENT_MEDECINS_PATIENTS_MODIFIES } from "@/constants/medecins";
import {
  compterFiltresActifs,
  FILTRES_FACTURATION_VIDES,
  FormulaireFiltresFacturationCaisse,
  type FiltresFacturationCaisse,
} from "@/features/caisse/formulaire-filtres-facturation-caisse";
import {
  MiseEnPageMedecins,
  type UtilisateurMedecins,
} from "@/features/medecins/mise-en-page-medecins";
import {
  type DetailsImagerie,
  LignesMedicamentsOrdonnances,
  type LigneMedicamentDraft,
  nouvelleLigneMed,
  SectionImagerieOrdonnances,
  SelectionExamensOrdonnances,
} from "@/features/medecins/formulaire-ordonnances-blocs";
import { MenuActionsTransfertMedecins } from "@/features/medecins/menu-actions-transfert-medecins";
import {
  PanneauDroitMedecins,
  SectionsMobileMedecinsPatients,
} from "@/features/medecins/panneau-droit-medecins";
import { useSelectionMedecins } from "@/features/medecins/contexte-selection-medecins";
import { imprimerDevisEstimation } from "@/lib/reception/imprimer-devis-estimation";
import type {
  MedicamentMedecins,
  PatientFileMedecins,
  TypeExamenMedecins,
} from "@/lib/medecins/types";
import { cn } from "@/lib/utils";

function patientCorrespondFiltres(
  p: PatientFileMedecins,
  f: FiltresFacturationCaisse
): boolean {
  const nom = f.nom.trim().toLowerCase();
  const prenom = f.prenom.trim().toLowerCase();
  const tel = f.telephone.trim().toLowerCase();
  const enreg = f.numeroEnreg.trim().toLowerCase();
  const idEntite = f.idEntite.trim().toLowerCase();
  if (nom && !`${p.nom} ${p.nomComplet}`.toLowerCase().includes(nom)) return false;
  if (prenom && !`${p.prenom} ${p.nomComplet}`.toLowerCase().includes(prenom))
    return false;
  if (tel && !(p.telephone || "").toLowerCase().includes(tel)) return false;
  if (
    enreg &&
    !(p.numeroDossier || "").toLowerCase().includes(enreg) &&
    !(p.numeroPatient || "").toLowerCase().includes(enreg)
  ) {
    return false;
  }
  if (
    idEntite &&
    !(p.numeroPatient || "").toLowerCase().includes(idEntite) &&
    !(p.dossierId || "").toLowerCase().includes(idEntite)
  ) {
    return false;
  }
  return true;
}

interface Props {
  utilisateur: UtilisateurMedecins;
}

const IMAGERIE_VIDE: DetailsImagerie = {
  categories: [],
  autres: [""],
  typeExamen: "",
  but: "",
  conduiteATenir: "",
};

function formaterPrixUsd(prix: number): string {
  return `$ ${prix.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function formaterPrixFc(prix: number): string {
  return `${prix.toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })} Fc`;
}

function CorpsOrdonnances({ utilisateur }: Props) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const dossierUrl = searchParams.get("dossier")?.trim() ?? "";

  const {
    patientSelectionne,
    selectionnerPatient,
    dossiersCoches,
    basculerDossierCoche,
    definirCoches,
    synchroniserSelection,
  } = useSelectionMedecins();

  const [patients, setPatients] = useState<PatientFileMedecins[]>([]);
  const [catalogue, setCatalogue] = useState<MedicamentMedecins[]>([]);
  const [examens, setExamens] = useState<TypeExamenMedecins[]>([]);
  const [lignes, setLignes] = useState<LigneMedicamentDraft[]>([nouvelleLigneMed()]);
  const [imagerie, setImagerie] = useState<DetailsImagerie>(IMAGERIE_VIDE);
  const [patientNom, setPatientNom] = useState("");
  const [dateOrd, setDateOrd] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [docteur, setDocteur] = useState(
    `${utilisateur.prenom} ${utilisateur.nom}`.trim()
  );
  const [remise, setRemise] = useState(0);
  const [modeEstimation, setModeEstimation] = useState(false);
  const [orienterPharmacie, setOrienterPharmacie] = useState(true);
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [brouillonFiltres, setBrouillonFiltres] = useState<FiltresFacturationCaisse>(
    FILTRES_FACTURATION_VIDES
  );
  const [filtresAppliques, setFiltresAppliques] = useState<FiltresFacturationCaisse>(
    FILTRES_FACTURATION_VIDES
  );
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [pageListe, setPageListe] = useState(1);
  const [chargement, setChargement] = useState(true);
  const [enCours, setEnCours] = useState(false);
  const [impression, setImpression] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const dossierId = patientSelectionne?.dossierId ?? "";

  const chargerPatients = useCallback(async () => {
    setChargement(true);
    try {
      const [resP, resM] = await Promise.all([
        fetch("/api/medecins/patients"),
        fetch("/api/medecins/medicaments"),
      ]);
      const dataP = (await resP.json()) as { patients?: PatientFileMedecins[] };
      const dataM = (await resM.json()) as { medicaments?: MedicamentMedecins[] };
      setPatients(dataP.patients ?? []);
      setCatalogue(dataM.medicaments ?? []);
    } catch {
      setErreur(t("medecins.ordonnances.erreur"));
    } finally {
      setChargement(false);
    }
  }, [t]);

  useEffect(() => {
    void chargerPatients();
  }, [chargerPatients]);

  useEffect(() => {
    const onModifie = () => void chargerPatients();
    window.addEventListener(EVENEMENT_MEDECINS_PATIENTS_MODIFIES, onModifie);
    return () =>
      window.removeEventListener(EVENEMENT_MEDECINS_PATIENTS_MODIFIES, onModifie);
  }, [chargerPatients]);

  useEffect(() => {
    synchroniserSelection(patients);
  }, [patients, synchroniserSelection]);

  useEffect(() => {
    if (!dossierUrl || patients.length === 0) return;
    const p = patients.find((x) => x.dossierId === dossierUrl);
    if (p) {
      selectionnerPatient(p);
      setFormulaireOuvert(true);
    }
  }, [dossierUrl, patients, selectionnerPatient]);

  useEffect(() => {
    if (!patientSelectionne) {
      setPatientNom("");
      setFormulaireOuvert(false);
      return;
    }
    setPatientNom(
      `${patientSelectionne.nom.toUpperCase()} ${patientSelectionne.prenom}`
    );
  }, [patientSelectionne]);

  const filtrés = useMemo(
    () => patients.filter((p) => patientCorrespondFiltres(p, filtresAppliques)),
    [patients, filtresAppliques]
  );

  useEffect(() => {
    setPageListe(1);
  }, [filtresAppliques]);

  const nbFiltresActifs = compterFiltresActifs(filtresAppliques, {
    ignorerNumeroFacture: true,
  });

  const totalExamens = examens.reduce((t, e) => t + e.prix, 0);
  const totalMeds = lignes
    .filter((l) => l.medicamentId)
    .reduce(
      (t, l) => t + l.prixUnitaire * Math.max(1, Number(l.quantite) || 1),
      0
    );
  const remiseEff = Math.min(Math.max(0, remise), totalExamens);
  const totalExamensNet = Math.max(0, totalExamens - remiseEff);

  const PAR_PAGE = 7;
  const totalPages = Math.max(1, Math.ceil(filtrés.length / PAR_PAGE));
  const pageCourante = Math.min(pageListe, totalPages);
  const debutPage = (pageCourante - 1) * PAR_PAGE;
  const patientsPage = filtrés.slice(debutPage, debutPage + PAR_PAGE);

  const lignesApi = lignes
    .filter((l) => l.medicamentId)
    .map((l) => ({
      medicamentId: l.medicamentId,
      quantite: Math.max(1, Number(l.quantite) || 1),
      posologie: [l.dosage, l.frequence].filter(Boolean).join(" — ") || null,
      dureeJours: Number(l.duree) || null,
    }));

  async function enregistrer() {
    if (!dossierId) {
      setErreur("Sélectionnez un patient.");
      return;
    }
    setEnCours(true);
    setErreur(null);
    setMessage(null);
    try {
      const res = await fetch("/api/medecins/ordonnances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dossierId,
          notes: imagerie.conduiteATenir || null,
          detailsPrescription: {
            imagerie,
            patient: patientNom,
            date: dateOrd,
            docteur,
          },
          typeExamenIds: examens.map((e) => e.id),
          lignes: lignesApi,
          orienterVersPharmacie: orienterPharmacie && lignesApi.length > 0,
        }),
      });
      const data = (await res.json()) as { erreur?: string };
      if (!res.ok) throw new Error(data.erreur ?? "Enregistrement impossible.");
      setMessage(t("medecins.ordonnances.creee"));
      setExamens([]);
      setLignes([nouvelleLigneMed()]);
      setImagerie(IMAGERIE_VIDE);
      setModeEstimation(false);
      setFormulaireOuvert(false);
      selectionnerPatient(null);
      await chargerPatients();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur.");
    } finally {
      setEnCours(false);
    }
  }

  async function imprimerEstimation() {
    if (!patientSelectionne) {
      setErreur("Sélectionnez un patient.");
      return;
    }
    if (examens.length === 0 && lignesApi.length === 0) {
      setErreur("Ajoutez des examens et/ou des médicaments pour l'estimation.");
      return;
    }
    if (!docteur.trim()) {
      setErreur("Indiquez le médecin.");
      return;
    }
    setImpression(true);
    setErreur(null);
    try {
      const medsPdf = lignes
        .filter((l) => l.medicamentId)
        .map((l) => ({
          nom: l.nom,
          dosage: l.dosage,
          frequence: l.frequence,
          duree: l.duree,
          quantite: Math.max(1, Number(l.quantite) || 1),
          prixUnitaire: l.prixUnitaire,
          code: l.code,
        }));
      const ok = await imprimerDevisEstimation({
        examens: examens.map((e) => ({
          id: e.id,
          code: e.code,
          libelle: e.libelle,
          categorie: e.categorie,
          prix: e.prix,
          delaiHeures: e.delaiHeures,
        })),
        medicaments: medsPdf,
        medecinResponsable: docteur.trim(),
        nomPatient: patientSelectionne.nom,
        prenomPatient: patientSelectionne.prenom,
        telephonePatient:
          patientSelectionne.telephone === "—"
            ? ""
            : patientSelectionne.telephone,
        numeroEnregistrement: patientSelectionne.numeroDossier,
        dateEnregistrement: `${dateOrd} ${new Date().toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        agentNom: `${utilisateur.prenom} ${utilisateur.nom}`.trim(),
        remise: remiseEff,
        labels: {
          titreTicket: "ESTIMATION",
          numero: "N°",
          date: "Date",
          patient: "Patient",
          telephone: "Téléphone",
          medecin: "Médecin",
          description: "Description",
          prix: "Prix",
          total: "Total",
          genereLe: "Généré le",
          agent: "Émis par",
        },
      });
      if (!ok) setErreur("Impossible de générer le PDF.");
    } finally {
      setImpression(false);
    }
  }

  const tousCoches =
    filtrés.length > 0 &&
    filtrés.every((p) => dossiersCoches.includes(p.dossierId));

  const afficherFormulaire = formulaireOuvert && Boolean(dossierId);

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-bleu-medical" />
            <h2 className="text-xl font-bold text-texte-principal">Ordonnances</h2>
          </div>
          <p className="mt-1 text-sm text-texte-secondaire">
            {afficherFormulaire && patientSelectionne
              ? `Recommandations — ${patientSelectionne.nomComplet}`
              : "Sélectionnez un patient pour rédiger les recommandations."}
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setFiltresOuverts((o) => !o)}
            aria-expanded={filtresOuverts}
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
            toutSelectionne={tousCoches}
            onSelectionnerTout={() =>
              definirCoches(
                filtrés.map((p) => p.dossierId),
                !tousCoches
              )
            }
            onExporter={() => {
              const ids =
                dossiersCoches.length > 0
                  ? dossiersCoches
                  : filtrés.map((p) => p.dossierId);
              const lignesCsv = patients.filter((p) => ids.includes(p.dossierId));
              const csv = [
                "numero;nom;prenom;telephone;statut;heure",
                ...lignesCsv.map(
                  (p) =>
                    `${p.numeroPatient};${p.nom};${p.prenom};${p.telephone};${p.statut};${p.heure}`
                ),
              ].join("\n");
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "file-ordonnances.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
            labelSelectionnerTout={t("medecins.patients.selectionnerTout")}
            labelExporter={t("caisse.transferts.exporterSelection")}
          />
        </div>
      </div>

      {filtresOuverts ? (
        <FormulaireFiltresFacturationCaisse
          valeurs={brouillonFiltres}
          onChange={setBrouillonFiltres}
          onRechercher={() => {
            setFiltresAppliques(brouillonFiltres);
            setFiltresOuverts(false);
          }}
          onReinitialiser={() => {
            setBrouillonFiltres(FILTRES_FACTURATION_VIDES);
            setFiltresAppliques(FILTRES_FACTURATION_VIDES);
          }}
          idPrefix="filtre-ordonnances"
          masquerNumeroFacture
        />
      ) : null}

      {message ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {message}
        </p>
      ) : null}
      {erreur ? <p className="text-sm text-red-600">{erreur}</p> : null}

      {afficherFormulaire ? (
        <div className="space-y-12">
          <div className="space-y-12 rounded-xl border border-gris-bordure bg-white p-4 shadow-sm sm:p-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>Patient</label>
                <input
                  className={CLASSE_CHAMP_RECEPTION}
                  value={patientNom}
                  readOnly
                  placeholder="Sélectionnez un patient ci-dessous"
                />
              </div>
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>Date</label>
                <input
                  type="date"
                  className={CLASSE_CHAMP_RECEPTION}
                  value={dateOrd}
                  onChange={(e) => setDateOrd(e.target.value)}
                />
              </div>
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>Docteur</label>
                <input
                  className={CLASSE_CHAMP_RECEPTION}
                  value={docteur}
                  onChange={(e) => setDocteur(e.target.value)}
                  placeholder="— Choisir un médecin —"
                />
              </div>
            </div>

            <SelectionExamensOrdonnances
              selection={examens}
              onChange={setExamens}
            />

            <LignesMedicamentsOrdonnances
              lignes={lignes}
              onChange={setLignes}
              catalogue={catalogue}
            />

            <SectionImagerieOrdonnances value={imagerie} onChange={setImagerie} />

            <label className="flex items-center gap-2 text-sm text-texte-principal">
              <input
                type="checkbox"
                checked={orienterPharmacie}
                onChange={(e) => setOrienterPharmacie(e.target.checked)}
              />
              Orienter vers la pharmacie après enregistrement des médicaments
            </label>
          </div>

          {modeEstimation ? (
            <div className="space-y-4 rounded-xl border border-bleu-medical/30 bg-bleu-medical-clair/20 p-4">
              <h3 className="text-sm font-bold uppercase text-texte-principal">
                Estimation
              </h3>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-lg border border-gris-bordure bg-white p-3">
                  <p className="mb-2 text-xs font-semibold uppercase text-texte-secondaire">
                    Examens
                  </p>
                  {examens.length === 0 ? (
                    <p className="text-xs text-texte-secondaire">Aucun examen.</p>
                  ) : (
                    <ul className="space-y-1 text-sm">
                      {examens.map((e) => (
                        <li key={e.id} className="flex justify-between gap-2">
                          <span>
                            {e.code} — {e.libelle}
                          </span>
                          <span className="font-medium">
                            {formaterPrixUsd(e.prix)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-2 border-t border-gris-bordure pt-2 text-right text-sm font-bold">
                    Sous-total : {formaterPrixUsd(totalExamens)}
                  </p>
                </div>
                <div className="rounded-lg border border-gris-bordure bg-white p-3">
                  <p className="mb-2 text-xs font-semibold uppercase text-texte-secondaire">
                    Médicaments (Fc)
                  </p>
                  {lignesApi.length === 0 ? (
                    <p className="text-xs text-texte-secondaire">
                      Aucun médicament.
                    </p>
                  ) : (
                    <ul className="space-y-1 text-sm">
                      {lignes
                        .filter((l) => l.medicamentId)
                        .map((l) => (
                          <li key={l.key} className="flex justify-between gap-2">
                            <span>
                              {l.nom} × {l.quantite || 1}
                            </span>
                            <span className="font-medium">
                              {formaterPrixFc(
                                l.prixUnitaire *
                                  Math.max(1, Number(l.quantite) || 1)
                              )}
                            </span>
                          </li>
                        ))}
                    </ul>
                  )}
                  <p className="mt-2 border-t border-gris-bordure pt-2 text-right text-sm font-bold">
                    Sous-total : {formaterPrixFc(totalMeds)}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <label className={CLASSE_LABEL_RECEPTION}>
                    Remise examens ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={remise}
                    onChange={(e) => setRemise(Number(e.target.value) || 0)}
                    className={cn(CLASSE_CHAMP_RECEPTION, "w-28")}
                  />
                </div>
                <div className="rounded-lg border border-gris-bordure bg-white px-4 py-3 text-sm">
                  <div className="flex justify-between gap-8">
                    <span>Examens</span>
                    <span>{formaterPrixUsd(totalExamens)}</span>
                  </div>
                  <div className="flex justify-between gap-8 text-texte-secondaire">
                    <span>Remise</span>
                    <span>- {formaterPrixUsd(remiseEff)}</span>
                  </div>
                  <div className="flex justify-between gap-8 font-bold text-bleu-medical">
                    <span>Total examens</span>
                    <span>{formaterPrixUsd(totalExamensNet)}</span>
                  </div>
                  <div className="mt-1 flex justify-between gap-8 border-t border-gris-bordure pt-1 font-bold text-texte-principal">
                    <span>Total médicaments</span>
                    <span>{formaterPrixFc(totalMeds)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={impression}
                  onClick={() => void imprimerEstimation()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gris-bordure bg-white px-3 py-2 text-sm font-medium"
                >
                  {impression ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Printer className="h-4 w-4" />
                  )}
                  PDF estimation
                </button>
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2 border-t border-gris-bordure pt-4">
            <button
              type="button"
              disabled={enCours || !dossierId}
              onClick={() => void enregistrer()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-bleu-medical px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {enCours ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Enregistrer
            </button>
            <button
              type="button"
              disabled={!dossierId}
              onClick={() => setModeEstimation((v) => !v)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border bg-white px-4 py-2.5 text-sm font-medium",
                modeEstimation
                  ? "border-bleu-medical bg-bleu-medical-clair text-bleu-medical"
                  : "border-gris-bordure text-texte-principal hover:bg-gris-tres-clair"
              )}
            >
              <Calculator className="h-4 w-4" />
              Estimation
            </button>
            <button
              type="button"
              onClick={() => {
                setFormulaireOuvert(false);
                setModeEstimation(false);
                selectionnerPatient(null);
                setMessage(null);
                setErreur(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gris-bordure bg-white px-4 py-2.5 text-sm font-medium text-texte-principal hover:bg-gris-tres-clair"
            >
              <X className="h-4 w-4" />
              Annuler
            </button>
          </div>
        </div>
      ) : null}

      <section className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wide text-texte-principal">
          Patients orientés vers les médecins
        </h3>
        <p className="text-xs text-texte-secondaire">
          File médicale : patients transmis depuis les autres salles — cliquez
          pour rédiger l&apos;ordonnance.
        </p>

        {chargement ? (
          <div className="flex items-center gap-2 text-sm text-texte-secondaire">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("medecins.patients.chargement")}
          </div>
        ) : filtrés.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gris-bordure bg-white p-8 text-center text-sm text-texte-secondaire">
            {nbFiltresActifs > 0
              ? t("caisse.facturation.filtres.aucunResultat")
              : t("medecins.patients.vide")}
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gris-bordure bg-gris-tres-clair/60 text-xs uppercase text-texte-secondaire">
                <tr>
                  <th className="px-3 py-3">
                    <CaseCocheLigne
                      coche={tousCoches}
                      onChange={(coche) =>
                        definirCoches(
                          filtrés.map((p) => p.dossierId),
                          coche
                        )
                      }
                      ariaLabel={t("medecins.patients.selectionnerTout")}
                    />
                  </th>
                  <th className="px-3 py-3">ID</th>
                  <th className="px-3 py-3">Patient</th>
                  <th className="hidden px-3 py-3 md:table-cell">Téléphone</th>
                  <th className="px-3 py-3">Orientation</th>
                  <th className="px-3 py-3">Statut</th>
                  <th className="px-3 py-3">Heure</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patientsPage.map((p) => {
                  const sel =
                    patientSelectionne?.dossierId === p.dossierId &&
                    formulaireOuvert;
                  return (
                    <tr
                      key={p.cleListe}
                      onClick={() => {
                        selectionnerPatient(p);
                        setFormulaireOuvert(true);
                        setModeEstimation(false);
                        setMessage(null);
                        setErreur(null);
                      }}
                      className={cn(
                        "cursor-pointer border-b border-gris-bordure/70 hover:bg-bleu-medical-clair/20",
                        sel && "bg-bleu-medical-clair/40"
                      )}
                    >
                      <td
                        className="px-3 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <CaseCocheLigne
                          coche={dossiersCoches.includes(p.dossierId)}
                          onChange={() => basculerDossierCoche(p.dossierId)}
                          ariaLabel={p.nomComplet}
                        />
                      </td>
                      <td className="px-3 py-3 font-mono text-[11px]">
                        {p.numeroPatient}
                      </td>
                      <td className="px-3 py-3">
                        <span className="font-bold uppercase">{p.nom}</span>{" "}
                        <span className="lowercase">{p.prenom}</span>
                      </td>
                      <td className="hidden px-3 py-3 md:table-cell">
                        {p.telephone}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium",
                            p.orientationCouleur
                          )}
                        >
                          {p.orientation}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium",
                            p.statutCouleur
                          )}
                        >
                          {p.statut}
                        </span>
                      </td>
                      <td className="px-3 py-3">{p.heure}</td>
                      <td
                        className="px-3 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MenuActionsTransfertMedecins
                          patient={p}
                          onRafraichir={chargerPatients}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <PaginationListe
              page={pageCourante}
              totalPages={totalPages}
              totalItems={filtrés.length}
              parPage={PAR_PAGE}
              onChange={setPageListe}
            />
          </div>
        )}
        <SectionsMobileMedecinsPatients />
      </section>
    </div>
  );
}

export function ContenuOrdonnancesMedecins({ utilisateur }: Props) {
  const { t } = useTranslation();
  return (
    <MiseEnPageMedecins
      utilisateur={utilisateur}
      titre={t("medecins.ordonnances.titre")}
      sousTitre={t("medecins.ordonnances.sousTitre")}
      panneauDroit={<PanneauDroitMedecins />}
      activerSelection
    >
      <CorpsOrdonnances utilisateur={utilisateur} />
    </MiseEnPageMedecins>
  );
}
