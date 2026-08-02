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
    reader.onerror = () => reject(reader.error ?? new Error("Lecture PDF impossible"));
    reader.readAsDataURL(blob);
  });
}

async function ouvrirPdfSurMobile(blob: Blob, nomFichier: string): Promise<boolean> {
  const fichier = new File([blob], nomFichier, { type: "application/pdf" });

  // Android / iOS récents : partage natif (ouvre le visualiseur PDF)
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
      /* utilisateur a annulé ou share indisponible → fallback */
    }
  }

  // data: URL — plus fiable que blob: dans un nouvel onglet sur mobile
  const dataUrl = await blobVersDataUrl(blob);

  const lien = document.createElement("a");
  lien.href = dataUrl;
  lien.download = nomFichier;
  lien.target = "_blank";
  lien.rel = "noopener";
  document.body.appendChild(lien);
  lien.click();
  lien.remove();

  // iOS Safari : ouvrir dans le même onglet si le téléchargement ne suffit pas
  const estIos = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (estIos) {
    window.location.assign(dataUrl);
  }

  return true;
}

async function ouvrirPdfSurDesktop(blob: Blob, nomFichier: string): Promise<boolean> {
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

  window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
  return true;
}

/**
 * Génère un devis PDF A4 (@react-pdf/renderer).
 * Desktop : nouvel onglet. Mobile : share / data-URL (blob: échoue souvent sur iOS).
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
      return ouvrirPdfSurMobile(blob, nomFichier);
    }

    return ouvrirPdfSurDesktop(blob, nomFichier);
  } catch (error) {
    console.error("[imprimerDevisEstimation]", error);
    return false;
  }
}
