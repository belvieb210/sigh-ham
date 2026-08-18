import type { Metadata } from "next";
import { ContenuVisitesTransfertsAdmin } from "@/features/admin/contenu-visites-transferts-admin";
import { verifierAccesAdmin } from "@/lib/auth/garde-salle";
import { propsUtilisateurAdmin } from "@/lib/auth/props-utilisateur-admin";

export const metadata: Metadata = {
  title: "Annuler un transfert — Administration",
  robots: { index: false, follow: false },
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const utilisateur = await verifierAccesAdmin();
  const { id } = await params;
  return (
    <ContenuVisitesTransfertsAdmin
      utilisateur={propsUtilisateurAdmin(utilisateur)}
      patientId={id}
      mode="annuler"
    />
  );
}
