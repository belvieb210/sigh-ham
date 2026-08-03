import type { Metadata } from "next";
import { ContenuPatientsTransfertsCaisse } from "@/features/caisse/contenu-patients-transferts-caisse";
import { verifierAccesCaisse } from "@/lib/auth/garde-salle";
import { propsUtilisateurCaisse } from "@/lib/auth/props-utilisateur-caisse";

export const metadata: Metadata = {
  title: "Patients / Transferts — Caisse",
  robots: { index: false, follow: false },
};

export default async function PageTransfertsCaisse() {
  const utilisateur = await verifierAccesCaisse();

  return (
    <ContenuPatientsTransfertsCaisse utilisateur={propsUtilisateurCaisse(utilisateur)} />
  );
}
