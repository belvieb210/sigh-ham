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
import { EVENEMENT_MEDECINS_PATIENTS_MODIFIES, ORIENTATIONS_RAPIDES_MEDECINS } from "@/constants/medecins";
import { orientationsInitialesDepuisPatient, filtrerOrientationsAutorisees } from "@/lib/transferts/orientations-universelles";
import { useOrientationMedecins } from "@/features/medecins/contexte-orientation-medecins";
import type { PatientFileMedecins } from "@/lib/medecins/types";
import {
  creerDebounce,
  orienterPatientsEnSerie,
} from "@/features/transferts/utilitaires-orientation-lot";

export interface ResumePatientMedecins {
  initiales: string;
  nomComplet: string;
  numeroPatient: string | null;
  dossierId: string | null;
  age: string;
  telephone: string;
  motif: string;
  provenance: string;
  vide: boolean;
}

export const RESUME_MEDECINS_VIDE: ResumePatientMedecins = {
  initiales: "—",
  nomComplet: "Aucun patient sélectionné",
  numeroPatient: null,
  dossierId: null,
  age: "—",
  telephone: "—",
  motif: "—",
  provenance: "—",
  vide: true,
};

function initiales(prenom: string, nom: string) {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase() || "—";
}

interface ContexteSelectionMedecins {
  patientSelectionne: PatientFileMedecins | null;
  resume: ResumePatientMedecins;
  selectionnerPatient: (patient: PatientFileMedecins | null) => void;
  dossiersCoches: string[];
  basculerDossierCoche: (dossierId: string) => void;
  definirCoches: (dossierIds: string[], coche: boolean) => void;
  viderCoches: () => void;
  demanderOrientation: (codeSalle: string) => void;
  demanderOrientations: (codesSalle: string[]) => void;
  synchroniserSelection: (patients: PatientFileMedecins[]) => void;
  modificationEnCours: boolean;
  messagePanneau: string | null;
}

const Contexte = createContext<ContexteSelectionMedecins | null>(null);

export function FournisseurSelectionMedecins({ children }: { children: ReactNode }) {
  const { definirOrientation, definirOrientations } = useOrientationMedecins();
  const [patientSelectionne, setPatientSelectionne] =
    useState<PatientFileMedecins | null>(null);
  const [resume, setResume] = useState<ResumePatientMedecins>(RESUME_MEDECINS_VIDE);
  const [dossiersCoches, setDossiersCoches] = useState<string[]>([]);
  const [modificationEnCours, setModificationEnCours] = useState(false);
  const [messagePanneau, setMessagePanneau] = useState<string | null>(null);
  const verrouOrientationRef = useRef(false);

  const selectionnerPatient = useCallback(
    (patient: PatientFileMedecins | null) => {
      setMessagePanneau(null);
      if (!patient) {
        setPatientSelectionne(null);
        setResume(RESUME_MEDECINS_VIDE);
        return;
      }
      setPatientSelectionne(patient);
      const codes = orientationsInitialesDepuisPatient(
        "MEDECINS",
        patient.codesSalleDestination,
        patient.codeSalleDestination
      );
      definirOrientations(codes);
      setResume({
        initiales: initiales(patient.prenom, patient.nom),
        nomComplet: patient.nomComplet,
        numeroPatient: patient.numeroPatient,
        dossierId: patient.dossierId,
        age: patient.age !== null ? `${patient.age} ans` : "—",
        telephone: patient.telephone || "—",
        motif: patient.motif || "—",
        provenance: patient.provenance || "—",
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

  const appliquerOrientationsMedecins = useCallback(
    async (codesSalle: string[]) => {
      const codes = filtrerOrientationsAutorisees(
        "MEDECINS",
        codesSalle.filter((c) => c !== "MEDECINS")
      );
      if (codes.length === 0) {
        setMessagePanneau("Sélectionnez au moins une destination autorisée (Caisse).");
        return;
      }

      const cibles =
        dossiersCoches.length > 0
          ? dossiersCoches
          : patientSelectionne
            ? [patientSelectionne.dossierId]
            : [];

      if (cibles.length === 0) {
        setMessagePanneau("Sélectionnez au moins un patient.");
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
            const res = await fetch("/api/medecins/transferts", {
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
                ORIENTATIONS_RAPIDES_MEDECINS.find((o) => o.value === c)?.labelKey ?? c
            )
            .join(", ");

        setMessagePanneau(
          echecs > 0
            ? `${ok} patient(s) orienté(s) vers ${label} (${echecs} échec(s)). Confirmez via ⋮.`
            : cibles.length > 1
              ? `${ok} patients orientés vers ${label} — confirmez via le menu ⋮.`
              : `Transfert vers ${label} créé — confirmez via le menu ⋮.`
        );

        if (patientSelectionne && cibles.includes(patientSelectionne.dossierId)) {
          setPatientSelectionne((courant) =>
            courant
              ? {
                  ...courant,
                  orientation: label,
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
        window.dispatchEvent(new CustomEvent(EVENEMENT_MEDECINS_PATIENTS_MODIFIES));
      } catch (error) {
        setMessagePanneau(
          error instanceof Error ? error.message : "Impossible d'orienter le patient."
        );
        if (
          patientSelectionne?.codeSalleDestination &&
          patientSelectionne.codeSalleDestination !== "MEDECINS"
        ) {
          definirOrientation(patientSelectionne.codeSalleDestination);
        }
      } finally {
        verrouOrientationRef.current = false;
        setModificationEnCours(false);
      }
    },
    [dossiersCoches, patientSelectionne, definirOrientation, definirOrientations]
  );

  const debounceOrientationRef = useRef<ReturnType<
    typeof creerDebounce<(codes: string[]) => void>
  > | null>(null);

  useEffect(() => {
    debounceOrientationRef.current = creerDebounce((codes: string[]) => {
      void appliquerOrientationsMedecins(codes);
    }, 400);
    return () => debounceOrientationRef.current?.annuler();
  }, [appliquerOrientationsMedecins]);

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

  const synchroniserSelection = useCallback((patients: PatientFileMedecins[]) => {
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

export function useSelectionMedecins() {
  const contexte = useContext(Contexte);
  if (!contexte) {
    throw new Error(
      "useSelectionMedecins doit être dans FournisseurSelectionMedecins."
    );
  }
  return contexte;
}

export function useSelectionMedecinsOptionnel() {
  return useContext(Contexte);
}
