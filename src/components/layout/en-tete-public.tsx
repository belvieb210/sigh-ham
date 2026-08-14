"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LogoHam } from "@/components/brand/logo-ham";
import { MenuLateralMobile } from "@/components/layout/menu-lateral-mobile";
import { BoutonRecherche } from "@/components/recherche/modale-recherche";
import { Bouton } from "@/components/ui/bouton";
import { SelecteurLangue } from "@/components/ui/selecteur-langue";
import { URL_CONNEXION_INTERNE } from "@/constants/navigation";
import { useLiensNavigation } from "@/hooks/use-liens-navigation";
import { cn } from "@/lib/utils";

export function EnTetePublic() {
  const { t } = useTranslation();
  const cheminActuel = usePathname();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const { principale: liensNav } = useLiensNavigation();

  return (
    <>
      <header className="en-tete-public fixed inset-x-0 top-0 z-50 border-b border-gris-bordure/80 bg-white/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/90">
        <div className="conteneur-principal">
          <div className="flex h-16 items-center justify-between gap-3 lg:hidden">
            <LogoHam taille="petit" afficherTexte />

            <div className="flex items-center gap-0.5">
              <BoutonRecherche className="!p-2" />
              <SelecteurLangue variante="compacte" />

              <button
                type="button"
                className="rounded-lg p-2 text-texte-principal"
                onClick={() => setMenuOuvert(true)}
                aria-label={t("common.ouvrirMenu")}
                aria-expanded={menuOuvert}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="hidden h-20 grid-cols-[1fr_auto_1fr] items-center gap-4 lg:grid">
            <div className="justify-self-start">
              <LogoHam taille="moyen" />
            </div>

            <nav
              className="flex items-center justify-center gap-0.5"
              aria-label={t("common.navigationPrincipale")}
            >
              {liensNav.map((lien) => (
                <Link
                  key={lien.href}
                  href={lien.href}
                  className={cn(
                    "whitespace-nowrap rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors hover:text-bleu-medical xl:px-3 xl:text-sm",
                    cheminActuel === lien.href
                      ? "text-bleu-medical"
                      : "text-texte-principal/80"
                  )}
                >
                  {lien.etiquette}
                </Link>
              ))}
            </nav>

            <div className="flex items-center justify-end gap-2">
              <BoutonRecherche />
              <SelecteurLangue />

              <Link href={URL_CONNEXION_INTERNE}>
                <Bouton
                  variante="primaire"
                  taille="moyen"
                  className="rounded-lg px-4 text-[13px]"
                  enTantQueEnfant
                >
                  <User className="h-4 w-4" />
                  {t("common.seConnecter")}
                </Bouton>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <MenuLateralMobile
        estOuvert={menuOuvert}
        onFermer={() => setMenuOuvert(false)}
        cheminActuel={cheminActuel}
      />
    </>
  );
}
