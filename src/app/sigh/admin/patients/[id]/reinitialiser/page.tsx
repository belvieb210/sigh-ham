import type { Metadata } from "next";
import { ContenuReinitialiserVisitesAdmin } from "@/features/admin/contenu-reinitialiser-visites-admin";
import { verifierAccesAdmin } from "@/lib/auth/garde-salle";
import { propsUtilisateurAdmin } from "@/lib/auth/props-utilisateur-admin";

export const metadata: Metadata = {
  title: "Réinitialiser une visite — Administration",
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
    <ContenuReinitialiserVisitesAdmin
      utilisateur={propsUtilisateurAdmin(utilisateur)}
      patientId={id}
    />
  );
}
