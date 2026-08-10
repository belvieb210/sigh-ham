"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Activity, Loader2, Save, SlidersHorizontal, X } from "lucide-react";
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
import { useOrientationInfirmiers } from "@/features/infirmiers/contexte-orientation-infirmiers";
import { useSelectionInfirmiersOptionnel } from "@/features/infirmiers/contexte-selection-infirmiers";
import {
  MiseEnPageInfirmiers,
  type UtilisateurInfirmiers,
} from "@/features/infirmiers/mise-en-page-infirmiers";
import { MenuActionsTransfertInfirmiers } from "@/features/infirmiers/menu-actions-transfert-infirmiers";
import {
  PanneauDroitInfirmiers,
  SectionsMobileInfirmiersPatients,
} from "@/features/infirmiers/panneau-droit-infirmiers";
import {
  FORMULAIRE_VIDE,
  FormulaireConsultationClinique,
  formulaireDepuisConstantes,
  sexePourSelectFormulaire,
  signesDepuisConstantes,
} from "@/features/medecins/formulaire-consultation-clinique";
import type {
  ConstanteVitaleResume,
  PatientFileInfirmiers,
} from "@/lib/infirmiers/types";
import type { FormulaireCliniqueMedecins } from "@/lib/medecins/types";
import { cn } from "@/lib/utils";

interface Props {
  utilisateur: UtilisateurInfirmiers;
}

function aujourdhuiInput() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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

