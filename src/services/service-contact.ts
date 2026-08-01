import type { DonneesFormulaireContact } from "@/hooks/use-schemas-validation";

export type { DonneesFormulaireContact };

export interface ReponseEnvoiContact {
  succes: boolean;
}

/** Envoie un message de contact — Phase future : POST /api/contact */
export async function envoyerMessageContact(
  donnees: DonneesFormulaireContact
): Promise<ReponseEnvoiContact> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (process.env.NODE_ENV === "development") {
    console.info("[Contact] Message reçu :", donnees.sujet, donnees.email);
  }

  return { succes: true };
}
