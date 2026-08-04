"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface ContexteOrientationCaisse {
  orientation: string;
  orientations: string[];
  definirOrientation: (value: string) => void;
  definirOrientations: (values: string[]) => void;
}

const Contexte = createContext<ContexteOrientationCaisse | null>(null);

export function FournisseurOrientationCaisse({ children }: { children: ReactNode }) {
  const [orientations, setOrientations] = useState<string[]>(["LABORATOIRE"]);

  const definirOrientations = useCallback((values: string[]) => {
    setOrientations(values.length > 0 ? values : ["LABORATOIRE"]);
  }, []);

  const definirOrientation = useCallback((value: string) => {
    setOrientations([value]);
  }, []);

  const valeur = useMemo(
    () => ({
      orientation: orientations[0] ?? "LABORATOIRE",
      orientations,
      definirOrientation,
      definirOrientations,
    }),
    [orientations, definirOrientation, definirOrientations]
  );

  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function useOrientationCaisse() {
  const contexte = useContext(Contexte);
  if (!contexte) {
    throw new Error("useOrientationCaisse doit être dans FournisseurOrientationCaisse.");
  }
  return contexte;
}
