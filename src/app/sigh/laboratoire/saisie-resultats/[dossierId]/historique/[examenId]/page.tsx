import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContenuHistoriqueResultatsExamen } from "@/features/laboratoire/contenu-historique-resultats-examen";
import { verifierAccesLaboratoire } from "@/lib/auth/garde-salle";
import { propsUtilisateurLaboratoire } from "@/lib/auth/props-utilisateur-laboratoire";

export const metadata: Metadata = {
  title: "Historique des résultats — Laboratoire",
  robots: { index: false, follow: false },
};

interface PropsPage {
  params: Promise<{ dossierId: string; examenId: string }>;
  searchParams: Promise<{ retour?: string }>;
}

export default async function PageHistoriqueResultatsExamenLaboratoire({
  params,
  searchParams,
}: PropsPage) {
  const utilisateur = await verifierAccesLaboratoire();
  const { dossierId, examenId } = await params;
  const { retour } = await searchParams;

  if (!dossierId?.trim() || !examenId?.trim()) notFound();

  const urlRetour =
    retour?.trim() ||
    `/sigh/laboratoire/saisie-resultats/${encodeURIComponent(dossierId.trim())}`;

  return (
    <ContenuHistoriqueResultatsExamen
      utilisateur={propsUtilisateurLaboratoire(utilisateur)}
      dossierId={dossierId.trim()}
      examenId={examenId.trim()}
      urlRetour={urlRetour}
    />
  );
}
