import type { TraductionsSite } from "./types";
import { communHi } from "./commun/hi";
import { pagesHi } from "./pages/hi";
import { receptionHi } from "./reception/hi";
import { caisseHi } from "./caisse/hi";
import { laboratoireHi } from "./laboratoire/hi";
import { medecinsHi } from "./medecins/hi";
import { infirmiersHi } from "./infirmiers/hi";
import { pharmacieHi } from "./pharmacie/hi";
import { medecinsExternesHi } from "./medecins-externes/hi";
import { egliseHi } from "./eglise/hi";

const hi: { translation: TraductionsSite } = {
  translation: {
    nav: {
      accueil: "होम",
      aPropos: "हमारे बारे में",
      services: "सेवाएँ",
      campagnes: "अभियान",
      contact: "संपर्क",
      rendezVous: "अपॉइंटमेंट",
    },
    common: {
      seConnecter: "साइन इन",
      rechercher: "खोजें",
      fermer: "बंद करें",
      voirTous: "सभी देखें",
      voirToutes: "सभी देखें",
      enSavoirPlus: "और जानें",
      plusInfos: "अधिक जानकारी",
      liensRapides: "त्वरित लिंक",
      nosServices: "हमारी सेवाएँ",
      contact: "संपर्क",
      mentionsLegales: "कानूनी सूचना",
      confidentialite: "गोपनीयता नीति",
      espacePersonnel: "कर्मचारी पोर्टल",
      droitsReserves: "सर्वाधिकार सुरक्षित।",
      responsable: "प्रबं.",
      reseauSocial: "सोशल नेटवर्क",
      ouvrirMenu: "मेनू खोलें",
      fermerMenu: "मेनू बंद करें",
      navigationPrincipale: "मुख्य नेविगेशन",
      navigationMobile: "मोबाइल नेविगेशन",
    },
    hopital: {
      typeEtablissement: "चिकित्सा निदान और विश्लेषण केंद्र",
      slogan: "आपका स्वास्थ्य हमारा बोझ, विश्वसनीयता हमारी प्रमुखता",
      titreAccueil: "आपका स्वास्थ्य हमारा बोझ,",
      titreAccueilSuite: "विश्वसनीयता हमारी प्रमुखता",
      description:
        "गुणवत्तापूर्ण देखभाल, अत्याधुनिक उपकरण और आपकी सेवा में एक चिकित्सा टीम।",
    },
    accueil: {
      nosServices: "हमारी सेवाएँ",
      prestationsMedicales: "चिकित्सा सेवाएँ",
      sousTitreServices:
        "निदान, लैब परीक्षण और देखभाल — आपके स्वास्थ्य के लिए एक संपूर्ण सेवा",
      campagnesEnCours: "चल रहे अभियान",
      santePublique: "सार्वजनिक स्वास्थ्य",
      sousTitreCampagnes: "जाँच, जागरूकता और रोकथाम की पहल",
      nosServicesBtn: "हमारी सेवाएँ",
      prendreRdv: "अपॉइंटमेंट बुक करें",
      appMobile: "मोबाइल ऐप",
      appTitre: "आपका स्वास्थ्य, आपकी उंगलियों पर",
      appDescription:
        "अपॉइंटमेंट बुक करने, अपने परिणाम देखने और अपना चिकित्सा रिकॉर्ड प्रबंधित करने के लिए हमारा मोबाइल ऐप डाउनलोड करें।",
      appEnSavoirPlus: "और जानें",
      googlePlay: "Google Play",
      appStore: "App Store",
      disponibleSur: "उपलब्ध है",
      telechargerSur: "डाउनलोड करें",
      stats: {
        medecins: "विशेषज्ञ चिकित्सक",
        departements: "विभाग",
        patients: "देखभाल किए गए रोगी",
        certification: "गुणवत्ता प्रमाणन",
      },
      accesRapide: {
        rdv: { titre: "अपॉइंटमेंट बुक करें", sousTitre: "ऑनलाइन 24/7" },
        resultats: { titre: "परीक्षण परिणाम", sousTitre: "ऑनलाइन उपलब्ध" },
        paiement: { titre: "सुरक्षित भुगतान", sousTitre: "ऑनलाइन" },
        support: { titre: "रोगी सहायता", sousTitre: "समर्पित सहायता" },
      },
      services: {
        consultations: {
          titre: "परामर्श",
          description:
            "हमारे अनुभवी चिकित्सकों के साथ सामान्य और विशेषज्ञ परामर्श।",
        },
        laboratoire: {
          titre: "प्रयोगशाला",
          description:
            "अत्याधुनिक उपकरणों के साथ संपूर्ण चिकित्सा परीक्षण।",
        },
        pharmacie: {
          titre: "फार्मेसी",
          description:
            "गुणवत्तापूर्ण दवाएँ और व्यक्तिगत दवा सलाह।",
        },
        hospitalisation: {
          titre: "अस्पताल में भर्ती",
          description:
            "निरंतर चिकित्सा निगरानी के साथ रोगी देखभाल।",
        },
        urgences: {
          titre: "आपातकाल",
          description:
            "गंभीर स्थितियों के लिए 24/7 आपातकालीन सेवा।",
        },
        imagerie: {
          titre: "चिकित्सा इमेजिंग",
          description:
            "सटीक निदान के लिए रेडियोलॉजी, अल्ट्रासाउंड और MRI।",
        },
      },
    },
    footer: {
      consultations: "परामर्श",
      laboratoire: "प्रयोगशाला",
      pharmacie: "फार्मेसी",
      urgences: "आपातकाल",
      applicationMobile: "मोबाइल ऐप",
    },
    recherche: {
      titre: "साइट खोजें",
      placeholder: "सेवाएँ, अभियान, पृष्ठ…",
      hint: "खोजने के लिए कम से कम 2 अक्षर टाइप करें।",
      suggestions: "सुझाव",
      aucunResultat: "इस खोज के लिए कोई परिणाम नहीं।",
      aucunResultatTitre: "कोई परिणाम नहीं मिला",
      aucunResultatPour: "\"{{query}}\" के लिए कोई परिणाम नहीं",
      aucunResultatConseil:
        "अलग कीवर्ड आज़माएँ, वर्तनी जाँचें, या हमारे मुख्य पृष्ठों को ब्राउज़ करें।",
      compteur: "{{count}} परिणाम",
      navigation: "↑↓ नेविगेट · Enter खोलें · Esc बंद करें",
      raccourci: "Ctrl+K से खोजें",
      categories: {
        page: "पृष्ठ",
        service: "सेवा",
        campagne: "अभियान",
        acces: "त्वरित पहुँच",
        faq: "अक्सर पूछे जाने वाले प्रश्न",
        prestation: "सेवा प्रकार",
      },
      pages: {
        "/": "होम",
        "/a-propos": "HAM Laboratoire के बारे में",
        "/services": "हमारी चिकित्सा सेवाएँ",
        "/campagnes": "स्वास्थ्य अभियान",
        "/contact": "हमसे संपर्क करें",
        "/rendez-vous": "ऑनलाइन अपॉइंटमेंट बुक करें",
        "/resultats": "अपने परीक्षण परिणाम देखें",
        "/connexion": "कर्मचारी पोर्टल — साइन इन",
        "/application": "HAM मोबाइल ऐप",
      },
    },
    pages: pagesHi,
    reception: receptionHi,
    caisse: caisseHi,
    laboratoire: laboratoireHi,
    medecins: medecinsHi,
    infirmiers: infirmiersHi,
    pharmacie: pharmacieHi,
    medecinsExternes: medecinsExternesHi,
    eglise: egliseHi,
    ...communHi,
  },
};

export default hi;
