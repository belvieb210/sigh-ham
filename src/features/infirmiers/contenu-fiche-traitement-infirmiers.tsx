"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ClipboardList, Loader2, Save, SlidersHorizontal, X } from "lucide-react";
import { BoutonsOutilsListe } from "@/components/ui/boutons-outils-liste";
import { CaseCocheLigne } from "@/components/ui/case-coche-ligne";
import { PaginationListe } from "@/components/ui/pagination-liste";
import { EVENEMENT_INFIRMIERS_PATIENTS_MODIFIES } from "@/constants/infirmiers";
import {
  compterFiltresActifs,
  FILTRES_FACTURATION_VIDES,
  FormulaireFiltresFacturationCaisse,
  type FiltresFacturationCaisse,
} from "@/features/caisse/formulaire-filtres-facturation-caisse";
import {
  FournisseurFicheTraitementInfirmiers,
  useFicheTraitementInfirmiers,
} from "@/features/infirmiers/contexte-fiche-traitement-infirmiers";
import { useSelectionInfirmiersOptionnel } from "@/features/infirmiers/contexte-selection-infirmiers";
import {
  FormulaireFicheTraitement,
  formulaireDepuisFiche,
  formulaireVersPayload,
} from "@/features/infirmiers/formulaire-fiche-traitement";
import {
  MiseEnPageInfirmiers,
  type UtilisateurInfirmiers,
} from "@/features/infirmiers/mise-en-page-infirmiers";
import { MenuActionsTransfertInfirmiers } from "@/features/infirmiers/menu-actions-transfert-infirmiers";
import {
  PanneauDroitFicheTraitement,
  SectionsMobileFicheTraitementInfirmiers,
} from "@/features/infirmiers/panneau-droit-fiche-traitement";
import { isoVersDatetimeLocal } from "@/lib/infirmiers/fiche-traitement-utils";
import { sexePourSelectFormulaire } from "@/features/medecins/formulaire-consultation-clinique";
import type { FicheTraitementResume } from "@/lib/infirmiers/types-fiche-traitement";
import {
  FORMULAIRE_FICHE_TRAITEMENT_VIDE,
  type FormulaireFicheTraitementState,
} from "@/lib/infirmiers/types-fiche-traitement";
import type { PatientFileInfirmiers } from "@/lib/infirmiers/types";
import { cn } from "@/lib/utils";

interface Props {
  utilisateur: UtilisateurInfirmiers;
}

function maintenantDatetimeLocal() {
  return isoVersDatetimeLocal(new Date().toISOString());
}

function finParDefaut() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return isoVersDatetimeLocal(d.toISOString());
}

