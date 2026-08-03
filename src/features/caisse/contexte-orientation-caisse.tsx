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
  definirOrientation: (value: string) => void;
}

const Contexte = createContext<ContexteOrientationCaisse | null>(null);

export function FournisseurOrientationCaisse({ children }: { children: ReactNode }) {
  const [orientation, setOrientation] = useState("LABORATOIRE");

  const definirOrientation = useCallback((value: string) => {
    setOrientation(value);
  }, []);

  const valeur = useMemo(
    () => ({ orientation, definirOrientation }),
    [orientation, definirOrientation]
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
