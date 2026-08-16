"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface ContexteOrientationMedecins {
  orientation: string;
  orientations: string[];
  definirOrientation: (value: string) => void;
  definirOrientations: (values: string[]) => void;
}

const Contexte = createContext<ContexteOrientationMedecins | null>(null);

export function FournisseurOrientationMedecins({ children }: { children: ReactNode }) {
  const [orientations, setOrientations] = useState<string[]>(["CAISSE"]);

  const definirOrientations = useCallback((values: string[]) => {
    setOrientations(values.length > 0 ? values : ["CAISSE"]);
  }, []);

  const definirOrientation = useCallback((value: string) => {
    setOrientations([value]);
  }, []);

  const valeur = useMemo(
    () => ({
      orientation: orientations[0] ?? "CAISSE",
      orientations,
      definirOrientation,
      definirOrientations,
    }),
    [orientations, definirOrientation, definirOrientations]
  );

  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function useOrientationMedecins() {
  const contexte = useContext(Contexte);
  if (!contexte) {
    throw new Error(
      "useOrientationMedecins doit être dans FournisseurOrientationMedecins."
    );
  }
  return contexte;
}
