import type { Metadata } from "next";
import { ContenuPatientsAttenteCaisse } from "@/features/caisse/contenu-patients-attente-caisse";
import { verifierAccesCaisse } from "@/lib/auth/garde-salle";
import { propsUtilisateurCaisse } from "@/lib/auth/props-utilisateur-caisse";

export const metadata: Metadata = {
  title: "Patients en attente — Caisse",
  robots: { index: false, follow: false },
};

export default async function PagePatientsCaisse() {
  const utilisateur = await verifierAccesCaisse();

  return (
    <ContenuPatientsAttenteCaisse utilisateur={propsUtilisateurCaisse(utilisateur)} />
  );
}
