/** Contenu statique — page catalogue examens laboratoire */

export const CONTENU_SERVICES_LABORATOIRE = {
  hero: {
    surtitre: "Laboratoire d'analyses médicales",
    titre: "Nos examens",
    titreAccent: "médicaux",
    description:
      "Découvrez notre catalogue complet d'analyses de laboratoire, d'imagerie et d'examens spécialisés. Tarifs transparents, délais maîtrisés et résultats fiables certifiés ISO 9001:2015.",
    garanties: [
      {
        id: "fiabilite",
        titre: "Résultats fiables",
        description: "Contrôles qualité rigoureux",
      },
      {
        id: "equipements",
        titre: "Équipements modernes",
        description: "Technologie de dernière génération",
      },
      {
        id: "rapidite",
        titre: "Rapidité & efficacité",
        description: "Délais optimisés",
      },
      {
        id: "confidentialite",
        titre: "Confidentialité assurée",
        description: "Données protégées",
      },
    ],
  },
  cta: {
    titre: "Prenez rendez-vous pour vos examens",
    description:
      "Gagnez du temps en réservant votre créneau en ligne ou contactez notre accueil pour être orienté.",
    boutonServices: "Voir nos services",
    boutonRdv: "Prendre rendez-vous",
  },
} as const;
