export function arrondirMontantCaisse(montant: number) {
  if (!Number.isFinite(montant)) return 0;
  return Math.round(montant * 100) / 100;
}

export function formaterMontantCaisse(montant: number, devise = "USD", locale = "fr-FR") {
  const n = arrondirMontantCaisse(montant);
  const corps = n.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (devise === "CDF") return `${corps} FCFA`;
  return `${corps} $`;
}

export function formaterPrixFc(montant: number, locale = "fr-FR") {
  const n = Number.isFinite(montant) ? Math.round(montant) : 0;
  return `${n.toLocaleString(locale)} Fc`;
}

/** Prix médicaments : Fc (pas FCFA). USD uniquement si la vente est en dollars. */
export function formaterMontantPharmacie(
  montant: number,
  devise = "CDF",
  locale = "fr-FR"
) {
  if (devise === "USD") return formaterMontantCaisse(montant, "USD", locale);
  return formaterPrixFc(montant, locale);
}

export function formaterHeure(iso: string, locale = "fr-FR") {
  try {
    return new Date(iso).toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export function formaterDate(iso: string | Date = new Date(), locale = "fr-FR") {
  try {
    const d = typeof iso === "string" ? new Date(iso) : iso;
    return d.toLocaleDateString(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export function calculerAge(dateNaissanceIso: string | null): number | null {
  if (!dateNaissanceIso) return null;
  const naissance = new Date(dateNaissanceIso);
  if (Number.isNaN(naissance.getTime())) return null;
  const aujourdHui = new Date();
  let age = aujourdHui.getFullYear() - naissance.getFullYear();
  const m = aujourdHui.getMonth() - naissance.getMonth();
  if (m < 0 || (m === 0 && aujourdHui.getDate() < naissance.getDate())) age -= 1;
  return age >= 0 ? age : null;
}

/** Âge affiché : calculé depuis la date de naissance, sinon âge déclaré en base. */
export function resoudreAgePatient(opts: {
  dateNaissance?: string | Date | null;
  age?: number | null;
}): number | null {
  const brut = opts.dateNaissance;
  const iso =
    brut instanceof Date
      ? Number.isNaN(brut.getTime())
        ? null
        : brut.toISOString()
      : brut?.trim()
        ? brut
        : null;
  return calculerAge(iso) ?? (typeof opts.age === "number" ? opts.age : null);
}

/** Parse un âge déclaré (0–150). Chaîne vide → null. */
export function parserAgeDeclare(brut: unknown): number | null {
  if (brut === null || brut === undefined) return null;
  const texte = String(brut).trim();
  if (!texte) return null;
  const n = Number(texte);
  if (!Number.isFinite(n) || !Number.isInteger(n)) return null;
  if (n < 0 || n > 150) return null;
  return n;
}

export function initiales(prenom: string, nom: string) {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}
