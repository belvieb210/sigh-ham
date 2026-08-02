import { pdf } from "@react-pdf/renderer";
import {
  DocumentDevisEstimation,
  enregistrerPolicesPdf,
  type DonneesDevisEstimation,
} from "@/features/reception/devis-estimation-pdf";

export type { DonneesDevisEstimation };

function estNavigateurMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) ||
    (navigator.maxTouchPoints > 0 && window.innerWidth < 1024)
  );
}

function blobVersDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Lecture PDF impossible"));
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error("Lecture PDF impossible"));
    reader.readAsDataURL(blob);
  });
}

/**
 * Sur mobile, les URL blob: (blob:https://...) sont souvent bloquées.
 * On utilise data: URL, partage natif, ou téléchargement — jamais blob: seul.
 */
async function ouvrirPdfSansBlob(blob: Blob, nomFichier: string): Promise<boolean> {
  const fichier = new File([blob], nomFichier, { type: "application/pdf" });

  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
    share?: (data: ShareData) => Promise<void>;
  };

  if (nav.canShare?.({ files: [fichier] }) && nav.share) {
    try {
      await nav.share({
        files: [fichier],
        title: nomFichier,
        text: "Devis d'estimation HAM Laboratoire",
      });
      return true;
    } catch {
      /* annulé → fallback */
    }
  }

  const dataUrl = await blobVersDataUrl(blob);

  // Téléchargement (Android / la plupart des navigateurs)
  const lien = document.createElement("a");
  lien.href = dataUrl;
  lien.download = nomFichier;
  lien.rel = "noopener";
  document.body.appendChild(lien);
  lien.click();
  lien.remove();

  // iOS Safari : afficher le PDF dans le même onglet (data: OK, blob: non)
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    window.location.assign(dataUrl);
  }

  return true;
}

async function ouvrirPdfDesktop(blob: Blob, nomFichier: string): Promise<boolean> {
  // Desktop : blob: fonctionne correctement (problème surtout mobile / iOS)
  const url = URL.createObjectURL(blob);
  const onglet = window.open(url, "_blank");

  if (!onglet) {
    const lien = document.createElement("a");
    lien.href = url;
    lien.download = nomFichier;
    document.body.appendChild(lien);
    lien.click();
    lien.remove();
  }

  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return true;
}

/**
 * Génère un devis PDF A4.
 * N'utilise plus d'URL blob: pour l'affichage (problème mobile confirmé).
 */
export async function imprimerDevisEstimation(
  donnees: DonneesDevisEstimation
): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    enregistrerPolicesPdf();

    const blob = await pdf(<DocumentDevisEstimation donnees={donnees} />).toBlob();
    const nomFichier = `estimation-${donnees.numeroEnregistrement || "devis"}.pdf`;

    if (estNavigateurMobile()) {
      return ouvrirPdfSansBlob(blob, nomFichier);
    }

    return ouvrirPdfDesktop(blob, nomFichier);
  } catch (error) {
    console.error("[imprimerDevisEstimation]", error);
    return false;
  }
}
