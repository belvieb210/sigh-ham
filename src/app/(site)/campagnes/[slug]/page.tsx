import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { calculerStatutCampagne } from "@/lib/campagnes-utils";
import { DetailCampagneClient } from "@/features/campagnes/detail-campagne-client";
import {
  obtenirCampagneParSlug,
  obtenirCampagnesPubliees,
} from "@/services/service-campagnes";

interface PropsPage {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const campagnes = await obtenirCampagnesPubliees();
  return campagnes.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PropsPage): Promise<Metadata> {
  const { slug } = await params;
  const campagne = await obtenirCampagneParSlug(slug);
  if (!campagne) return { title: "Campagne introuvable" };
  return {
    title: campagne.titre,
    description: campagne.extrait,
  };
}

export default async function PageDetailCampagne({ params }: PropsPage) {
  const { slug } = await params;
  const campagne = await obtenirCampagneParSlug(slug);

  if (!campagne) notFound();

  const statut = calculerStatutCampagne(campagne.dateDebut, campagne.dateFin);

  return <DetailCampagneClient slug={slug} statut={statut} />;
}
