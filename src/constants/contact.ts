/** Contenu de la page Contact — HAM LABORATOIRE */

export const CONTENU_CONTACT = {
  hero: {
    surtitre: "Restons en contact",
    titre: "Nous sommes",
    titreAccent: "à votre écoute",
    description:
      "Une question sur nos services, vos résultats d'analyses ou une campagne de santé ? Notre équipe HAM LABORATOIRE vous répond avec professionnalisme et bienveillance.",
    statistiques: [
      { valeur: "24-48h", libelle: "Délai de réponse" },
      { valeur: "2", libelle: "Lignes téléphoniques" },
      { valeur: "7j/7", libelle: "Accueil & urgences" },
      { valeur: "MATETE", libelle: "Kinshasa, RDC" },
    ],
  },

  horaires: {
    titre: "Horaires d'ouverture",
    jours: [
      { jour: "Lundi — Vendredi", heures: "07h00 — 19h00" },
      { jour: "Samedi", heures: "07h00 — 14h00" },
      { jour: "Dimanche", heures: "Urgences analyses uniquement" },
    ],
  },

  sujetsFormulaire: [
    { value: "rendez-vous", label: "Prise de rendez-vous" },
    { value: "resultats", label: "Résultats d'examens" },
    { value: "campagnes", label: "Campagnes & dépistages" },
    { value: "tarifs", label: "Tarifs & prestations" },
    { value: "partenariat", label: "Partenariat institutionnel" },
    { value: "reclamation", label: "Réclamation" },
    { value: "autre", label: "Autre demande" },
  ],

  faq: [
    {
      id: "1",
      question: "Comment obtenir mes résultats d'analyses ?",
      reponse:
        "Vos résultats sont disponibles au laboratoire ou en ligne via notre portail patient. Présentez votre fiche de prélèvement ou contactez-nous avec votre numéro de dossier.",
    },
    {
      id: "2",
      question: "Faut-il un rendez-vous pour les analyses ?",
      reponse:
        "La plupart des analyses peuvent être réalisées sans rendez-vous. Pour certains examens spécialisés, nous recommandons de prendre rendez-vous à l'avance.",
    },
    {
      id: "3",
      question: "Quels moyens de paiement acceptez-vous ?",
      reponse:
        "Nous acceptons les paiements en espèces, mobile money et virement bancaire. Des facilités peuvent être accordées pour les campagnes de dépistage.",
    },
    {
      id: "4",
      question: "Où se trouve HAM LABORATOIRE ?",
      reponse:
        "259, Avenue Lumière, Entrée Debonhomme Troisième Parcelle À Droit, Commune MATETE, Kinshasa, RDC. Consultez la carte ci-dessous pour l'itinéraire.",
    },
  ],

  carteEmbed:
    "https://maps.google.com/maps?q=259+Avenue+Lumi%C3%A8re+MATETE+Kinshasa+RDC&z=15&output=embed",

  cta: {
    titre: "Besoin d'un rendez-vous rapidement ?",
    description:
      "Prenez rendez-vous en ligne ou appelez-nous — notre équipe d'accueil est disponible pour vous orienter.",
    boutonRdv: { etiquette: "Prendre rendez-vous", href: "/rendez-vous" },
    boutonFormulaire: { etiquette: "Envoyer un message", href: "#formulaire-contact" },
    telephone: "+243 819 191 643",
  },
} as const;
