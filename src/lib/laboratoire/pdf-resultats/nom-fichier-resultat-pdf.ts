export function sanitiserSegmentNomFichierPdf(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Ex. resultat-OLIVIER-BOKULU-20260811025.pdf ou resultat-3-examens-OLIVIER-BOKULU-20260811025.pdf */
export function nomFichierResultatPdf(options: {
  numeroPatient: string;
  nbExamens: number;
  nom?: string;
  prenom?: string;
  /** Ancien format interne — ignoré si nom/prénom fournis. */
  libelleExamen?: string;
}): string {
  const numero =
    sanitiserSegmentNomFichierPdf(options.numeroPatient) || "patient";

  const segmentNom =
    options.nom && options.prenom
      ? sanitiserSegmentNomFichierPdf(`${options.nom}-${options.prenom}`)
      : sanitiserSegmentNomFichierPdf(options.libelleExamen ?? "patient");

  if (options.nbExamens > 1) {
    return `resultat-${options.nbExamens}-examens-${segmentNom}-${numero}.pdf`;
  }

  return `resultat-${segmentNom}-${numero}.pdf`;
}

export function extraireNomFichierContentDisposition(
  header: string | null
): string | null {
  if (!header) return null;
  const match = /filename\*=UTF-8''([^;]+)|filename="([^"]+)"|filename=([^;]+)/i.exec(
    header
  );
  const brut = match?.[1] ?? match?.[2] ?? match?.[3];
  if (!brut) return null;
  try {
    return decodeURIComponent(brut.trim());
  } catch {
    return brut.trim();
  }
}
