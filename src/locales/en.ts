import type { TraductionsSite } from "./types";
import { communEn } from "./commun/en";
import { pagesEn } from "./pages/en";
import { receptionEn } from "./reception/en";
import { caisseEn } from "./caisse/en";
import { laboratoireEn } from "./laboratoire/en";
import { medecinsEn } from "./medecins/en";
import { infirmiersEn } from "./infirmiers/en";
import { pharmacieEn } from "./pharmacie/en";

const en: { translation: TraductionsSite } = {
  translation: {
    nav: {
      accueil: "Home",
      aPropos: "About",
      services: "Services",
      campagnes: "Campaigns",
      contact: "Contact",
      rendezVous: "Appointments",
    },
    common: {
      seConnecter: "Sign in",
      rechercher: "Search",
      fermer: "Close",
      voirTous: "View all",
      voirToutes: "View all",
      enSavoirPlus: "Learn more",
      plusInfos: "More info",
      liensRapides: "Quick links",
      nosServices: "Our services",
      contact: "Contact",
      mentionsLegales: "Legal notice",
      confidentialite: "Privacy policy",
      espacePersonnel: "Staff portal",
      droitsReserves: "All rights reserved.",
      responsable: "Mgr.",
      reseauSocial: "Social network",
      ouvrirMenu: "Open menu",
      fermerMenu: "Close menu",
      navigationPrincipale: "Main navigation",
      navigationMobile: "Mobile navigation",
    },
    hopital: {
      typeEtablissement: "Medical Diagnostic & Analysis Center",
      slogan: "YOUR HEALTH MY BURDEN, RELIABILITY OUR PRE-EMINENCE",
      titreAccueil: "Your health my burden,",
      titreAccueilSuite: "reliability our pre-eminence",
      description:
        "Quality care, state-of-the-art equipment and a medical team at your service.",
    },
    accueil: {
      nosServices: "Our services",
      prestationsMedicales: "Medical services",
      sousTitreServices:
        "Diagnostics, lab tests and care — a complete offering for your health",
      campagnesEnCours: "Current campaigns",
      santePublique: "Public health",
      sousTitreCampagnes: "Screening, awareness and prevention initiatives",
      nosServicesBtn: "Our services",
      prendreRdv: "Book an appointment",
      appMobile: "Mobile app",
      appTitre: "Your health, at your fingertips",
      appDescription:
        "Download our mobile app to book appointments, view your results and manage your medical record.",
      appEnSavoirPlus: "Learn more",
      googlePlay: "Google Play",
      appStore: "App Store",
      disponibleSur: "Available on",
      telechargerSur: "Download on the",
      stats: {
        medecins: "Specialist doctors",
        departements: "Departments",
        patients: "Patients cared for",
        certification: "Quality certification",
      },
      accesRapide: {
        rdv: { titre: "Book appointment", sousTitre: "Online 24/7" },
        resultats: { titre: "Test results", sousTitre: "Available online" },
        paiement: { titre: "Secure payment", sousTitre: "Online" },
        support: { titre: "Patient support", sousTitre: "Dedicated assistance" },
      },
      services: {
        consultations: {
          titre: "Consultations",
          description:
            "General and specialized consultations with our experienced physicians.",
        },
        laboratoire: {
          titre: "Laboratory",
          description:
            "Complete medical tests with state-of-the-art equipment.",
        },
        pharmacie: {
          titre: "Pharmacy",
          description:
            "Quality medicines and personalized pharmaceutical advice.",
        },
        hospitalisation: {
          titre: "Hospitalization",
          description:
            "Inpatient care with continuous medical monitoring.",
        },
        urgences: {
          titre: "Emergency",
          description:
            "24/7 emergency service for critical situations.",
        },
        imagerie: {
          titre: "Medical imaging",
          description:
            "Radiology, ultrasound and MRI for accurate diagnosis.",
        },
      },
    },
    footer: {
      consultations: "Consultations",
      laboratoire: "Laboratory",
      pharmacie: "Pharmacy",
      urgences: "Emergency",
      applicationMobile: "Mobile app",
    },
    recherche: {
      titre: "Search the site",
      placeholder: "Services, campaigns, pages…",
      hint: "Type at least 2 characters to search.",
      suggestions: "Suggestions",
      aucunResultat: "No results for this search.",
      aucunResultatTitre: "No results found",
      aucunResultatPour: "No results for \"{{query}}\"",
      aucunResultatConseil:
        "Try different keywords, check spelling, or browse our main pages.",
      compteur: "{{count}} result(s)",
      navigation: "↑↓ navigate · Enter open · Esc close",
      raccourci: "Ctrl+K to search",
      categories: {
        page: "Page",
        service: "Service",
        campagne: "Campaign",
        acces: "Quick access",
        faq: "FAQ",
        prestation: "Service type",
      },
      pages: {
        "/": "Home",
        "/a-propos": "About HAM Laboratory",
        "/services": "Our medical services",
        "/campagnes": "Health campaigns",
        "/contact": "Contact us",
        "/rendez-vous": "Book an appointment online",
        "/resultats": "View your test results",
        "/connexion": "Staff portal — Sign in",
        "/application": "HAM mobile app",
      },
    },
    pages: pagesEn,
    reception: receptionEn,
    caisse: caisseEn,
    laboratoire: laboratoireEn,
    medecins: medecinsEn,
    infirmiers: infirmiersEn,
    pharmacie: pharmacieEn,
    ...communEn,
  },
};

export default en;