function useSelectionConsultationInfirmiers() {
  const ctx = useSelectionInfirmiersOptionnel();
  const [patientLocal, setPatientLocal] = useState<PatientFileInfirmiers | null>(
    null
  );
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

export function CorpsConsultationInfirmiers() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const dossierUrl = searchParams.get("dossier")?.trim() ?? "";
  const { definirOrientations } = useOrientationInfirmiers();

  const {
    patientSelectionne,
    selectionnerPatient,
    dossiersCoches,
    basculerDossierCoche,
    definirCoches,
    synchroniserSelection,
  } = useSelectionConsultationInfirmiers();

  const [patients, setPatients] = useState<PatientFileInfirmiers[]>([]);
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
    useState<FormulaireCliniqueMedecins>(FORMULAIRE_VIDE);
  const [dateConsult, setDateConsult] = useState(aujourdhuiInput());
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const dossierId = patientSelectionne?.dossierId ?? "";

  const chargerPatients = useCallback(async () => {
    setChargementListe(true);
    try {
      const res = await fetch("/api/infirmiers/patients");
      const data = (await res.json()) as {
        patients?: PatientFileInfirmiers[];
        erreur?: string;
      };
      if (!res.ok) {
        setErreur(data.erreur ?? t("infirmiers.patients.erreur"));
        return;
      }
      setPatients(data.patients ?? []);
    } catch {
      setErreur(t("infirmiers.patients.erreur"));
    } finally {
      setChargementListe(false);
    }
  }, [t]);

  const reinitaliserFormulaire = useCallback(
    (opts?: { derniereConstante?: ConstanteVitaleResume | null }) => {
      const c = opts?.derniereConstante ?? null;
      const depuisConstante = formulaireDepuisConstantes(c);
      setFormulaire({
        ...FORMULAIRE_VIDE,
        ...depuisConstante,
        drRef: depuisConstante.drRef || "",
        signesVitaux: signesDepuisConstantes(c),
      });
      setDateConsult(aujourdhuiInput());
    },
    []
  );

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
    if (!dossierId) {
      reinitaliserFormulaire();
      setFormulaireOuvert(false);
      return;
    }

    let annule = false;
    (async () => {
      setErreur(null);
      try {
        const res = await fetch(
          `/api/infirmiers/constantes?dossierId=${encodeURIComponent(dossierId)}`
        );
        const data = (await res.json()) as {
          constantes?: ConstanteVitaleResume[];
          erreur?: string;
        };
        if (!res.ok) {
          throw new Error(data.erreur ?? t("infirmiers.consultation.erreurChargement"));
        }
        if (annule) return;
        const derniere = data.constantes?.[0] ?? null;
        reinitaliserFormulaire({
          derniereConstante: derniere,
        });
      } catch (e) {
        if (!annule) {
          setErreur(
            e instanceof Error ? e.message : t("infirmiers.consultation.erreurChargement")
          );
        }
      }
    })();

    return () => {
      annule = true;
    };
  }, [dossierId, patientSelectionne, reinitaliserFormulaire, t]);

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

  const tousCoches =
    filtrés.length > 0 && filtrés.every((p) => dossiersCoches.includes(p.dossierId));

  function fermerFormulaire() {
    setFormulaireOuvert(false);
    setMessage(null);
    setErreur(null);
  }

  async function sauvegarder() {
    if (!dossierId) {
      setErreur(t("infirmiers.consultation.selectionnerPatient"));
      return;
    }
    setEnCours(true);
    setErreur(null);
    setMessage(null);
    const sv = formulaire.signesVitaux ?? {};
    try {
      const res = await fetch("/api/infirmiers/constantes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dossierId,
          formulaireClinique: formulaire,
          ...sv,
        }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) {
        throw new Error(data.message ?? t("infirmiers.consultation.erreurSave"));
      }
      setMessage(data.message ?? t("infirmiers.consultation.enregistree"));
      definirOrientations(["MEDECINS"]);
      await chargerPatients();
      fermerFormulaire();
      window.dispatchEvent(new CustomEvent(EVENEMENT_INFIRMIERS_PATIENTS_MODIFIES));
    } catch (e) {
      setErreur(e instanceof Error ? e.message : t("infirmiers.consultation.erreurSave"));
    } finally {
      setEnCours(false);
    }
  }

  const identite = {
    nom: patientSelectionne
      ? `${patientSelectionne.nom.toUpperCase()} ${patientSelectionne.prenom}`
      : "",
    age: patientSelectionne?.age != null ? String(patientSelectionne.age) : "",
    sexe: sexePourSelectFormulaire(patientSelectionne?.sexe),
    date: dateConsult,
    telPat:
      patientSelectionne?.telephone === "—"
        ? ""
        : (patientSelectionne?.telephone ?? ""),
    numeroEnreg: patientSelectionne?.numeroDossier ?? "",
    lectureSeuleIdentite: true as const,
    onChangeIdentite: (champ: string, v: string) => {
      if (champ === "date") setDateConsult(v);
    },
  };

  const afficherFormulaire = formulaireOuvert && Boolean(dossierId);

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-bleu-medical" />
            <h2 className="text-xl font-bold text-texte-principal">
              {t("infirmiers.consultation.titre")}
            </h2>
          </div>
          <p className="mt-1 text-sm text-texte-secondaire">
            {afficherFormulaire && patientSelectionne
              ? t("infirmiers.consultation.patientActif", {
                  nom: patientSelectionne.nomComplet,
                })
              : t("infirmiers.consultation.aideSelection")}
          </p>
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
              a.download = "file-consultation-infirmiers.csv";
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
          idPrefix="filtre-consultation-infirmiers"
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
          <FormulaireConsultationClinique
            formulaire={formulaire}
            onChange={setFormulaire}
            motif=""
            onMotifChange={() => {}}
            identite={identite}
            desactive={!dossierId}
            variante="signesSeulement"
          />

          <div className="flex flex-wrap gap-2 border-t border-gris-bordure pt-4">
            <button
              type="button"
              disabled={enCours || !dossierId}
              onClick={() => void sauvegarder()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-bleu-medical px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {enCours ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {t("infirmiers.consultation.enregistrer")}
            </button>
            <button
              type="button"
              onClick={fermerFormulaire}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gris-bordure bg-white px-4 py-2.5 text-sm font-medium text-texte-principal hover:bg-gris-tres-clair"
            >
              <X className="h-4 w-4" />
              {t("infirmiers.consultation.annuler")}
            </button>
          </div>
        </div>
      ) : null}

      <section className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wide text-texte-principal">
          {t("infirmiers.consultation.listeTitre")}
        </h3>
        <p className="text-xs text-texte-secondaire">
          {t("infirmiers.consultation.listeDescription")}
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
          <div className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
            <table className="w-full text-left text-sm">
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
                    {t("infirmiers.patients.colonnes.heure")}
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
                      <td className="px-3 py-3 text-texte-secondaire">
                        {p.heure}
                      </td>
                      <td
                        className="px-3 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
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
            <PaginationListe
              page={pageCourante}
              totalPages={totalPages}
              totalItems={filtrés.length}
              parPage={PAR_PAGE}
              onChange={setPageListe}
            />
          </div>
        )}
        <SectionsMobileInfirmiersPatients />
      </section>
    </div>
  );
}

export function ContenuConsultationInfirmiers({ utilisateur }: Props) {
  const { t } = useTranslation();

  return (
    <MiseEnPageInfirmiers
      utilisateur={utilisateur}
      titre={t("infirmiers.consultation.titre")}
      sousTitre={t("infirmiers.consultation.sousTitre")}
      panneauDroit={<PanneauDroitInfirmiers />}
      activerSelection
    >
      <CorpsConsultationInfirmiers />
    </MiseEnPageInfirmiers>
  );
}
