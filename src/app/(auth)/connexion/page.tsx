import type { Metadata } from "next";
import { ContenuConnexion } from "@/features/connexion/contenu-connexion";

export const metadata: Metadata = {
  title: "Connexion — Espace personnel",
  description: "Accès réservé au personnel de HAM Laboratoire.",
  robots: { index: false, follow: false },
};

export default function PageConnexion() {
  return <ContenuConnexion />;
}
