"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { DonneesFormulairePatient } from "@/lib/reception/types";
import {
  construireResumeDepuisDonneesFormulaire,
  construireResumeDepuisFormulaire,
  RESUME_PATIENT_VIDE,
  type DonneesResumePatient,
} from "@/lib/reception/resume-patient";

interface ContexteResumePatient {
  resume: DonneesResumePatient;
  definirResume: (resume: DonneesResumePatient) => void;
  definirDepuisFormulaire: (donnees: Parameters<typeof construireResumeDepuisFormulaire>[0]) => void;
  definirDepuisDonneesCompletes: (donnees: DonneesFormulairePatient) => void;
  reinitialiserResume: () => void;
}

const ContexteResume = createContext<ContexteResumePatient | null>(null);

export function FournisseurResumePatient({ children }: { children: ReactNode }) {
  const [resume, setResume] = useState<DonneesResumePatient>(RESUME_PATIENT_VIDE);

  const definirResume = useCallback((value: DonneesResumePatient) => {
    setResume(value);
  }, []);

  const definirDepuisFormulaire = useCallback(
    (donnees: Parameters<typeof construireResumeDepuisFormulaire>[0]) => {
      setResume(construireResumeDepuisFormulaire(donnees));
    },
    []
  );

  const definirDepuisDonneesCompletes = useCallback((donnees: DonneesFormulairePatient) => {
    setResume(construireResumeDepuisDonneesFormulaire(donnees));
  }, []);

  const reinitialiserResume = useCallback(() => {
    setResume(RESUME_PATIENT_VIDE);
  }, []);

  const valeur = useMemo(
    () => ({
      resume,
      definirResume,
      definirDepuisFormulaire,
      definirDepuisDonneesCompletes,
      reinitialiserResume,
    }),
    [resume, definirResume, definirDepuisFormulaire, definirDepuisDonneesCompletes, reinitialiserResume]
  );

  return <ContexteResume.Provider value={valeur}>{children}</ContexteResume.Provider>;
}

export function useResumePatient() {
  const contexte = useContext(ContexteResume);
  if (!contexte) {
    throw new Error("useResumePatient doit être utilisé dans FournisseurResumePatient.");
  }
  return contexte;
}
