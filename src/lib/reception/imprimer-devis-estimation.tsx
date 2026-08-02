import { pdf } from "@react-pdf/renderer";
import {
  DocumentDevisEstimation,
  enregistrerPolicesPdf,
  type DonneesDevisEstimation,
} from "@/features/reception/devis-estimation-pdf";

export type { DonneesDevisEstimation };

/**
 * Génère un devis PDF A4 (@react-pdf/renderer) et l'ouvre dans un onglet
 * du même navigateur — pas de PHP, pas de ticket thermique.
 */
export async function imprimerDevisEstimation(
  donnees: DonneesDevisEstimation
): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    enregistrerPolicesPdf();

    const blob = await pdf(<DocumentDevisEstimation donnees={donnees} />).toBlob();

    const url = URL.createObjectURL(blob);
    const onglet = window.open(url, "_blank");
    if (!onglet) {
      const a = document.createElement("a");
      a.href = url;
      a.download = `estimation-${donnees.numeroEnregistrement || "devis"}.pdf`;
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      return true;
    }

    window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
    return true;
  } catch (error) {
    console.error("[imprimerDevisEstimation]", error);
    return false;
  }
}
