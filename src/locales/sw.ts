import type { TraductionsSite } from "./types";
import { communSw } from "./commun/sw";
import { pagesSw } from "./pages/sw";
import { receptionSw } from "./reception/sw";
import { caisseSw } from "./caisse/sw";
import { laboratoireSw } from "./laboratoire/sw";

const sw: { translation: TraductionsSite } = {
  translation: {
    nav: {
      accueil: "Nyumbani",
      aPropos: "Kuhusu",
      services: "Huduma",
      campagnes: "Kampeni",
      contact: "Wasiliana",
      rendezVous: "Miadi",
    },
    common: {
      seConnecter: "Ingia",
      rechercher: "Tafuta",
      fermer: "Funga",
      voirTous: "Angalia zote",
      voirToutes: "Angalia zote",
      enSavoirPlus: "Jifunze zaidi",
      plusInfos: "Maelezo zaidi",
      liensRapides: "Viungo vya haraka",
      nosServices: "Huduma zetu",
      contact: "Wasiliana",
      mentionsLegales: "Notisi ya kisheria",
      confidentialite: "Sera ya faragha",
      espacePersonnel: "Eneo la wafanyakazi",
      droitsReserves: "Haki zote zimehifadhiwa.",
      responsable: "Meneja",
      reseauSocial: "Mtandao wa kijamii",
      ouvrirMenu: "Fungua menyu",
      fermerMenu: "Funga menyu",
      navigationPrincipale: "Urambazaji mkuu",
      navigationMobile: "Urambazaji wa simu",
    },
    hopital: {
      typeEtablissement: "Kituo cha Uchunguzi na Uchambuzi wa Matibabu",
      slogan: "AFYA YAKO MZIGO WETU, UAMINIFU UTUKUZO WETU",
      titreAccueil: "Afya yako mzigo wetu,",
      titreAccueilSuite: "uaminifu utukuzo wetu",
      description:
        "Huduma bora, vifaa vya kisasa na timu ya matibabu kwa ajili yako.",
    },
    accueil: {
      nosServices: "Huduma zetu",
      prestationsMedicales: "Huduma za matibabu",
      sousTitreServices:
        "Uchunguzi, vipimo vya maabara na huduma — toleo kamili kwa afya yako",
      campagnesEnCours: "Kampeni zinazoendelea",
      santePublique: "Afya ya umma",
      sousTitreCampagnes: "Uchunguzi, uhamasishaji na hatua za kuzuia",
      nosServicesBtn: "Huduma zetu",
      prendreRdv: "Panga miadi",
      appMobile: "Programu ya simu",
      appTitre: "Afya yako, mkononi mwako",
      appDescription:
        "Pakua programu yetu ya simu ili kupanga miadi, kuona matokeo yako na kusimamia rekodi yako ya matibabu.",
      appEnSavoirPlus: "Jifunze zaidi",
      googlePlay: "Google Play",
      appStore: "App Store",
      disponibleSur: "Inapatikana kwenye",
      telechargerSur: "Pakua kwenye",
      stats: {
        medecins: "Madaktari wataalamu",
        departements: "Idara",
        patients: "Wagonjwa waliotibiwa",
        certification: "Uthibitisho wa ubora",
      },
      accesRapide: {
        rdv: { titre: "Panga miadi", sousTitre: "Mtandaoni 24/7" },
        resultats: { titre: "Matokeo ya vipimo", sousTitre: "Yanapatikana mtandaoni" },
        paiement: { titre: "Malipo salama", sousTitre: "Mtandaoni" },
        support: { titre: "Msaada wa wagonjwa", sousTitre: "Usaidizi maalum" },
      },
      services: {
        consultations: {
          titre: "Mikutano ya matibabu",
          description:
            "Mikutano ya jumla na ya kitaalamu na madaktari wetu wenye uzoefu.",
        },
        laboratoire: {
          titre: "Maabara",
          description:
            "Vipimo kamili vya matibabu kwa vifaa vya kisasa.",
        },
        pharmacie: {
          titre: "Duka la dawa",
          description:
            "Dawa bora na ushauri wa kibinafsi wa dawa.",
        },
        hospitalisation: {
          titre: "Kulazwa hospitalini",
          description:
            "Huduma ya wagonjwa waliolazwa na ufuatiliaji wa matibabu unaoendelea.",
        },
        urgences: {
          titre: "Dharura",
          description:
            "Huduma ya dharura 24/7 kwa hali za hatari.",
        },
        imagerie: {
          titre: "Picha za matibabu",
          description:
            "Radiolojia, ultrasound na MRI kwa utambuzi sahihi.",
        },
      },
    },
    footer: {
      consultations: "Mikutano ya matibabu",
      laboratoire: "Maabara",
      pharmacie: "Duka la dawa",
      urgences: "Dharura",
      applicationMobile: "Programu ya simu",
    },
    recherche: {
      titre: "Tafuta kwenye tovuti",
      placeholder: "Huduma, kampeni, kurasa…",
      hint: "Andika angalau herufi 2 ili kutafuta.",
      suggestions: "Mapendekezo",
      aucunResultat: "Hakuna matokeo kwa utafutaji huu.",
      aucunResultatTitre: "Hakuna matokeo yaliyopatikana",
      aucunResultatPour: "Hakuna matokeo kwa \"{{query}}\"",
      aucunResultatConseil:
        "Jaribu maneno mengine, angalia tahajia, au tembelea kurasa zetu kuu.",
      compteur: "Matokeo {{count}}",
      navigation: "↑↓ tembea · Enter fungua · Esc funga",
      raccourci: "Ctrl+K kutafuta",
      categories: {
        page: "Ukurasa",
        service: "Huduma",
        campagne: "Kampeni",
        acces: "Ufikiaji wa haraka",
        faq: "Maswali yanayoulizwa mara kwa mara",
        prestation: "Aina ya huduma",
      },
      pages: {
        "/": "Nyumbani",
        "/a-propos": "Kuhusu HAM Laboratoire",
        "/services": "Huduma zetu za matibabu",
        "/campagnes": "Kampeni za afya",
        "/contact": "Wasiliana nasi",
        "/rendez-vous": "Panga miadi mtandaoni",
        "/resultats": "Angalia matokeo yako ya vipimo",
        "/connexion": "Eneo la wafanyakazi — Ingia",
        "/application": "Programu ya simu ya HAM",
      },
    },
    pages: pagesSw,
    reception: receptionSw,
    caisse: caisseSw,
    laboratoire: laboratoireSw,
    ...communSw,
  },
};

export default sw;
