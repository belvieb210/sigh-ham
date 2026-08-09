import type { StatutFacture } from "@/generated/prisma/client";
import type { TypeFactureCaisseUi } from "@/lib/caisse/types";

export function estNumeroFacturePharmacie(numeroFacture: string): boolean {
  return numeroFacture.startsWith("FAC-PH-");
}

export function factureEstPayee(statut: StatutFacture | null | undefined): boolean {
  return statut === "PAYEE";
}

export interface EtatFacturationDual {
  aDesExamens: boolean;
  aDesMedicaments: boolean;
  factureExamensPayee: boolean;
  facturePharmaciePayee: boolean;
  facturationComplete: boolean;
  factureNormaleVerrouillee: boolean;
  facturePharmacieVerrouillee: boolean;
  typeFactureRecommande: TypeFactureCaisseUi | null;
  statutAttente: "EN_ATTENTE_PAIEMENT" | "PAYE" | "HORS_FILE";
}

export function evaluerEtatFacturationDual(params: {
  nombreExamens: number;
  aDesMedicaments: boolean;
  statutFactureExamens: StatutFacture | null;
  statutFacturePharmacie: StatutFacture | null;
  enFile: boolean;
}): EtatFacturationDual {
  const aDesExamens = params.nombreExamens > 0;
  const aDesMedicaments = params.aDesMedicaments;

  const factureExamensPayee =
    !aDesExamens || factureEstPayee(params.statutFactureExamens);
  const facturePharmaciePayee =
    !aDesMedicaments || factureEstPayee(params.statutFacturePharmacie);

  const facturationComplete = factureExamensPayee && facturePharmaciePayee;

  const factureNormaleVerrouillee =
    aDesExamens && factureEstPayee(params.statutFactureExamens);
  const facturePharmacieVerrouillee =
    aDesMedicaments && factureEstPayee(params.statutFacturePharmacie);

  let typeFactureRecommande: TypeFactureCaisseUi | null = null;
  if (!facturationComplete) {
    if (aDesExamens && !factureExamensPayee) {
      typeFactureRecommande = "NORMALE";
    } else if (aDesMedicaments && !facturePharmaciePayee) {
      typeFactureRecommande = "PHARMACIE";
    }
  }

  let statutAttente: EtatFacturationDual["statutAttente"] = "HORS_FILE";
  if (params.enFile) {
    statutAttente = facturationComplete ? "PAYE" : "EN_ATTENTE_PAIEMENT";
  }

  return {
    aDesExamens,
    aDesMedicaments,
    factureExamensPayee,
    facturePharmaciePayee,
    facturationComplete,
    factureNormaleVerrouillee,
    facturePharmacieVerrouillee,
    typeFactureRecommande,
    statutAttente,
  };
}
