import type { StatutFacture } from "@/generated/prisma/client";
import type { TypeFactureCaisseUi } from "@/lib/caisse/types";

export function estNumeroFacturePharmacie(numeroFacture: string): boolean {
  return numeroFacture.startsWith("FAC-PH-");
}

export function factureEstPayee(statut: StatutFacture | null | undefined): boolean {
  return statut === "PAYEE";
}

/** File facturation / « en attente de facturation » : il reste quelque chose à encaisser. */
export function patientEncoreAFacturerCaisse(p: {
  facturationComplete: boolean;
}): boolean {
  return !p.facturationComplete;
}

/**
 * Statut examens envoyé à l'état dual.
 * Une facture PAYEE existante ne doit pas masquer des examens encore non facturés,
 * et une facture ouverte périmée ne doit pas faire passer un dossier soldé pour impayé.
 */
export function statutExamensPourEtatDual(params: {
  aDesExamensNonFactures: boolean;
  statutFactureOuverte: StatutFacture | null;
  aUneFactureExamensPayee: boolean;
}): StatutFacture | null {
  if (params.aDesExamensNonFactures) {
    return params.statutFactureOuverte === "PAYEE"
      ? null
      : params.statutFactureOuverte;
  }
  return params.aUneFactureExamensPayee ? "PAYEE" : params.statutFactureOuverte;
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
  /** Examens prescrits pas encore sur une facture (complémentaire après paiement). */
  aDesExamensNonFactures?: boolean;
}): EtatFacturationDual {
  const aDesExamens = params.nombreExamens > 0;
  const aDesMedicaments = params.aDesMedicaments;
  const aDesExamensNonFactures = Boolean(params.aDesExamensNonFactures);

  const factureExamensPayee =
    !aDesExamens ||
    (factureEstPayee(params.statutFactureExamens) && !aDesExamensNonFactures);
  const facturePharmaciePayee =
    !aDesMedicaments || factureEstPayee(params.statutFacturePharmacie);

  const facturationComplete =
    (aDesExamens || aDesMedicaments) &&
    factureExamensPayee &&
    facturePharmaciePayee;

  const factureNormaleVerrouillee =
    aDesExamens &&
    factureEstPayee(params.statutFactureExamens) &&
    !aDesExamensNonFactures;
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
