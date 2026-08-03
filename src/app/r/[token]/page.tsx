import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { ContenuRecuPublic } from "@/features/caisse/contenu-recu-public";
import { chargerRecuPublicParToken } from "@/lib/caisse/recu-public";

export const metadata: Metadata = {
  title: "Reçu de caisse — HAM Laboratoire",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f2744",
};

interface PropsPageRecu {
  params: Promise<{ token: string }>;
}

export default async function PageRecuPublic({ params }: PropsPageRecu) {
  const { token } = await params;
  const detail = await chargerRecuPublicParToken(decodeURIComponent(token));
  if (!detail) notFound();

  return <ContenuRecuPublic detail={detail} />;
}
