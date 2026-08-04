"use client";

import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  ClipboardPlus,
  FileSearch,
  History,
  IdCard,
  MessageSquarePlus,
  MessagesSquare,
  Files,
} from "lucide-react";
import { useMonteClient } from "@/hooks/use-monte-client";
import { cn } from "@/lib/utils";

export type IdActionContextuelleLabo =
  | "voirDonneesRapport"
  | "ajouterCommentaire"
  | "voirCommentaires"
  | "ficheTravail"
  | "ajouterResultat"
  | "historiqueRapport"
  | "comparaisonDiagnostique";

const ACTIONS: {
  id: IdActionContextuelleLabo;
  icone: typeof FileSearch;
}[] = [
  { id: "voirDonneesRapport", icone: FileSearch },
  { id: "ajouterCommentaire", icone: MessageSquarePlus },
  { id: "voirCommentaires", icone: MessagesSquare },
  { id: "ficheTravail", icone: IdCard },
  { id: "ajouterResultat", icone: ClipboardPlus },
  { id: "historiqueRapport", icone: History },
  { id: "comparaisonDiagnostique", icone: Files },
];

interface PropsMenuContextuelLaboratoire {
  ouvert: boolean;
  x: number;
  y: number;
  onFermer: () => void;
  onAction: (id: IdActionContextuelleLabo) => void;
}

export function MenuContextuelLaboratoire({
  ouvert,
  x,
  y,
  onFermer,
  onAction,
}: PropsMenuContextuelLaboratoire) {
  const { t } = useTranslation();
  const monte = useMonteClient();
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: x, top: y });

  useLayoutEffect(() => {
    if (!ouvert || !ref.current) {
      setPos({ left: x, top: y });
      return;
    }
    const rect = ref.current.getBoundingClientRect();
    const left = Math.min(x, window.innerWidth - rect.width - 8);
    const top = Math.min(y, window.innerHeight - rect.height - 8);
    setPos({ left: Math.max(8, left), top: Math.max(8, top) });
  }, [ouvert, x, y]);

  useEffect(() => {
    if (!ouvert) return;
    const fermer = () => onFermer();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFermer();
    };
    window.addEventListener("click", fermer);
    window.addEventListener("scroll", fermer, true);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("click", fermer);
      window.removeEventListener("scroll", fermer, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [ouvert, onFermer]);

  if (!monte || !ouvert) return null;

  return createPortal(
    <div
      ref={ref}
      role="menu"
      className="fixed z-[80] min-w-[240px] overflow-hidden rounded-lg border border-gris-bordure bg-white py-1 shadow-xl"
      style={{ left: pos.left, top: pos.top }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {ACTIONS.map((action) => {
        const Icone = action.icone;
        return (
          <button
            key={action.id}
            type="button"
            role="menuitem"
            className={cn(
              "flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-texte-principal",
              "hover:bg-gris-tres-clair focus:bg-gris-tres-clair focus:outline-none"
            )}
            onClick={() => {
              onAction(action.id);
              onFermer();
            }}
          >
            <Icone className="h-4 w-4 shrink-0 text-texte-secondaire" strokeWidth={1.75} />
            <span>{t(`laboratoire.menuContextuel.${action.id}`)}</span>
          </button>
        );
      })}
    </div>,
    document.body
  );
}

export function utiliserMenuContextuelLabo() {
  const [menu, setMenu] = useState<{
    x: number;
    y: number;
    dossierId: string;
  } | null>(null);

  const ouvrirSurPatient = (e: MouseEvent, dossierId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setMenu({ x: e.clientX, y: e.clientY, dossierId });
  };

  const fermer = () => setMenu(null);

  return { menu, ouvrirSurPatient, fermer };
}
