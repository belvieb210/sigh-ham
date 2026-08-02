"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { MoreHorizontal } from "lucide-react";
import { useNavigationCaisse } from "@/hooks/use-navigation-caisse";
import { cn } from "@/lib/utils";

interface PropsNavigationBasseCaisse {
  onMenu: () => void;
}

export function NavigationBasseCaisse({ onMenu }: PropsNavigationBasseCaisse) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { basse } = useNavigationCaisse();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gris-bordure bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(15,23,42,0.08)] lg:hidden"
      aria-label={t("caisse.layout.navigationMobile")}
    >
      <ul className="flex items-stretch justify-around px-1 pt-1">
        {basse.map((item) => {
          const actif =
            pathname === item.href ||
            (item.id === "accueil" && pathname === "/sigh/caisse") ||
            (item.id === "facturation" && pathname.startsWith("/sigh/caisse/facturation")) ||
            (item.id === "patients" && pathname.startsWith("/sigh/caisse/patients")) ||
            (item.id === "encaissements" && pathname.startsWith("/sigh/caisse/encaissements"));
          const Icone = item.icone;
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
                <span className="max-w-[72px] truncate text-center leading-tight">
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
            <span>{t("caisse.layout.menu")}</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
