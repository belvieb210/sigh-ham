"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { ModaleRecherche } from "@/components/recherche/modale-recherche";

interface ContexteRecherche {
  ouvrir: () => void;
  fermer: () => void;
}

const RechercheContext = createContext<ContexteRecherche | null>(null);

function estRouteAuth(pathname: string) {
  return pathname === "/connexion" || pathname.startsWith("/connexion/");
}

export function FournisseurRecherche({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [ouverte, setOuverte] = useState(false);

  const ouvrir = useCallback(() => setOuverte(true), []);
  const fermer = useCallback(() => setOuverte(false), []);
  const basculer = useCallback(() => setOuverte((v) => !v), []);

  useEffect(() => {
    if (estRouteAuth(pathname)) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        basculer();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [basculer, pathname]);

  return (
    <RechercheContext.Provider value={{ ouvrir, fermer }}>
      {children}
      {!estRouteAuth(pathname) && (
        <ModaleRecherche ouverte={ouverte} onFermer={fermer} />
      )}
    </RechercheContext.Provider>
  );
}

export function useRecherche() {
  const ctx = useContext(RechercheContext);
  if (!ctx) {
    throw new Error("useRecherche doit être utilisé dans FournisseurRecherche");
  }
  return ctx;
}
