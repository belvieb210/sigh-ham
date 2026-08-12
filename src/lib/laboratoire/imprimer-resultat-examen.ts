/**
 * Impression PDF d'un résultat d'examen laboratoire.
 * À brancher sur l'API Next.js / migration de pdf_resultat.php (voir pdf_resultat.md).
 */
export interface OptionsImpressionResultatExamen {
  dossierId: string;
  examenId: string;
  /** Identifiant patient SIGH (passage / dossier) — pour la future route PDF */
  numeroPatient?: string;
  /** Impression groupée : plusieurs examens d'un même patient */
  examenIds?: string[];
}

export async function imprimerResultatExamenLaboratoire(
  options: OptionsImpressionResultatExamen
): Promise<{ ok: boolean; erreur?: string }> {
  const ids =
    options.examenIds && options.examenIds.length > 0
      ? options.examenIds
      : [options.examenId];

  // Prochaine étape : GET /api/laboratoire/resultats/pdf?dossier=…&examIds=…
  void ids;
  void options.dossierId;
  void options.numeroPatient;

  return {
    ok: false,
    erreur: "impression_non_branchee",
  };
}
