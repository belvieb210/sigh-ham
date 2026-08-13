import type { LigneParametrePdf } from "@/lib/laboratoire/pdf-resultats/types";

function sansAccent(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/** Port normalizeCoagulationResults() PHP — fusionne RESULT + FLAG en une ligne. */
export function normaliserResultatsCoagulation(
  lignes: LigneParametrePdf[],
  libelleExamen: string
): LigneParametrePdf[] {
  if (lignes.length !== 2) return lignes;

  const noms = lignes.map((l) => sansAccent(l.name.trim()));
  const aResult = noms.some((n) => n === "result" || n === "resultat");
  const aFlag = noms.includes("flag");
  if (!aResult || !aFlag) return lignes;

  let rowResult: LigneParametrePdf | null = null;
  let rowFlag: LigneParametrePdf | null = null;
  for (const l of lignes) {
    const n = sansAccent(l.name.trim());
    if (n === "result" || n === "resultat") rowResult = l;
    if (n === "flag") rowFlag = l;
  }
  if (!rowResult || !rowFlag) return lignes;

  return [
    {
      name: libelleExamen,
      value: rowResult.value,
      unit: rowResult.unit,
      other: rowResult.other,
      range: rowResult.range,
      flag: rowFlag.value,
      nonRequis: false,
    },
  ];
}

export function preparerLignesPourRender(
  typeRender: string,
  lignes: LigneParametrePdf[],
  libelleExamen: string
): LigneParametrePdf[] {
  if (typeRender === "coagulation") {
    return normaliserResultatsCoagulation(lignes, libelleExamen);
  }
  return lignes;
}
