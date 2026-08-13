/** Métadonnées persistées dans `ExamenLaboratoire.notes` (hors orientation / remarque). */

export const MARQUEUR_PIECES_JOINTES = "laboPj=";

export interface PieceJointeExamenPersistee {
  nom: string;
  url: string;
  mimeType: string;
  taille?: number;
}

export function lirePiecesJointesDepuisNotes(
  notes: string | null | undefined
): PieceJointeExamenPersistee[] {
  if (!notes) return [];
  const m = notes.match(/laboPj=(\[[\s\S]*?\])(?=\s|$)/);
  if (!m?.[1]) return [];
  try {
    const parsed = JSON.parse(m[1]) as PieceJointeExamenPersistee[];
    return Array.isArray(parsed) ? parsed.filter((p) => p?.url && p?.nom) : [];
  } catch {
    return [];
  }
}

export function ecrirePiecesJointesDansNotes(
  notes: string | null | undefined,
  pieces: PieceJointeExamenPersistee[]
): string {
  const sansPj = retirerPiecesJointesDesNotes(notes);
  if (!pieces.length) return sansPj;
  const blob = `${MARQUEUR_PIECES_JOINTES}${JSON.stringify(pieces)}`;
  return sansPj ? `${sansPj} ${blob}` : blob;
}

export function retirerPiecesJointesDesNotes(notes: string | null | undefined): string {
  return (notes ?? "").replace(/\s*laboPj=\[[\s\S]*?\](?=\s|$)/g, " ").trim();
}
