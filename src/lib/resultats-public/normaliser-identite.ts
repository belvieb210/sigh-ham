/** Normalise un nom/prénom pour comparaison insensible à la casse et aux accents. */
export function normaliserIdentite(texte: string): string {
  return texte
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function normaliserLibelleFacture(texte: string): string {
  return normaliserIdentite(texte).replace(/[^a-z0-9 ]/g, "");
}
