import type { Metadata } from "next";
import { ContenuMessagerieEglise } from "@/features/eglise/contenu-messagerie-eglise";
import { verifierAccesEglise } from "@/lib/auth/garde-salle";
import { propsUtilisateurEglise } from "@/lib/auth/props-utilisateur-eglise";

export const metadata: Metadata = {
  title: "Messagerie — Église",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const utilisateur = await verifierAccesEglise();
  const props = propsUtilisateurEglise(utilisateur);
  return (
    <ContenuMessagerieEglise
      utilisateur={{ ...props, id: utilisateur.id }}
      estAdmin={utilisateur.role.code === "ADMIN" || utilisateur.role.code === "SUPER_ADMIN"}
    />
  );
}
