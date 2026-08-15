/** Dossier créé en vente directe pharmacie (walk-in, sans parcours hospitalier). */
export function estClientWalkInPharmacie(numeroDossier: string): boolean {
  return numeroDossier.startsWith("PH-");
}

export function libelleTypePersonneCaisse(numeroDossier: string): "CLIENT" | "PATIENT" {
  return estClientWalkInPharmacie(numeroDossier) ? "CLIENT" : "PATIENT";
}

/** N° affiché : dossier PH-* pour un client walk-in, n° patient hospitalier sinon. */
export function numeroIdentitePersonne(
  numeroDossier: string,
  numeroPatient: string
): string {
  if (estClientWalkInPharmacie(numeroDossier)) {
    return numeroDossier;
  }
  return numeroPatient;
}

export function libelleIdentitePersonne(numeroDossier: string): "Client" | "Patient" {
  return estClientWalkInPharmacie(numeroDossier) ? "Client" : "Patient";
}
