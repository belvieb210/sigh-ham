import type { Metadata } from "next";
import { ContenuSallesTransfertAdmin } from "@/features/admin/contenu-salles-transfert-admin";
import { verifierAccesAdmin } from "@/lib/auth/garde-salle";
import { propsUtilisateurAdmin } from "@/lib/auth/props-utilisateur-admin";

export const metadata: Metadata = {
  title: "Choisir les salles à annuler — Administration",
  robots: { index: false, follow: false },
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; dossierId: string }>;
}) {
  const utilisateur = await verifierAccesAdmin();
  const { id, dossierId } = await params;
  return (
    <ContenuSallesTransfertAdmin
      utilisateur={propsUtilisateurAdmin(utilisateur)}
      patientId={id}
      dossierId={dossierId}
      mode="annuler"
    />
  );
}
