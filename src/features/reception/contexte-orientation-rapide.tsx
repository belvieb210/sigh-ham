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
  definirOrientation: (value: string) => void;
}

const ContexteOrientation = createContext<ContexteOrientationRapide | null>(null);

export function FournisseurOrientationRapide({ children }: { children: ReactNode }) {
  const [orientation, setOrientation] = useState("INFIRMIERS");

  const definirOrientation = useCallback((value: string) => {
    setOrientation(value);
  }, []);

  const valeur = useMemo(
    () => ({ orientation, definirOrientation }),
    [orientation, definirOrientation]
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
