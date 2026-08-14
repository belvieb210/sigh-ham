/** Formate un entier pour l'affichage vitrine (ex. 24000 → "24K+"). */
export function formaterNombreVitrine(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0";
  if (n >= 10_000) {
    return `${Math.floor(n / 1000)}K+`;
  }
  if (n >= 1_000) {
    const k = n / 1000;
    const arrondi = k >= 10 ? Math.floor(k) : Math.round(k * 10) / 10;
    return `${arrondi}K+`;
  }
  return `${n}+`;
}
