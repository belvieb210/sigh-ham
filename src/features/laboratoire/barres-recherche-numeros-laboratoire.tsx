"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, X } from "lucide-react";

export interface RechercheNumerosLabo {
  numeroPermanent: string;
  numeroPat: string;
}

const CLASSE_CHAMP =
  "flex h-11 min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm text-texte-principal shadow-sm transition-colors focus-within:border-bleu-medical focus-within:ring-2 focus-within:ring-bleu-medical/20";

function ChampRechercheNumero({
  valeur,
  onChange,
  placeholder,
  ariaLabel,
  ariaEffacer,
}: {
  valeur: string;
  onChange: (v: string) => void;
  placeholder: string;
  ariaLabel: string;
  ariaEffacer: string;
}) {
  return (
    <label className={CLASSE_CHAMP}>
      <Search className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
      <input
        type="text"
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        autoComplete="off"
        className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-500"
      />
      {valeur ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label={ariaEffacer}
          className="shrink-0 rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </label>
  );
}

export function BarresRechercheNumerosLaboratoire({
  numeroPermanent,
  numeroPat,
  onChangePermanent,
  onChangePat,
}: {
  numeroPermanent: string;
  numeroPat: string;
  onChangePermanent: (v: string) => void;
  onChangePat: (v: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex min-w-0 gap-2">
      <ChampRechercheNumero
        valeur={numeroPermanent}
        onChange={onChangePermanent}
        placeholder={t("laboratoire.filtres.placeholderPermanent")}
        ariaLabel={t("laboratoire.filtres.ariaPermanent")}
        ariaEffacer={t("laboratoire.filtres.effacerRecherche")}
      />
      <ChampRechercheNumero
        valeur={numeroPat}
        onChange={onChangePat}
        placeholder={t("laboratoire.filtres.placeholderPat")}
        ariaLabel={t("laboratoire.filtres.ariaPat")}
        ariaEffacer={t("laboratoire.filtres.effacerRecherche")}
      />
    </div>
  );
}

/** Saisie immédiate + valeurs appliquées (debounce) pour l’API. */
export function useRechercheNumerosLabo(delaiMs = 400): {
  saisie: RechercheNumerosLabo;
  applique: RechercheNumerosLabo;
  setNumeroPermanent: (v: string) => void;
  setNumeroPat: (v: string) => void;
} {
  const [saisie, setSaisie] = useState<RechercheNumerosLabo>({
    numeroPermanent: "",
    numeroPat: "",
  });
  const [applique, setApplique] = useState<RechercheNumerosLabo>({
    numeroPermanent: "",
    numeroPat: "",
  });

  useEffect(() => {
    const id = window.setTimeout(() => {
      setApplique({
        numeroPermanent: saisie.numeroPermanent.trim(),
        numeroPat: saisie.numeroPat.trim(),
      });
    }, delaiMs);
    return () => window.clearTimeout(id);
  }, [saisie.numeroPermanent, saisie.numeroPat, delaiMs]);

  return {
    saisie,
    applique,
    setNumeroPermanent: (numeroPermanent: string) =>
      setSaisie((c) => ({ ...c, numeroPermanent })),
    setNumeroPat: (numeroPat: string) => setSaisie((c) => ({ ...c, numeroPat })),
  };
}

export function queryRechercheNumerosLabo(r: RechercheNumerosLabo): string {
  const params = new URLSearchParams();
  if (r.numeroPermanent) params.set("numeroPermanent", r.numeroPermanent);
  if (r.numeroPat) params.set("numeroPat", r.numeroPat);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
