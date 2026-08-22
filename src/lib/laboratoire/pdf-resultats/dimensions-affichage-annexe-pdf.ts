/** Largeur utile page A4 (595pt) − marges horizontales réduites annexe (20×2). */
export const LARGEUR_CONTENU_ANNEXE_PDF = 555;

/** Hauteur max. image annexe (en-tête compact + pied de page). */
export const HAUTEUR_MAX_IMAGE_ANNEXE_PDF = 750;

export function lireDimensionsPng(buffer: Buffer): { width: number; height: number } | null {
  if (buffer.length < 24 || buffer.toString("ascii", 1, 4) !== "PNG") return null;
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

/** Dimensions JPEG via marqueur SOF (baseline / progressif). */
export function lireDimensionsJpeg(buffer: Buffer): { width: number; height: number } | null {
  if (buffer.length < 4 || buffer.readUInt16BE(0) !== 0xffd8) return null;

  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) break;
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if (length < 2) break;

    const estSof =
      marker === 0xc0 ||
      marker === 0xc1 ||
      marker === 0xc2 ||
      marker === 0xc3 ||
      marker === 0xc5 ||
      marker === 0xc6 ||
      marker === 0xc7 ||
      marker === 0xc9 ||
      marker === 0xca ||
      marker === 0xcb ||
      marker === 0xcd ||
      marker === 0xce ||
      marker === 0xcf;

    if (estSof && offset + 7 < buffer.length) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }

    offset += 2 + length;
  }

  return null;
}

export function lireDimensionsImageBuffer(
  buffer: Buffer,
  mimeType: string
): { width: number; height: number } | null {
  if (/png/i.test(mimeType)) return lireDimensionsPng(buffer);
  if (/jpe?g/i.test(mimeType)) return lireDimensionsJpeg(buffer);
  return lireDimensionsPng(buffer) ?? lireDimensionsJpeg(buffer);
}

/** Adapte l'image à la zone annexe (pleine largeur, hauteur proportionnelle). */
export function calculerDimensionsAffichageAnnexe(
  largeurPx: number,
  hauteurPx: number,
  largeurMax = LARGEUR_CONTENU_ANNEXE_PDF,
  hauteurMax = HAUTEUR_MAX_IMAGE_ANNEXE_PDF
): { largeurAffichage: number; hauteurAffichage: number } {
  if (largeurPx <= 0 || hauteurPx <= 0) {
    return { largeurAffichage: largeurMax, hauteurAffichage: hauteurMax };
  }

  const ratio = largeurPx / hauteurPx;
  const largeurAffichage = largeurMax;
  const hauteurAffichage = Math.min(Math.round(largeurAffichage / ratio), hauteurMax);

  return { largeurAffichage, hauteurAffichage };
}
