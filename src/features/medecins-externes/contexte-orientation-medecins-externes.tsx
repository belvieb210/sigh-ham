"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface ContexteOrientationMedecinsExternes {
  orientation: string;
  orientations: string[];
  definirOrientation: (value: string) => void;
  definirOrientations: (values: string[]) => void;
}

const Contexte = createContext<ContexteOrientationMedecinsExternes | null>(null);

export function FournisseurOrientationMedecinsExternes({ children }: { children: ReactNode }) {
  const [orientations, setOrientations] = useState<string[]>([]);

  const definirOrientations = useCallback((values: string[]) => {
    setOrientations(values);
  }, []);

  const definirOrientation = useCallback((value: string) => {
    setOrientations([value]);
  }, []);

  const valeur = useMemo(
    () => ({
      orientation: orientations[0] ?? "",
      orientations,
      definirOrientation,
      definirOrientations,
    }),
    [orientations, definirOrientation, definirOrientations]
  );

  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function useOrientationMedecinsExternes() {
  const contexte = useContext(Contexte);
  if (!contexte) {
    throw new Error(
      "useOrientationMedecinsExternes doit être dans FournisseurOrientationMedecinsExternes."
    );
  }
  return contexte;
}
