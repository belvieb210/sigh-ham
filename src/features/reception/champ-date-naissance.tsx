"use client";

import { useMemo } from "react";
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
  return { annee: m[1], mois: m[2], jour: m[3] };
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
}

/**
 * Date de naissance avec listes Jour / Mois / Année
 * (évite le long parcours du calendrier natif pour choisir l'année).
 */
export function ChampDateNaissance({
  id = "date-naissance",
  value,
  onChange,
  className,
  required = false,
}: PropsChampDateNaissance) {
  const { t } = useTranslation();
  const { jour, mois, annee } = parserDateIso(value);

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

  const maj = (suivant: { jour?: string; mois?: string; annee?: string }) => {
    const j = suivant.jour ?? jour;
    const m = suivant.mois ?? mois;
    const a = suivant.annee ?? annee;
    onChange(composerDateIso(j, m, a));
  };

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
          onChange={(e) => maj({ jour: e.target.value })}
          className={CLASSE_CHAMP_RECEPTION}
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
          onChange={(e) => maj({ mois: e.target.value })}
          className={CLASSE_CHAMP_RECEPTION}
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
          onChange={(e) => maj({ annee: e.target.value })}
          className={CLASSE_CHAMP_RECEPTION}
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
