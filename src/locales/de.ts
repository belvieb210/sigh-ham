import type { TraductionsSite } from "./types";
import { communDe } from "./commun/de";
import { pagesDe } from "./pages/de";
import { receptionDe } from "./reception/de";
import { caisseDe } from "./caisse/de";
import { laboratoireDe } from "./laboratoire/de";
import { medecinsDe } from "./medecins/de";
import { infirmiersDe } from "./infirmiers/de";
import { pharmacieDe } from "./pharmacie/de";
import { medecinsExternesDe } from "./medecins-externes/de";
import { egliseDe } from "./eglise/de";

const de: { translation: TraductionsSite } = {
  translation: {
    nav: {
      accueil: "Startseite",
      aPropos: "Über uns",
      services: "Leistungen",
      campagnes: "Kampagnen",
      contact: "Kontakt",
      rendezVous: "Termine",
    },
    common: {
      seConnecter: "Anmelden",
      rechercher: "Suchen",
      fermer: "Schließen",
      voirTous: "Alle anzeigen",
      voirToutes: "Alle anzeigen",
      enSavoirPlus: "Mehr erfahren",
      plusInfos: "Weitere Infos",
      liensRapides: "Schnelllinks",
      nosServices: "Unsere Leistungen",
      contact: "Kontakt",
      mentionsLegales: "Impressum",
      confidentialite: "Datenschutz",
      espacePersonnel: "Mitarbeiterportal",
      droitsReserves: "Alle Rechte vorbehalten.",
      responsable: "Leit.",
      reseauSocial: "Soziales Netzwerk",
      ouvrirMenu: "Menü öffnen",
      fermerMenu: "Menü schließen",
      navigationPrincipale: "Hauptnavigation",
      navigationMobile: "Mobile Navigation",
    },
    hopital: {
      typeEtablissement: "Medizinisches Diagnose- und Analysezentrum",
      slogan: "IHRE GESUNDHEIT UNSERE LAST, ZUVERLÄSSIGKEIT UNSER VORRANG",
      titreAccueil: "Ihre Gesundheit unsere Last,",
      titreAccueilSuite: "Zuverlässigkeit unser Vorrang",
      description:
        "Qualitätsversorgung, modernste Ausstattung und ein medizinisches Team für Sie.",
    },
    accueil: {
      nosServices: "Unsere Leistungen",
      prestationsMedicales: "Medizinische Leistungen",
      sousTitreServices:
        "Diagnostik, Laboruntersuchungen und Versorgung — ein umfassendes Angebot für Ihre Gesundheit",
      campagnesEnCours: "Laufende Kampagnen",
      santePublique: "Öffentliche Gesundheit",
      sousTitreCampagnes: "Vorsorge, Aufklärung und Präventionsmaßnahmen",
      nosServicesBtn: "Unsere Leistungen",
      prendreRdv: "Termin vereinbaren",
      appMobile: "Mobile App",
      appTitre: "Ihre Gesundheit, immer griffbereit",
      appDescription:
        "Laden Sie unsere mobile App herunter, um Termine zu buchen, Ihre Ergebnisse einzusehen und Ihre Krankenakte zu verwalten.",
      appEnSavoirPlus: "Mehr erfahren",
      googlePlay: "Google Play",
      appStore: "App Store",
      disponibleSur: "Verfügbar auf",
      telechargerSur: "Herunterladen auf",
      stats: {
        medecins: "Fachärzte",
        departements: "Abteilungen",
        patients: "Betreute Patienten",
        certification: "Qualitätszertifizierung",
      },
      accesRapide: {
        rdv: { titre: "Termin buchen", sousTitre: "Online 24/7" },
        resultats: { titre: "Testergebnisse", sousTitre: "Online verfügbar" },
        paiement: { titre: "Sichere Zahlung", sousTitre: "Online" },
        support: { titre: "Patientenbetreuung", sousTitre: "Persönliche Unterstützung" },
      },
      services: {
        consultations: {
          titre: "Konsultationen",
          description:
            "Allgemeine und fachärztliche Konsultationen mit unseren erfahrenen Ärzten.",
        },
        laboratoire: {
          titre: "Labor",
          description:
            "Umfassende medizinische Untersuchungen mit modernster Ausstattung.",
        },
        pharmacie: {
          titre: "Apotheke",
          description:
            "Qualitätsmedikamente und individuelle pharmazeutische Beratung.",
        },
        hospitalisation: {
          titre: "Stationäre Versorgung",
          description:
            "Stationäre Betreuung mit kontinuierlicher medizinischer Überwachung.",
        },
        urgences: {
          titre: "Notfall",
          description:
            "24/7-Notfalldienst für kritische Situationen.",
        },
        imagerie: {
          titre: "Medizinische Bildgebung",
          description:
            "Radiologie, Ultraschall und MRT für eine präzise Diagnose.",
        },
      },
    },
    footer: {
      consultations: "Konsultationen",
      laboratoire: "Labor",
      pharmacie: "Apotheke",
      urgences: "Notfall",
      applicationMobile: "Mobile App",
    },
    recherche: {
      titre: "Website durchsuchen",
      placeholder: "Leistungen, Kampagnen, Seiten…",
      hint: "Geben Sie mindestens 2 Zeichen ein, um zu suchen.",
      suggestions: "Vorschläge",
      aucunResultat: "Keine Ergebnisse für diese Suche.",
      aucunResultatTitre: "Keine Ergebnisse gefunden",
      aucunResultatPour: "Keine Ergebnisse für \"{{query}}\"",
      aucunResultatConseil:
        "Versuchen Sie andere Stichwörter, prüfen Sie die Rechtschreibung oder durchsuchen Sie unsere Hauptseiten.",
      compteur: "{{count}} Ergebnis(se)",
      navigation: "↑↓ navigieren · Enter öffnen · Esc schließen",
      raccourci: "Strg+K zum Suchen",
      categories: {
        page: "Seite",
        service: "Leistung",
        campagne: "Kampagne",
        acces: "Schnellzugriff",
        faq: "FAQ",
        prestation: "Leistungsart",
      },
      pages: {
        "/": "Startseite",
        "/a-propos": "Über HAM Laboratoire",
        "/services": "Unsere medizinischen Leistungen",
        "/campagnes": "Gesundheitskampagnen",
        "/contact": "Kontaktieren Sie uns",
        "/rendez-vous": "Online-Termin vereinbaren",
        "/resultats": "Ihre Testergebnisse einsehen",
        "/connexion": "Mitarbeiterportal — Anmelden",
        "/application": "HAM Mobile App",
      },
    },
    pages: pagesDe,
    reception: receptionDe,
    caisse: caisseDe,
    laboratoire: laboratoireDe,
    medecins: medecinsDe,
    infirmiers: infirmiersDe,
    pharmacie: pharmacieDe,
    medecinsExternes: medecinsExternesDe,
    eglise: egliseDe,
    ...communDe,
  },
};

export default de;
