"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ChevronDown,
  Copy,
  Forward,
  Loader2,
  Pencil,
  Pin,
  Reply,
  Trash2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { MessageConversation } from "@/lib/messagerie/types";
import { cn } from "@/lib/utils";

interface PropsMenuActionsMessage {
  message: MessageConversation;
  estMoi: boolean;
  epingle: boolean;
  peutModifier: boolean;
  onRepondre: () => void;
  onCopier: () => void;
  onTransférer: () => void;
  onEpingle: () => void;
  onModifier: () => void;
  onSupprimer: (portee: "moi" | "tous") => void | Promise<void>;
  alignement: "gauche" | "droite";
}

interface PositionMenu {
  top: number;
  left: number;
}

export function MenuActionsMessage({
  message,
  estMoi,
  epingle,
  peutModifier,
  onRepondre,
  onCopier,
  onTransférer,
  onEpingle,
  onModifier,
  onSupprimer,
  alignement,
}: PropsMenuActionsMessage) {
  const { t } = useTranslation();
  const [ouvert, setOuvert] = useState(false);
  const [sousMenuSuppression, setSousMenuSuppression] = useState(false);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const [position, setPosition] = useState<PositionMenu | null>(null);
  const boutonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const calculerPosition = useCallback(() => {
    const bouton = boutonRef.current;
    if (!bouton) return;
    const rect = bouton.getBoundingClientRect();
    const largeurMenu = 220;
    const marge = 8;
    let left =
      alignement === "droite" ? rect.right - largeurMenu : rect.left;
    left = Math.max(marge, Math.min(left, window.innerWidth - largeurMenu - marge));
    setPosition({ top: rect.bottom + 4, left });
  }, [alignement]);

  useEffect(() => {
    if (!ouvert) return;
    calculerPosition();
    const onScroll = () => calculerPosition();
    const onResize = () => calculerPosition();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [ouvert, calculerPosition]);

  useEffect(() => {
    if (!ouvert) return;
    const fermer = (e: MouseEvent) => {
      const cible = e.target as Node;
      if (
        boutonRef.current?.contains(cible) ||
        menuRef.current?.contains(cible)
      ) {
        return;
      }
      setOuvert(false);
      setSousMenuSuppression(false);
    };
    document.addEventListener("mousedown", fermer);
    return () => document.removeEventListener("mousedown", fermer);
  }, [ouvert]);

  const executerSuppression = async (portee: "moi" | "tous") => {
    setSuppressionEnCours(true);
    try {
      await onSupprimer(portee);
    } finally {
      setSuppressionEnCours(false);
      setOuvert(false);
      setSousMenuSuppression(false);
    }
  };

  if (message.supprime) return null;

  const items = [
    {
      icone: Reply,
      label: t("reception.messagerie.actionsMessage.repondre"),
      action: () => {
        onRepondre();
        setOuvert(false);
      },
    },
    {
      icone: Copy,
      label: t("reception.messagerie.actionsMessage.copier"),
      action: () => {
        onCopier();
        setOuvert(false);
      },
      disabled: !message.contenu.trim(),
    },
    {
      icone: Forward,
      label: t("reception.messagerie.actionsMessage.transferer"),
      action: () => {
        onTransférer();
        setOuvert(false);
      },
    },
    {
      icone: Pin,
      label: epingle
        ? t("reception.messagerie.actionsMessage.desepingle")
        : t("reception.messagerie.actionsMessage.epingle"),
      action: () => {
        onEpingle();
        setOuvert(false);
      },
    },
    ...(peutModifier
      ? [
          {
            icone: Pencil,
            label: t("reception.messagerie.actionsMessage.modifier"),
            action: () => {
              onModifier();
              setOuvert(false);
            },
            disabled: false,
          },
        ]
      : []),
    {
      icone: Trash2,
      label: t("reception.messagerie.actionsMessage.supprimer"),
      action: () => setSousMenuSuppression(true),
      danger: true,
    },
  ];

  const menuPortal =
    ouvert &&
    position &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        ref={menuRef}
        role="menu"
        style={{ top: position.top, left: position.left }}
        className="fixed z-[9999] min-w-[220px] rounded-xl border border-gris-bordure bg-white py-1 shadow-xl"
      >
        {!sousMenuSuppression ? (
          items.map(({ icone: Icone, label, action, disabled, danger }) => (
            <button
              key={label}
              type="button"
              role="menuitem"
              disabled={disabled}
              onClick={action}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-texte-principal transition hover:bg-gris-tres-clair disabled:opacity-40",
                danger && "text-red-600 hover:bg-red-50"
              )}
            >
              <Icone className="h-4 w-4 shrink-0 opacity-70" />
              {label}
            </button>
          ))
        ) : (
          <div className="py-1">
            <p className="px-4 py-2 text-xs font-semibold text-texte-secondaire">
              {t("reception.messagerie.actionsMessage.supprimerTitre")}
            </p>
            <button
              type="button"
              role="menuitem"
              disabled={suppressionEnCours}
              onClick={() => void executerSuppression("moi")}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-texte-principal hover:bg-gris-tres-clair"
            >
              {suppressionEnCours ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 opacity-70" />
              )}
              {t("reception.messagerie.actionsMessage.supprimerPourMoi")}
            </button>
            {estMoi && (
              <button
                type="button"
                role="menuitem"
                disabled={suppressionEnCours}
                onClick={() => void executerSuppression("tous")}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
              >
                {suppressionEnCours ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {t("reception.messagerie.actionsMessage.supprimerPourTous")}
              </button>
            )}
            <button
              type="button"
              onClick={() => setSousMenuSuppression(false)}
              className="mt-1 w-full border-t border-gris-bordure px-4 py-2 text-center text-xs text-texte-secondaire hover:bg-gris-tres-clair"
            >
              {t("reception.messagerie.annuler")}
            </button>
          </div>
        )}
      </div>,
      document.body
    );

  return (
    <>
      <div
        className={cn(
          "absolute top-0.5 z-30 transition-opacity",
          /* Mobile / tactile : bouton toujours visible (pas de hover) */
          "opacity-100",
          /* Desktop : visible au survol ou focus du message */
          "md:opacity-0 md:group-hover/message:opacity-100 md:group-focus-within/message:opacity-100",
          alignement === "droite" ? "right-0.5 md:right-1" : "left-0.5 md:left-1",
          ouvert && "opacity-100"
        )}
      >
        <button
          ref={boutonRef}
          type="button"
          onClick={() => {
            setOuvert((v) => {
              const next = !v;
              if (next) {
                setSousMenuSuppression(false);
                requestAnimationFrame(() => calculerPosition());
              }
              return next;
            });
          }}
          className={cn(
            "flex items-center justify-center rounded-md shadow-sm transition",
            /* Zone tactile confortable sur mobile */
            "h-8 w-8 md:h-6 md:w-6",
            estMoi
              ? "bg-bleu-medical-fonce/90 text-white hover:bg-bleu-medical-fonce"
              : "border border-gris-bordure/80 bg-white text-texte-secondaire hover:bg-gris-tres-clair"
          )}
          aria-label={t("reception.messagerie.actionsMessage.menu")}
          aria-expanded={ouvert}
          aria-haspopup="menu"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
      {menuPortal}
    </>
  );
}
