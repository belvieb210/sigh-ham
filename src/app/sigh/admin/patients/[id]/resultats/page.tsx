import type { Metadata } from "next";
import { ContenuResultatsPatientAdmin } from "@/features/admin/contenu-resultats-patient-admin";
import { verifierAccesAdmin } from "@/lib/auth/garde-salle";
import { propsUtilisateurAdmin } from "@/lib/auth/props-utilisateur-admin";

export const metadata: Metadata = {
  title: "Résultats patient — Administration",
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
    <ContenuResultatsPatientAdmin
      utilisateur={propsUtilisateurAdmin(utilisateur)}
      patientId={id}
    />
  );
}
