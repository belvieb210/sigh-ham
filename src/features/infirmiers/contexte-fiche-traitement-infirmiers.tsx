"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { FicheTraitementResume } from "@/lib/infirmiers/types-fiche-traitement";

interface ContexteFicheTraitementInfirmiers {
  ficheActive: FicheTraitementResume | null;
  fichesDossier: FicheTraitementResume[];
  definirFicheActive: (fiche: FicheTraitementResume | null) => void;
  definirFichesDossier: (fiches: FicheTraitementResume[]) => void;
  rafraichirFichesDossier: (dossierId: string) => Promise<FicheTraitementResume[]>;
  actionEnCours: boolean;
  definirActionEnCours: (v: boolean) => void;
  messagePanneau: string | null;
  definirMessagePanneau: (msg: string | null) => void;
}

const Contexte = createContext<ContexteFicheTraitementInfirmiers | null>(null);

export function FournisseurFicheTraitementInfirmiers({ children }: { children: ReactNode }) {
  const [ficheActive, setFicheActive] = useState<FicheTraitementResume | null>(null);
  const [fichesDossier, setFichesDossier] = useState<FicheTraitementResume[]>([]);
  const [actionEnCours, setActionEnCours] = useState(false);
  const [messagePanneau, setMessagePanneau] = useState<string | null>(null);

  const rafraichirFichesDossier = useCallback(async (dossierId: string) => {
    const res = await fetch(
      `/api/infirmiers/fiches-traitement?dossierId=${encodeURIComponent(dossierId)}`
    );
    const data = (await res.json()) as {
      fiches?: FicheTraitementResume[];
      erreur?: string;
    };
    if (!res.ok) {
      throw new Error(data.erreur ?? "Impossible de charger les fiches.");
    }
    const fiches = data.fiches ?? [];
    setFichesDossier(fiches);
    return fiches;
  }, []);

  const valeur = useMemo(
    () => ({
      ficheActive,
      fichesDossier,
      definirFicheActive: setFicheActive,
      definirFichesDossier: setFichesDossier,
      rafraichirFichesDossier,
      actionEnCours,
      definirActionEnCours: setActionEnCours,
      messagePanneau,
      definirMessagePanneau: setMessagePanneau,
    }),
    [ficheActive, fichesDossier, rafraichirFichesDossier, actionEnCours, messagePanneau]
  );

  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function useFicheTraitementInfirmiers() {
  const ctx = useContext(Contexte);
  if (!ctx) {
    throw new Error(
      "useFicheTraitementInfirmiers doit être utilisé dans FournisseurFicheTraitementInfirmiers"
    );
  }
  return ctx;
}

export function useFicheTraitementInfirmiersOptionnel() {
  return useContext(Contexte);
}
