/** Parse un poids en kg (accepte virgule) et valide la plage DECIMAL(5,2). */
export function parserPoidsKg(
  valeur: unknown
): { ok: true; poidsKg: number | null } | { ok: false; message: string } {
  if (valeur == null || valeur === "") {
    return { ok: true, poidsKg: null };
  }

  const brut = String(valeur).trim().replace(",", ".");
  if (!brut) {
    return { ok: true, poidsKg: null };
  }

  const n = Number.parseFloat(brut);
  if (!Number.isFinite(n)) {
    return { ok: false, message: "Poids invalide : saisissez un nombre en kg." };
  }
  if (n < 0 || n > 999.99) {
    return {
      ok: false,
      message: "Poids invalide : la valeur doit être entre 0 et 999,99 kg.",
    };
  }

  return { ok: true, poidsKg: Math.round(n * 100) / 100 };
}
