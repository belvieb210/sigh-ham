import type { TraductionsSite } from "./types";
import { communHe } from "./commun/he";
import { pagesHe } from "./pages/he";
import { receptionHe } from "./reception/he";
import { caisseHe } from "./caisse/he";
import { laboratoireHe } from "./laboratoire/he";
import { medecinsHe } from "./medecins/he";
import { infirmiersHe } from "./infirmiers/he";
import { pharmacieHe } from "./pharmacie/he";
import { medecinsExternesHe } from "./medecins-externes/he";
import { egliseHe } from "./eglise/he";
import { adminHe } from "./admin/he";
import { clientHe } from "./client/he";

const he: { translation: TraductionsSite } = {
  translation: {
    nav: {
      accueil: "דף הבית",
      aPropos: "אודות",
      services: "שירותים",
      campagnes: "קמפיינים",
      contact: "יצירת קשר",
      rendezVous: "תורים",
      resultats: "Results available",
    },
    common: {
      seConnecter: "התחברות",
      rechercher: "חיפוש",
      fermer: "סגירה",
      voirTous: "הצג הכל",
      voirToutes: "הצג הכל",
      enSavoirPlus: "מידע נוסף",
      plusInfos: "פרטים נוספים",
      liensRapides: "קישורים מהירים",
      nosServices: "השירותים שלנו",
      contact: "יצירת קשר",
      mentionsLegales: "הצהרה משפטית",
      confidentialite: "מדיניות פרטיות",
      espacePersonnel: "אזור אישי",
      droitsReserves: "כל הזכויות שמורות.",
      responsable: "מנהל",
      reseauSocial: "רשת חברתית",
      ouvrirMenu: "פתיחת תפריט",
      fermerMenu: "סגירת תפריט",
      navigationPrincipale: "ניווט ראשי",
      navigationMobile: "ניווט לנייד",
    },
    hopital: {
      typeEtablissement: "מרכז לאבחון ובדיקות רפואיות",
      slogan: "בריאותכם עלינו, האמינות שלנו בראש סדר העדיפויות",
      titreAccueil: "בריאותכם עלינו,",
      titreAccueilSuite: "האמינות שלנו בראש סדר העדיפויות",
      description:
        "טיפול איכותי, ציוד מתקדם וצוות רפואי לשירותכם.",
    },
    accueil: {
      nosServices: "השירותים שלנו",
      prestationsMedicales: "שירותים רפואיים",
      sousTitreServices:
        "אבחון, בדיקות מעבדה וטיפול — מגוון מלא לבריאותכם",
      campagnesEnCours: "קמפיינים פעילים",
      santePublique: "בריאות הציבור",
      sousTitreCampagnes: "סקרים, הסברה ופעולות מניעה",
      nosServicesBtn: "השירותים שלנו",
      prendreRdv: "קביעת תור",
      appMobile: "אפליקציה לנייד",
      appTitre: "בריאותכם, בכף ידכם",
      appDescription:
        "הורידו את האפליקציה לקביעת תורים, צפייה בתוצאות וניהול התיק הרפואי.",
      appEnSavoirPlus: "מידע נוסף",
      googlePlay: "Google Play",
      appStore: "App Store",
      disponibleSur: "זמין ב-",
      telechargerSur: "הורדה מ-",
      stats: {
        medecins: "רופאים מומחים",
        departements: "מחלקות",
        patients: "מטופלים בטיפול",
        certification: "הסמכת איכות",
      },
      accesRapide: {
        rdv: { titre: "קביעת תור", sousTitre: "אונליין 24/7" },
        resultats: { titre: "תוצאות בדיקות", sousTitre: "זמינות אונליין" },
        paiement: { titre: "תשלום מאובטח", sousTitre: "אונליין" },
        support: { titre: "תמיכת מטופלים", sousTitre: "סיוע ייעודי" },
      },
      services: {
        consultations: {
          titre: "ייעוצים",
          description:
            "ייעוצים כלליים ומומחים עם הרופאים המנוסים שלנו.",
        },
        laboratoire: {
          titre: "מעבדה",
          description:
            "בדיקות רפואיות מקיפות עם ציוד מהדור האחרון.",
        },
        pharmacie: {
          titre: "בית מרקחת",
          description:
            "תרופות איכותיות וייעוץ מקצועי מבית המרקחת.",
        },
        hospitalisation: {
          titre: "אשפוז",
          description:
            "טיפול בית-חולי עם מעקב רפואי רציף.",
        },
        urgences: {
          titre: "מיון",
          description:
            "שירות חירום 24/7 למצבי חירום.",
        },
        imagerie: {
          titre: "הדמיה רפואית",
          description:
            "רנטגן, אולטראסאונד ו-MRI לאבחון מדויק.",
        },
      },
    },
    footer: {
      consultations: "ייעוצים",
      laboratoire: "מעבדה",
      pharmacie: "בית מרקחת",
      urgences: "מיון",
      applicationMobile: "אפליקציה לנייד",
    },
    recherche: {
      titre: "חיפוש באתר",
      placeholder: "שירותים, קמפיינים, דפים…",
      hint: "הקלידו לפחות 2 תווים לחיפוש.",
      suggestions: "הצעות",
      aucunResultat: "אין תוצאות לחיפוש זה.",
      aucunResultatTitre: "לא נמצאו תוצאות",
      aucunResultatPour: "אין תוצאות עבור \"{{query}}\"",
      aucunResultatConseil:
        "נסו מילות מפתח אחרות, בדקו את האיות או עיינו בדפים העיקריים.",
      compteur: "{{count}} תוצאה/ות",
      navigation: "↑↓ ניווט · Enter פתיחה · Esc סגירה",
      raccourci: "Ctrl+K לחיפוש",
      categories: {
        page: "דף",
        service: "שירות",
        campagne: "קמפיין",
        acces: "גישה מהירה",
        faq: "שאלות נפוצות",
        prestation: "סוג שירות",
      },
      pages: {
        "/": "דף הבית",
        "/a-propos": "אודות HAM Laboratoire",
        "/services": "השירותים הרפואיים שלנו",
        "/campagnes": "קמפיינים לבריאות",
        "/contact": "צרו קשר",
        "/rendez-vous": "קביעת תור אונליין",
        "/resultats": "צפייה בתוצאות הבדיקות",
        "/connexion": "אזור אישי — התחברות",
        "/application": "אפליקציית HAM לנייד",
      },
    },
    pages: pagesHe,
    reception: receptionHe,
    caisse: caisseHe,
    laboratoire: laboratoireHe,
    medecins: medecinsHe,
    infirmiers: infirmiersHe,
    pharmacie: pharmacieHe,
    medecinsExternes: medecinsExternesHe,
    eglise: egliseHe,
    admin: adminHe,
    client: clientHe,
    ...communHe,
  },
};

export default he;
