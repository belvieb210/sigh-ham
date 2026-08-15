export function formaterPrixExamenPublic(prix: number): string {
  const arrondi = Math.round(prix);
  return `${arrondi.toLocaleString("fr-FR")} FC`;
}

export function formaterDelaiExamenPublic(delaiHeures: number): string {
  if (delaiHeures <= 2) return `${delaiHeures}h`;
  if (delaiHeures < 24) return `${delaiHeures}h`;
  if (delaiHeures === 24) return "24h";
  const jours = Math.round(delaiHeures / 24);
  return jours === 1 ? "24h" : `${jours}j`;
}
