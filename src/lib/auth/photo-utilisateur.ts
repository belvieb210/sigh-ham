import "server-only";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

export const TAILLE_MAX_PHOTO_UTILISATEUR = 2 * 1024 * 1024;
export const TYPES_PHOTO_UTILISATEUR = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const DOSSIER_UPLOAD = path.join(process.cwd(), "public", "uploads", "utilisateurs");

function extensionDepuisMime(type: string): string {
  if (type === "image/png") return ".png";
  if (type === "image/webp") return ".webp";
  return ".jpg";
}

export function validerPhotoUtilisateur(fichier: File): string | null {
  if (!TYPES_PHOTO_UTILISATEUR.has(fichier.type)) {
    return "Format non accepté. Utilisez PNG, JPG ou WebP.";
  }
  if (fichier.size > TAILLE_MAX_PHOTO_UTILISATEUR) {
    return "La photo ne doit pas dépasser 2 Mo.";
  }
  return null;
}

export async function sauvegarderPhotoUtilisateur(
  utilisateurId: string,
  fichier: File
): Promise<string> {
  const erreur = validerPhotoUtilisateur(fichier);
  if (erreur) throw new Error(erreur);

  await mkdir(DOSSIER_UPLOAD, { recursive: true });

  const ext = extensionDepuisMime(fichier.type);
  const nomFichier = `${utilisateurId.replace(/[^a-zA-Z0-9-]/g, "")}-${Date.now()}${ext}`;
  const cheminAbsolu = path.join(DOSSIER_UPLOAD, nomFichier);
  const buffer = Buffer.from(await fichier.arrayBuffer());
  await writeFile(cheminAbsolu, buffer);

  return `/uploads/utilisateurs/${nomFichier}`;
}

export async function supprimerPhotoUtilisateurLocale(photoUrl: string | null | undefined) {
  if (!photoUrl?.startsWith("/uploads/utilisateurs/")) return;
  const chemin = path.join(process.cwd(), "public", photoUrl);
  try {
    await unlink(chemin);
  } catch {
    /* déjà absente */
  }
}
