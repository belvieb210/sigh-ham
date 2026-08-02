export function formaterMontantCaisse(montant: number, devise = "CDF", locale = "fr-CD") {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: devise === "USD" ? "USD" : "CDF",
      maximumFractionDigits: 0,
    }).format(montant);
  } catch {
    return `${Math.round(montant).toLocaleString("fr-FR")} ${devise}`;
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
