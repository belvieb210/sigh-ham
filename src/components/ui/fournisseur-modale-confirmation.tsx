"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import {
  ModaleConfirmation,
  type VarianteModaleConfirmation,
} from "@/components/ui/modale-confirmation";

type OptionsConfirmation = {
  titre: string;
  description: string;
  libelleConfirmer?: string;
  libelleAnnuler?: string;
  variante?: VarianteModaleConfirmation;
  onConfirmer: () => void | Promise<void>;
};

type ContexteModaleConfirmation = {
  demanderConfirmation: (options: OptionsConfirmation) => void;
};

const Contexte = createContext<ContexteModaleConfirmation | null>(null);

export function FournisseurModaleConfirmation({
  children,
}: {
  children: ReactNode;
}) {
  const [modale, setModale] = useState<OptionsConfirmation | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const fermer = useCallback(() => {
    if (enCours) return;
    setModale(null);
    setErreur(null);
  }, [enCours]);

  const demanderConfirmation = useCallback((options: OptionsConfirmation) => {
    setErreur(null);
    setModale(options);
  }, []);

  const confirmer = useCallback(async () => {
    if (!modale) return;
    setEnCours(true);
    setErreur(null);
    try {
      await modale.onConfirmer();
      setModale(null);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setEnCours(false);
    }
  }, [modale]);

  return (
    <Contexte.Provider value={{ demanderConfirmation }}>
      {children}
      <ModaleConfirmation
        ouverte={Boolean(modale)}
        onFermer={fermer}
        onConfirmer={confirmer}
        titre={modale?.titre ?? ""}
        description={modale?.description ?? ""}
        libelleConfirmer={modale?.libelleConfirmer ?? "Confirmer"}
        libelleAnnuler={modale?.libelleAnnuler ?? "Annuler"}
        variante={modale?.variante ?? "danger"}
        enCours={enCours}
        erreur={erreur}
      />
    </Contexte.Provider>
  );
}

export function useDemanderConfirmation() {
  const ctx = useContext(Contexte);
  if (!ctx) {
    throw new Error(
      "useDemanderConfirmation doit être utilisé dans FournisseurModaleConfirmation"
    );
  }
  return ctx.demanderConfirmation;
}
