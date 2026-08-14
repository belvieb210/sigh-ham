"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CLASSE_CHAMP_RECEPTION, CLASSE_LABEL_RECEPTION } from "@/constants/reception";
import { cn } from "@/lib/utils";

const CLASSE_CHAMP_CONNEXION =
  "w-full rounded-xl border border-gris-bordure bg-white py-3 pl-10 pr-11 text-sm text-texte-principal transition-colors placeholder:text-texte-secondaire/60 focus:border-bleu-medical focus:outline-none focus:ring-2 focus:ring-bleu-medical/20";

interface PropsChampMotDePasse
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  id: string;
  label: string;
  erreur?: string;
  variant?: "connexion" | "reception";
}

export function ChampMotDePasse({
  id,
  label,
  erreur,
  className,
  variant = "connexion",
  autoComplete = "current-password",
  ...props
}: PropsChampMotDePasse) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const reception = variant === "reception";

  return (
    <div>
      <label
        htmlFor={id}
        className={
          reception
            ? CLASSE_LABEL_RECEPTION
            : "mb-1.5 block text-sm font-semibold text-texte-principal"
        }
      >
        {label}
      </label>
      <div className="relative">
        {!reception ? (
          <Lock
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-texte-secondaire"
            aria-hidden
          />
        ) : null}
        <input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          className={cn(
            reception ? `${CLASSE_CHAMP_RECEPTION} pr-11` : CLASSE_CHAMP_CONNEXION,
            erreur && "border-red-400 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
          aria-invalid={erreur ? true : undefined}
          aria-describedby={erreur ? `${id}-erreur` : undefined}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-texte-secondaire transition-colors hover:bg-gris-tres-clair hover:text-bleu-medical"
          aria-label={
            visible
              ? t("connexion.masquerMotDePasse")
              : t("connexion.afficherMotDePasse")
          }
          tabIndex={0}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" aria-hidden />
          ) : (
            <Eye className="h-4 w-4" aria-hidden />
          )}
        </button>
      </div>
      {erreur && (
        <p id={`${id}-erreur`} className="mt-1.5 text-xs text-red-600" role="alert">
          {erreur}
        </p>
      )}
    </div>
  );
}
