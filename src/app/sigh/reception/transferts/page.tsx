import type { Metadata } from "next";
import { ContenuPatientsTransferes } from "@/features/reception/contenu-patients-transferes";
import { verifierAccesReception } from "@/lib/auth/garde-salle";
import { propsUtilisateurReception } from "@/lib/auth/props-utilisateur-reception";

export const metadata: Metadata = {
  title: "Patients transférés — Réception",
  robots: { index: false, follow: false },
};

export default async function PagePatientsTransferes() {
  const utilisateur = await verifierAccesReception();

  return (
    <ContenuPatientsTransferes
      utilisateur={propsUtilisateurReception(utilisateur)}
    />
  );
}
