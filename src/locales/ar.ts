import type { TraductionsSite } from "./types";
import { communAr } from "./commun/ar";
import { pagesAr } from "./pages/ar";
import { receptionAr } from "./reception/ar";
import { caisseAr } from "./caisse/ar";
import { laboratoireAr } from "./laboratoire/ar";
import { medecinsAr } from "./medecins/ar";
import { infirmiersAr } from "./infirmiers/ar";
import { pharmacieAr } from "./pharmacie/ar";
import { medecinsExternesAr } from "./medecins-externes/ar";
import { egliseAr } from "./eglise/ar";
import { adminAr } from "./admin/ar";
import { clientAr } from "./client/ar";

const ar: { translation: TraductionsSite } = {
  translation: {
    nav: {
      accueil: "الرئيسية",
      aPropos: "من نحن",
      services: "الخدمات",
      campagnes: "الحملات",
      contact: "اتصل بنا",
      rendezVous: "المواعيد",
      resultats: "Results available",
    },
    common: {
      seConnecter: "تسجيل الدخول",
      rechercher: "بحث",
      fermer: "إغلاق",
      voirTous: "عرض الكل",
      voirToutes: "عرض الكل",
      enSavoirPlus: "اعرف المزيد",
      plusInfos: "مزيد من المعلومات",
      liensRapides: "روابط سريعة",
      nosServices: "خدماتنا",
      contact: "اتصل بنا",
      mentionsLegales: "إشعار قانوني",
      confidentialite: "سياسة الخصوصية",
      espacePersonnel: "بوابة الموظفين",
      droitsReserves: "جميع الحقوق محفوظة.",
      responsable: "المدير",
      reseauSocial: "شبكة اجتماعية",
      ouvrirMenu: "فتح القائمة",
      fermerMenu: "إغلاق القائمة",
      navigationPrincipale: "التنقل الرئيسي",
      navigationMobile: "التنقل على الجوال",
    },
    hopital: {
      typeEtablissement: "مركز التشخيص والتحاليل الطبية",
      slogan: "صحتكم همّنا، والموثوقية أولويتنا",
      titreAccueil: "صحتكم همّنا،",
      titreAccueilSuite: "والموثوقية أولويتنا",
      description:
        "رعاية عالية الجودة، معدات حديثة وفريق طبي في خدمتكم.",
    },
    accueil: {
      nosServices: "خدماتنا",
      prestationsMedicales: "الخدمات الطبية",
      sousTitreServices:
        "التشخيص والتحاليل المخبرية والرعاية — عرض متكامل لصحتكم",
      campagnesEnCours: "الحملات الجارية",
      santePublique: "الصحة العامة",
      sousTitreCampagnes: "الفحص والتوعية ومبادرات الوقاية",
      nosServicesBtn: "خدماتنا",
      prendreRdv: "حجز موعد",
      appMobile: "التطبيق المحمول",
      appTitre: "صحتكم في متناول يدكم",
      appDescription:
        "حمّلوا تطبيقنا المحمول لحجز المواعيد واستعراض النتائج وإدارة سجلكم الطبي.",
      appEnSavoirPlus: "اعرف المزيد",
      googlePlay: "Google Play",
      appStore: "App Store",
      disponibleSur: "متوفر على",
      telechargerSur: "حمّل من",
      stats: {
        medecins: "أطباء متخصصون",
        departements: "الأقسام",
        patients: "مرضى تمت خدمتهم",
        certification: "شهادة الجودة",
      },
      accesRapide: {
        rdv: { titre: "حجز موعد", sousTitre: "عبر الإنترنت 24/7" },
        resultats: { titre: "نتائج الفحوصات", sousTitre: "متاحة عبر الإنترنت" },
        paiement: { titre: "دفع آمن", sousTitre: "عبر الإنترنت" },
        support: { titre: "خدمة المرضى", sousTitre: "مساعدة مخصصة" },
      },
      services: {
        consultations: {
          titre: "الاستشارات",
          description:
            "استشارات عامة وتخصصية مع أطبائنا ذوي الخبرة.",
        },
        laboratoire: {
          titre: "المختبر",
          description:
            "تحاليل طبية شاملة بمعدات حديثة.",
        },
        pharmacie: {
          titre: "الصيدلية",
          description:
            "أدوية عالية الجودة وإرشاد صيدلاني مخصص.",
        },
        hospitalisation: {
          titre: "الإقامة بالمستشفى",
          description:
            "رعاية مستشفوية مع متابعة طبية مستمرة.",
        },
        urgences: {
          titre: "الطوارئ",
          description:
            "خدمة طوارئ على مدار الساعة للحالات الحرجة.",
        },
        imagerie: {
          titre: "التصوير الطبي",
          description:
            "أشعة سينية، تصوير بالموجات فوق الصوتية والرنين المغناطيسي لتشخيص دقيق.",
        },
      },
    },
    footer: {
      consultations: "الاستشارات",
      laboratoire: "المختبر",
      pharmacie: "الصيدلية",
      urgences: "الطوارئ",
      applicationMobile: "التطبيق المحمول",
    },
    recherche: {
      titre: "البحث في الموقع",
      placeholder: "الخدمات، الحملات، الصفحات…",
      hint: "اكتب حرفين على الأقل للبحث.",
      suggestions: "اقتراحات",
      aucunResultat: "لا توجد نتائج لهذا البحث.",
      aucunResultatTitre: "لم يُعثر على نتائج",
      aucunResultatPour: "لا توجد نتائج لـ \"{{query}}\"",
      aucunResultatConseil:
        "جرّب كلمات مفتاحية أخرى، راجع الإملاء أو استكشف صفحاتنا الرئيسية.",
      compteur: "{{count}} نتيجة",
      navigation: "↑↓ للتنقل · Enter للفتح · Esc للإغلاق",
      raccourci: "Ctrl+K للبحث",
      categories: {
        page: "صفحة",
        service: "خدمة",
        campagne: "حملة",
        acces: "وصول سريع",
        faq: "أسئلة شائعة",
        prestation: "نوع الخدمة",
      },
      pages: {
        "/": "الرئيسية",
        "/a-propos": "عن HAM Laboratoire",
        "/services": "خدماتنا الطبية",
        "/campagnes": "الحملات الصحية",
        "/contact": "اتصل بنا",
        "/rendez-vous": "حجز موعد عبر الإنترنت",
        "/resultats": "استعراض نتائج الفحوصات",
        "/connexion": "بوابة الموظفين — تسجيل الدخول",
        "/application": "تطبيق HAM المحمول",
      },
    },
    pages: pagesAr,
    reception: receptionAr,
    caisse: caisseAr,
    laboratoire: laboratoireAr,
    medecins: medecinsAr,
    infirmiers: infirmiersAr,
    pharmacie: pharmacieAr,
    medecinsExternes: medecinsExternesAr,
    eglise: egliseAr,
    admin: adminAr,
    client: clientAr,
    ...communAr,
  },
};

export default ar;
