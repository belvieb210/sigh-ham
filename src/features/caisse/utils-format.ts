export function formaterMontantCaisse(montant: number, devise = "USD", locale = "fr-CD") {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: devise === "CDF" ? "CDF" : "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(montant);
  } catch {
    return `${montant.toFixed(2)} $`;
  }
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
  return age;
}

export function initiales(prenom: string, nom: string) {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}
