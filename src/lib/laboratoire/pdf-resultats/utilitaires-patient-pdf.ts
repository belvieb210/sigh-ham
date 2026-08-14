import type { DonneesPatientResultatPdf } from "@/lib/laboratoire/pdf-resultats/types";

export function formaterAdressePatientPdf(parts: {
  adresse?: string | null;
  ville?: string | null;
  province?: string | null;
  pays?: string | null;
}): string {
  const morceaux = [
    parts.adresse?.trim(),
    parts.ville?.trim(),
    parts.province?.trim(),
    parts.pays?.trim(),
  ].filter(Boolean);
  return morceaux.join(" ") || "—";
}

export function idPatientAffichePdf(patient: DonneesPatientResultatPdf): string {
  return patient.numeroTransfert ?? patient.numeroEnregistrement ?? "—";
}

export function resoudreAvatarPatientPdf(
  sexe: string | null | undefined,
  avatarHomme: string,
  avatarFemme: string
): string {
  return sexe === "FEMININ" ? avatarFemme : avatarHomme;
}
