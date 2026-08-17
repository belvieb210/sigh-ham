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
import { EVENEMENT_PHARMACIE_PATIENTS_MODIFIES, ORIENTATIONS_RAPIDES_PHARMACIE } from "@/constants/pharmacie";
import { orientationsInitialesDepuisPatient, filtrerOrientationsAutorisees } from "@/lib/transferts/orientations-universelles";
import { useOrientationPharmacie } from "@/features/pharmacie/contexte-orientation-pharmacie";
import type { PatientFilePharmacie } from "@/lib/pharmacie/types";
import {
  creerDebounce,
  orienterPatientsEnSerie,
} from "@/features/transferts/utilitaires-orientation-lot";

export interface ResumePatientPharmacie {
  initiales: string;
  nomComplet: string;
  numeroPatient: string | null;
  numeroDossier: string | null;
  dossierId: string | null;
  age: string;
  telephone: string;
  motif: string;
  provenance: string;
  vide: boolean;
}

export const RESUME_PHARMACIE_VIDE: ResumePatientPharmacie = {
  initiales: "—",
  nomComplet: "Aucun patient sélectionné",
  numeroPatient: null,
  numeroDossier: null,
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

interface ContexteSelectionPharmacie {
  patientSelectionne: PatientFilePharmacie | null;
  resume: ResumePatientPharmacie;
  selectionnerPatient: (patient: PatientFilePharmacie) => void;
  dossiersCoches: string[];
  basculerDossierCoche: (dossierId: string) => void;
  definirCoches: (dossierIds: string[], coche: boolean) => void;
  viderCoches: () => void;
  demanderOrientation: (codeSalle: string) => void;
  demanderOrientations: (codesSalle: string[]) => void;
  synchroniserSelection: (patients: PatientFilePharmacie[]) => void;
  modificationEnCours: boolean;
  messagePanneau: string | null;
}

const Contexte = createContext<ContexteSelectionPharmacie | null>(null);

export function FournisseurSelectionPharmacie({ children }: { children: ReactNode }) {
  const { definirOrientation, definirOrientations } = useOrientationPharmacie();
  const [patientSelectionne, setPatientSelectionne] =
    useState<PatientFilePharmacie | null>(null);
  const [resume, setResume] = useState<ResumePatientPharmacie>(RESUME_PHARMACIE_VIDE);
  const [dossiersCoches, setDossiersCoches] = useState<string[]>([]);
  const [modificationEnCours, setModificationEnCours] = useState(false);
  const [messagePanneau, setMessagePanneau] = useState<string | null>(null);
  const verrouOrientationRef = useRef(false);

  const selectionnerPatient = useCallback(
    (patient: PatientFilePharmacie) => {
      setMessagePanneau(null);
      setPatientSelectionne(patient);
      const codes = orientationsInitialesDepuisPatient(
        "PHARMACIE",
        patient.codesSalleDestination,
        patient.codeSalleDestination
      );
      definirOrientations(codes);
      setResume({
        initiales: initiales(patient.prenom, patient.nom),
        nomComplet: patient.nomComplet,
        numeroPatient: patient.numeroPatient,
        numeroDossier: patient.numeroDossier,
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

  const appliquerOrientationsPharmacie = useCallback(
    async (codesSalle: string[]) => {
      const codes = filtrerOrientationsAutorisees(
        "PHARMACIE",
        codesSalle.filter((c) => c !== "PHARMACIE")
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
            const res = await fetch("/api/pharmacie/transferts", {
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
                ORIENTATIONS_RAPIDES_PHARMACIE.find((o) => o.value === c)?.labelKey ?? c
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
        window.dispatchEvent(new CustomEvent(EVENEMENT_PHARMACIE_PATIENTS_MODIFIES));
      } catch (error) {
        setMessagePanneau(
          error instanceof Error ? error.message : "Impossible d'orienter le patient."
        );
        if (
          patientSelectionne?.codeSalleDestination &&
          patientSelectionne.codeSalleDestination !== "PHARMACIE"
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
      void appliquerOrientationsPharmacie(codes);
    }, 400);
    return () => debounceOrientationRef.current?.annuler();
  }, [appliquerOrientationsPharmacie]);

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

  const synchroniserSelection = useCallback((patients: PatientFilePharmacie[]) => {
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

export function useSelectionPharmacie() {
  const contexte = useContext(Contexte);
  if (!contexte) {
    throw new Error(
      "useSelectionPharmacie doit être dans FournisseurSelectionPharmacie."
    );
  }
  return contexte;
}

export function useSelectionPharmacieOptionnel() {
  return useContext(Contexte);
}
