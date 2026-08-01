"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, MoreVertical, Shield, ShieldOff, UserMinus } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ConversationResume } from "@/lib/messagerie/types";
import { cn } from "@/lib/utils";

type Participant = ConversationResume["participants"][0];

interface PropsMenuActionsMembre {
  participant: Participant;
  nbAdmins: number;
  onRetirer: () => void | Promise<void>;
  onPromouvoirAdmin: () => void | Promise<void>;
  onRetirerAdmin: () => void | Promise<void>;
}

interface PositionMenu {
  top: number;
  left: number;
}

export function MenuActionsMembre({
  participant,
  nbAdmins,
  onRetirer,
  onPromouvoirAdmin,
  onRetirerAdmin,
}: PropsMenuActionsMembre) {
  const { t } = useTranslation();
  const [ouvert, setOuvert] = useState(false);
  const [confirmerRetrait, setConfirmerRetrait] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [position, setPosition] = useState<PositionMenu | null>(null);
  const boutonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const estAdmin = participant.roleGroupe === "ADMIN";
  const peutRetirerAdmin = estAdmin && nbAdmins > 1;
  const peutRetirer = !estAdmin || (estAdmin && nbAdmins > 1);

  const calculerPosition = useCallback(() => {
    const bouton = boutonRef.current;
    if (!bouton) return;
    const rect = bouton.getBoundingClientRect();
    const largeurMenu = 240;
    const marge = 8;
    let left = rect.right - largeurMenu;
    left = Math.max(marge, Math.min(left, window.innerWidth - largeurMenu - marge));
    setPosition({ top: rect.bottom + 4, left });
  }, []);

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
      if (boutonRef.current?.contains(cible) || menuRef.current?.contains(cible)) return;
      setOuvert(false);
      setConfirmerRetrait(false);
    };
    document.addEventListener("mousedown", fermer);
    return () => document.removeEventListener("mousedown", fermer);
  }, [ouvert]);

  const executer = async (action: () => void | Promise<void>) => {
    setEnCours(true);
    try {
      await action();
      setOuvert(false);
      setConfirmerRetrait(false);
    } finally {
      setEnCours(false);
    }
  };

  const items: Array<{
    icone: typeof Shield;
    label: string;
    action: () => void;
    danger?: boolean;
  }> = [
    ...(!estAdmin
      ? [
          {
            icone: Shield,
            label: t("reception.messagerie.groupe.membre.promouvoirAdmin"),
            action: () => void executer(onPromouvoirAdmin),
          },
        ]
      : []),
    ...(peutRetirerAdmin
      ? [
          {
            icone: ShieldOff,
            label: t("reception.messagerie.groupe.membre.retirerAdmin"),
            action: () => void executer(onRetirerAdmin),
          },
        ]
      : []),
    ...(peutRetirer
      ? [
          {
            icone: UserMinus,
            label: t("reception.messagerie.groupe.membre.retirer"),
            action: () => setConfirmerRetrait(true),
            danger: true,
          },
        ]
      : []),
  ];

  if (items.length === 0) return null;

  const menuPortal =
    ouvert &&
    position &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        ref={menuRef}
        role="menu"
        style={{ top: position.top, left: position.left }}
        className="fixed z-[9999] min-w-[240px] rounded-xl border border-gris-bordure bg-white py-1 shadow-xl"
      >
        {!confirmerRetrait ? (
          items.map(({ icone: Icone, label, action, danger }) => (
            <button
              key={label}
              type="button"
              role="menuitem"
              disabled={enCours}
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
              {t("reception.messagerie.groupe.membre.confirmerRetrait", {
                nom: `${participant.prenom} ${participant.nom}`,
              })}
            </p>
            <button
              type="button"
              role="menuitem"
              disabled={enCours}
              onClick={() => void executer(onRetirer)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
            >
              {enCours ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserMinus className="h-4 w-4" />
              )}
              {t("reception.messagerie.groupe.membre.retirerConfirmer")}
            </button>
            <button
              type="button"
              role="menuitem"
              disabled={enCours}
              onClick={() => setConfirmerRetrait(false)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-texte-principal hover:bg-gris-tres-clair"
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
      <button
        ref={boutonRef}
        type="button"
        onClick={() => {
          setConfirmerRetrait(false);
          setOuvert((v) => !v);
        }}
        className="shrink-0 rounded-lg p-1.5 text-texte-secondaire opacity-0 transition hover:bg-gris-tres-clair group-hover:opacity-100 focus:opacity-100"
        aria-label={t("reception.messagerie.groupe.membre.actions")}
        aria-expanded={ouvert}
        aria-haspopup="menu"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {menuPortal}
    </>
  );
}
