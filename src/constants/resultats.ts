export const CONTENU_RESULTATS = {
  hero: {
    surtitre: "Portail patient",
    titre: "Consultez vos",
    titreAccent: "résultats",
    description:
      "Accédez en toute sécurité à vos rapports d'analyses approuvés par notre équipe médicale — disponibles 24h/24 depuis n'importe où.",
    stats: {
      securise: "Accès sécurisé",
      disponible: "Disponible 24h/24",
      certifie: "Résultats certifiés",
      rapide: "Consultation instantanée",
    },
  },
  consultation: {
    surtitre: "Vos examens",
    titre: "Accéder à vos résultats",
    sousTitre:
      "Saisissez vos informations telles qu'elles figurent sur votre fiche de prélèvement et votre facture.",
    securite:
      "Vos données sont protégées. Seuls les examens approuvés par le médecin responsable sont accessibles.",
    aide: "Besoin d'aide ?",
    aideTexte: "Notre accueil peut vous aider à retrouver votre numéro de patient ou de facture.",
  },
  form: {
    nom: "Nom *",
    prenom: "Prénom *",
    numeroPatient: "N° patient *",
    numeroFacture: "N° facture *",
    telephone: "Téléphone *",
    numeroPatientAide: "Ex. 20260811025",
    numeroFactureAide: "Ex. FAC-2026-00042",
    telephoneAide: "Ex. +243 819 191 643",
    rechercher: "Consulter mes résultats",
    recherche: "Vérification en cours…",
    nouvelleRecherche: "Nouvelle recherche",
    erreur:
      "Informations incorrectes ou résultats non encore disponibles. Vérifiez vos données ou contactez l'accueil.",
  },
  visionneuse: {
    titre: "Rapport de résultats",
    ouvrir: "Ouvrir",
    telecharger: "Télécharger",
    fermer: "Fermer",
    chargement: "Chargement du rapport…",
    erreurPdf: "Impossible d'afficher le PDF.",
    details: "Détails du dossier",
    examens: "Examens inclus",
    examensExclus: "Examens exclus",
    examensExclusInfo:
      "Ces examens de votre facture ne sont pas encore disponibles en ligne.",
    enAttenteTitre: "Résultats en cours de validation",
    enAttenteMessage:
      "Vos résultats ne sont pas encore disponibles en ligne. Ils seront accessibles sous 24 heures après validation par notre équipe médicale.",
    enAttenteExamens: "Examens en attente sur cette facture",
    actions: "Actions",
    ouvrirOnglet: "Ouvrir dans un nouvel onglet",
    imprimer: "Imprimer",
    informations:
      "Ce document est un rapport officiel HAM LABORATOIRE. Conservez-le pour vos consultations médicales.",
    patient: "Patient",
    numeroPatient: "N° patient",
    facture: "N° facture",
    prescripteur: "Médecin prescripteur",
    dateAnalyse: "Date d'analyse",
    montant: "Montant facture",
    statut: "Statut",
    statutApprouve: "Approuvé — disponible",
  },
} as const;
