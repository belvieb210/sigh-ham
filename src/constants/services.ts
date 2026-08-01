/** Contenu de la page Services — HAM LABORATOIRE */

export const CONTENU_SERVICES = {
  hero: {
    surtitre: "Centre de diagnostic & analyses médicales",
    titre: "Des services médicaux",
    titreAccent: "d'excellence",
    description:
      "HAM LABORATOIRE offre une gamme complète de prestations de diagnostic — analyses de laboratoire, consultations, imagerie et dépistages — avec des résultats fiables, des délais maîtrisés et une accessibilité pour tous.",
    statistiques: [
      { valeur: "200+", libelle: "Types d'analyses" },
      { valeur: "24h", libelle: "Délai moyen résultats" },
      { valeur: "ISO", libelle: "9001:2015 certifié" },
      { valeur: "7j/7", libelle: "Accueil patients" },
    ],
  },

  categories: [
    { id: "tous", etiquette: "Tous les services" },
    { id: "diagnostic", etiquette: "Diagnostic" },
    { id: "soins", etiquette: "Soins & suivi" },
    { id: "urgences", etiquette: "Urgences" },
  ] as const,

  services: [
    {
      id: "laboratoire",
      categorie: "diagnostic" as const,
      titre: "Laboratoire d'analyses",
      description:
        "Cœur de notre expertise — analyses biologiques, hématologiques, biochimiques et spécialisées avec équipements de dernière génération.",
      points: [
        "Plus de 200 paramètres analysés",
        "Contrôles qualité rigoureux",
        "Résultats sécurisés en ligne",
      ],
      badge: "Service phare",
      href: "/services/laboratoire",
      imageUrl: "/images/a-propos/labo-3.jpg",
      icone: "laboratoire" as const,
      couleurIcone: "text-violet-600",
      fondIcone: "bg-violet-50",
      accent: "from-violet-600/10 to-violet-50",
    },
    {
      id: "consultations",
      categorie: "diagnostic" as const,
      titre: "Consultations médicales",
      description:
        "Consultations générales et spécialisées pour orienter vos examens et interpréter vos résultats avec nos médecins qualifiés.",
      points: [
        "Médecins généralistes & spécialistes",
        "Interprétation des résultats",
        "Suivi personnalisé du patient",
      ],
      href: "/services/consultations",
      imageUrl: "/images/a-propos/labo-1.jpg",
      icone: "consultations" as const,
      couleurIcone: "text-bleu-medical",
      fondIcone: "bg-bleu-medical-clair",
      accent: "from-bleu-medical/10 to-bleu-medical-clair",
    },
    {
      id: "imagerie",
      categorie: "diagnostic" as const,
      titre: "Imagerie médicale",
      description:
        "Radiologie, échographie et examens d'imagerie pour un diagnostic visuel précis et complémentaire aux analyses biologiques.",
      points: [
        "Échographie & radiologie",
        "Équipements numériques",
        "Compte-rendus détaillés",
      ],
      href: "/services/imagerie",
      imageUrl: "/images/a-propos/labo-2.jpg",
      icone: "imagerie" as const,
      couleurIcone: "text-cyan-600",
      fondIcone: "bg-cyan-50",
      accent: "from-cyan-600/10 to-cyan-50",
    },
    {
      id: "pharmacie",
      categorie: "soins" as const,
      titre: "Pharmacie",
      description:
        "Dispensation de médicaments de qualité et conseils pharmaceutiques pour accompagner votre traitement après diagnostic.",
      points: [
        "Médicaments certifiés",
        "Conseils personnalisés",
        "Disponibilité optimisée",
      ],
      href: "/services/pharmacie",
      imageUrl: "/images/a-propos/labo-4.jpg",
      icone: "pharmacie" as const,
      couleurIcone: "text-vert-sante",
      fondIcone: "bg-vert-sante-clair",
      accent: "from-vert-sante/10 to-vert-sante-clair",
    },
    {
      id: "hospitalisation",
      categorie: "soins" as const,
      titre: "Hospitalisation",
      description:
        "Prise en charge hospitalière avec surveillance médicale continue pour les patients nécessitant un suivi approfondi.",
      points: [
        "Chambres confortables",
        "Suivi médical 24h/24",
        "Coordination des soins",
      ],
      href: "/services/hospitalisation",
      icone: "hospitalisation" as const,
      couleurIcone: "text-orange-600",
      fondIcone: "bg-orange-50",
      accent: "from-orange-600/10 to-orange-50",
    },
    {
      id: "urgences",
      categorie: "urgences" as const,
      titre: "Urgences",
      description:
        "Service d'urgences disponible pour les situations critiques nécessitant une prise en charge immédiate et des analyses prioritaires.",
      points: [
        "Disponibilité étendue",
        "Analyses en urgence",
        "Équipe réactive",
      ],
      href: "/services/urgences",
      icone: "urgences" as const,
      couleurIcone: "text-red-600",
      fondIcone: "bg-red-50",
      accent: "from-red-600/10 to-red-50",
    },
  ],

  impact: {
    titre: "Excellence en chiffres",
    sousTitre:
      "Des performances mesurables qui témoignent de notre engagement envers la qualité diagnostique.",
    indicateurs: [
      {
        id: "analyses",
        valeur: "200+",
        libelle: "Types d'analyses",
        description: "Biologie, hématologie, microbiologie, immunologie et plus.",
      },
      {
        id: "patients",
        valeur: "24K+",
        libelle: "Patients / an",
        description: "Prises en charge dans notre centre de MATETE.",
      },
      {
        id: "delai",
        valeur: "24h",
        libelle: "Délai moyen",
        description: "Résultats disponibles rapidement, souvent le jour même.",
      },
      {
        id: "qualite",
        valeur: "ISO 9001",
        libelle: "Certification",
        description: "Processus qualité certifiés et contrôles rigoureux.",
      },
    ],
  },

  specialites: {
    titre: "Spécialités d'analyses",
    sousTitre:
      "Un laboratoire complet couvrant l'ensemble des domaines analytiques essentiels au diagnostic médical",
    domaines: [
      {
        id: "hematologie",
        titre: "Hématologie",
        description: "Numération, coagulation, groupes sanguins, anémies.",
        examens: ["NFS", "VS", "Groupe sanguin", "Frottis"],
      },
      {
        id: "biochimie",
        titre: "Biochimie",
        description: "Glycémie, bilan lipidique, fonction rénale et hépatique.",
        examens: ["Glycémie", "Créatinine", "Bilan lipidique", "Transaminases"],
      },
      {
        id: "microbiologie",
        titre: "Microbiologie",
        description: "Cultures, antibiogrammes, sérologies infectieuses.",
        examens: ["ECBU", "Hémocultures", "Sérologies", "Antibiogramme"],
      },
      {
        id: "parasitologie",
        titre: "Parasitologie",
        description: "Diagnostic des parasitoses courantes en zone tropicale.",
        examens: ["Paludisme", "GEPP", "Filariose", "Amibes"],
      },
      {
        id: "immunologie",
        titre: "Immunologie",
        description: "Marqueurs immunitaires et maladies auto-immunes.",
        examens: ["VIH", "Hépatites", "Auto-anticorps", "Allergies"],
      },
      {
        id: "hormonologie",
        titre: "Hormonologie",
        description: "Bilan hormonal, fertilité, thyroïde et endocrinologie.",
        examens: ["TSH", "FSH/LH", "Prolactine", "Cortisol"],
      },
    ],
  },

  parcours: {
    titre: "Votre parcours chez HAM",
    sousTitre: "Un processus simple, rapide et transparent — de l'accueil à vos résultats",
    etapes: [
      {
        numero: "01",
        titre: "Accueil & orientation",
        description:
          "Notre équipe d'accueil vous oriente et enregistre votre dossier en quelques minutes.",
      },
      {
        numero: "02",
        titre: "Consultation",
        description:
          "Un médecin prescrit les examens adaptés à votre situation clinique.",
      },
      {
        numero: "03",
        titre: "Prélèvement & analyses",
        description:
          "Prélèvement sécurisé et traitement en laboratoire avec contrôles qualité.",
      },
      {
        numero: "04",
        titre: "Résultats fiables",
        description:
          "Remise ou consultation en ligne de vos résultats certifiés et interprétés.",
      },
    ],
  },

  engagements: {
    titre: "Pourquoi choisir HAM LABORATOIRE ?",
    sousTitre: "Des engagements concrets qui font la différence",
    items: [
      {
        id: "fiabilite",
        titre: "Fiabilité certifiée",
        description:
          "Résultats conformes aux normes ISO 9001:2015 et aux bonnes pratiques de laboratoire.",
      },
      {
        id: "rapidite",
        titre: "Rapidité maîtrisée",
        description:
          "Délais optimisés grâce à un flux de travail organisé et des équipements performants.",
      },
      {
        id: "accessibilite",
        titre: "Accessibilité",
        description:
          "Des tarifs favorables permettant aux plus démunis d'accéder à un diagnostic de qualité.",
      },
      {
        id: "equipe",
        titre: "Équipe qualifiée",
        description:
          "Biologistes, techniciens et médecins expérimentés à votre écoute à chaque étape.",
      },
    ],
  },

  cta: {
    titre: "Prêt à prendre soin de votre santé ?",
    description:
      "Prenez rendez-vous en ligne ou contactez-nous — notre équipe est à votre disposition pour vous orienter vers les examens adaptés.",
    boutonPrincipal: { etiquette: "Prendre rendez-vous", href: "/rendez-vous" },
    boutonSecondaire: { etiquette: "Nous contacter", href: "/contact" },
    telephone: "+243 819 191 643",
  },
} as const;

export type IdCategorieService =
  (typeof CONTENU_SERVICES.categories)[number]["id"];
