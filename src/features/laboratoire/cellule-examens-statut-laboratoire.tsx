"use client";

import { useTranslation } from "react-i18next";
import type { IdOrientationStatutAnalyse } from "@/constants/laboratoire-orientations";
import {
  couleurStatutAnalyse,
  examensPourPageStatut,
  statutAnalyseDepuisExamen,
} from "@/features/laboratoire/utils-affichage";
import type { ExamenFileLaboratoire } from "@/lib/laboratoire/types";
import { cn } from "@/lib/utils";

interface PropsCelluleExamensStatutLaboratoire {
  examens: ExamenFileLaboratoire[];
  pageStatut?: IdOrientationStatutAnalyse;
  max?: number;
  afficherLibelle?: boolean;
}

function BadgeStatutExamen({ statut }: { statut: IdOrientationStatutAnalyse }) {
  const { t } = useTranslation();
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
        couleurStatutAnalyse(statut)
      )}
    >
      {t(`laboratoire.orientationsStatut.${statut}.label`)}
    </span>
  );
}

function filtrerExamens(
  examens: ExamenFileLaboratoire[],
  pageStatut?: IdOrientationStatutAnalyse
) {
  return pageStatut ? examensPourPageStatut(examens, pageStatut) : examens;
}

/** Noms d'examens (sans badge), filtrés par page si besoin. */
export function CelluleListeExamens({
  examens,
  pageStatut,
  max = 6,
}: Omit<PropsCelluleExamensStatutLaboratoire, "afficherLibelle">) {
  const source = filtrerExamens(examens, pageStatut);

  if (source.length === 0) {
    return <span className="text-xs text-texte-secondaire">—</span>;
  }

  const visibles = source.slice(0, max);
  const reste = source.length - visibles.length;

  return (
    <ul className="space-y-1.5">
      {visibles.map((ex) => (
        <li
          key={ex.id}
          className="truncate text-xs font-medium text-texte-principal"
        >
          {ex.libelle}
        </li>
      ))}
      {reste > 0 && (
        <li className="text-[10px] text-texte-secondaire">+{reste}</li>
      )}
    </ul>
  );
}

/** Badges de statut uniques (un seul « Reçus » si plusieurs examens reçus). */
export function CelluleBadgesStatutExamens({
  examens,
  pageStatut,
}: Pick<PropsCelluleExamensStatutLaboratoire, "examens" | "pageStatut">) {
  const source = filtrerExamens(examens, pageStatut);

  if (source.length === 0) {
    return <span className="text-xs text-texte-secondaire">—</span>;
  }

  const statutsUniques = [
    ...new Set(
      source.map((ex) => statutAnalyseDepuisExamen(ex.statut, ex.notes))
    ),
  ];

  return (
    <div className="flex flex-wrap gap-1.5">
      {statutsUniques.map((statut) => (
        <BadgeStatutExamen key={statut} statut={statut} />
      ))}
    </div>
  );
}

/** Liste d'examens avec badge par examen (vue mobile). */
export function CelluleExamensStatutLaboratoire({
  examens,
  pageStatut,
  max = 6,
  afficherLibelle = true,
}: PropsCelluleExamensStatutLaboratoire) {
  const source = filtrerExamens(examens, pageStatut);

  if (source.length === 0) {
    return <span className="text-xs text-texte-secondaire">—</span>;
  }

  const visibles = source.slice(0, max);
  const reste = source.length - visibles.length;

  return (
    <ul className="space-y-1.5">
      {visibles.map((ex) => {
        const statut = statutAnalyseDepuisExamen(ex.statut, ex.notes);
        return (
          <li
            key={ex.id}
            className={cn(
              "flex min-w-0 flex-wrap items-center gap-1.5",
              afficherLibelle ? "justify-between" : "justify-start"
            )}
          >
            {afficherLibelle && (
              <span className="min-w-0 flex-1 truncate text-xs font-medium text-texte-principal">
                {ex.libelle}
              </span>
            )}
            <BadgeStatutExamen statut={statut} />
          </li>
        );
      })}
      {reste > 0 && (
        <li className="text-[10px] text-texte-secondaire">+{reste}</li>
      )}
    </ul>
  );
}