function patientCorrespondFiltres(
  p: PatientFileInfirmiers,
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

function useSelectionFicheTraitementInfirmiers() {
  const ctx = useSelectionInfirmiersOptionnel();
  const [patientLocal, setPatientLocal] = useState<PatientFileInfirmiers | null>(null);
  const [cochesLocal, setCochesLocal] = useState<string[]>([]);

  const basculerLocal = useCallback((dossierId: string) => {
    setCochesLocal((prev) =>
      prev.includes(dossierId)
        ? prev.filter((id) => id !== dossierId)
        : [...prev, dossierId]
    );
  }, []);

  const definirCochesLocal = useCallback((dossierIds: string[], coche: boolean) => {
    setCochesLocal((prev) => {
      const set = new Set(prev);
      for (const id of dossierIds) {
        if (coche) set.add(id);
        else set.delete(id);
      }
      return [...set];
    });
  }, []);

  if (ctx) {
    return {
      patientSelectionne: ctx.patientSelectionne,
      selectionnerPatient: ctx.selectionnerPatient,
      dossiersCoches: ctx.dossiersCoches,
      basculerDossierCoche: ctx.basculerDossierCoche,
      definirCoches: ctx.definirCoches,
      synchroniserSelection: ctx.synchroniserSelection,
    };
  }

  return {
    patientSelectionne: patientLocal,
    selectionnerPatient: setPatientLocal,
    dossiersCoches: cochesLocal,
    basculerDossierCoche: basculerLocal,
    definirCoches: definirCochesLocal,
    synchroniserSelection: () => {},
  };
}

async function uploaderFichiersEnAttente(ficheId: string, fichiers: File[]) {
  for (const fichier of fichiers) {
    const form = new FormData();
    form.append("ficheId", ficheId);
    form.append("fichier", fichier);
    const res = await fetch("/api/infirmiers/fiches-traitement/upload", {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      const data = (await res.json()) as { message?: string };
      throw new Error(data.message ?? "Upload impossible.");
    }
  }
}

export function CorpsFicheTraitementInfirmiers() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const dossierUrl = searchParams.get("dossier")?.trim() ?? "";

  const {
    ficheActive,
    definirFicheActive,
    rafraichirFichesDossier,
    definirMessagePanneau,
  } = useFicheTraitementInfirmiers();

  const {
    patientSelectionne,
    selectionnerPatient,
    dossiersCoches,
    basculerDossierCoche,
    definirCoches,
    synchroniserSelection,
  } = useSelectionFicheTraitementInfirmiers();

  const [patients, setPatients] = useState<PatientFileInfirmiers[]>([]);
  const [fichesActives, setFichesActives] = useState<FicheTraitementResume[]>([]);
  const [chargementListe, setChargementListe] = useState(true);
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [brouillonFiltres, setBrouillonFiltres] = useState<FiltresFacturationCaisse>(
    FILTRES_FACTURATION_VIDES
  );
  const [filtresAppliques, setFiltresAppliques] = useState<FiltresFacturationCaisse>(
    FILTRES_FACTURATION_VIDES
  );
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [pageListe, setPageListe] = useState(1);
  const [formulaire, setFormulaire] =
    useState<FormulaireFicheTraitementState>(FORMULAIRE_FICHE_TRAITEMENT_VIDE);
  const [identite, setIdentite] = useState({
    nom: "",
    age: "",
    sexe: "",
    poidsKg: "",
    numeroRecu: "",
    lectureSeuleNom: true as const,
  });
  const [fichiersEnAttente, setFichiersEnAttente] = useState<File[]>([]);
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const dossierId = patientSelectionne?.dossierId ?? "";

  const chargerPatients = useCallback(async () => {
    setChargementListe(true);
    try {
      const [resPatients, resFiches] = await Promise.all([
        fetch("/api/infirmiers/patients?contexte=fiche-traitement"),
        fetch("/api/infirmiers/fiches-traitement"),
      ]);
      const dataPatients = (await resPatients.json()) as {
        patients?: PatientFileInfirmiers[];
        erreur?: string;
      };
      const dataFiches = (await resFiches.json()) as {
        fiches?: FicheTraitementResume[];
      };
      if (!resPatients.ok) {
        setErreur(dataPatients.erreur ?? t("infirmiers.patients.erreur"));
        return;
      }
      setPatients(dataPatients.patients ?? []);
      setFichesActives(dataFiches.fiches ?? []);
    } catch {
      setErreur(t("infirmiers.patients.erreur"));
    } finally {
      setChargementListe(false);
    }
  }, [t]);

  const reinitialiserFormulaireNouveau = useCallback(() => {
    setFormulaire({
      ...FORMULAIRE_FICHE_TRAITEMENT_VIDE,
      debutTraitementLe: maintenantDatetimeLocal(),
      finTraitementLe: finParDefaut(),
    });
    setFichiersEnAttente([]);
  }, []);

  useEffect(() => {
    void chargerPatients();
  }, [chargerPatients]);

  useEffect(() => {
    const onModifie = () => void chargerPatients();
    window.addEventListener(EVENEMENT_INFIRMIERS_PATIENTS_MODIFIES, onModifie);
    return () =>
      window.removeEventListener(EVENEMENT_INFIRMIERS_PATIENTS_MODIFIES, onModifie);
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
    if (!dossierId || !patientSelectionne) {
      reinitialiserFormulaireNouveau();
      definirFicheActive(null);
      setFormulaireOuvert(false);
      return;
    }

    setIdentite({
      nom: `${patientSelectionne.nom.toUpperCase()} ${patientSelectionne.prenom}`,
      age: patientSelectionne.age != null ? String(patientSelectionne.age) : "",
      sexe: sexePourSelectFormulaire(patientSelectionne.sexe),
      poidsKg: "",
      numeroRecu: patientSelectionne.numeroDossier ?? "",
      lectureSeuleNom: true,
    });

    let annule = false;
    (async () => {
      setErreur(null);
      try {
        const [fiches, resDetail] = await Promise.all([
          rafraichirFichesDossier(dossierId),
          fetch(`/api/infirmiers/patients/${encodeURIComponent(dossierId)}`),
        ]);
        const dataDetail = (await resDetail.json()) as {
          patient?: { derniereConstante?: { poidsKg?: number | null } | null };
        };
        const poidsConstantes = dataDetail.patient?.derniereConstante?.poidsKg;

        if (annule) return;

        const enCoursFiche = fiches.find((f) => f.statut === "EN_COURS") ?? null;
        if (enCoursFiche) {
          definirFicheActive(enCoursFiche);
          setFormulaire(formulaireDepuisFiche(enCoursFiche));
          setIdentite((prev) => ({
            ...prev,
            poidsKg:
              enCoursFiche.poidsKg != null
                ? String(enCoursFiche.poidsKg)
                : poidsConstantes != null
                  ? String(poidsConstantes)
                  : prev.poidsKg,
            sexe: sexePourSelectFormulaire(enCoursFiche.sexe) || prev.sexe,
            numeroRecu: enCoursFiche.numeroRecu ?? prev.numeroRecu,
          }));
        } else {
          definirFicheActive(null);
          reinitialiserFormulaireNouveau();
          if (poidsConstantes != null) {
            setIdentite((prev) => ({
              ...prev,
              poidsKg: String(poidsConstantes),
            }));
          }
        }
        setFichiersEnAttente([]);
      } catch (e) {
        if (!annule) {
          setErreur(
            e instanceof Error ? e.message : t("infirmiers.ficheTraitement.erreurChargement")
          );
        }
      }
    })();

    return () => {
      annule = true;
    };
  }, [
    dossierId,
    patientSelectionne,
    rafraichirFichesDossier,
    definirFicheActive,
    reinitialiserFormulaireNouveau,
    t,
  ]);

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

  const PAR_PAGE = 7;
  const totalPages = Math.max(1, Math.ceil(filtrés.length / PAR_PAGE));
  const pageCourante = Math.min(pageListe, totalPages);
  const debutPage = (pageCourante - 1) * PAR_PAGE;
  const patientsPage = filtrés.slice(debutPage, debutPage + PAR_PAGE);

  const dossiersAvecFicheActive = useMemo(
    () => new Set(fichesActives.map((f) => f.dossierId)),
    [fichesActives]
  );

  const tousCoches =
    filtrés.length > 0 && filtrés.every((p) => dossiersCoches.includes(p.dossierId));

  function fermerFormulaire() {
    setFormulaireOuvert(false);
    setMessage(null);
    setErreur(null);
    definirMessagePanneau(null);
  }

  async function sauvegarder() {
    if (!dossierId) {
      setErreur(t("infirmiers.ficheTraitement.selectionnerPatient"));
      return;
    }
    setEnCours(true);
    setErreur(null);
    setMessage(null);
    definirMessagePanneau(null);

    try {
      const payload = formulaireVersPayload(formulaire, identite);
      const estMaj = Boolean(ficheActive?.id);
      const res = await fetch(
        estMaj
          ? `/api/infirmiers/fiches-traitement/${ficheActive!.id}`
          : "/api/infirmiers/fiches-traitement",
        {
          method: estMaj ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, dossierId }),
        }
      );
      const data = (await res.json()) as {
        message?: string;
        fiche?: FicheTraitementResume;
      };
      if (!res.ok) {
        throw new Error(data.message ?? t("infirmiers.ficheTraitement.erreurSave"));
      }

      const fiche = data.fiche;
      if (!fiche) {
        throw new Error(t("infirmiers.ficheTraitement.erreurSave"));
      }

      if (fichiersEnAttente.length > 0) {
        await uploaderFichiersEnAttente(fiche.id, fichiersEnAttente);
        setFichiersEnAttente([]);
        const fiches = await rafraichirFichesDossier(dossierId);
        const miseAJour = fiches.find((f) => f.id === fiche.id) ?? fiche;
        definirFicheActive(miseAJour);
        setFormulaire(formulaireDepuisFiche(miseAJour));
      } else {
        definirFicheActive(fiche);
        setFormulaire(formulaireDepuisFiche(fiche));
        await rafraichirFichesDossier(dossierId);
      }

      setMessage(data.message ?? t("infirmiers.ficheTraitement.enregistree"));
      await chargerPatients();
      window.dispatchEvent(new CustomEvent(EVENEMENT_INFIRMIERS_PATIENTS_MODIFIES));
    } catch (e) {
      setErreur(e instanceof Error ? e.message : t("infirmiers.ficheTraitement.erreurSave"));
    } finally {
      setEnCours(false);
    }
  }

  const afficherFormulaire = formulaireOuvert && Boolean(dossierId);

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-bleu-medical" />
            <h2 className="text-xl font-bold text-texte-principal">
              {t("infirmiers.ficheTraitement.titre")}
            </h2>
          </div>
          <p className="mt-1 text-sm text-texte-secondaire">
            {afficherFormulaire && patientSelectionne
              ? t("infirmiers.ficheTraitement.patientActif", {
                  nom: patientSelectionne.nomComplet,
                })
              : t("infirmiers.ficheTraitement.aideSelection")}
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
              const lignes = patients.filter((p) => ids.includes(p.dossierId));
              const csv = [
                "numero;nom;prenom;telephone;motif;statut;heure",
                ...lignes.map(
                  (p) =>
                    `${p.numeroPatient};${p.nom};${p.prenom};${p.telephone};${p.motif};${p.statut};${p.heure}`
                ),
              ].join("\n");
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "fiches-traitement-infirmiers.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
            labelSelectionnerTout={t("infirmiers.patients.selectionnerTout")}
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
          idPrefix="filtre-fiche-traitement-infirmiers"
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
        <div className="space-y-5">
          <FormulaireFicheTraitement
            formulaire={formulaire}
            onChange={setFormulaire}
            identite={identite}
            onChangeIdentite={(champ, valeur) =>
              setIdentite((prev) => ({ ...prev, [champ]: valeur }))
            }
            fichiersEnAttente={fichiersEnAttente}
            onFichiersEnAttenteChange={setFichiersEnAttente}
            desactive={!dossierId || ficheActive?.statut === "CLOTURE"}
          />

          <div className="flex flex-wrap gap-2 border-t border-gris-bordure pt-4">
            <button
              type="button"
              disabled={
                enCours || !dossierId || ficheActive?.statut === "CLOTURE"
              }
              onClick={() => void sauvegarder()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-bleu-medical px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {enCours ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {t("infirmiers.ficheTraitement.enregistrer")}
            </button>
            <button
              type="button"
              onClick={fermerFormulaire}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gris-bordure bg-white px-4 py-2.5 text-sm font-medium text-texte-principal hover:bg-gris-tres-clair"
            >
              <X className="h-4 w-4" />
              {t("infirmiers.ficheTraitement.annuler")}
            </button>
          </div>
        </div>
      ) : null}

      <section className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wide text-texte-principal">
          {t("infirmiers.ficheTraitement.listeTitre")}
        </h3>
        <p className="text-xs text-texte-secondaire">
          {t("infirmiers.ficheTraitement.listeDescription")}
        </p>

        {chargementListe ? (
          <div className="flex items-center gap-2 text-sm text-texte-secondaire">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("infirmiers.patients.chargement")}
          </div>
        ) : filtrés.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gris-bordure bg-white p-8 text-center text-sm text-texte-secondaire">
            {nbFiltresActifs > 0
              ? t("caisse.facturation.filtres.aucunResultat")
              : t("infirmiers.patients.vide")}
          </p>
        ) : (
          <>
            <ul className="space-y-3 2xl:hidden">
              {patientsPage.map((p) => {
                const selectionne =
                  patientSelectionne?.dossierId === p.dossierId && formulaireOuvert;
                const aFiche = dossiersAvecFicheActive.has(p.dossierId);
                return (
                  <li key={p.cleListe}>
                    <button
                      type="button"
                      onClick={() => {
                        selectionnerPatient(p);
                        setFormulaireOuvert(true);
                        setMessage(null);
                        setErreur(null);
                      }}
                      className={cn(
                        "w-full rounded-xl border bg-white p-4 text-left shadow-sm transition-colors",
                        selectionne
                          ? "border-bleu-medical bg-bleu-medical-clair/30"
                          : "border-gris-bordure"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <CaseCocheLigne
                          coche={dossiersCoches.includes(p.dossierId)}
                          onChange={() => basculerDossierCoche(p.dossierId)}
                          ariaLabel={p.nomComplet}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-texte-principal">
                                {p.nomComplet}
                              </p>
                              <p className="font-mono text-[11px] text-texte-secondaire">
                                {p.numeroPatient}
                              </p>
                            </div>
                            <span onClick={(e) => e.stopPropagation()}>
                              <MenuActionsTransfertInfirmiers
                                patient={p}
                                onRafraichir={chargerPatients}
                              />
                            </span>
                          </div>
                          <p className="mt-2 truncate text-xs text-texte-secondaire">
                            {p.motif}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[11px] font-medium",
                                p.orientationCouleur
                              )}
                            >
                              {p.orientation}
                            </span>
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[11px] font-medium",
                                p.statutCouleur
                              )}
                            >
                              {p.statut}
                            </span>
                            {aFiche ? (
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                                {t("infirmiers.ficheTraitement.ficheActive")}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="hidden overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm 2xl:block">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="border-b border-gris-bordure bg-gris-tres-clair/60 text-xs uppercase tracking-wide text-texte-secondaire">
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
                      ariaLabel={t("infirmiers.patients.selectionnerTout")}
                    />
                  </th>
                  <th className="px-3 py-3">ID</th>
                  <th className="px-3 py-3">
                    {t("infirmiers.patients.colonnes.patient")}
                  </th>
                  <th className="hidden px-3 py-3 md:table-cell">
                    {t("infirmiers.patients.colonnes.telephone")}
                  </th>
                  <th className="hidden px-3 py-3 lg:table-cell">
                    {t("infirmiers.patients.colonnes.motif")}
                  </th>
                  <th className="px-3 py-3">
                    {t("infirmiers.patients.colonnes.orientation")}
                  </th>
                  <th className="px-3 py-3">
                    {t("infirmiers.patients.colonnes.statut")}
                  </th>
                  <th className="px-3 py-3">
                    {t("infirmiers.ficheTraitement.colonneFiche")}
                  </th>
                  <th className="px-3 py-3">
                    {t("infirmiers.patients.colonnes.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {patientsPage.map((p) => {
                  const selectionne =
                    patientSelectionne?.dossierId === p.dossierId && formulaireOuvert;
                  const aFiche = dossiersAvecFicheActive.has(p.dossierId);
                  return (
                    <tr
                      key={p.cleListe}
                      onClick={() => {
                        selectionnerPatient(p);
                        setFormulaireOuvert(true);
                        setMessage(null);
                        setErreur(null);
                      }}
                      className={cn(
                        "cursor-pointer border-b border-gris-bordure/70 hover:bg-bleu-medical-clair/20",
                        selectionne && "bg-bleu-medical-clair/40"
                      )}
                    >
                      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <CaseCocheLigne
                          coche={dossiersCoches.includes(p.dossierId)}
                          onChange={() => basculerDossierCoche(p.dossierId)}
                          ariaLabel={p.nomComplet}
                        />
                      </td>
                      <td className="px-3 py-3 font-mono text-[11px] text-texte-secondaire">
                        {p.numeroPatient}
                      </td>
                      <td className="px-3 py-3">
                        <span className="font-bold uppercase">{p.nom}</span>{" "}
                        <span className="lowercase">{p.prenom}</span>
                      </td>
                      <td className="hidden px-3 py-3 text-texte-secondaire md:table-cell">
                        {p.telephone}
                      </td>
                      <td className="hidden max-w-[9rem] truncate px-3 py-3 text-texte-secondaire lg:table-cell">
                        {p.motif}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                            p.orientationCouleur
                          )}
                        >
                          {p.orientation}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                            p.statutCouleur
                          )}
                        >
                          {p.statut}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        {aFiche ? (
                          <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                            {t("infirmiers.ficheTraitement.ficheActive")}
                          </span>
                        ) : (
                          <span className="text-xs text-texte-secondaire">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <MenuActionsTransfertInfirmiers
                          patient={p}
                          onRafraichir={chargerPatients}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
            <PaginationListe
              page={pageCourante}
              totalPages={totalPages}
              totalItems={filtrés.length}
              parPage={PAR_PAGE}
              onChange={setPageListe}
            />
          </>
        )}
        <SectionsMobileFicheTraitementInfirmiers />
      </section>
    </div>
  );
}

export function ContenuFicheTraitementInfirmiers({ utilisateur }: Props) {
  const { t } = useTranslation();

  return (
    <FournisseurFicheTraitementInfirmiers>
      <MiseEnPageInfirmiers
        utilisateur={utilisateur}
        titre={t("infirmiers.ficheTraitement.titre")}
        sousTitre={t("infirmiers.ficheTraitement.sousTitre")}
        panneauDroit={<PanneauDroitFicheTraitement />}
        activerSelection
      >
        <CorpsFicheTraitementInfirmiers />
      </MiseEnPageInfirmiers>
    </FournisseurFicheTraitementInfirmiers>
  );
}
