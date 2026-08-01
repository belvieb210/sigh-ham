import type { Metadata } from "next";
import { ContenuPatientsEnregistres } from "@/features/reception/contenu-patients-enregistres";
import { verifierAccesReception } from "@/lib/auth/garde-salle";

export const metadata: Metadata = {
  title: "Patients enregistrés — Réception",
  robots: { index: false, follow: false },
};

export default async function PagePatientsEnregistres() {
  const utilisateur = await verifierAccesReception();

  return (
    <ContenuPatientsEnregistres
      utilisateur={{
        prenom: utilisateur.prenom,
        nom: utilisateur.nom,
        role: utilisateur.role.nom,
      }}
    />
  );
}
