import type { Metadata } from "next";
import { SectionHeroContact } from "@/features/contact/sections/section-hero-contact";
import { SectionCoordonneesContact } from "@/features/contact/sections/section-coordonnees-contact";
import { SectionFormulaireContact } from "@/features/contact/sections/section-formulaire-contact";
import { SectionFaqContact } from "@/features/contact/sections/section-faq-contact";
import { SectionCtaContact } from "@/features/contact/sections/section-cta-contact";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez HAM LABORATOIRE à Kinshasa — adresse, téléphones, email, horaires et formulaire de contact. MATETE, Avenue Lumière.",
  openGraph: {
    title: "Contact | HAM Laboratoire",
    description:
      "Nous sommes à votre écoute — rendez-vous, résultats, campagnes et renseignements.",
  },
};

export default function PageContact() {
  return (
    <>
      <SectionHeroContact />
      <SectionCoordonneesContact />
      <SectionFormulaireContact />
      <SectionFaqContact />
      <SectionCtaContact />
    </>
  );
}
