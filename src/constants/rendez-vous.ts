/** Contenu de la page Rendez-vous — HAM LABORATOIRE */

export const CONTENU_RENDEZ_VOUS = {
  hero: {
    surtitre: "Prise de rendez-vous en ligne",
    titre: "Réservez votre",
    titreAccent: "consultation",
    description:
      "Planifiez votre visite au laboratoire en quelques clics — analyses, consultations, imagerie ou dépistages. Confirmation immédiate et rappel par SMS ou email.",
    statistiques: [
      { valeur: "5 min", libelle: "Réservation rapide" },
      { valeur: "24h/24", libelle: "Disponible en ligne" },
      { valeur: "100%", libelle: "Confirmation instantanée" },
      { valeur: "ISO", libelle: "Qualité certifiée" },
    ],
  },

  typesPrestation: [
    {
      id: "analyses",
      titre: "Analyses de laboratoire",
      description:
        "Prélèvements sanguins, urinaires et biologiques — bilan complet ou examens ciblés.",
      duree: "15 — 30 min",
      sansRdv: true,
      icone: "flask" as const,
      accent: "from-violet-600/10 to-violet-50",
    },
    {
      id: "consultation",
      titre: "Consultation médicale",
      description:
        "Consultation générale ou spécialisée pour interpréter vos résultats ou orienter vos examens.",
      duree: "30 — 45 min",
      sansRdv: false,
      icone: "stethoscope" as const,
      accent: "from-bleu-medical/10 to-bleu-medical-clair",
    },
    {
      id: "imagerie",
      titre: "Imagerie médicale",
      description:
        "Échographie, radiologie et examens d'imagerie sur rendez-vous.",
      duree: "20 — 60 min",
      sansRdv: false,
      icone: "scan" as const,
      accent: "from-cyan-600/10 to-cyan-50",
    },
    {
      id: "depistage",
      titre: "Dépistage & campagne",
      description:
        "Participation aux campagnes de santé publique et dépistages organisés par HAM LABORATOIRE.",
      duree: "20 — 40 min",
      sansRdv: false,
      icone: "heart-pulse" as const,
      accent: "from-[#7a1f4e]/10 to-[#fdf2f8]",
    },
    {
      id: "prelevement",
      titre: "Prélèvement spécialisé",
      description:
        "Prélèvements nécessitant une préparation ou un protocole spécifique (jeûne, horaire précis).",
      duree: "30 min",
      sansRdv: false,
      icone: "syringe" as const,
      accent: "from-orange-600/10 to-orange-50",
    },
  ],

  parcours: {
    titre: "Comment ça marche ?",
    sousTitre: "Quatre étapes simples pour confirmer votre rendez-vous",
    etapes: [
      {
        numero: "01",
        titre: "Choisissez la prestation",
        description:
          "Sélectionnez le type d'examen ou de consultation dont vous avez besoin.",
      },
      {
        numero: "02",
        titre: "Date & créneau",
        description:
          "Indiquez la date et l'heure qui vous conviennent parmi nos disponibilités.",
      },
      {
        numero: "03",
        titre: "Vos coordonnées",
        description:
          "Renseignez vos informations pour recevoir la confirmation et les consignes.",
      },
      {
        numero: "04",
        titre: "Confirmation",
        description:
          "Validez votre demande — vous recevez un numéro de référence par email ou SMS.",
      },
    ],
  },

  infosPratiques: {
    titre: "Informations pratiques",
    sousTitre: "Préparez votre visite au laboratoire",
    items: [
      {
        id: "piece",
        titre: "Pièces à apporter",
        description:
          "Carte d'identité, ordonnance médicale si applicable, carnet de santé et résultats antérieurs.",
        icone: "file" as const,
      },
      {
        id: "jeune",
        titre: "Jeûne & préparation",
        description:
          "Certains examens nécessitent un jeûne de 8 à 12 h. Les consignes vous seront précisées à la confirmation.",
        icone: "clock" as const,
      },
      {
        id: "horaires",
        titre: "Horaires d'accueil",
        description:
          "Lun — Ven : 07h — 19h · Sam : 07h — 14h · Dim : urgences analyses uniquement.",
        icone: "calendar" as const,
      },
      {
        id: "acces",
        titre: "Accès & parking",
        description:
          "259, Avenue Lumière, MATETE — Kinshasa. Accès facile, stationnement disponible à proximité.",
        icone: "map-pin" as const,
      },
    ],
  },

  faq: [
    {
      id: "1",
      question: "Puis-je venir sans rendez-vous pour des analyses ?",
      reponse:
        "Oui, la plupart des analyses de laboratoire peuvent être réalisées sans rendez-vous durant nos heures d'ouverture. Un créneau réservé vous garantit un accueil prioritaire.",
    },
    {
      id: "2",
      question: "Comment modifier ou annuler mon rendez-vous ?",
      reponse:
        "Contactez notre accueil au +243 819 191 643 ou par email à obb5lab@gmail.com en indiquant votre numéro de référence. Merci de prévenir au moins 24 h à l'avance.",
    },
    {
      id: "3",
      question: "Recevrai-je un rappel avant mon rendez-vous ?",
      reponse:
        "Oui, un rappel vous est envoyé par SMS ou email 24 heures avant votre créneau, avec les consignes de préparation si nécessaire.",
    },
    {
      id: "4",
      question: "Les rendez-vous en ligne sont-ils gratuits ?",
      reponse:
        "La prise de rendez-vous en ligne est entièrement gratuite. Seuls les examens et consultations réalisés sont facturés selon notre grille tarifaire.",
    },
  ],

  cta: {
    titre: "Une question avant de réserver ?",
    description:
      "Notre équipe d'accueil est disponible pour vous orienter vers la bonne prestation.",
    telephone: "+243 819 191 643",
    boutonContact: { etiquette: "Nous contacter", href: "/contact" },
    boutonReserver: { etiquette: "Réserver maintenant", href: "#reservation" },
  },
} as const;

export type IdTypePrestation =
  (typeof CONTENU_RENDEZ_VOUS.typesPrestation)[number]["id"];
