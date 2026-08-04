"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface ContexteOrientationRapide {
  orientation: string;
  orientations: string[];
  definirOrientation: (value: string) => void;
  definirOrientations: (values: string[]) => void;
}

const ContexteOrientation = createContext<ContexteOrientationRapide | null>(null);

export function FournisseurOrientationRapide({ children }: { children: ReactNode }) {
  const [orientations, setOrientations] = useState<string[]>(["INFIRMIERS"]);

  const definirOrientations = useCallback((values: string[]) => {
    setOrientations(values.length > 0 ? values : ["INFIRMIERS"]);
  }, []);

  const definirOrientation = useCallback((value: string) => {
    setOrientations([value]);
  }, []);

  const valeur = useMemo(
    () => ({
      orientation: orientations[0] ?? "INFIRMIERS",
      orientations,
      definirOrientation,
      definirOrientations,
    }),
    [orientations, definirOrientation, definirOrientations]
  );

  return <ContexteOrientation.Provider value={valeur}>{children}</ContexteOrientation.Provider>;
}

export function useOrientationRapide() {
  const contexte = useContext(ContexteOrientation);
  if (!contexte) {
    throw new Error("useOrientationRapide doit être utilisé dans FournisseurOrientationRapide.");
  }
  return contexte;
}
