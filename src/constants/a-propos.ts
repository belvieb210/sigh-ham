import { IMAGES_FOND_A_PROPOS } from "@/constants/images";

/** Contenu de la page À propos — HAM LABORATOIRE */

export const CONTENU_A_PROPOS = {
  hero: {
    typeEtablissement: "CENTRE DE DIAGNOSTIC ET D'ANALYSES MÉDICALES",
    nom: '"HAM LABORATOIRE"',
    badgeSlogan: "VOTRE SANTÉ MON FARDEAU,",
    suiteSlogan: "LA FIABILITÉ NOTRE PRÉÉMINENCE",
    /** Images de fond — remplacez les fichiers dans public/images/a-propos/ */
    imagesFond: [...IMAGES_FOND_A_PROPOS],
  },

  mission: {
    titre: "Notre mission",
    texte:
      "HAM avec son laboratoire et ses personnels qualifiés s'engage à se conformer au niveau d'exigence normative et aux bonnes pratiques, tout en satisfaisant ses clients aux exigences de fiabilité de résultats à un coût favorable permettant même aux démunis d'être bien diagnostiqués.",
  },

  vision: {
    titre: "Notre vision",
    texte:
      "Devenir le centre de référence en diagnostic et analyses médicales en République Démocratique du Congo et en Afrique, reconnu pour l'excellence, l'accessibilité et la fiabilité de nos résultats.",
  },

  valeurs: [
    {
      id: "fiabilite",
      titre: "Fiabilité",
      description:
        "Des résultats précis et conformes aux normes internationales de laboratoire.",
    },
    {
      id: "accessibilite",
      titre: "Accessibilité",
      description:
        "Des prestations de qualité à un coût favorable, ouvertes à tous, y compris aux plus démunis.",
    },
    {
      id: "excellence",
      titre: "Excellence",
      description:
        "Personnels qualifiés, équipements modernes et respect des bonnes pratiques.",
    },
    {
      id: "humanite",
      titre: "Humanité",
      description:
        "Votre santé est notre fardeau — chaque patient est accueilli avec respect et attention.",
    },
  ],

  histoire: {
    titre: "Notre histoire",
    paragraphes: [
      "HAM LABORATOIRE est un centre de diagnostic et d'analyses médicales implanté à Kinshasa, en République Démocratique du Congo. Depuis sa création, l'établissement s'est engagé à offrir des services de santé fiables et accessibles à toute la population.",
      "Fort de son laboratoire équipé et de son équipe de professionnels qualifiés, HAM LABORATOIRE accompagne médecins, patients et partenaires institutionnels dans le parcours diagnostique avec rigueur et bienveillance.",
    ],
  },

  direction: {
    titre: "Notre direction",
    sousTitre: "Le responsable du centre",
    responsable: {
      nom: "Olivier Bokulu",
      fonction: "Directeur général — HAM Laboratoire",
      biographie:
        "Olivier Bokulu dirige HAM LABORATOIRE avec la conviction que la santé est un fardeau partagé et que la fiabilité des résultats doit rester accessible à tous. Sous sa direction, le centre poursuit sa mission d'excellence en diagnostic médical, en plaçant la qualité, l'intégrité et l'accessibilité des soins au cœur de chaque décision.",
      /** Remplacer par la photo officielle : public/images/equipe/responsable.jpg */
      photoUrl: "/images/equipe/responsable.png",
    },
  },

  equipe: {
    titre: "Notre équipe",
    sousTitre: "Des professionnels qualifiés à votre service",
    membres: [
      {
        id: "1",
        nom: "Équipe Laboratoire",
        fonction: "Biologistes & techniciens",
        photoUrl: "/images/equipe/personnel-1.png",
      },
      {
        id: "2",
        nom: "Équipe Accueil",
        fonction: "Réception & orientation",
        photoUrl: "/images/equipe/personnel-2.png",
      },
      {
        id: "3",
        nom: "Équipe Médicale",
        fonction: "Médecins & infirmiers",
        photoUrl: "/images/equipe/personnel-3.png",
      },
      {
        id: "4",
        nom: "Équipe Administrative",
        fonction: "Gestion & qualité",
        photoUrl: "/images/equipe/personnel-4.png",
      },
    ],
  },

  certifications: {
    titre: "Certifications & engagements",
    items: [
      {
        id: "iso",
        titre: "ISO 9001:2015",
        description: "Système de management de la qualité certifié.",
      },
      {
        id: "bonnes-pratiques",
        titre: "Bonnes pratiques de laboratoire",
        description: "Conformité aux exigences normatives nationales et internationales.",
      },
      {
        id: "fiabilite",
        titre: "Fiabilité des résultats",
        description: "Contrôles qualité rigoureux à chaque étape analytique.",
      },
    ],
  },

  impact: {
    titre: "HAM en chiffres",
    sousTitre:
      "Une présence établie à Kinshasa, au service de la santé publique congolaise.",
    indicateurs: [
      {
        id: "patients",
        valeur: "24K+",
        libelle: "Patients / an",
        description: "Prises en charge et analyses réalisées chaque année.",
      },
      {
        id: "analyses",
        valeur: "200+",
        libelle: "Types d'analyses",
        description: "Plateau technique complet en biologie médicale.",
      },
      {
        id: "equipe",
        valeur: "50+",
        libelle: "Professionnels",
        description: "Biologistes, techniciens, médecins et personnel qualifié.",
      },
      {
        id: "iso",
        valeur: "ISO 9001",
        libelle: "Certification",
        description: "Management de la qualité certifié.",
      },
    ],
  },

  cta: {
    titre: "Rejoignez des milliers de patients qui nous font confiance",
    description:
      "Prenez rendez-vous ou contactez-nous — HAM LABORATOIRE vous accueille à MATETE, Kinshasa.",
    boutonPrincipal: { etiquette: "Prendre rendez-vous", href: "/rendez-vous" },
    boutonSecondaire: { etiquette: "Nous contacter", href: "/contact" },
    telephone: "+243 819 191 643",
  },

  bandeau: {
    slogan: "HAM LABORATOIRE, LE CHOIX SÛR POUR UNE MEILLEURE SANTÉ !",
    siteWeb: "https://hamlabor.org/",
    telephones: ["+243 819 191 643", "+243 815 129 111"],
  },
} as const;
