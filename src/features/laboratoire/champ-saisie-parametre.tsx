"use client";

import {
  OPTION_AUTRES,
  OPTIONS_FLAG_BNE,
  type ConfigSaisieParametre,
  estValeurAutres,
} from "@/lib/laboratoire/config-saisie-parametre";
import {
  persisterSelectAutres,
  valeurSelectAutres,
} from "@/lib/laboratoire/resoudre-config-saisie-parametre";

export type ValeursChampSaisie = {
  valeur: string;
  flag: string | null;
  valeurSecondaire: string | null;
};

type Props = {
  config: ConfigSaisieParametre;
  valeurs: ValeursChampSaisie;
  disabled?: boolean;
  onChange: (patch: Partial<ValeursChampSaisie>) => void;
  className?: string;
};

const selectClass =
  "rounded border border-gray-300 bg-white px-2 py-1 text-sm min-w-0";
const inputClass =
  "rounded border border-gray-300 px-2 py-1 text-sm w-full min-w-0";

export function ChampSaisieParametre({
  config,
  valeurs,
  disabled,
  onChange,
  className = "",
}: Props) {
  const { typeSaisie, options = [], libelleSecondaire, placeholderSecondaire } =
    config;

  if (typeSaisie === "flag_valeur") {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        <select
          className={`${selectClass} w-16 shrink-0`}
          value={valeurs.flag ?? ""}
          disabled={disabled}
          onChange={(e) =>
            onChange({ flag: e.target.value || null })
          }
          aria-label="Flag B N E"
        >
          <option value="">—</option>
          {OPTIONS_FLAG_BNE.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          className={`${inputClass} flex-1 min-w-[6rem]`}
          value={valeurs.valeur}
          disabled={disabled}
          onChange={(e) => onChange({ valeur: e.target.value })}
          placeholder="Valeur"
        />
      </div>
    );
  }

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
          className={selectClass}
          value={selection}
          disabled={disabled}
          onChange={(e) => {
            const v = e.target.value;
            if (avecAutres) {
              const p = persisterSelectAutres(
                v,
                v === OPTION_AUTRES ? (valeurs.valeurSecondaire ?? "") : ""
              );
              onChange(p);
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
            className={inputClass}
            value={valeurs.valeurSecondaire ?? ""}
            disabled={disabled}
            placeholder="Préciser…"
            onChange={(e) => {
              const p = persisterSelectAutres(OPTION_AUTRES, e.target.value);
              onChange(p);
            }}
          />
        )}
      </div>
    );
  }

  if (typeSaisie === "resultat_valeur") {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        <select
          className={`${selectClass} min-w-[7rem] flex-1`}
          value={valeurs.valeur}
          disabled={disabled}
          onChange={(e) => onChange({ valeur: e.target.value })}
        >
          <option value="">Résultat</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <input
          type="text"
          className={`${inputClass} min-w-[6rem] flex-1`}
          value={valeurs.valeurSecondaire ?? ""}
          disabled={disabled}
          placeholder={placeholderSecondaire ?? libelleSecondaire ?? "Valeur"}
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
        className={`${inputClass} min-h-[4rem] resize-y ${className}`}
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
        className={`${inputClass} ${className}`}
        value={valeurs.valeur}
        disabled={disabled}
        onChange={(e) => onChange({ valeur: e.target.value })}
      />
    );
  }

  return (
    <input
      type="text"
      className={`${inputClass} ${className}`}
      value={valeurs.valeur}
      disabled={disabled}
      onChange={(e) => onChange({ valeur: e.target.value })}
    />
  );
}
