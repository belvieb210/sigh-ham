import { pdf } from "@react-pdf/renderer";
import {
  DocumentCrConsultation,
  enregistrerPolicesPdfConsultation,
  type DonneesCrConsultation,
} from "@/features/medecins/consultation-pdf";
import {
  BRANDING_PDF_FALLBACK,
  type BrandingPdfLabo,
} from "@/features/medecins/en-tete-pdf-labo";
import {
  DocumentHistoriqueDossierPdf,
  enregistrerPolicesPdfHistorique,
  type DonneesHistoriqueDossierPdf,
} from "@/features/medecins/historique-dossier-pdf";
import {
  DocumentOrdonnancePdf,
  enregistrerPolicesPdfOrdonnance,
  type DonneesOrdonnancePdf,
} from "@/features/medecins/ordonnance-pdf";

function sanitiserNomFichier(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

async function chargerBrandingPdf(): Promise<BrandingPdfLabo> {
  try {
    const res = await fetch("/api/public/branding");
    if (!res.ok) return BRANDING_PDF_FALLBACK;
    const data = (await res.json()) as { branding?: BrandingPdfLabo };
    if (!data.branding) return BRANDING_PDF_FALLBACK;
    return {
      nom: data.branding.nom || BRANDING_PDF_FALLBACK.nom,
      nomComplet: data.branding.nomComplet || BRANDING_PDF_FALLBACK.nomComplet,
      slogan: data.branding.slogan || BRANDING_PDF_FALLBACK.slogan,
      telephone: data.branding.telephone || BRANDING_PDF_FALLBACK.telephone,
      email: data.branding.email || BRANDING_PDF_FALLBACK.email,
      adresse: data.branding.adresse || BRANDING_PDF_FALLBACK.adresse,
    };
  } catch {
    return BRANDING_PDF_FALLBACK;
  }
}

async function ouvrirPdfBlob(blob: Blob, nom: string): Promise<boolean> {
  if (!blob || blob.size < 100) throw new Error("PDF vide");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nom;
  a.target = "_blank";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.open(url, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return true;
}

export async function imprimerCrConsultation(
  donnees: DonneesCrConsultation
): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    enregistrerPolicesPdfConsultation();
    const branding = donnees.branding ?? (await chargerBrandingPdf());
    const blob = await pdf(
      <DocumentCrConsultation donnees={{ ...donnees, branding }} />
    ).toBlob();
    return ouvrirPdfBlob(
      blob,
      `cr-consultation-${sanitiserNomFichier(donnees.patient)}-${sanitiserNomFichier(donnees.numeroDossier)}.pdf`
    );
  } catch (e) {
    console.error("[imprimerCrConsultation]", e);
    return false;
  }
}

export async function imprimerOrdonnancePdf(
  donnees: DonneesOrdonnancePdf
): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    enregistrerPolicesPdfOrdonnance();
    const branding = donnees.branding ?? (await chargerBrandingPdf());
    const blob = await pdf(
      <DocumentOrdonnancePdf donnees={{ ...donnees, branding }} />
    ).toBlob();
    return ouvrirPdfBlob(
      blob,
      `ordonnance-${sanitiserNomFichier(donnees.patient)}-${sanitiserNomFichier(donnees.numeroDossier)}.pdf`
    );
  } catch (e) {
    console.error("[imprimerOrdonnancePdf]", e);
    return false;
  }
}

export async function imprimerHistoriqueDossierPdf(
  donnees: DonneesHistoriqueDossierPdf
): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    enregistrerPolicesPdfHistorique();
    const branding = donnees.branding ?? (await chargerBrandingPdf());
    const blob = await pdf(
      <DocumentHistoriqueDossierPdf donnees={{ ...donnees, branding }} />
    ).toBlob();
    return ouvrirPdfBlob(
      blob,
      `historique-${sanitiserNomFichier(donnees.patient)}-${sanitiserNomFichier(donnees.numeroDossier)}.pdf`
    );
  } catch (e) {
    console.error("[imprimerHistoriqueDossierPdf]", e);
    return false;
  }
}

export type { DonneesCrConsultation, DonneesOrdonnancePdf, DonneesHistoriqueDossierPdf };
