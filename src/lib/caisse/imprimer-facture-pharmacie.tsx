import { pdf } from "@react-pdf/renderer";
import {
  DocumentDevisEstimation,
  enregistrerPolicesPdf,
  type DonneesDevisEstimation,
} from "@/features/reception/devis-estimation-pdf";
import type { DossierFacturationCaisse } from "@/lib/caisse/types";

export async function imprimerFacturePharmacieCaisse(
  dossier: DossierFacturationCaisse,
  options?: { remise?: number; agentNom?: string }
): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const lignes = dossier.pharmacie.lignes;
  if (!lignes.length) return false;

  enregistrerPolicesPdf();

  const donnees: DonneesDevisEstimation = {
    examens: [],
    medicaments: lignes.map((l) => ({
      nom: l.libelle,
      quantite: l.quantite,
      prixUnitaire: l.prixUnitaire,
    })),
    medecinResponsable: dossier.transferePar ?? "—",
    nomPatient: dossier.nom,
    prenomPatient: dossier.prenom,
    telephonePatient: dossier.telephone ?? undefined,
    numeroEnregistrement: dossier.numeroDossier,
    dateEnregistrement: new Date().toISOString(),
    agentNom: options?.agentNom,
    remise: options?.remise ?? 0,
    labels: {
      titreTicket: "FACTURE PHARMACIE",
      numero: "N°",
      date: "Date",
      patient: "Patient",
      telephone: "Téléphone",
      medecin: "Prescripteur",
      description: "Médicament",
      prix: "Montant (Fc)",
      total: "Total médicaments",
      genereLe: "Émis le",
      agent: "Caissier",
    },
  };

  try {
    const blob = await pdf(<DocumentDevisEstimation donnees={donnees} />).toBlob();
    const url = URL.createObjectURL(blob);
    const numero =
      dossier.pharmacie.facture?.numeroFacture?.replace(/^FAC-PH-/, "") ??
      dossier.numeroDossier;
    const a = document.createElement("a");
    a.href = url;
    a.download = `facture-pharmacie-${numero}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  } catch {
    return false;
  }
}
