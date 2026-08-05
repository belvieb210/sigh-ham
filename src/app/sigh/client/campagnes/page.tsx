import type { Metadata } from "next";
import { Suspense } from "react";
import { ContenuCampagnesClient } from "@/features/client/contenu-campagnes-client";
import { verifierAccesClient } from "@/lib/auth/garde-salle";
import { propsUtilisateurClient } from "@/lib/auth/props-utilisateur-client";

export const metadata: Metadata = {
  title: "Campagnes — Service Client",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesClient();
  return (
    <Suspense>
      <ContenuCampagnesClient
        utilisateur={propsUtilisateurClient(utilisateur)}
      />
    </Suspense>
  );
}
