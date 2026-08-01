"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { EnTeteSection } from "@/components/ui/en-tete-section";

const MEDECINS_VEDETTE = [
  {
    id: "1",
    nom: "KABAMBA",
    prenom: "Dr. Jean-Pierre",
    specialite: "Médecine générale",
    experience: "15 ans d'expérience",
  },
  {
    id: "2",
    nom: "MULUMBA",
    prenom: "Dr. Sarah",
    specialite: "Cardiologie",
    experience: "12 ans d'expérience",
  },
  {
    id: "3",
    nom: "TSHILOMBO",
    prenom: "Dr. Michel",
    specialite: "Biologie médicale",
    experience: "20 ans d'expérience",
  },
  {
    id: "4",
    nom: "KASONGO",
    prenom: "Dr. Anne",
    specialite: "Pédiatrie",
    experience: "10 ans d'expérience",
  },
] as const;

export function SectionMedecins() {
  return (
    <section
      className="section-medecins py-16 lg:py-24"
      aria-labelledby="titre-medecins"
    >
      <div className="conteneur-principal">
        <EnTeteSection
          idTitre="titre-medecins"
          titre="Nos médecins"
          lienVoirTout={{ href: "/medecins", etiquette: "Voir tous les médecins" }}
        />

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {MEDECINS_VEDETTE.map((medecin, index) => (
            <motion.article
              key={medecin.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={`/medecins/${medecin.id}`}
                className="carte-medecin group block overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm transition-all hover:shadow-md"
              >
                <div className="aspect-square bg-gradient-to-br from-bleu-medical-clair to-vert-sante-clair flex items-center justify-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-bleu-medical text-3xl font-bold text-white">
                    {medecin.prenom.charAt(4)}
                    {medecin.nom.charAt(0)}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-texte-principal group-hover:text-bleu-medical">
                    {medecin.prenom} {medecin.nom}
                  </h3>
                  <p className="text-sm text-bleu-medical">{medecin.specialite}</p>
                  <p className="mt-1 text-xs text-texte-secondaire">
                    {medecin.experience}
                  </p>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
