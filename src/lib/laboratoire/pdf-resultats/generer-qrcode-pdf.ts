import "server-only";
import QRCode from "qrcode";
import { creerTokenRecuFacture, cheminRecuPublic } from "@/lib/caisse/token-recu-public";
import { obtenirOriginePublique } from "@/lib/url-publique";

/** URL absolue du reçu public (scan QR bandeau patient). */
export function urlRecuFactureAbsolue(
  factureId: string,
  request?: Request
): string {
  const token = creerTokenRecuFacture(factureId);
  const origin = obtenirOriginePublique(request);
  return `${origin}${cheminRecuPublic(token)}`;
}

/** Data URL PNG pour @react-pdf/renderer `<Image src={...} />`. */
export async function genererQrCodeDataUrl(contenu: string): Promise<string | null> {
  if (!contenu.trim()) return null;
  try {
    return await QRCode.toDataURL(contenu, {
      type: "image/png",
      width: 220,
      margin: 1,
      errorCorrectionLevel: "L",
      color: { dark: "#000000", light: "#ffffff" },
    });
  } catch {
    return null;
  }
}
