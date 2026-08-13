import "server-only";
import { join } from "path";
import { existsSync } from "fs";

/** Résout une URL `/uploads/...` ou chemin relatif vers un fichier lisible par react-pdf. */
export function resoudreCheminFichierPdf(url: string): string | null {
  const brut = url.trim();
  if (!brut) return null;

  if (/^https?:\/\//i.test(brut)) {
    return brut;
  }

  const rel = brut.replace(/^\//, "");
  if (rel.startsWith("uploads/")) {
    const local = join(process.cwd(), "public", rel);
    if (existsSync(local)) return local;
  }

  const publicPath = join(process.cwd(), "public", rel);
  if (existsSync(publicPath)) return publicPath;

  return null;
}

export function estImageAffichablePdf(mimeType: string): boolean {
  return /^image\/(jpeg|jpg|png|webp|gif)$/i.test(mimeType);
}
