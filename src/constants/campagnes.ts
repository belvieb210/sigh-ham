import type { CampagnePublication } from "@/types/campagnes";

/**
 * Source de données des campagnes & publicités HAM LABORATOIRE.
 *
 * Phase actuelle : données statiques (constants).
 * Phase future  : l'API admin remplacera ce fichier —
 *   POST /api/campagnes  → publie une campagne (publie: true)
 *   GET  /api/campagnes  → alimente cette page automatiquement
 */
export const CAMPAGNES_PUBLICATIONS: CampagnePublication[] = [
  {
    id: "paludisme-2026",
    slug: "depistage-paludisme",
    titre: "Campagne de dépistage du paludisme",
    extrait:
      "Dépistage rapide du paludisme à tarif réduit — protégez votre famille.",
    description:
      "HAM LABORATOIRE lance une campagne de dépistage du paludisme avec des tarifs préférentiels. Nos techniciens qualifiés réalisent un test rapide (TDR) avec résultat fiable en moins de 30 minutes. Sensibilisation incluse sur la prévention en zone tropicale.",
    periode: "Du 01 Juillet au 31 Août 2026",
    dateDebut: "2026-07-01",
    dateFin: "2026-08-31",
    href: "/campagnes/depistage-paludisme",
    categorie: "depistage",
    typePublication: "campagne",
    publie: true,
    misEnAvant: true,
    couleurFond: "bg-bleu-medical-clair",
    couleurIllustration: "from-bleu-medical/15 to-bleu-medical-clair",
    couleurAccent: "text-bleu-medical",
    icone: "diabete",
    imageUrl: "/images/a-propos/labo-3.jpg",
    lieu: "HAM Laboratoire — MATETE",
    datePublication: "2026-06-28",
  },
  {
    id: "depistage-vih-2026",
    slug: "depistage-vih",
    titre: "Dépistage VIH — gratuit et confidentiel",
    extrait:
      "Test VIH gratuit, résultats confidentiels et accompagnement bienveillant.",
    description:
      "Dans le cadre de notre engagement en santé publique, HAM LABORATOIRE propose un dépistage VIH gratuit et totalement confidentiel. Prélèvement sécurisé, résultats fiables et orientation vers les structures de prise en charge si nécessaire.",
    periode: "Du 15 Juillet au 15 Août 2026",
    dateDebut: "2026-07-15",
    dateFin: "2026-08-15",
    href: "/campagnes/depistage-vih",
    categorie: "depistage",
    typePublication: "campagne",
    publie: true,
    misEnAvant: true,
    couleurFond: "bg-red-50",
    couleurIllustration: "from-red-100 to-rose-50",
    couleurAccent: "text-red-600",
    icone: "ruban",
    imageUrl: "/images/a-propos/labo-1.jpg",
    lieu: "HAM Laboratoire — MATETE",
    datePublication: "2026-07-10",
  },
  {
    id: "cancer-sein",
    slug: "depistage-cancer-sein",
    titre: "Dépistage du cancer du sein",
    extrait:
      "Octobre rose — dépistage précoce et sensibilisation au cancer du sein.",
    description:
      "Campagne annuelle de sensibilisation et de dépistage du cancer du sein. Examens cliniques, orientation mammographie et conseils de prévention dispensés par notre équipe médicale.",
    periode: "Du 01 au 31 Mai 2026",
    dateDebut: "2026-05-01",
    dateFin: "2026-05-31",
    href: "/campagnes/depistage-cancer-sein",
    categorie: "depistage",
    typePublication: "campagne",
    publie: true,
    misEnAvant: false,
    couleurFond: "bg-pink-50",
    couleurIllustration: "from-pink-100 to-pink-50",
    couleurAccent: "text-pink-600",
    icone: "ruban",
    datePublication: "2026-04-20",
  },
  {
    id: "vaccination-grippe",
    slug: "vaccination-grippe",
    titre: "Vaccination antigrippe",
    extrait:
      "Protégez-vous contre la grippe saisonnière — vaccination disponible.",
    description:
      "Campagne de vaccination antigrippe pour les populations à risque et le grand public. Vaccins certifiés, administration par des professionnels de santé qualifiés.",
    periode: "Du 15 au 30 Avril 2026",
    dateDebut: "2026-04-15",
    dateFin: "2026-04-30",
    href: "/campagnes/vaccination-grippe",
    categorie: "vaccination",
    typePublication: "campagne",
    publie: true,
    misEnAvant: false,
    couleurFond: "bg-white",
    couleurIllustration: "from-blue-100 to-blue-50",
    couleurAccent: "text-blue-600",
    icone: "vaccin",
    datePublication: "2026-04-01",
  },
  {
    id: "depistage-diabete",
    slug: "depistage-diabete",
    titre: "Dépistage du diabète",
    extrait:
      "Glycémie, HbA1c et conseils nutritionnels — détectez le diabète tôt.",
    description:
      "Semaine de dépistage du diabète avec bilan glycémique complet à prix réduit. Interprétation des résultats par un médecin et recommandations personnalisées.",
    periode: "Du 01 au 15 Juin 2026",
    dateDebut: "2026-06-01",
    dateFin: "2026-06-15",
    href: "/campagnes/depistage-diabete",
    categorie: "depistage",
    typePublication: "campagne",
    publie: true,
    misEnAvant: false,
    couleurFond: "bg-white",
    couleurIllustration: "from-green-100 to-green-50",
    couleurAccent: "text-green-600",
    icone: "diabete",
    datePublication: "2026-05-25",
  },
  {
    id: "journee-cardiologie",
    slug: "journee-cardiologie",
    titre: "Journée de la cardiologie",
    extrait:
      "Bilans cardiaques, ECG et sensibilisation aux maladies cardiovasculaires.",
    description:
      "À l'occasion de la Journée mondiale du cœur, HAM LABORATOIRE organise une journée portes ouvertes dédiée à la santé cardiovasculaire : ECG, bilan lipidique et consultations spécialisées.",
    periode: "29 Septembre 2026",
    dateDebut: "2026-09-29",
    dateFin: "2026-09-29",
    href: "/campagnes/journee-cardiologie",
    categorie: "evenement",
    typePublication: "evenement",
    publie: true,
    misEnAvant: true,
    couleurFond: "bg-white",
    couleurIllustration: "from-amber-100 to-amber-50",
    couleurAccent: "text-amber-700",
    icone: "coeur",
    imageUrl: "/images/a-propos/labo-4.jpg",
    lieu: "HAM Laboratoire — Kinshasa",
    datePublication: "2026-07-01",
  },
  {
    id: "hypertension-2026",
    slug: "sensibilisation-hypertension",
    titre: "Semaine de sensibilisation — Hypertension",
    extrait:
      "Mesure gratuite de la tension et dépistage des facteurs de risque.",
    description:
      "Campagne de prévention de l'hypertension artérielle : mesure gratuite, bilan rénal et conseils hygiéno-diététiques par nos infirmiers et médecins.",
    periode: "Du 01 au 07 Septembre 2026",
    dateDebut: "2026-09-01",
    dateFin: "2026-09-07",
    href: "/campagnes/sensibilisation-hypertension",
    categorie: "sensibilisation",
    typePublication: "campagne",
    publie: true,
    misEnAvant: false,
    couleurFond: "bg-indigo-50",
    couleurIllustration: "from-indigo-100 to-indigo-50",
    couleurAccent: "text-indigo-600",
    icone: "coeur",
    datePublication: "2026-08-15",
  },
  {
    id: "pub-equipements-2026",
    slug: "nouveaux-equipements",
    titre: "Nouveaux équipements de laboratoire",
    extrait:
      "HAM LABORATOIRE modernise son parc analytique — fiabilité renforcée.",
    description:
      "Publicité institutionnelle : HAM LABORATOIRE investit dans de nouveaux analyseurs automatiques de dernière génération pour des résultats encore plus rapides et fiables.",
    periode: "Publication permanente",
    dateDebut: "2026-07-01",
    dateFin: "2026-12-31",
    href: "/campagnes/nouveaux-equipements",
    categorie: "sensibilisation",
    typePublication: "publicite",
    publie: true,
    misEnAvant: false,
    couleurFond: "bg-bleu-medical-clair",
    couleurIllustration: "from-bleu-medical/20 to-bleu-medical-clair",
    couleurAccent: "text-bleu-medical",
    icone: "vaccin",
    datePublication: "2026-07-20",
  },
  /* Exemple brouillon — ne s'affiche PAS sur le site public */
  {
    id: "brouillon-hepatite",
    slug: "depistage-hepatite",
    titre: "Dépistage hépatites B & C",
    extrait: "Campagne en préparation.",
    description: "Brouillon — à publier depuis l'espace admin.",
    periode: "Octobre 2026",
    dateDebut: "2026-10-01",
    dateFin: "2026-10-31",
    href: "/campagnes/depistage-hepatite",
    categorie: "depistage",
    typePublication: "campagne",
    publie: false,
    misEnAvant: false,
    couleurFond: "bg-gray-50",
    couleurIllustration: "from-gray-100 to-gray-50",
    couleurAccent: "text-gray-600",
    icone: "ruban",
    datePublication: "2026-07-25",
  },
];

