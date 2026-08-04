"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface ContexteOrientationPharmacie {
  orientation: string;
  orientations: string[];
  definirOrientation: (value: string) => void;
  definirOrientations: (values: string[]) => void;
}

const Contexte = createContext<ContexteOrientationPharmacie | null>(null);

export function FournisseurOrientationPharmacie({ children }: { children: ReactNode }) {
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

export function useOrientationPharmacie() {
  const contexte = useContext(Contexte);
  if (!contexte) {
    throw new Error(
      "useOrientationPharmacie doit être dans FournisseurOrientationPharmacie."
    );
  }
  return contexte;
}
