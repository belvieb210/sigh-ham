import "server-only";
import { join } from "path";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { urlFichierLocalPdf } from "@/lib/pdf/assets-pdf-serveur";

/** Résout une URL `/uploads/...` ou chemin relatif vers un fichier lisible par react-pdf. */
export function resoudreCheminFichierPdf(url: string): string | null {
  const brut = url.trim();
  if (!brut) return null;
  if (/^https?:\/\//i.test(brut)) return brut;

  const absolu = resoudreCheminAbsoluFichierPdf(url);
  if (!absolu) return null;
  return urlFichierLocalPdf(absolu);
}

/** Chemin disque absolu (conversion PDF, etc.). */
export function resoudreCheminAbsoluFichierPdf(url: string): string | null {
  const brut = url.trim();
  if (!brut) return null;
  if (/^https?:\/\//i.test(brut)) return null;

  if (brut.startsWith("file://")) {
    try {
      const local = fileURLToPath(brut);
      return existsSync(local) ? local : null;
    } catch {
      return null;
    }
  }

  const rel = brut.replace(/^\//, "");
  if (rel.startsWith("uploads/")) {
    const local = join(process.cwd(), "public", rel);
    if (existsSync(local)) return local;
  }

  const publicPath = join(process.cwd(), "public", rel);
  if (existsSync(publicPath)) return publicPath;

  if (existsSync(brut)) return brut;

  return null;
}

export function estImageAffichablePdf(mimeType: string): boolean {
  return /^image\/(jpeg|jpg|png|webp|gif)$/i.test(mimeType);
}

export function estPdfPieceJointe(
  mimeType: string,
  nomFichier?: string
): boolean {
  if (/^application\/pdf$/i.test(mimeType)) return true;
  return /\.pdf$/i.test(nomFichier?.trim() ?? "");
}
