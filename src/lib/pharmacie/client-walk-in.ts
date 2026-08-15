/** Dossier créé en vente directe pharmacie (walk-in, sans parcours hospitalier). */
export function estClientWalkInPharmacie(numeroDossier: string): boolean {
  return numeroDossier.startsWith("PH-");
}

export function libelleTypePersonneCaisse(numeroDossier: string): "CLIENT" | "PATIENT" {
  return estClientWalkInPharmacie(numeroDossier) ? "CLIENT" : "PATIENT";
}
