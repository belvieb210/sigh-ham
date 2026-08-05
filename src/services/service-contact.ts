import type { DonneesFormulaireContact } from "@/hooks/use-schemas-validation";

export type { DonneesFormulaireContact };

export interface ReponseEnvoiContact {
  succes: boolean;
}

/** Envoie un message de contact vers le CMS Service Client. */
export async function envoyerMessageContact(
  donnees: DonneesFormulaireContact
): Promise<ReponseEnvoiContact> {
  const res = await fetch("/api/public/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nom: donnees.nomComplet,
      email: donnees.email,
      telephone: donnees.telephone,
      sujet: donnees.sujet,
      message: donnees.message,
    }),
  });

  const data = (await res.json()) as { succes?: boolean; message?: string };
  if (!res.ok) {
    throw new Error(data.message ?? "Échec de l'envoi");
  }
  return { succes: true };
}
