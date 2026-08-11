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
  /** Filtre page (Reçus, En cours…) — n'affiche que les examens concernés */
  pageStatut?: IdOrientationStatutAnalyse;
  max?: number;
  /** Afficher le libellé d'examen à côté du badge */
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

/** Liste d'examens avec badge de statut propre à chaque examen. */
export function CelluleExamensStatutLaboratoire({
  examens,
  pageStatut,
  max = 6,
  afficherLibelle = true,
}: PropsCelluleExamensStatutLaboratoire) {
  const source = pageStatut
    ? examensPourPageStatut(examens, pageStatut)
    : examens;

  if (source.length === 0) {
    return <span className="text-xs text-texte-secondaire">—</span>;
  }

  const visibles = source.slice(0, max);
  const reste = source.length - visibles.length;

  return (
    <ul className="space-y-1.5">
      {visibles.map((ex) => {
        const statut = statutAnalyseDepuisExamen(ex.statut);
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

/** Noms d'examens (sans badge), alignés avec CelluleBadgesStatutExamens. */
export function CelluleListeExamens({
  examens,
  pageStatut,
  max = 6,
}: Omit<PropsCelluleExamensStatutLaboratoire, "afficherLibelle">) {
  const source = pageStatut
    ? examensPourPageStatut(examens, pageStatut)
    : examens;

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

/** Badges de statut uniquement (colonne statut quand les noms sont ailleurs). */
export function CelluleBadgesStatutExamens({
  examens,
  pageStatut,
  max = 6,
}: Omit<PropsCelluleExamensStatutLaboratoire, "afficherLibelle">) {
  return (
    <CelluleExamensStatutLaboratoire
      examens={examens}
      pageStatut={pageStatut}
      max={max}
      afficherLibelle={false}
    />
  );
}
