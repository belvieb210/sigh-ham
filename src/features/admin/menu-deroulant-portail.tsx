"use client";

import { useEffect, useLayoutEffect, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";

export function MenuDeroulantPortail({
  ouvert,
  ancre,
  onFermer,
  children,
}: {
  ouvert: boolean;
  ancre: HTMLElement | null;
  onFermer: () => void;
  children: ReactNode;
}) {
  const [style, setStyle] = useState<CSSProperties>({});

  useLayoutEffect(() => {
    if (!ouvert || !ancre) return;
    const placer = () => {
      const rect = ancre.getBoundingClientRect();
      const largeur = 228;
      const hauteurEstimee = 196;
      const espaceBas = window.innerHeight - rect.bottom - 12;
      const ouvrirHaut = espaceBas < hauteurEstimee && rect.top > espaceBas;
      const right = Math.max(8, window.innerWidth - rect.right);
      setStyle(
        ouvrirHaut
          ? {
              position: "fixed",
              right,
              bottom: window.innerHeight - rect.top + 8,
              width: largeur,
              zIndex: 80,
            }
          : {
              position: "fixed",
              right,
              top: rect.bottom + 8,
              width: largeur,
              zIndex: 80,
            }
      );
    };
    placer();
    window.addEventListener("resize", placer);
    window.addEventListener("scroll", placer, true);
    return () => {
      window.removeEventListener("resize", placer);
      window.removeEventListener("scroll", placer, true);
    };
  }, [ouvert, ancre]);

  useEffect(() => {
    if (!ouvert) return;
    const fermer = (e: MouseEvent) => {
      const cible = e.target as Node;
      if (ancre?.contains(cible)) return;
      const menu = document.getElementById("menu-actions-portail-admin");
      if (menu?.contains(cible)) return;
      onFermer();
    };
    document.addEventListener("mousedown", fermer);
    return () => document.removeEventListener("mousedown", fermer);
  }, [ouvert, ancre, onFermer]);

  if (!ouvert || !ancre) return null;

  return createPortal(
    <div
      id="menu-actions-portail-admin"
      role="menu"
      style={style}
      className="overflow-hidden rounded-lg border border-gris-bordure bg-white py-1 shadow-lg"
    >
      {children}
    </div>,
    document.body
  );
}
