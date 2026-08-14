export function sanitiserSegmentNomFichierPdf(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Ex. resultat-3-examens-20260811025.pdf ou resultat-urines-routines-20260811025.pdf */
export function nomFichierResultatPdf(options: {
  numeroPatient: string;
  nbExamens: number;
  libelleExamen?: string;
}): string {
  const numero =
    sanitiserSegmentNomFichierPdf(options.numeroPatient) || "patient";

  if (options.nbExamens > 1) {
    return `resultat-${options.nbExamens}-examens-${numero}.pdf`;
  }

  const libelle = sanitiserSegmentNomFichierPdf(
    options.libelleExamen ?? "examen"
  );
  return `resultat-${libelle}-${numero}.pdf`;
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
