"use client";

import Link from "next/link";
import { useEffect } from "react";
import { X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Bouton } from "@/components/ui/bouton";
import { LogoHam } from "@/components/brand/logo-ham";
import { URL_CONNEXION_INTERNE } from "@/constants/navigation";
import { useLiensNavigation } from "@/hooks/use-liens-navigation";
import { cn } from "@/lib/utils";

interface PropsMenuLateralMobile {
  estOuvert: boolean;
  onFermer: () => void;
  cheminActuel: string;
}

export function MenuLateralMobile({
  estOuvert,
  onFermer,
  cheminActuel,
}: PropsMenuLateralMobile) {
  const { t } = useTranslation();
  const { principale: liensNav } = useLiensNavigation();

  useEffect(() => {
    if (estOuvert) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [estOuvert]);

  useEffect(() => {
    const fermerSurEchap = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFermer();
    };
    if (estOuvert) {
      window.addEventListener("keydown", fermerSurEchap);
    }
    return () => window.removeEventListener("keydown", fermerSurEchap);
  }, [estOuvert, onFermer]);

  return (
    <AnimatePresence>
      {estOuvert && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="menu-lateral-overlay fixed inset-0 z-[60] bg-black/40 lg:hidden"
            onClick={onFermer}
            aria-hidden="true"
          />

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
            className="menu-lateral-panneau fixed right-0 top-0 z-[70] flex h-full w-[min(320px,85vw)] flex-col bg-white shadow-2xl lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label={t("common.navigationPrincipale")}
          >
            <div className="flex items-center justify-between border-b border-gris-bordure px-5 py-4">
              <LogoHam taille="petit" afficherTexte />
              <button
                type="button"
                onClick={onFermer}
                className="rounded-lg p-2 text-texte-secondaire transition-colors hover:bg-gris-tres-clair hover:text-texte-principal"
                aria-label={t("common.fermerMenu")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label={t("common.navigationMobile")}>
              <ul className="flex flex-col gap-1">
                {liensNav.map((lien) => (
                  <li key={lien.href}>
                    <Link
                      href={lien.href}
                      onClick={onFermer}
                      className={cn(
                        "block rounded-xl px-4 py-3.5 text-[15px] font-medium transition-colors",
                        cheminActuel === lien.href
                          ? "bg-bleu-medical-clair text-bleu-medical"
                          : "text-texte-principal hover:bg-gris-tres-clair"
                      )}
                    >
                      {lien.etiquette}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="border-t border-gris-bordure p-5">
              <Link href={URL_CONNEXION_INTERNE} onClick={onFermer}>
                <Bouton variante="primaire" taille="grand" className="w-full rounded-xl" enTantQueEnfant>
                  <User className="h-4 w-4" />
                  {t("common.seConnecter")}
                </Bouton>
              </Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
