import type { Metadata } from "next";
import { ContenuConfirmerReinitialiserAdmin } from "@/features/admin/contenu-confirmer-reinitialiser-admin";
import { verifierAccesAdmin } from "@/lib/auth/garde-salle";
import { propsUtilisateurAdmin } from "@/lib/auth/props-utilisateur-admin";

export const metadata: Metadata = {
  title: "Confirmer la réinitialisation — Administration",
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
    <ContenuConfirmerReinitialiserAdmin
      utilisateur={propsUtilisateurAdmin(utilisateur)}
      patientId={id}
      dossierId={dossierId}
    />
  );
}
