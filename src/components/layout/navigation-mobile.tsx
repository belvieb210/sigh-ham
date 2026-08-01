"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Stethoscope, Calendar, Megaphone, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLiensNavigation } from "@/hooks/use-liens-navigation";
import { cn } from "@/lib/utils";

const CARTE_ICONES_NAV_MOBILE = {
  accueil: Home,
  services: Stethoscope,
  rdv: Calendar,
  campagnes: Megaphone,
  contact: Phone,
} as const;

export function NavigationMobile() {
  const { t } = useTranslation();
  const cheminActuel = usePathname();
  const { mobile: liensNav } = useLiensNavigation();

  return (
    <nav
      className="navigation-mobile fixed bottom-0 left-0 right-0 z-40 border-t border-gris-bordure bg-white lg:hidden"
      aria-label={t("common.navigationMobile")}
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="flex items-stretch justify-around px-1 pt-1.5 pb-2">
        {liensNav.map((lien) => {
          const Icone = CARTE_ICONES_NAV_MOBILE[lien.icone];
          const estActif = cheminActuel === lien.href;

          return (
            <li key={lien.href} className="flex-1">
              <Link
                href={lien.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 rounded-lg py-1 text-[10px] font-medium transition-colors",
                  estActif ? "text-bleu-medical" : "text-texte-secondaire"
                )}
              >
                <Icone
                  className={cn("h-[22px] w-[22px]", estActif && "stroke-[2.5]")}
                  strokeWidth={estActif ? 2.5 : 1.75}
                />
                <span>{lien.etiquette}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
