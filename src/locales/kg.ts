import type { TraductionsSite } from "./types";
import { communKg } from "./commun/kg";
import { pagesKg } from "./pages/kg";
import { receptionKg } from "./reception/kg";
import { caisseKg } from "./caisse/kg";

/** Kikongo — traductions principales du site public */
const kg: { translation: TraductionsSite } = {
  translation: {
    nav: {
      accueil: "Ebandeli",
      aPropos: "Kuhusu biso",
      services: "Bisalu",
      campagnes: "Ba campagnes",
      contact: "Bokomi",
      rendezVous: "Rendez-vous",
    },
    common: {
      seConnecter: "Kota",
      rechercher: "Luka",
      fermer: "Kanga",
      voirTous: "Tala nyonso",
      voirToutes: "Tala nyonso",
      enSavoirPlus: "Yebisa mingi",
      plusInfos: "Ba infos",
      liensRapides: "Ba lien ya noki",
      nosServices: "Bisalu na biso",
      contact: "Bokomi",
      mentionsLegales: "Mentions légales",
      confidentialite: "Confidentialité",
      espacePersonnel: "Espace ya basali",
      droitsReserves: "Makoki nyonso ebomami.",
      responsable: "Mokambi",
      reseauSocial: "Réseau social",
      ouvrirMenu: "Fungola menu",
      fermerMenu: "Kanga menu",
      navigationPrincipale: "Navigation principale",
      navigationMobile: "Navigation mobile",
    },
    hopital: {
      typeEtablissement: "Centre ya Diagnostic mpe Analyses Médicales",
      slogan: "SANTÉ NA BINO MOLOTO NA BISO, BOTekei EZALI PREMIER NA BISO",
      titreAccueil: "Santé na bino moloto na biso,",
      titreAccueilSuite: "boteki ezali premier na biso",
      description:
        "Ponama ya malamu, bisaleli ya sika mpe ekipi ya monganga na bino.",
    },
    accueil: {
      nosServices: "Bisalu na biso",
      prestationsMedicales: "Bisalu ya monganga",
      sousTitreServices:
        "Diagnostic, analyses mpe ponama — offre mobimba mpo na santé na bino",
      campagnesEnCours: "Ba campagnes ezali kosala",
      santePublique: "Santé ya bato nyonso",
      sousTitreCampagnes: "Kotala, koyebisa mpe kobatela bato",
      nosServicesBtn: "Bisalu na biso",
      prendreRdv: "Kozwa rendez-vous",
      appMobile: "Application mobile",
      appTitre: "Santé na bino, pene na yo",
      appDescription:
        "Télécharger application na biso mpo na rendez-vous, kotala ba résultats mpe kokamba dossier na bino.",
      appEnSavoirPlus: "Yebisa mingi",
      googlePlay: "Google Play",
      appStore: "App Store",
      disponibleSur: "Ezali na",
      telechargerSur: "Télécharger na",
      stats: {
        medecins: "Ba médecins spécialistes",
        departements: "Ba départements",
        patients: "Ba patients batelami",
        certification: "Certification ya qualité",
      },
      accesRapide: {
        rdv: { titre: "Rendez-vous", sousTitre: "Na Internet 24h/24" },
        resultats: {
          titre: "Ba résultats",
          sousTitre: "Okoki kotala na Internet",
        },
        paiement: { titre: "Kofuta na sécurité", sousTitre: "Na Internet" },
        support: { titre: "Lisalisi ya patient", sousTitre: "Lisalisi ya sikisiki" },
      },
      services: {
        consultations: {
          titre: "Ba consultations",
          description:
            "Ba consultations ya liboso mpe ya spécialité na ba médecins na biso.",
        },
        laboratoire: {
          titre: "Laboratoire",
          description:
            "Ba analyses ya mobimba na bisaleli ya sika.",
        },
        pharmacie: {
          titre: "Pharmacie",
          description:
            "Ba médicaments ya malamu mpe ba conseils ya monganga.",
        },
        hospitalisation: {
          titre: "Hospitalisation",
          description:
            "Kobatela na lopitalo na kolanda ya monganga.",
        },
        urgences: {
          titre: "Ba urgences",
          description:
            "Misala ya urgences 24h/24 mpo na ba cas ya makasi.",
        },
        imagerie: {
          titre: "Imagerie médicale",
          description:
            "Radiologie, échographie mpe IRM mpo na diagnostic ya malamu.",
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
      titre: "Luka na site",
      placeholder: "Bisalu, campagnes, ba pages…",
      hint: "Tá ba caractères 2 to koleka mpo na koluka.",
      suggestions: "Ba suggestions",
      aucunResultat: "Ezali na résultat mpo na boluki oyo.",
      aucunResultatTitre: "Résultat ezwami te",
      aucunResultatPour: "Résultat ezali te mpo na « {{query}} »",
      aucunResultatConseil:
        "Meka ba maloba mosusu, talá orthographe to parcourir ba pages na biso ya liboso.",
      compteur: "{{count}} résultat(s)",
      navigation: "↑↓ naviguer · Entrée ouvrir · Échap fermer",
      raccourci: "Ctrl+K mpo na koluka",
      categories: {
        page: "Page",
        service: "Bisalu",
        campagne: "Campagne",
        acces: "Accès ya noki",
        faq: "FAQ",
        prestation: "Prestation",
      },
      pages: {
        "/": "Ebandeli",
        "/a-propos": "Kuhusu biso — HAM Laboratoire",
        "/services": "Bisalu ya monganga",
        "/campagnes": "Ba campagnes ya santé",
        "/contact": "Bokomi na biso",
        "/rendez-vous": "Kozwa rendez-vous na Internet",
        "/resultats": "Tala ba résultats na bino",
        "/connexion": "Espace ya basali — Kota",
        "/application": "Application mobile HAM",
      },
    },
    pages: pagesKg,
    reception: receptionKg,
    caisse: caisseKg,
    ...communKg,
  },
};

export default kg;
