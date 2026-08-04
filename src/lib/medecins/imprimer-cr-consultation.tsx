import { pdf } from "@react-pdf/renderer";
import {
  DocumentCrConsultation,
  enregistrerPolicesPdfConsultation,
  type DonneesCrConsultation,
} from "@/features/medecins/consultation-pdf";

export type { DonneesCrConsultation };

function sanitiserNomFichier(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/**
 * Génère le compte-rendu PDF A4 et ouvre un aperçu / téléchargement.
 */
export async function imprimerCrConsultation(
  donnees: DonneesCrConsultation
): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    enregistrerPolicesPdfConsultation();
    const blob = await pdf(
      <DocumentCrConsultation donnees={donnees} />
    ).toBlob();
    if (!blob || blob.size < 100) throw new Error("PDF vide");

    const nom = `cr-consultation-${sanitiserNomFichier(donnees.patient || "patient")}-${sanitiserNomFichier(donnees.numeroDossier || "dossier")}.pdf`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nom;
    a.target = "_blank";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();

    const fenetre = window.open(url, "_blank", "noopener,noreferrer");
    if (!fenetre) {
      /* téléchargement déjà lancé */
    }
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return true;
  } catch (error) {
    console.error("[imprimerCrConsultation]", error);
    return false;
  }
}
