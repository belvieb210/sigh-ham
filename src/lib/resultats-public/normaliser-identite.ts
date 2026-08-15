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

/** Compare les numéros en ne gardant que les chiffres (9 derniers pour RDC). */
export function normaliserTelephone(texte: string): string {
  const chiffres = texte.replace(/\D/g, "");
  if (chiffres.length <= 9) return chiffres;
  return chiffres.slice(-9);
}

export function telephonesCorrespondent(
  saisi: string,
  enBase: string | null | undefined
): boolean {
  const a = normaliserTelephone(saisi);
  const b = normaliserTelephone(enBase ?? "");
  if (!a || !b) return false;
  return a === b || a.endsWith(b) || b.endsWith(a);
}
