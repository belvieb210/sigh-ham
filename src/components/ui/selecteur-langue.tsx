"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { LANGUES_DISPONIBLES } from "@/constants/navigation";
import { useLangue } from "@/hooks/use-langue";
import type { CodeLangue } from "@/locales/types";
import { cn } from "@/lib/utils";

const BASE_DRAPEAU =
  "inline-flex h-5 w-5 shrink-0 overflow-hidden rounded-full border border-gris-bordure/80";

/** Pastilles colorées (couleurs nationales) pour les langues sans drapeau détaillé */
const COULEURS_DRAPEAU: Partial<Record<CodeLangue, string>> = {
  en: "bg-[#012169] text-white",
  ln: "bg-[#007FFF] text-[#F7D117]",
  sw: "bg-[#009639] text-[#FCD116]",
  kg: "bg-[#DC241F] text-[#F7D117]",
  lua: "bg-[#007A33] text-[#FCD116]",
  es: "bg-[#AA151B] text-[#F1BF00]",
  de: "bg-[#000000] text-[#FFCE00]",
  hi: "bg-[#FF9933] text-white",
  pt: "bg-[#006600] text-[#FF0000]",
  zh: "bg-[#DE2910] text-[#FFDE00]",
  he: "bg-[#0038B8] text-white",
  ar: "bg-[#006C35] text-white",
};

function DrapeauLangue({ code, className }: { code: CodeLangue; className?: string }) {
  if (code === "fr") {
    return (
      <span className={cn(BASE_DRAPEAU, className)} aria-hidden>
        <span className="flex h-full w-full">
          <span className="w-1/3 bg-[#002395]" />
          <span className="w-1/3 bg-white" />
          <span className="w-1/3 bg-[#ED2939]" />
        </span>
      </span>
    );
  }

  if (code === "zh") {
    return (
      <span className={cn(BASE_DRAPEAU, "bg-[#DE2910]", className)} aria-hidden>
        <span className="flex h-full w-full items-center justify-center">
          <span className="text-[8px] font-bold leading-none text-[#FFDE00]">★</span>
        </span>
      </span>
    );
  }

  if (code === "he") {
    return (
      <span className={cn(BASE_DRAPEAU, "bg-white", className)} aria-hidden>
        <span className="flex h-full w-full flex-col">
          <span className="h-[28%] bg-[#0038B8]" />
          <span className="flex flex-1 items-center justify-center bg-white text-[6px] text-[#0038B8]">
            ✡
          </span>
          <span className="h-[28%] bg-[#0038B8]" />
        </span>
      </span>
    );
  }

  if (code === "ar") {
    return (
      <span className={cn(BASE_DRAPEAU, className)} aria-hidden>
        <span className="flex h-full w-full">
          <span className="w-1/3 bg-[#007A3D]" />
          <span className="w-1/3 bg-white" />
          <span className="w-1/3 bg-[#CE1126]" />
        </span>
      </span>
    );
  }

  const couleur = COULEURS_DRAPEAU[code] ?? "bg-gris-tres-clair text-texte-principal";

  return (
    <span
      className={cn(
        BASE_DRAPEAU,
        "items-center justify-center text-[7px] font-bold",
        couleur,
        className
      )}
      aria-hidden
    >
      {code.toUpperCase()}
    </span>
  );
}

interface PropsSelecteurLangue {
  className?: string;
  variante?: "compacte" | "contour";
}

export function SelecteurLangue({ className, variante = "contour" }: PropsSelecteurLangue) {
  const conteneurRef = useRef<HTMLDivElement>(null);
  const [ouvert, setOuvert] = useState(false);
  const { langueActuelle, changerLangue } = useLangue();

  const langueCourante =
    LANGUES_DISPONIBLES.find((langue) => langue.code === langueActuelle) ??
    LANGUES_DISPONIBLES[0];

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!conteneurRef.current?.contains(event.target as Node)) {
        setOuvert(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const selectionner = (code: CodeLangue) => {
    changerLangue(code);
    setOuvert(false);
  };

  return (
    <div ref={conteneurRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOuvert((value) => !value)}
        className={cn(
          "flex items-center gap-1.5 rounded-lg text-[13px] font-medium text-texte-principal transition-colors",
          variante === "contour"
            ? "border border-gris-bordure px-2.5 py-1.5 hover:bg-gris-tres-clair"
            : "px-2 py-2 hover:bg-gris-tres-clair"
        )}
        aria-expanded={ouvert}
        aria-haspopup="listbox"
        aria-label={langueCourante.libelle}
      >
        <DrapeauLangue code={langueActuelle} />
        <span>{langueCourante.libelle}</span>
        <ChevronDown className="h-3.5 w-3.5 text-texte-secondaire" />
      </button>

      <AnimatePresence>
        {ouvert && (
          <motion.ul
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute right-0 top-full z-50 mt-1 max-h-[min(360px,70vh)] min-w-[148px] overflow-y-auto rounded-lg border border-gris-bordure bg-white py-1 shadow-lg"
            role="listbox"
          >
            {LANGUES_DISPONIBLES.map((langue) => (
              <li key={langue.code}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-gris-tres-clair",
                    langue.code === langueActuelle && "font-semibold text-bleu-medical"
                  )}
                  role="option"
                  aria-selected={langue.code === langueActuelle}
                  onClick={() => selectionner(langue.code as CodeLangue)}
                >
                  <DrapeauLangue code={langue.code as CodeLangue} />
                  {langue.libelle}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
