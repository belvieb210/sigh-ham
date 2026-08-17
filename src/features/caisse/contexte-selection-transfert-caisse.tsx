"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  COULEURS_ORIENTATION_CAISSE,
  EVENEMENT_CAISSE_PATIENTS_MODIFIES,
  ORIENTATIONS_RAPIDES_CAISSE,
} from "@/constants/caisse";
import { orientationsInitialesDepuisPatient, filtrerOrientationsAutorisees } from "@/lib/transferts/orientations-universelles";
import { useOrientationCaisse } from "@/features/caisse/contexte-orientation-caisse";
import { calculerAge, initiales } from "@/features/caisse/utils-format";
import type { PatientTransfertCaisse } from "@/lib/caisse/types";
import {
  creerDebounce,
  orienterPatientsEnSerie,
} from "@/features/transferts/utilitaires-orientation-lot";

export interface ResumePatientCaisse {
  initiales: string;
  nomComplet: string;
  numeroPatient: string | null;
  numeroDossier: string | null;
  dossierId: string | null;
  age: string;
  telephone: string;
  vide: boolean;
}

export const RESUME_CAISSE_VIDE: ResumePatientCaisse = {
  initiales: "—",
  nomComplet: "Aucun patient sélectionné",
  numeroPatient: null,
  numeroDossier: null,
  dossierId: null,
  age: "—",
  telephone: "—",
  vide: true,
};

interface ContexteSelectionTransfertCaisse {
  patientSelectionne: PatientTransfertCaisse | null;
  resume: ResumePatientCaisse;
  selectionnerPatient: (patient: PatientTransfertCaisse) => void;
  dossiersCoches: string[];
  basculerDossierCoche: (dossierId: string) => void;
  definirCoches: (dossierIds: string[], coche: boolean) => void;
  viderCoches: () => void;
  /** Applique l'orientation immédiatement (sans modal), comme à la réception */
  demanderOrientation: (codeSalle: string) => void;
  demanderOrientations: (codesSalle: string[]) => void;
  synchroniserSelection: (patients: PatientTransfertCaisse[]) => void;
  modificationEnCours: boolean;
  messagePanneau: string | null;
}

const Contexte = createContext<ContexteSelectionTransfertCaisse | null>(null);

