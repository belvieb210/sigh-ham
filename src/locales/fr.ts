import type { TraductionsSite } from "./types";
import { communFr } from "./commun/fr";
import { pagesFr } from "./pages/fr";
import { receptionFr } from "./reception/fr";
import { caisseFr } from "./caisse/fr";
import { laboratoireFr } from "./laboratoire/fr";
import { medecinsFr } from "./medecins/fr";
import { infirmiersFr } from "./infirmiers/fr";
import { pharmacieFr } from "./pharmacie/fr";
import { medecinsExternesFr } from "./medecins-externes/fr";

const fr: { translation: TraductionsSite } = {
  translation: {
    nav: {
      accueil: "Accueil",
      aPropos: "À propos",
      services: "Services",
      campagnes: "Campagnes",
      contact: "Contact",
      rendezVous: "Rendez-vous",
    },
    common: {
      seConnecter: "Se connecter",
      rechercher: "Rechercher",
      fermer: "Fermer",
      voirTous: "Voir tous",
      voirToutes: "Voir toutes",
      enSavoirPlus: "En savoir plus",
      plusInfos: "Plus d'infos",
      liensRapides: "Liens rapides",
      nosServices: "Nos services",
      contact: "Contact",
      mentionsLegales: "Mentions légales",
      confidentialite: "Confidentialité",
      espacePersonnel: "Espace personnel",
      droitsReserves: "Tous droits réservés.",
      responsable: "Resp.",
      reseauSocial: "Réseau social",
      ouvrirMenu: "Ouvrir le menu",
      fermerMenu: "Fermer le menu",
      navigationPrincipale: "Navigation principale",
      navigationMobile: "Navigation mobile",
    },
    hopital: {
      typeEtablissement: "Centre de Diagnostic et d'Analyses Médicales",
      slogan: "VOTRE SANTÉ MON FARDEAU, LA FIABILITÉ NOTRE PRÉÉMINENCE",
      titreAccueil: "Votre santé mon fardeau,",
      titreAccueilSuite: "la fiabilité notre prééminence",
      description:
        "Des soins de qualité, des équipements de pointe et une équipe médicale à votre écoute.",
    },
    accueil: {
      nosServices: "Nos services",
      prestationsMedicales: "Prestations médicales",
      sousTitreServices:
        "Diagnostic, analyses et soins — une offre complète pour votre santé",
      campagnesEnCours: "Campagnes en cours",
      santePublique: "Santé publique",
      sousTitreCampagnes: "Dépistages, sensibilisation et actions de prévention",
      nosServicesBtn: "Nos services",
      prendreRdv: "Prendre rendez-vous",
      appMobile: "Application mobile",
      appTitre: "Votre santé, à portée de main",
      appDescription:
        "Téléchargez notre application mobile pour prendre rendez-vous, consulter vos résultats et gérer votre dossier médical.",
      appEnSavoirPlus: "En savoir plus",
      googlePlay: "Google Play",
      appStore: "App Store",
      disponibleSur: "Disponible sur",
      telechargerSur: "Télécharger sur",
      stats: {
        medecins: "Médecins spécialistes",
        departements: "Départements",
        patients: "Patients pris en charge",
        certification: "Certification qualité",
      },
      accesRapide: {
        rdv: { titre: "Prise de rendez-vous", sousTitre: "En ligne 24h/24" },
        resultats: {
          titre: "Résultats d'examens",
          sousTitre: "Consultables en ligne",
        },
        paiement: { titre: "Paiement sécurisé", sousTitre: "En ligne" },
        support: { titre: "Support patient", sousTitre: "Assistance dédiée" },
      },
      services: {
        consultations: {
          titre: "Consultations",
          description:
            "Consultations générales et spécialisées avec nos médecins expérimentés.",
        },
        laboratoire: {
          titre: "Laboratoire",
          description:
            "Analyses médicales complètes avec des équipements de dernière génération.",
        },
        pharmacie: {
          titre: "Pharmacie",
          description:
            "Médicaments de qualité et conseils pharmaceutiques personnalisés.",
        },
        hospitalisation: {
          titre: "Hospitalisation",
          description:
            "Prise en charge hospitalière avec un suivi médical continu.",
        },
        urgences: {
          titre: "Urgences",
          description:
            "Service d'urgences disponible 24h/24 pour les situations critiques.",
        },
        imagerie: {
          titre: "Imagerie médicale",
          description:
            "Radiologie, échographie et IRM pour un diagnostic précis.",
        },
      },
    },
    footer: {
      consultations: "Consultations",
      laboratoire: "Laboratoire",
      pharmacie: "Pharmacie",
      urgences: "Urgences",
      applicationMobile: "Application mobile",
    },
    recherche: {
      titre: "Rechercher sur le site",
      placeholder: "Services, campagnes, pages…",
      hint: "Tapez au moins 2 caractères pour lancer la recherche.",
      suggestions: "Suggestions",
      aucunResultat: "Aucun résultat pour cette recherche.",
      aucunResultatTitre: "Aucun résultat trouvé",
      aucunResultatPour: "Aucun résultat pour « {{query}} »",
      aucunResultatConseil:
        "Essayez d'autres mots-clés, vérifiez l'orthographe ou parcourez nos pages principales.",
      compteur: "{{count}} résultat(s)",
      navigation: "↑↓ naviguer · Entrée ouvrir · Échap fermer",
      raccourci: "Ctrl+K pour rechercher",
      categories: {
        page: "Page",
        service: "Service",
        campagne: "Campagne",
        acces: "Accès rapide",
        faq: "FAQ",
        prestation: "Prestation",
      },
      pages: {
        "/": "Accueil",
        "/a-propos": "À propos de HAM Laboratoire",
        "/services": "Nos services médicaux",
        "/campagnes": "Campagnes de santé",
        "/contact": "Contactez-nous",
        "/rendez-vous": "Prendre rendez-vous en ligne",
        "/resultats": "Consulter vos résultats d'examens",
        "/connexion": "Espace personnel — Connexion",
        "/application": "Application mobile HAM",
      },
    },
    pages: pagesFr,
    reception: receptionFr,
    caisse: caisseFr,
    laboratoire: laboratoireFr,
    medecins: medecinsFr,
    infirmiers: infirmiersFr,
    pharmacie: pharmacieFr,
    medecinsExternes: medecinsExternesFr,
    ...communFr,
  },
};

export default fr;
