"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CLASSE_CHAMP_RECEPTION } from "@/constants/reception";
import { cn } from "@/lib/utils";

const MOIS_FR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
] as const;

function joursDansMois(annee: number, mois: number): number {
  if (!annee || !mois) return 31;
  return new Date(annee, mois, 0).getDate();
}

function parserDateIso(valeur: string): { jour: string; mois: string; annee: string } {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valeur?.trim() ?? "");
  if (!m) return { jour: "", mois: "", annee: "" };
  return { annee: m[1]!, mois: m[2]!, jour: m[3]! };
}

function composerDateIso(jour: string, mois: string, annee: string): string {
  if (!jour || !mois || !annee) return "";
  const j = Number(jour);
  const mo = Number(mois);
  const a = Number(annee);
  if (!j || !mo || !a) return "";
  const max = joursDansMois(a, mo);
  const jourValide = Math.min(j, max);
  return `${String(a).padStart(4, "0")}-${String(mo).padStart(2, "0")}-${String(jourValide).padStart(2, "0")}`;
}

interface PropsChampDateNaissance {
  id?: string;
  value: string;
  onChange: (valeurIso: string) => void;
  className?: string;
  required?: boolean;
  /** Année la plus ancienne (défaut 1920 — naissance) */
  anneeMin?: number;
  /** Année la plus récente (défaut année courante) */
  anneeMax?: number;
}

/**
 * Date en 3 listes Jour / Mois / Année (desktop + téléphone).
 */
export function ChampDateNaissance({
  id = "date-naissance",
  value,
  onChange,
  className,
  required = false,
  anneeMin = 1920,
  anneeMax,
}: PropsChampDateNaissance) {
  const { t } = useTranslation();
  const parse = parserDateIso(value);
  const [jour, setJour] = useState(parse.jour);
  const [mois, setMois] = useState(parse.mois);
  const [annee, setAnnee] = useState(parse.annee);

  useEffect(() => {
    const suivant = parserDateIso(value);
    setJour(suivant.jour);
    setMois(suivant.mois);
    setAnnee(suivant.annee);
  }, [value]);

  const anneeCourante = new Date().getFullYear();
  const maxAnnee = anneeMax ?? anneeCourante;
  const minAnnee = Math.min(anneeMin, maxAnnee);

  const annees = useMemo(() => {
    const liste: number[] = [];
    for (let a = maxAnnee; a >= minAnnee; a -= 1) liste.push(a);
    return liste;
  }, [maxAnnee, minAnnee]);

  const nbJours = joursDansMois(Number(annee) || 0, Number(mois) || 0);
  const jours = useMemo(
    () => Array.from({ length: nbJours }, (_, i) => String(i + 1).padStart(2, "0")),
    [nbJours]
  );

  const publier = (j: string, m: string, a: string) => {
    setJour(j);
    setMois(m);
    setAnnee(a);
    onChange(composerDateIso(j, m, a));
  };

  /** text-base (≥16px) évite le zoom iOS ; min-h-11 pour le tactile */
  const classeSelect = cn(
    CLASSE_CHAMP_RECEPTION,
    "min-h-11 appearance-none bg-[length:12px] bg-[right_0.65rem_center] bg-no-repeat pr-8 text-base sm:text-sm",
    "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 24 24%27 stroke=%27%23475569%27%3E%3Cpath stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27M19 9l-7 7-7-7%27/%3E%3C/svg%3E')]"
  );

  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      <div className="min-w-0">
        <label htmlFor={`${id}-jour`} className="sr-only">
          {t("reception.formulaire.date.jour", { defaultValue: "Jour" })}
        </label>
        <select
          id={`${id}-jour`}
          value={jour}
          required={required}
          onChange={(e) => publier(e.target.value, mois, annee)}
          className={classeSelect}
        >
          <option value="">
            {t("reception.formulaire.date.jour", { defaultValue: "Jour" })}
          </option>
          {jours.map((j) => (
            <option key={j} value={j}>
              {Number(j)}
            </option>
          ))}
        </select>
      </div>

      <div className="min-w-0">
        <label htmlFor={`${id}-mois`} className="sr-only">
          {t("reception.formulaire.date.mois", { defaultValue: "Mois" })}
        </label>
        <select
          id={`${id}-mois`}
          value={mois}
          required={required}
          onChange={(e) => publier(jour, e.target.value, annee)}
          className={classeSelect}
        >
          <option value="">
            {t("reception.formulaire.date.mois", { defaultValue: "Mois" })}
          </option>
          {MOIS_FR.map((label, index) => {
            const valeur = String(index + 1).padStart(2, "0");
            return (
              <option key={valeur} value={valeur}>
                {label}
              </option>
            );
          })}
        </select>
      </div>

      <div className="min-w-0">
        <label htmlFor={`${id}-annee`} className="sr-only">
          {t("reception.formulaire.date.annee", { defaultValue: "Année" })}
        </label>
        <select
          id={`${id}-annee`}
          value={annee}
          required={required}
          onChange={(e) => publier(jour, mois, e.target.value)}
          className={classeSelect}
        >
          <option value="">
            {t("reception.formulaire.date.annee", { defaultValue: "Année" })}
          </option>
          {annees.map((a) => (
            <option key={a} value={String(a)}>
              {a}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
