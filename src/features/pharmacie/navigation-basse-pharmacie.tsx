"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { MoreHorizontal } from "lucide-react";
import { useNavigationPharmacie } from "@/hooks/use-navigation-pharmacie";
import { cn } from "@/lib/utils";

interface PropsNavigationBassePharmacie {
  onMenu: () => void;
}

export function NavigationBassePharmacie({ onMenu }: PropsNavigationBassePharmacie) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { basse } = useNavigationPharmacie();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gris-bordure bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(15,23,42,0.08)] lg:hidden"
      aria-label={t("pharmacie.layout.navigationMobile")}
    >
      <ul className="flex items-end justify-around px-1 pt-1">
        {basse.map((item) => {
          const actif =
            pathname === item.href ||
            (item.id === "accueil" && pathname === "/sigh/pharmacie") ||
            (item.id === "patients" && pathname.startsWith("/sigh/pharmacie/patients")) ||
            (item.id === "vente" && pathname.startsWith("/sigh/pharmacie/vente")) ||
            (item.id === "nouveauClient" &&
              pathname.startsWith("/sigh/pharmacie/nouveau-client"));
          const Icone = item.icone;
          const estFab = "fab" in item && item.fab;

          if (estFab) {
            return (
              <li key={item.id} className="relative -mt-5 flex-1">
                <Link
                  href={item.href}
                  className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-bleu-medical text-white shadow-lg shadow-bleu-medical/30"
                  aria-label={item.etiquette}
                >
                  <Icone className="h-6 w-6" aria-hidden />
                </Link>
              </li>
            );
          }

          return (
            <li key={item.id} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-medium transition-colors",
                  actif ? "text-bleu-medical" : "text-texte-secondaire"
                )}
              >
                <Icone className={cn("h-5 w-5", actif && "stroke-[2.5]")} aria-hidden />
                <span className="max-w-[4.5rem] truncate text-center text-[9px] leading-tight sm:max-w-[72px] sm:text-[10px]">
                  {item.etiquette}
                </span>
              </Link>
            </li>
          );
        })}
        <li className="flex-1">
          <button
            type="button"
            onClick={onMenu}
            className="flex w-full flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-medium text-texte-secondaire"
          >
            <MoreHorizontal className="h-5 w-5" aria-hidden />
            <span>{t("pharmacie.navBas.menu")}</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
