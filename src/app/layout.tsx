import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { FournisseurRequetes } from "@/components/fournisseurs/fournisseur-requetes";
import { FournisseurI18n } from "@/components/fournisseurs/fournisseur-i18n";
import { FournisseurRecherche } from "@/components/recherche/fournisseur-recherche";
import { MetadonneesDynamiques } from "@/components/layout/metadonnees-dynamiques";
import { CHEMIN_LOGO_HAM } from "@/constants/navigation";
import { CLE_STOCKAGE_LANGUE, resoudreLangue } from "@/lib/i18n-config";
import type { CodeLangue } from "@/locales/types";

export const metadata: Metadata = {
  title: {
    default: "HAM Laboratoire — Centre de Diagnostic et d'Analyses Médicales",
    template: "%s | HAM Laboratoire",
  },
  description:
    "VOTRE SANTÉ MON FARDEAU, LA FIABILITÉ NOTRE PRÉÉMINENCE. Centre de diagnostic et d'analyses médicales à Kinshasa.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: CHEMIN_LOGO_HAM, type: "image/jpeg" },
    ],
    apple: CHEMIN_LOGO_HAM,
  },
  keywords: [
    "HAM Laboratoire",
    "laboratoire médical",
    "diagnostic médical",
    "analyses médicales",
    "Kinshasa",
    "MATETE",
  ],
  openGraph: {
    title: "HAM Laboratoire",
    description: "Centre de Diagnostic et d'Analyses Médicales",
    type: "website",
    locale: "fr_FR",
  },
};

export default async function LayoutRacine({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieLangue = cookieStore.get(CLE_STOCKAGE_LANGUE)?.value;
  const langueInitiale: CodeLangue = resoudreLangue(cookieLangue);

  return (
    <html lang={langueInitiale} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans">
        <FournisseurRequetes>
          <FournisseurI18n langueInitiale={langueInitiale}>
            <FournisseurRecherche>
              <MetadonneesDynamiques />
              {children}
            </FournisseurRecherche>
          </FournisseurI18n>
        </FournisseurRequetes>
      </body>
    </html>
  );
}
