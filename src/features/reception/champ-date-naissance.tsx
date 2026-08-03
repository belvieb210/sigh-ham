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

function detecterMobile(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(pointer: coarse)").matches ||
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 0 && window.innerWidth < 768)
  );
}

interface PropsChampDateNaissance {
  id?: string;
  value: string;
  onChange: (valeurIso: string) => void;
  className?: string;
  required?: boolean;
}

/**
 * Date de naissance :
 * - Mobile : input type="date" natif (format téléphone fiable)
 * - Desktop : listes Jour / Mois / Année (choix d'année rapide)
 */
export function ChampDateNaissance({
  id = "date-naissance",
  value,
  onChange,
  className,
  required = false,
}: PropsChampDateNaissance) {
  const { t } = useTranslation();
  const [mobile, setMobile] = useState(false);
  const parse = parserDateIso(value);
  const [jour, setJour] = useState(parse.jour);
  const [mois, setMois] = useState(parse.mois);
  const [annee, setAnnee] = useState(parse.annee);

  useEffect(() => {
    setMobile(detecterMobile());
  }, []);

  useEffect(() => {
    const suivant = parserDateIso(value);
    setJour(suivant.jour);
    setMois(suivant.mois);
    setAnnee(suivant.annee);
  }, [value]);

  const anneeCourante = new Date().getFullYear();
  const annees = useMemo(() => {
    const liste: number[] = [];
    for (let a = anneeCourante; a >= 1920; a -= 1) liste.push(a);
    return liste;
  }, [anneeCourante]);

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

  const classeSelect = cn(CLASSE_CHAMP_RECEPTION, "min-h-11 text-base sm:text-sm");

  if (mobile) {
    return (
      <div className={className}>
        <input
          id={id}
          type="date"
          value={value || ""}
          required={required}
          max={`${anneeCourante}-12-31`}
          min="1920-01-01"
          onChange={(e) => onChange(e.target.value)}
          className={cn(CLASSE_CHAMP_RECEPTION, "min-h-11 text-base")}
        />
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      <div>
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

      <div>
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

      <div>
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
