import type { Metadata } from "next";
import { ContenuMedecinsClient } from "@/features/client/contenu-medecins-client";
import { verifierAccesClient } from "@/lib/auth/garde-salle";
import { propsUtilisateurClient } from "@/lib/auth/props-utilisateur-client";

export const metadata: Metadata = {
  title: "Médecins — Service Client",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesClient();
  return (
    <ContenuMedecinsClient
      utilisateur={propsUtilisateurClient(utilisateur)}
    />
  );
}
