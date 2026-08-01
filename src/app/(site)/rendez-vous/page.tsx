import type { Metadata } from "next";
import { SectionHeroRendezVous } from "@/features/rendez-vous/sections/section-hero-rendez-vous";
import { SectionReservationRendezVous } from "@/features/rendez-vous/sections/section-reservation-rendez-vous";
import { SectionParcoursRendezVous } from "@/features/rendez-vous/sections/section-parcours-rendez-vous";
import { SectionInfosPratiquesRendezVous } from "@/features/rendez-vous/sections/section-infos-pratiques-rendez-vous";
import { SectionFaqRendezVous } from "@/features/rendez-vous/sections/section-faq-rendez-vous";
import { SectionCtaRendezVous } from "@/features/rendez-vous/sections/section-cta-rendez-vous";

export const metadata: Metadata = {
  title: "Prendre rendez-vous",
  description:
    "Réservez votre consultation ou vos analyses en ligne chez HAM LABORATOIRE — Kinshasa, MATETE. Confirmation immédiate, créneaux disponibles du lundi au samedi.",
  openGraph: {
    title: "Prendre rendez-vous | HAM Laboratoire",
    description:
      "Planifiez votre visite au laboratoire en quelques clics — analyses, consultations, imagerie et dépistages.",
  },
};

export default function PageRendezVous() {
  return (
    <>
      <SectionHeroRendezVous />
      <SectionReservationRendezVous />
      <SectionParcoursRendezVous />
      <SectionInfosPratiquesRendezVous />
      <SectionFaqRendezVous />
      <SectionCtaRendezVous />
    </>
  );
}