export function FournisseurSelectionTransfertCaisse({ children }: { children: ReactNode }) {
  const { definirOrientation, definirOrientations } = useOrientationCaisse();
  const [patientSelectionne, setPatientSelectionne] = useState<PatientTransfertCaisse | null>(
    null
  );
  const [resume, setResume] = useState<ResumePatientCaisse>(RESUME_CAISSE_VIDE);
  const [dossiersCoches, setDossiersCoches] = useState<string[]>([]);
  const [modificationEnCours, setModificationEnCours] = useState(false);
  const [messagePanneau, setMessagePanneau] = useState<string | null>(null);
  const verrouOrientationRef = useRef(false);

  const selectionnerPatient = useCallback(
    (patient: PatientTransfertCaisse) => {
      setMessagePanneau(null);
      setPatientSelectionne(patient);
      const codes =
        patient.section === "paye" && patient.peutOrienterSortant
          ? orientationsInitialesDepuisPatient(
              "CAISSE",
              (patient as { codesSalleDestination?: string[] }).codesSalleDestination,
              patient.codeSalleDestination
            )
          : [];
      definirOrientations(codes);
      const age = calculerAge(patient.dateNaissance);
      setResume({
        initiales: initiales(patient.prenom, patient.nom),
        nomComplet: patient.nomComplet,
        numeroPatient: patient.numeroPatient,
        numeroDossier: patient.numeroDossier,
        dossierId: patient.dossierId,
        age: age !== null ? `${age} ans` : "—",
        telephone: patient.telephone || "—",
        vide: false,
      });
    },
    [definirOrientations]
  );

  const basculerDossierCoche = useCallback((dossierId: string) => {
    setDossiersCoches((prev) =>
      prev.includes(dossierId)
        ? prev.filter((id) => id !== dossierId)
        : [...prev, dossierId]
    );
  }, []);

  const definirCoches = useCallback((dossierIds: string[], coche: boolean) => {
    setDossiersCoches((prev) => {
      const set = new Set(prev);
      for (const id of dossierIds) {
        if (coche) set.add(id);
        else set.delete(id);
      }
      return [...set];
    });
  }, []);

  const viderCoches = useCallback(() => setDossiersCoches([]), []);

  const appliquerOrientations = useCallback(
    async (codesSalle: string[]) => {
      const codes = filtrerOrientationsAutorisees(
        "CAISSE",
        codesSalle.filter((c) => c !== "CAISSE")
      );
      if (codes.length === 0) {
        setMessagePanneau("Sélectionnez au moins une destination.");
        return;
      }

      const cibles =
        dossiersCoches.length > 0
          ? dossiersCoches
          : patientSelectionne
            ? [patientSelectionne.dossierId]
            : [];

      if (cibles.length === 0) {
        setMessagePanneau("Sélectionnez au moins un patient (section factures payées).");
        return;
      }

      const dossiersNonPayes = cibles.filter((id) => {
        const courant =
          patientSelectionne?.dossierId === id ? patientSelectionne : null;
        return courant ? !courant.peutOrienterSortant : false;
      });
      if (dossiersNonPayes.length > 0) {
        setMessagePanneau(
          "Seuls les patients de la section « Factures payées » peuvent être orientés."
        );
        return;
      }

      if (verrouOrientationRef.current) return;
      verrouOrientationRef.current = true;
      definirOrientations(codes);
      setModificationEnCours(true);
      setMessagePanneau(null);

      try {
        const { ok, echecs, resultats, premierEchec } = await orienterPatientsEnSerie(
          cibles,
          async (dossierId) => {
            const res = await fetch("/api/caisse/transferts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ dossierId, orientations: codes }),
            });
            const data = (await res.json()) as {
              message?: string;
              salleDestination?: string;
              codesSalle?: string[];
              transfertId?: string;
            };
            if (!res.ok) throw new Error(data.message ?? "Orientation impossible.");
            return data;
          }
        );

        if (ok === 0) {
          throw premierEchec ?? new Error("Orientation impossible.");
        }

        const premierOk = resultats[0];
        const codesFinal = premierOk?.codesSalle ?? codes;
        const label =
          premierOk?.salleDestination ??
          codesFinal
            .map(
              (c) =>
                ORIENTATIONS_RAPIDES_CAISSE.find((o) => o.value === c)?.label ?? c
            )
            .join(", ");

        setMessagePanneau(
          echecs > 0
            ? `${ok} patient(s) orienté(s) vers ${label} (${echecs} échec(s)). Confirmez via ⋮.`
            : cibles.length > 1
              ? `${ok} patients orientés vers ${label} — confirmez via le menu ⋮.`
              : `Transfert vers ${label} créé — confirmez via le menu ⋮ après la facture.`
        );

        if (patientSelectionne && cibles.includes(patientSelectionne.dossierId)) {
          setPatientSelectionne((courant) =>
            courant
              ? {
                  ...courant,
                  orientation: label,
                  orientationCouleur:
                    COULEURS_ORIENTATION_CAISSE[label.split(",")[0]?.trim() ?? ""] ??
                    "bg-slate-100 text-slate-600",
                  codeSalleDestination: codesFinal[0] ?? courant.codeSalleDestination,
                  codesSalleDestination: codesFinal,
                  transfertSortantId:
                    premierOk?.transfertId ?? courant.transfertSortantId,
                  statutTransfertSortant: "EN_ATTENTE",
                  statut: "À confirmer",
                  statutCouleur: "bg-orange-100 text-orange-800",
                }
              : courant
          );
        }

        definirOrientations(codesFinal);
        setDossiersCoches([]);
        window.dispatchEvent(new CustomEvent(EVENEMENT_CAISSE_PATIENTS_MODIFIES));
      } catch (error) {
        setMessagePanneau(
          error instanceof Error ? error.message : "Impossible d'orienter le patient."
        );
        if (patientSelectionne?.codeSalleDestination) {
          definirOrientation(patientSelectionne.codeSalleDestination);
        }
      } finally {
        verrouOrientationRef.current = false;
        setModificationEnCours(false);
      }
    },
    [
      dossiersCoches,
      patientSelectionne,
      definirOrientation,
      definirOrientations,
    ]
  );

  const debounceOrientationRef = useRef<ReturnType<
    typeof creerDebounce<(codes: string[]) => void>
  > | null>(null);

  useEffect(() => {
    debounceOrientationRef.current = creerDebounce((codes: string[]) => {
      void appliquerOrientations(codes);
    }, 400);
    return () => debounceOrientationRef.current?.annuler();
  }, [appliquerOrientations]);

  const demanderOrientations = useCallback(
    async (codesSalle: string[]) => {
      debounceOrientationRef.current?.(codesSalle);
    },
    []
  );

  const demanderOrientation = useCallback(
    (codeSalle: string) => demanderOrientations([codeSalle]),
    [demanderOrientations]
  );

  const synchroniserSelection = useCallback((patients: PatientTransfertCaisse[]) => {
    setPatientSelectionne((courant) => {
      if (!courant) return courant;
      return patients.find((p) => p.cleListe === courant.cleListe) ?? null;
    });
    setDossiersCoches((prev) =>
      prev.filter((id) => patients.some((p) => p.dossierId === id))
    );
  }, []);

  const valeur = useMemo(
    () => ({
      patientSelectionne,
      resume,
      selectionnerPatient,
      dossiersCoches,
      basculerDossierCoche,
      definirCoches,
      viderCoches,
      demanderOrientation,
      demanderOrientations,
      synchroniserSelection,
      modificationEnCours,
      messagePanneau,
    }),
    [
      patientSelectionne,
      resume,
      selectionnerPatient,
      dossiersCoches,
      basculerDossierCoche,
      definirCoches,
      viderCoches,
      demanderOrientation,
      demanderOrientations,
      synchroniserSelection,
      modificationEnCours,
      messagePanneau,
    ]
  );

  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function useSelectionTransfertCaisse() {
  const contexte = useContext(Contexte);
  if (!contexte) {
    throw new Error(
      "useSelectionTransfertCaisse doit être dans FournisseurSelectionTransfertCaisse."
    );
  }
  return contexte;
}

export function useSelectionTransfertCaisseOptionnel() {
  return useContext(Contexte);
}
