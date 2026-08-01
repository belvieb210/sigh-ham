"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import { cn } from "@/lib/utils";

export type VarianteModaleConfirmation = "danger" | "avertissement" | "info";

interface PropsModaleConfirmation {
  ouverte: boolean;
  onFermer: () => void;
  onConfirmer: () => void | Promise<void>;
  titre: string;
  description: string;
  libelleConfirmer?: string;
  libelleAnnuler?: string;
  libelleFermer?: string;
  enCours?: boolean;
  erreur?: string | null;
  variante?: VarianteModaleConfirmation;
  /** Empêche la fermeture pendant une action en cours */
  bloquerFermeture?: boolean;
}

const STYLES_VARIANTE: Record<
  VarianteModaleConfirmation,
  { icone: string; bouton: "danger" | "primaire" | "vert" }
> = {
  danger: {
    icone: "bg-red-50 text-red-600",
    bouton: "danger",
  },
  avertissement: {
    icone: "bg-amber-50 text-amber-700",
    bouton: "primaire",
  },
  info: {
    icone: "bg-bleu-medical-clair text-bleu-medical",
    bouton: "primaire",
  },
};

export function ModaleConfirmation({
  ouverte,
  onFermer,
  onConfirmer,
  titre,
  description,
  libelleConfirmer = "Confirmer",
  libelleAnnuler = "Annuler",
  libelleFermer = "Fermer",
  enCours = false,
  erreur = null,
  variante = "danger",
  bloquerFermeture = true,
}: PropsModaleConfirmation) {
  const style = STYLES_VARIANTE[variante];

  return (
    <Dialog.Root
      open={ouverte}
      onOpenChange={(open) => {
        if (!open && (!bloquerFermeture || !enCours)) onFermer();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[120] bg-black/45 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[121] w-[min(calc(100vw-2rem),440px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-gris-bordure bg-white shadow-xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          onClick={(e) => e.stopPropagation()}
          onPointerDownOutside={(e) => {
            if (bloquerFermeture && enCours) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (bloquerFermeture && enCours) e.preventDefault();
          }}
        >
          <div className="flex items-start justify-between gap-3 border-b border-gris-bordure px-5 py-4">
            <div className="flex min-w-0 items-start gap-3">
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                  style.icone
                )}
              >
                <AlertTriangle className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 pt-0.5">
                <Dialog.Title className="text-base font-bold text-texte-principal">
                  {titre}
                </Dialog.Title>
                <Dialog.Description className="mt-1.5 text-sm leading-relaxed text-texte-secondaire">
                  {description}
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                disabled={enCours && bloquerFermeture}
                className="rounded-lg p-2 text-texte-secondaire transition-colors hover:bg-gris-tres-clair hover:text-texte-principal disabled:opacity-40"
                aria-label={libelleFermer}
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {erreur && (
            <div className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {erreur}
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 px-5 py-4 sm:flex-row sm:justify-end">
            <Bouton
              type="button"
              variante="contour"
              taille="petit"
              disabled={enCours}
              onClick={onFermer}
            >
              {libelleAnnuler}
            </Bouton>
            <Bouton
              type="button"
              variante={style.bouton}
              taille="petit"
              disabled={enCours}
              onClick={() => void onConfirmer()}
            >
              {enCours ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {libelleConfirmer}
                </>
              ) : (
                libelleConfirmer
              )}
            </Bouton>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