export const CONTENU_CAMPAGNES = {
  hero: {
    surtitre: "Actions de santé publique",
    titre: "Campagnes &",
    titreAccent: "publicités",
    description:
      "HAM LABORATOIRE mène des actions de prévention, de dépistage et de sensibilisation au service des populations de Kinshasa. Découvrez nos initiatives en cours et participez à la santé de tous.",
    statistiques: [
      { valeur: "15K+", libelle: "Personnes sensibilisées / an" },
      { valeur: "24", libelle: "Actions par an en moyenne" },
      { valeur: "98%", libelle: "Taux de satisfaction" },
      { valeur: "ISO 9001", libelle: "Certification qualité" },
    ],
  },
  impact: {
    titre: "Notre impact en chiffres",
    sousTitre:
      "Des campagnes structurées, mesurables et ancrées dans la réalité sanitaire congolaise.",
    indicateurs: [
      {
        id: "depistages",
        valeur: "8 500+",
        libelle: "Dépistages réalisés",
        description: "VIH, paludisme, diabète et autres pathologies ciblées.",
      },
      {
        id: "vaccinations",
        valeur: "3 200+",
        libelle: "Vaccinations administrées",
        description: "Grippe, hépatites et campagnes saisonnières.",
      },
      {
        id: "partenaires",
        valeur: "12+",
        libelle: "Partenaires institutionnels",
        description: "ONG, entreprises et structures de santé publique.",
      },
      {
        id: "communes",
        valeur: "6",
        libelle: "Communes couvertes",
        description: "Actions de proximité à Kinshasa et environs.",
      },
    ],
  },
  parcours: {
    titre: "Comment participer ?",
    sousTitre:
      "Un parcours simple et accessible, pensé pour faciliter votre participation à nos actions.",
    etapes: [
      {
        numero: "01",
        titre: "Découvrir",
        description:
          "Parcourez nos campagnes en cours et consultez les dates, lieux et conditions de participation.",
      },
      {
        numero: "02",
        titre: "S'inscrire",
        description:
          "Prenez rendez-vous en ligne, par téléphone ou présentez-vous directement au laboratoire.",
      },
      {
        numero: "03",
        titre: "Participer",
        description:
          "Bénéficiez de dépistages, vaccinations ou consultations dans un cadre professionnel et confidentiel.",
      },
      {
        numero: "04",
        titre: "Suivi",
        description:
          "Recevez vos résultats et, si nécessaire, une orientation vers les structures de prise en charge.",
      },
    ],
  },
  cta: {
    titre: "Organiser une campagne avec HAM ?",
    description:
      "Institutions, entreprises et associations — co-construisons ensemble des actions de santé publique à impact mesurable.",
    bouton: { etiquette: "Nous contacter", href: "/contact" },
    boutonSecondaire: { etiquette: "Prendre rendez-vous", href: "/rendez-vous" },
    telephone: "+243 819 191 643",
  },
} as const;
