import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CAMPAGNES_PUBLICATIONS } from "@/constants/campagnes";
import { calculerStatutCampagne } from "@/lib/campagnes-utils";
import { DetailCampagneClient } from "@/features/campagnes/detail-campagne-client";

interface PropsPage {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return CAMPAGNES_PUBLICATIONS.filter((c) => c.publie).map((c) => ({
    slug: c.slug,
  }));
}

export async function generateMetadata({ params }: PropsPage): Promise<Metadata> {
  const { slug } = await params;
  const campagne = CAMPAGNES_PUBLICATIONS.find(
    (c) => c.slug === slug && c.publie
  );
  if (!campagne) return { title: "Campagne introuvable" };
  return {
    title: campagne.titre,
    description: campagne.extrait,
  };
}

export default async function PageDetailCampagne({ params }: PropsPage) {
  const { slug } = await params;
  const campagne = CAMPAGNES_PUBLICATIONS.find(
    (c) => c.slug === slug && c.publie
  );

  if (!campagne) notFound();

  const statut = calculerStatutCampagne(campagne.dateDebut, campagne.dateFin);

  return <DetailCampagneClient slug={slug} statut={statut} />;
}
