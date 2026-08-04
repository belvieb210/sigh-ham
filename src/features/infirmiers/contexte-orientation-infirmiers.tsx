"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface ContexteOrientationInfirmiers {
  orientation: string;
  orientations: string[];
  definirOrientation: (value: string) => void;
  definirOrientations: (values: string[]) => void;
}

const Contexte = createContext<ContexteOrientationInfirmiers | null>(null);

export function FournisseurOrientationInfirmiers({ children }: { children: ReactNode }) {
  const [orientations, setOrientations] = useState<string[]>(["MEDECINS"]);

  const definirOrientations = useCallback((values: string[]) => {
    setOrientations(values.length > 0 ? values : ["MEDECINS"]);
  }, []);

  const definirOrientation = useCallback((value: string) => {
    setOrientations([value]);
  }, []);

  const valeur = useMemo(
    () => ({
      orientation: orientations[0] ?? "MEDECINS",
      orientations,
      definirOrientation,
      definirOrientations,
    }),
    [orientations, definirOrientation, definirOrientations]
  );

  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function useOrientationInfirmiers() {
  const contexte = useContext(Contexte);
  if (!contexte) {
    throw new Error(
      "useOrientationInfirmiers doit être dans FournisseurOrientationInfirmiers."
    );
  }
  return contexte;
}
