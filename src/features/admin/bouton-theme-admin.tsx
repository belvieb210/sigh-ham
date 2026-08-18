"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";

export function BoutonThemeAdmin({
  sombre,
  onBasculer,
}: {
  sombre: boolean;
  onBasculer: () => void;
}) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={onBasculer}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gris-bordure text-texte-secondaire transition-colors hover:bg-gris-tres-clair hover:text-bleu-medical"
      title={sombre ? t("admin.layout.modeClair") : t("admin.layout.modeSombre")}
      aria-label={
        sombre ? t("admin.layout.modeClair") : t("admin.layout.modeSombre")
      }
    >
      {sombre ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
