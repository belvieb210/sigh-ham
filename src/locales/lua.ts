import type { TraductionsSite } from "./types";
import { communLua } from "./commun/lua";
import { pagesLua } from "./pages/lua";
import { receptionLua } from "./reception/lua";

/** Tshiluba — traductions principales du site public */
const lua: { translation: TraductionsSite } = {
  translation: {
    nav: {
      accueil: "Munda",
      aPropos: "Tudi",
      services: "Mishindu",
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
      nosServices: "Mishindu yetu",
      contact: "Bokomi",
      mentionsLegales: "Mentions légales",
      confidentialite: "Confidentialité",
      espacePersonnel: "Espace ya basali",
      droitsReserves: "Makoki nyonso ebomami.",
      responsable: "Mukulu",
      reseauSocial: "Réseau social",
      ouvrirMenu: "Fungola menu",
      fermerMenu: "Kanga menu",
      navigationPrincipale: "Navigation principale",
      navigationMobile: "Navigation mobile",
    },
    hopital: {
      typeEtablissement: "Centre ya Diagnostic ne Analyses Médicales",
      slogan: "BULWADJI BWA BWE MOLOTO WETU, BOTEBI BWA BISIKISIKI BWA BISIKISIKI",
      titreAccueil: "Bulwadji bwa bwe moloto wetu,",
      titreAccueilSuite: "botebi bwa bisikisiki bwa bisikisiki",
      description:
        "Bupangaji bwa malamu, bisaleli bwa sika ne ekipi ya monganga kwa bwe.",
    },
    accueil: {
      nosServices: "Mishindu yetu",
      prestationsMedicales: "Mishindu ya monganga",
      sousTitreServices:
        "Diagnostic, analyses ne bupangaji — offre mobimba kwa bulwadji bwa bwe",
      campagnesEnCours: "Ba campagnes badi kosala",
      santePublique: "Bulwadji bwa bantu nyonso",
      sousTitreCampagnes: "Kutala, kuyebisa ne kubatela bantu",
      nosServicesBtn: "Mishindu yetu",
      prendreRdv: "Kozwa rendez-vous",
      appMobile: "Application mobile",
      appTitre: "Bulwadji bwa bwe, pene na bwe",
      appDescription:
        "Télécharger application yetu mpo na rendez-vous, kutala ba résultats ne kukamba dossier bwa bwe.",
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
          sousTitre: "Okoki kutala na Internet",
        },
        paiement: { titre: "Kofuta na sécurité", sousTitre: "Na Internet" },
        support: { titre: "Lisalisi ya patient", sousTitre: "Lisalisi ya sikisiki" },
      },
      services: {
        consultations: {
          titre: "Ba consultations",
          description:
            "Ba consultations ya liboso ne ya spécialité na ba médecins yetu.",
        },
        laboratoire: {
          titre: "Laboratoire",
          description:
            "Ba analyses ya mobimba na bisaleli bwa sika.",
        },
        pharmacie: {
          titre: "Pharmacie",
          description:
            "Ba médicaments bwa malamu ne ba conseils ya monganga.",
        },
        hospitalisation: {
          titre: "Hospitalisation",
          description:
            "Kubatela na lopitalo na kolanda ya monganga.",
        },
        urgences: {
          titre: "Ba urgences",
          description:
            "Mishindu ya urgences 24h/24 mpo na ba cas ya makasi.",
        },
        imagerie: {
          titre: "Imagerie médicale",
          description:
            "Radiologie, échographie ne IRM mpo na diagnostic ya malamu.",
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
      placeholder: "Mishindu, campagnes, ba pages…",
      hint: "Tá ba caractères 2 to koleka mpo na koluka.",
      suggestions: "Ba suggestions",
      aucunResultat: "Ezali na résultat mpo na boluki oyo.",
      aucunResultatTitre: "Résultat ezwami te",
      aucunResultatPour: "Résultat ezali te mpo na « {{query}} »",
      aucunResultatConseil:
        "Meka ba maloba mosusu, talá orthographe to parcourir ba pages yetu ya liboso.",
      compteur: "{{count}} résultat(s)",
      navigation: "↑↓ naviguer · Entrée ouvrir · Échap fermer",
      raccourci: "Ctrl+K mpo na koluka",
      categories: {
        page: "Page",
        service: "Mishindu",
        campagne: "Campagne",
        acces: "Accès ya noki",
        faq: "FAQ",
        prestation: "Prestation",
      },
      pages: {
        "/": "Munda",
        "/a-propos": "Tudi — HAM Laboratoire",
        "/services": "Mishindu ya monganga",
        "/campagnes": "Ba campagnes ya bulwadji",
        "/contact": "Bokomi na biso",
        "/rendez-vous": "Kozwa rendez-vous na Internet",
        "/resultats": "Tala ba résultats bwa bwe",
        "/connexion": "Espace ya basali — Kota",
        "/application": "Application mobile HAM",
      },
    },
    pages: pagesLua,
    reception: receptionLua,
    ...communLua,
  },
};

export default lua;
