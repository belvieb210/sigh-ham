/** Ordre d'affichage catalogue — indépendant de l'enregistrement (clé = parametreTypeExamenId). */

const ORDRE_MALARIA_GE = [
  "GOUTTE EPAISSE",
  "ETALEMENT MINCE",
  "TROPHOZOIDE",
  "GAMÉTOCYTE",
  "GAMETOCYTE",
  "SCHIZONTE",
  "PLASMODIUM FALCIPARUM",
  "PLASMODIUM MALARIAE",
  "PLASMODIUM OVALE",
  "PLASMODIUM VIVAX",
  "DENSITE PARASITAIRE",
] as const;

function cleOrdre(nom: string): string {
  return nom
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

function indexOrdre(formulaire: string, nom: string): number | null {
  if (formulaire === "malaria_ge") {
    const cle = cleOrdre(nom);
    const idx = ORDRE_MALARIA_GE.findIndex((n) => cleOrdre(n) === cle);
    return idx >= 0 ? idx : null;
  }
  return null;
}

/** Tri stable par formulaire (fallback si ordre BDD pas encore migré). */
export function trierParametresParFormulaire<
  T extends { nom: string; ordre: number }
>(formulaire: string | null | undefined, parametres: T[]): T[] {
  if (!formulaire) return parametres;

  return parametres.slice().sort((a, b) => {
    const ia = indexOrdre(formulaire, a.nom);
    const ib = indexOrdre(formulaire, b.nom);
    if (ia !== null && ib !== null) return ia - ib;
    if (ia !== null) return -1;
    if (ib !== null) return 1;
    return a.ordre - b.ordre || a.nom.localeCompare(b.nom, "fr");
  });
}
