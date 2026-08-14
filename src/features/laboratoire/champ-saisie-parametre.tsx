"use client";

import { cn } from "@/lib/utils";
import {
  OPTION_AUTRES,
  type ConfigSaisieParametre,
  estValeurAutres,
  avecOptionAutres,
} from "@/lib/laboratoire/config-saisie-parametre";
import {
  persisterSelectAutres,
  valeurSelectAutres,
} from "@/lib/laboratoire/resoudre-config-saisie-parametre";

export type ValeursChampSaisie = {
  valeur: string;
  valeurSecondaire: string | null;
};

type Props = {
  config: ConfigSaisieParametre;
  valeurs: ValeursChampSaisie;
  disabled?: boolean;
  onChange: (patch: Partial<ValeursChampSaisie>) => void;
  /** Styles indicateur (bordure unique) — remplace le contour gris par défaut */
  fieldClassName?: string;
  className?: string;
};

const DEFAULT_FIELD =
  "rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm w-full min-w-0 min-h-[2.25rem] outline-none ring-0 transition-colors focus:ring-2 text-slate-900";

const FIELD_BASE =
  "rounded-lg border px-2 py-1.5 text-sm w-full min-w-0 min-h-[2.25rem] outline-none ring-0 transition-colors focus:ring-2 text-slate-900";

const OPTIONS_RESULTAT_DEFAUT = avecOptionAutres(["Négatif", "Positif"]);

export function ChampSaisieParametre({
  config,
  valeurs,
  disabled,
  onChange,
  fieldClassName,
  className = "",
}: Props) {
  const field = fieldClassName
    ? cn(FIELD_BASE, "bg-white", fieldClassName)
    : DEFAULT_FIELD;
  const { typeSaisie, options = [], libelleSecondaire, placeholderSecondaire } =
    config;

  if (typeSaisie === "select" || typeSaisie === "select_autres") {
    const avecAutres = typeSaisie === "select_autres";
    const selection = avecAutres
      ? valeurSelectAutres(valeurs.valeur, valeurs.valeurSecondaire)
      : valeurs.valeur;
    const afficherPreciser =
      avecAutres &&
      (selection === OPTION_AUTRES || estValeurAutres(valeurs.valeur));

    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        <select
          className={field}
          value={selection}
          disabled={disabled}
          onChange={(e) => {
            const v = e.target.value;
            if (avecAutres) {
              onChange(
                persisterSelectAutres(
                  v,
                  v === OPTION_AUTRES ? (valeurs.valeurSecondaire ?? "") : ""
                )
              );
            } else {
              onChange({ valeur: v, valeurSecondaire: null });
            }
          }}
        >
          <option value="">—</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {afficherPreciser && (
          <input
            type="text"
            className={field}
            value={valeurs.valeurSecondaire ?? ""}
            disabled={disabled}
            placeholder="Préciser…"
            onChange={(e) => {
              onChange(persisterSelectAutres(OPTION_AUTRES, e.target.value));
            }}
          />
        )}
      </div>
    );
  }

  if (typeSaisie === "resultat_valeur") {
    const opts =
      options.length > 0 ? options : OPTIONS_RESULTAT_DEFAUT;
    const selection =
      !valeurs.valeur.trim()
        ? ""
        : opts.includes(valeurs.valeur)
          ? valeurs.valeur
          : OPTION_AUTRES;
    const preciserResultat =
      selection === OPTION_AUTRES && !opts.includes(valeurs.valeur)
        ? valeurs.valeur === OPTION_AUTRES
          ? ""
          : valeurs.valeur
        : "";

    return (
      <div className={`flex flex-wrap items-center gap-x-2 gap-y-1.5 ${className}`}>
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">
          Résultat
        </span>
        <select
          className={cn(field, "min-w-[5.5rem] flex-1")}
          value={selection}
          disabled={disabled}
          onChange={(e) => {
            const v = e.target.value;
            if (v === OPTION_AUTRES) {
              onChange({ valeur: OPTION_AUTRES });
            } else {
              onChange({ valeur: v });
            }
          }}
        >
          <option value="">—</option>
          {opts.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {selection === OPTION_AUTRES && (
          <input
            type="text"
            className={cn(field, "min-w-[5rem] flex-1")}
            value={preciserResultat}
            disabled={disabled}
            placeholder="Préciser…"
            onChange={(e) => {
              const txt = e.target.value.trim();
              onChange({ valeur: txt || OPTION_AUTRES });
            }}
          />
        )}
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">
          {libelleSecondaire ?? "Valeurs"}
        </span>
        <input
          type="text"
          className={cn(field, "min-w-[5rem] flex-1")}
          value={valeurs.valeurSecondaire ?? ""}
          disabled={disabled}
          placeholder={placeholderSecondaire ?? "Titre/Valeur"}
          onChange={(e) =>
            onChange({ valeurSecondaire: e.target.value || null })
          }
          aria-label={libelleSecondaire ?? "Valeur secondaire"}
        />
      </div>
    );
  }

  if (typeSaisie === "description") {
    return (
      <textarea
        className={cn(field, "min-h-[4rem] resize-y", className)}
        value={valeurs.valeur}
        disabled={disabled}
        rows={3}
        onChange={(e) => onChange({ valeur: e.target.value })}
      />
    );
  }

  if (typeSaisie === "date") {
    return (
      <input
        type="date"
        className={cn(field, className)}
        value={valeurs.valeur}
        disabled={disabled}
        onChange={(e) => onChange({ valeur: e.target.value })}
      />
    );
  }

  return (
    <input
      type="text"
      className={cn(field, className)}
      value={valeurs.valeur}
      disabled={disabled}
      onChange={(e) => onChange({ valeur: e.target.value })}
    />
  );
}
