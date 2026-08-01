import "server-only";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const TAILLE_MAX_PHOTO_OCTETS = 2 * 1024 * 1024;
export const TYPES_PHOTO_AUTORISES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
]);

const DOSSIER_UPLOAD = path.join(process.cwd(), "public", "uploads", "patients");

function extensionDepuisMime(type: string): string {
  if (type === "image/png") return ".png";
  return ".jpg";
}

export function validerPhotoPatient(fichier: File): string | null {
  if (!TYPES_PHOTO_AUTORISES.has(fichier.type)) {
    return "Format non accepté. Utilisez PNG ou JPG.";
  }
  if (fichier.size > TAILLE_MAX_PHOTO_OCTETS) {
    return "La photo ne doit pas dépasser 2 Mo.";
  }
  return null;
}

export async function sauvegarderPhotoPatient(
  numeroPatient: string,
  fichier: File
): Promise<string> {
  const erreur = validerPhotoPatient(fichier);
  if (erreur) throw new Error(erreur);

  await mkdir(DOSSIER_UPLOAD, { recursive: true });

  const ext = extensionDepuisMime(fichier.type);
  const nomFichier = `${numeroPatient.replace(/[^a-zA-Z0-9-]/g, "")}-${Date.now()}${ext}`;
  const cheminAbsolu = path.join(DOSSIER_UPLOAD, nomFichier);

  const buffer = Buffer.from(await fichier.arrayBuffer());
  await writeFile(cheminAbsolu, buffer);

  return `/uploads/patients/${nomFichier}`;
}
