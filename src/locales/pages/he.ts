/** תרגומים HE — תוכן דפים (למעט דף הבית שב-locales/he.ts) */

import { pagesServicesLaboratoireEn } from "./fragments/services-laboratoire-en";
import { extensionFormRdvMedecinEn } from "./fragments/extension-form-rdv-medecin-en";
import { resultatsPagesFallback } from "./fragments/resultats-fr";

export const pagesHe = {
  contact: {
    hero: {
      surtitre: "נשמור על קשר",
      titre: "אנחנו",
      titreAccent: "לשירותכם",
      description:
        "יש לכם שאלה על השירותים, תוצאות הבדיקות או קמפיין בריאות? צוות HAM LABORATOIRE עונה במקצועיות ובקשב.",
      stats: {
        delai: "זמן תגובה",
        lignes: "קווי טלפון",
        accueil: "קבלה ומיון",
        ville: "Kinshasa, RDC",
      },
    },
    coordonnees: {
      surtitre: "פרטי יצירת קשר",
      titre: "איך ליצור קשר",
      sousTitre: "גישה מהירה, כתובת מלאה ושעות פעילות",
      rdv: "תור",
      rdvDesc: "קביעה אונליין",
      resultats: "תוצאות",
      resultatsDesc: "צפייה בבדיקות",
      site: "אתר רשמי",
      adresse: "כתובת",
      telephones: "טלפונים",
      accueil: "קבלה",
      responsable: "מנהל",
      email: "דוא\"ל",
      horaires: "שעות פעילות",
    },
    formulaire: {
      surtitre: "כתבו לנו",
      titre: "שלחו לנו הודעה",
      sousTitre: "מלאו את הטופס — נשיב תוך 24–48 שעות עבודה",
      nom: "שם מלא *",
      email: "דוא\"ל *",
      telephone: "טלפון",
      sujet: "נושא הפנייה *",
      message: "הודעה *",
      consentement:
        "אני מאשר/ת ש-HAM LABORATOIRE יעבד את הנתונים שלי בקשר לפנייה, בהתאם למדיניות הפרטיות. *",
      envoyer: "שליחת הודעה",
      envoi: "שולח...",
      aideImmediate: "צריכים תשובה מיידית?",
      aideTexte: "התקשרו ישירות לקבלה — אנחנו כאן לעזור.",
      horairesLabel: "ב'-ו': 7:00 — 19:00",
      carteLegende: "רובע MATETE, Kinshasa — כניסה Debonhomme Third Parcel",
    },
    sujets: {
      "rendez-vous": "קביעת תור",
      resultats: "תוצאות בדיקות",
      campagnes: "קמפיינים וסקרים",
      tarifs: "מחירים ושירותים",
      partenariat: "שותפות מוסדית",
      reclamation: "תלונה",
      autre: "פנייה אחרת",
    },
    horaires: {
      titre: "שעות פעילות",
      lunVen: "יום שני — שישי",
      lunVenHeures: "7:00 — 19:00",
      sam: "שבת",
      samHeures: "7:00 — 14:00",
      dim: "ראשון",
      dimHeures: "בדיקות חירום בלבד",
    },
    faq: {
      surtitre: "עזרה ומידע",
      titre: "שאלות נפוצות",
      sousTitre:
        "מצאו במהירות תשובות על השירותים, התוצאות והגישה למעבדה.",
      aideTitre: "לא מצאתם את התשובה?",
      aideTexte: "השתמשו בטופס יצירת הקשר או התקשרו — צוות הקבלה יכוון אתכם.",
      aideLien: "יצירת קשר עם הצוות →",
      items: [
        {
          question: "איך מקבלים את תוצאות הבדיקות?",
          reponse:
            "התוצאות זמינות במעבדה או אונליין דרך האזור האישי של המטופל. הציגו את כרטיס הדגימה או צרו קשר עם מספר התיק.",
        },
        {
          question: "האם צריך תור לבדיקות?",
          reponse:
            "רוב הבדיקות ניתן לבצע ללא תור. לבדיקות מיוחדות מסוימות מומלץ לקבוע מראש.",
        },
        {
          question: "אילו אמצעי תשלום מקבלים?",
          reponse:
            "מקבלים מזומן, כסף נייד והעברות בנקאיות. ייתכנו הסדרי תשלום לקמפייני סקר.",
        },
        {
          question: "איפה נמצא HAM LABORATOIRE?",
          reponse:
            "259, Avenue Lumière, כניסה Debonhomme Third Parcel מימין, רובע MATETE, Kinshasa, RDC. ראו את המפה למטה לניווט.",
        },
      ],
    },
    cta: {
      titre: "צריכים תור דחוף?",
      description:
        "קבעו אונליין או התקשרו — צוות הקבלה זמין להכווין אתכם.",
      boutonRdv: "קביעת תור",
      boutonFormulaire: "שליחת הודעה",
    },
  },

  rendezVous: {
    hero: {
      surtitre: "קביעת תור אונליין",
      titre: "קבעו את",
      titreAccent: "הייעוץ שלכם",
      description:
        "תזמנו את הביקור במעבדה בכמה לחיצות — בדיקות, ייעוצים, הדמיה או סקרים. אישור מיידי ותזכורת ב-SMS או דוא\"ל.",
      commencer: "התחלת קביעה",
      voirCoords: "מעבר לטופס",
      stats: {
        rapide: "קביעה מהירה",
        enLigne: "זמין אונליין",
        confirmation: "אישור מיידי",
        qualite: "איכות מוסמכת",
      },
    },
    reservation: {
      surtitre: "קביעה אונליין",
      titre: "תזמנו את הביקור",
      sousTitre: "השלימו את השלבים — אישור מיידי עם מספר אסמכתא",
      securise: "קביעה מאובטחת",
      securiseTexte:
        "הנתונים שלכם מוגנים ומשמשים רק לניהול התור במעבדה.",
      aide: "צריכים עזרה?",
      aideTexte: "צוות הקבלה יכוון אתכם לשירות המתאים.",
      horaires: "שעות פעילות",
      adresse: "כתובת",
      voirCarte: "צפייה במפה →",
    },
    form: {
      etapes: ["שירות", "תאריך ושעה", "הפרטים שלכם", "Doctor", "אישור"],
      typeTitre: "איזה סוג שירות אתם צריכים?",
      typeSousTitre: "בחרו את השירות המתאים לצרכים שלכם",
      dateTitre: "בחרו תאריך ומועד",
      dateLabel: "תאריך מועדף",
      moisPrecedent: "חודש קודם",
      moisSuivant: "חודש הבא",
      anneeLabel: "שנה",
      creneauLabel: "מועד",
      pasCreneau: "אין מועדים פנויים לתאריך זה. בחרו תאריך אחר.",
      infosTitre: "פרטי יצירת קשר",
      infosSousTitre: "לקבלת אישור והוראות הכנה",
      nom: "שם מלא *",
      email: "דוא\"ל *",
      telephone: "טלפון *",
      naissance: "תאריך לידה",
      premiereVisite: "ביקור ראשון במעבדה",
      motif: "סיבה או פרטים (אופציונלי)",
      consentement:
        "אני מאשר/ת ש-HAM LABORATOIRE יעבד את הנתונים שלי לניהול התור, בהתאם למדיניות הפרטיות. *",
      continuer: "המשך",
      retour: "חזרה",
      confirmer: "אישור תור",
      confirmationEnCours: "מאשר...",
      succesTitre: "התור נרשם!",
      succesTexte:
        "הבקשה נשלחה לצוות שלנו. תקבלו אישור בדוא\"ל או ב-SMS בקרוב.",
      reference: "מספר אסמכתא",
      prestation: "שירות",
      date: "תאריך",
      heure: "שעה",
      patient: "מטופל",
      medecinTitre: extensionFormRdvMedecinEn.medecinTitre,
      medecinSousTitre: extensionFormRdvMedecinEn.medecinSousTitre,
      sansPreference: extensionFormRdvMedecinEn.sansPreference,
      medecin: extensionFormRdvMedecinEn.medecin,
      medecinSpecialite: extensionFormRdvMedecinEn.medecinSpecialite,
      medecinDisponibilite: extensionFormRdvMedecinEn.medecinDisponibilite,
      medecinHorairesDefaut: extensionFormRdvMedecinEn.medecinHorairesDefaut,
      autreRdv: "קביעת תור נוסף",
      sansRdv: "אפשר גם ללא תור",
    },
    types: {
      analyses: {
        titre: "בדיקות מעבדה",
        description: "דגימות דם, שתן וביולוגיות — מערך מלא או בדיקות ספציפיות.",
      },
      consultation: {
        titre: "ייעוץ רפואי",
        description:
          "ייעוץ כללי או מומחה לפרשנות תוצאות או הכוונה לבדיקות.",
      },
      imagerie: {
        titre: "הדמיה רפואית",
        description: "אולטראסאונד, רנטגן ובדיקות הדמיה בתיאום מראש.",
      },
      depistage: {
        titre: "סקר וקמפיין",
        description:
          "השתתפות בקמפיינים לבריאות הציבור ובסקרים שמארגן HAM LABORATOIRE.",
      },
      prelevement: {
        titre: "דגימה מיוחדת",
        description:
          "דגימות הדורשות הכנה או פרוטוקול מיוחד (צום, שעה מדויקת).",
      },
    },
    parcours: {
      titre: "איך זה עובד?",
      sousTitre: "ארבעה שלבים פשוטים לאישור התור",
      etapes: [
        { titre: "בחירת שירות", description: "בחרו את סוג הבדיקה או הייעוץ הנדרש." },
        { titre: "תאריך ומועד", description: "בחרו תאריך ושעה המתאימים לפי הזמינות." },
        { titre: "פרטי יצירת קשר", description: "הזינו את הפרטים לקבלת אישור והוראות." },
        { titre: "אישור", description: "שלחו את הבקשה — תקבלו מספר אסמכתא בדוא\"ל או SMS." },
      ],
    },
    infos: {
      surtitre: "לפני הביקור",
      titre: "מידע מעשי",
      sousTitre: "התכוננו לביקור במעבדה",
      items: [
        { titre: "מסמכים להצגה", description: "תעודת זהות, מרשם רפואי אם רלוונטי, פנקס בריאות ותוצאות קודמות." },
        { titre: "צום והכנה", description: "חלק מהבדיקות דורשות 8–12 שעות צום. ההוראות יישלחו באישור." },
        { titre: "שעות קבלה", description: "ב'-ו': 7:00 — 19:00 · ש': 7:00 — 14:00 · א': בדיקות חירום בלבד." },
        { titre: "גישה וחניה", description: "259, Avenue Lumière, MATETE — Kinshasa. גישה נוחה, חניה בסביבה." },
      ],
    },
    faq: {
      surtitre: "שאלות נפוצות",
      titre: "הכל על תורים",
      sousTitre: "שינויים, ביטולים, הכנה — תשובות לשאלות הנפוצות.",
      aideTitre: "צריכים סיוע?",
      aideTexte: "צוות הקבלה זמין מיום שני עד שבת.",
      aideLien: "דף יצירת קשר →",
      items: [
        {
          question: "האם אפשר להגיע לבדיקות ללא תור?",
          reponse:
            "כן, רוב בדיקות המעבדה אפשר לבצע ללא תור בשעות הפעילות. מועד שמור מבטיח קבלה מועדפת.",
        },
        {
          question: "איך משנים או מבטלים תור?",
          reponse:
            "צרו קשר עם הקבלה ב-+243 819 191 643 או בדוא\"ל obb5lab@gmail.com עם מספר האסמכתא. נבקש להודיע לפחות 24 שעות מראש.",
        },
        {
          question: "האם אקבל תזכורת לפני התור?",
          reponse:
            "כן, נשלחת תזכורת ב-SMS או דוא\"ל 24 שעות לפני המועד, עם הוראות הכנה אם נדרש.",
        },
        {
          question: "האם קביעת תור אונליין חינם?",
          reponse:
            "קביעת התור אונליין ללא עלות. מחויבים רק הבדיקות והייעוצים שבוצעו לפי התעריף.",
        },
      ],
    },
    cta: {
      titre: "יש שאלה לפני הקביעה?",
      description: "צוות הקבלה זמין להכווין אתכם לשירות המתאים.",
      boutonContact: "יצירת קשר",
      boutonReserver: "קבעו עכשיו",
    },
  },

  services: {
    hero: {
      surtitre: "מרכז לאבחון ובדיקות רפואיות",
      titre: "שירותים רפואיים",
      titreAccent: "מצוינים",
      description:
        "HAM LABORATOIRE מציע מגוון מלא של שירותי אבחון — בדיקות מעבדה, ייעוצים, הדמיה וסקרים — עם תוצאות אמינות, זמנים מבוקרים ונגישות לכולם.",
      decouvrir: "גלו את השירותים שלנו",
      voirPrestations: "צפייה בשירותים",
      badge: "שירותים · מעבדה מוסמכת ISO 9001:2015",
      stats: {
        analyses: "סוגי בדיקות",
        delai: "זמן ממוצע לתוצאות",
        iso: "9001:2015 מוסמך",
        accueil: "קבלת מטופלים",
      },
    },
    categories: {
      tous: "כל השירותים",
      diagnostic: "אבחון",
      soins: "טיפול ומעקב",
      urgences: "מיון",
    },
    vedette: {
      badge: "שירות מוביל",
      decouvrir: "גלו את המעבדה",
      chiffres: [
        { libelle: "סוגי בדיקות" },
        { libelle: "זמן ממוצע" },
        { libelle: "הסמכה" },
      ],
    },
    grille: {
      surtitre: "ההיצע שלנו",
      titre: "כל השירותים שלנו",
      sousTitre: "סננו לפי קטגוריה למציאת השירות המתאים",
      aucun: "אין שירותים בקטגוריה זו.",
    },
    items: {
      laboratoire: {
        titre: "בדיקות מעבדה",
        description: "ליבת המומחיות שלנו — בדיקות ביולוגיות, המטולוגיה, ביוכימיה ומיוחדות עם ציוד מתקדם.",
        badge: "שירות מוביל",
        points: ["מעל 200 פרמטרים נבדקים", "בקרת איכות קפדנית", "תוצאות מאובטחות אונליין"],
      },
      consultations: {
        titre: "ייעוצים רפואיים",
        description: "ייעוצים כלליים ומומחים להכוונה לבדיקות ופרשנות תוצאות עם רופאים מוסמכים.",
        points: ["רופאים כלליים ומומחים", "פרשנות תוצאות", "מעקב מטופל מותאם אישית"],
      },
      imagerie: {
        titre: "הדמיה רפואית",
        description: "רנטגן, אולטראסאונד ובדיקות הדמיה לאבחון ויזואלי מדויק המשלים את הבדיקות הביולוגיות.",
        points: ["אולטראסאונד ורנטגן", "ציוד דיגיטלי", "דוחות מפורטים"],
      },
      pharmacie: {
        titre: "בית מרקחת",
        description: "מתן תרופות איכותיות וייעוץ מקצועי מבית המרקחת לתמיכה בטיפול לאחר האבחון.",
        points: ["תרופות מוסמכות", "ייעוץ מותאם אישית", "זמינות מיטבית"],
      },
      hospitalisation: {
        titre: "אשפוז",
        description: "טיפול בית-חולי עם ניטור רפואי רציף למטופלים הדורשים מעקב מעמיק.",
        points: ["חדרים נוחים", "ניטור רפואי 24/7", "טיפול מתואם"],
      },
      urgences: {
        titre: "מיון",
        description: "שירות חירום למצבים קריטיים הדורשים טיפול מיידי ובדיקות בעדיפות.",
        points: ["זמינות מורחבת", "בדיקות חירום", "צוות מגיב"],
      },
    },
    impact: {
      titre: "מצוינות במספרים",
      sousTitre: "ביצועים מדידים המשקפים את מחויבותנו לאיכות האבחון.",
      items: [
        { libelle: "סוגי בדיקות", description: "ביולוגיה, המטולוגיה, מיקרוביולוגיה ואימונולוגיה." },
        { libelle: "מטופלים / שנה", description: "טיפול במרכז שלנו ב-MATETE." },
        { libelle: "זמן ממוצע", description: "תוצאות זמינות במהירות, לעיתים קרובות באותו יום." },
        { libelle: "הסמכה", description: "תהליכי איכות מוסמכים ובקרות קפדניות." },
      ],
    },
    specialites: {
      titre: "התמחויות בדיקה",
      sousTitre: "מעבדה מלאה המכסה את כל תחומי הניתוח החיוניים לאבחון רפואי",
    },
    parcours: {
      titre: "המסלול שלכם ב-HAM",
      sousTitre: "תהליך פשוט, מהיר ושקוף — מהקבלה ועד התוצאות",
      etapes: [
        { titre: "קבלה והכוונה", description: "צוות הקבלה מכוון אתכם ורושם את התיק תוך דקות." },
        { titre: "ייעוץ", description: "רופא רושם בדיקות המותאמות למצב הקליני." },
        { titre: "דגימה ובדיקה", description: "דגימה בטוחה ועיבוד במעבדה עם בקרת איכות." },
        { titre: "תוצאות אמינות", description: "מסירה או גישה אונליין לתוצאות מאושרות ומפורשות." },
      ],
    },
    engagements: {
      titre: "למה לבחור ב-HAM LABORATOIRE?",
      sousTitre: "מחויבויות קונקרטיות שעושות את ההבדל",
      items: [
        { titre: "אמינות מוסמכת", description: "תוצאות העומדות בתקן ISO 9001:2015 ולנהלי מעבדה טובים." },
        { titre: "מהירות מבוקרת", description: "זמנים מיטביים בזכות תהליך עבודה מסודר וציוד ביצועים גבוהים." },
        { titre: "נגישות", description: "מחירים סבירים המאפשרים גם למי שפחות מבוסס גישה לאבחון איכותי." },
        { titre: "צוות מוסמך", description: "ביולוגים, טכנאים ורופאים מנוסים לצדכם בכל שלב." },
      ],
    },
    cta: {
      titre: "מוכנים לדאוג לבריאות?",
      description: "קבעו אונליין או צרו קשר — הצוות שלנו זמין להכווין אתכם לבדיקות המתאימות.",
      boutonPrincipal: "קביעת תור",
      boutonSecondaire: "יצירת קשר",
    },
  },

  servicesLaboratoire: pagesServicesLaboratoireEn,

  campagnes: {
    hero: {
      surtitre: "פעולות בריאות הציבור",
      titre: "קמפיינים ו",
      titreAccent: "הסברה",
      description:
        "HAM LABORATOIRE מקיים פעולות מניעה, סקר והסברה לאוכלוסיית Kinshasa. גלו את היוזמות הפעילות והשתתפו בבריאות הכלל.",
      voirCampagnes: "צפייה בקמפיינים",
      stats: {
        sensibilises: "אנשים שהגיעו להסברה / שנה",
        actions: "פעולות בממוצע לשנה",
        satisfaction: "שיעור שביעות רצון",
        iso: "הסמכת איכות",
      },
    },
    grille: {
      surtitre: "כל הפעולות שלנו",
      titre: "קמפיינים והסברה",
      sousTitre: "סננו לפי קטגוריה או עיינו ביוזמות הפעילות",
      filtrerPublications: "סינון פרסומים",
      resultatSingulier: "תוצאה",
      resultatPluriel: "תוצאות",
      filtrerStatutAria: "סינון לפי סטטוס",
      erreurChargement: "לא ניתן לטעון קמפיינים. נסו שוב.",
      aucunePublication: "לא נמצאו פרסומים",
      modifierFiltres: "נסו לשנות את המסננים לראות יותר תוצאות.",
      compteurSingulier: "פרסום מוצג מתוך",
      compteurPluriel: "פרסומים מוצגים מתוך",
      auTotal: "בסך הכל",
      filtres: {
        toutes: "כל הקטגוריות",
        tous: "הכל",
        depistage: "סקר",
        vaccination: "חיסון",
        sensibilisation: "הסברה",
        evenement: "אירוע",
      },
      statuts: { en_cours: "פעיל", a_venir: "בקרוב", terminee: "הסתיים" },
    },
    impact: {
      titre: "ההשפעה שלנו במספרים",
      sousTitre: "קמפיינים מובנים, מדידים ומעוגנים במציאות בריאות הציבור ב-Congo.",
      items: [
        { libelle: "סקרים שבוצעו", description: "HIV, קדחת, סוכרת ומחלות ספציפיות אחרות." },
        { libelle: "חיסונים שבוצעו", description: "שפעת, דלקת כבד וקמפיינים עונתיים." },
        { libelle: "שותפים מוסדיים", description: "ארגונים, חברות ומוסדות בריאות ציבורית." },
        { libelle: "רובעים מכוסים", description: "פעולות קהילתיות ב-Kinshasa וסביבה." },
      ],
    },
    parcours: {
      titre: "איך להשתתף?",
      sousTitre: "תהליך פשוט ונגיש שנועד להקל על ההשתתפות בפעולות שלנו.",
      etapes: [
        { titre: "גלו", description: "עיינו בקמפיינים הפעילים — תאריכים, מקומות ותנאי השתתפות." },
        { titre: "הירשמו", description: "קבעו אונליין, בטלפון או הגיעו ישירות למעבדה." },
        { titre: "השתתפו", description: "תיהנו מסקרים, חיסונים או ייעוצים בסביבה מקצועית וחסויה." },
        { titre: "מעקב", description: "קבלו תוצאות ואם נדרש — הפניה למרכזי טיפול מתאימים." },
      ],
    },
    cta: {
      titre: "רוצים לארגן קמפיין עם HAM?",
      description: "מוסדות, חברות וארגונים — נבנה יחד פעולות בריאות ציבור מדידות.",
      bouton: "יצירת קשר",
      boutonSecondaire: "קביעת תור",
    },
    items: {
      "paludisme-2026": {
        titre: "קמפיין סקר קדחת",
        extrait: "סקר קדחת מהיר במחירים מוזלים — הגנו על המשפחה.",
        description:
          "HAM LABORATOIRE משיק קמפיין סקר קדחת במחירים מועדפים. טכנאים מוסמכים מבצעים בדיקה מהירה (RDT) עם תוצאות אמינות תוך פחות מ-30 דקות. כולל הסברה על מניעה באזורים טרופיים.",
        periode: "1 ביולי — 31 באוגוסט 2026",
        lieu: "HAM Laboratoire — MATETE",
      },
      "depistage-vih-2026": {
        titre: "סקר HIV — חינם וחסוי",
        extrait: "בדיקת HIV ללא תשלום, תוצאות חסויות וליווי תומך.",
        description:
          "במסגרת מחויבותנו לבריאות הציבור, HAM LABORATOIRE מציע סקר HIV ללא תשלום וחסוי לחלוטין. דגימה בטוחה, תוצאות אמינות והפניה למרכזי טיפול בעת הצורך.",
        periode: "15 ביולי — 15 באוגוסט 2026",
        lieu: "HAM Laboratoire — MATETE",
      },
      "cancer-sein": {
        titre: "סקר סרטן שד",
        extrait: "אוקטובר הוורוד — גילוי מוקדם והסברה על סרטן שד.",
        description:
          "קמפיין שנתי להסברה וסקר סרטן שד. בדיקות בדיקות בדיקות קlinיות והפניה לצילום שד ועצות מניעה מצוות רפואי.",
        periode: "1 — 31 במאי 2026",
      },
      "vaccination-grippe": {
        titre: "חיסון נגד שפעת",
        extrait: "הגנו מפני שפעת עונתית — חיסון זמין.",
        description:
          "קמפיין חיסון נגד שפעת לאוכלוסיות בסיכון ולציבור הרחב. חיסונים מוסמכים על ידי אנשי מקצוע.",
        periode: "15 — 30 באפריל 2026",
      },
      "depistage-diabete": {
        titre: "סקר סוכרת",
        extrait: "גלucose, HbA1c וייעוץ תזונתי — גלו סוכרת בזמן.",
        description:
          "שבוע סקר סוכרת עם מערך סוכר מלא מלא במחיר מוזל. תוצאות מפורשות על ידי רופא עם המלצות מותאמות.",
        periode: "1 — 15 ביוני 2026",
      },
      "journee-cardiologie": {
        titre: "יום הקרדיולוגיה",
        extrait: "ייעוצים וסקרים לב וכלי דם במחירים מועדפים.",
        description:
          "ביום הלב העולמי, HAM LABORATOIRE מארגן יום פתוח לבריאות הלב: ECG, פרופיל שומני הדם וייעוצים מומחים.",
        periode: "29 בספטמבר 2026",
        lieu: "HAM Laboratoire — Kinshasa",
      },
      "hypertension-2026": {
        titre: "שבוע הסברה על לחץ דם גבוה",
        extrait: "מדידות לחץ דם ללא תשלום וסקר גורמי סיכון.",
        description:
          "קמפיין מניעת לחץ דם גבוה: מדידות ללא תשלום, panel renal וייעוץ אורח חיים מאחיות ורופאים.",
        periode: "1 — 7 בספטמבר 2026",
      },
      "pub-equipements-2026": {
        titre: "ציוד מעבדה חדש",
        extrait: "HAM LABORATOIRE מחדש את מערך הניתוח — אמינות מוגברת.",
        description:
          "הודעה מוסדית: HAM LABORATOIRE משקיע ב-מנתחים אוטומטיים חדשים לתוצאות מהירות ואמינות יותר.",
        periode: "פרסום קבוע",
      },
    },
  },

  aPropos: {
    hero: {
      typeEtablissement: "מרכז לאבחון ובדיקות רפואיות",
      badgeSlogan: "בריאותכם עלינו,",
      suiteSlogan: "האמינות שלנו בראש סדר העדיפויות",
    },
    mission: {
      titre: "המשימה שלנו",
      texte:
        "HAM, עם המעבדה והצוות המוסמך שלה, מחויבת לעמוד בתקנות ובנהלי הטוב ביותר, ולספק ללקוחות תוצאות אמינות בעלות סבירה, כך שגם המעוטים יוכלו לקבל אבחון מתאים.",
    },
    vision: {
      titre: "החזון שלנו",
      texte:
        "להיות מרכז הייחוס לאבחון ובדיקות רפואיות בהרפובליקה הדמוקרטית של Congo ובאפריקה, המוכר במצוינות, נגישות ואמינות התוצאות.",
    },
    valeurs: {
      titre: "הערכים שלנו",
      items: [
        { titre: "אמינות", description: "תוצאות מדויקות העומדות בתקנים בינלאומיים של מעבדה." },
        { titre: "נגישות", description: "שירותים איכותיים בעלות סבירה, פתוחים לכולם, כולל המעוטים." },
        { titre: "מצוינות", description: "צוות מוסמך, ציוד מודרני ועמידה בנהלי הטוב ביותר." },
        { titre: "אנושיות", description: "בריאותכם עלינו — כל מטופל מתקבל בכבוד ובקשב." },
      ],
    },
    histoire: {
      titre: "הסיפור שלנו",
      paragraphes: [
        "HAM LABORATOIRE הוא מרכז לאבחון ובדיקות רפואיות ב-Kinshasa, הרפובליקה הדמוקרטית של Congo. מאז הקמתו, המוסד מחויב לספק שירותי בריאות אמינים ונגישים לכל האוכלוסייה.",
        "עם מעבדה מאובזרת וצוות מקצועי מוסמך, HAM LABORATOIRE מלווה רופאים, מטופלים ושותפים מוסדיים לאורך מסלול האבחון בקפדנות ובקשב.",
      ],
    },
    direction: {
      titre: "ההנהלה שלנו",
      sousTitre: "מנהל המרכז",
      responsable: {
        nom: "Olivier Bokulu",
        fonction: "מנהל כללי — HAM Laboratoire",
        biographie:
          "Olivier Bokulu מנהל את HAM LABORATOIRE מתוך אמונה שבריאות היא נטל משותף ותוצאות אמינות חייבות להישאר נגישות לכולם. תחת הנהגתו, המרכז ממשיך את משימת המצוינות באבחון רפואי, עם איכות, יושרה ונגישות הטיפול בלב כל החלטה.",
      },
    },
    equipe: {
      titre: "הצוות שלנו",
      sousTitre: "אנשי מקצוע מוסמכים לשירותכם",
      membres: [
        { nom: "צוות המעבדה", fonction: "ביולוגים וטכנאים" },
        { nom: "צוות הקבלה", fonction: "קבלה והכוונה" },
        { nom: "צוות רפואי", fonction: "רופאים ואחיות" },
        { nom: "צוות מנהלי", fonction: "ניהול ואיכות" },
      ],
    },
    certifications: {
      titre: "הסמכות ומחויבויות",
      items: [
        { titre: "ISO 9001:2015", description: "מערכת ניהול איכות מוסמכת." },
        { titre: "נהלי מעבדה טובים", description: "עמידה בדרישות תקניות לאומיות ובינלאומיות." },
        { titre: "אמינות תוצאות", description: "בקרת איכות קפדנית בכל שלב הניתוח." },
      ],
    },
    impact: {
      titre: "HAM במספרים",
      sousTitre: "נוכחות מבוססת ב-Kinshasa, בשירות בריאות הציבור ב-Congo.",
      items: [
        { libelle: "מטופלים / שנה", description: "טיפולים ובדיקות שבוצעו מדי שנה." },
        { libelle: "סוגי בדיקות", description: "פלטפורמה טכנית מלאה בביולוגיה רפואית." },
        { libelle: "אנשי מקצוע", description: "ביולוגים, טכנאים, רופאים וצוות מוסמך." },
        { libelle: "הסמכה", description: "ניהול איכות מוסמך." },
      ],
    },
    bandeau: {
      slogan: "HAM LABORATOIRE — הבחירה הבטוחה לבריאות טובה יותר!",
      telephone: "טלפון",
      siteWeb: "אתר",
    },
    cta: {
      titre: "הצטרפו לאלפי מטופלים שסומכים עלינו",
      description: "קבעו תור או צרו קשר — HAM LABORATOIRE מקבל אתכם ב-MATETE, Kinshasa.",
      boutonPrincipal: "קביעת תור",
      boutonSecondaire: "יצירת קשר",
    },
  },

  resultats: resultatsPagesFallback,
} as const;

export type PagesHe = typeof pagesHe;
