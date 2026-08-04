import type { TraductionsSite } from "./types";
import { communZh } from "./commun/zh";
import { pagesZh } from "./pages/zh";
import { receptionZh } from "./reception/zh";
import { caisseZh } from "./caisse/zh";
import { laboratoireZh } from "./laboratoire/zh";
import { medecinsZh } from "./medecins/zh";
import { infirmiersZh } from "./infirmiers/zh";
import { pharmacieZh } from "./pharmacie/zh";

const zh: { translation: TraductionsSite } = {
  translation: {
    nav: {
      accueil: "首页",
      aPropos: "关于我们",
      services: "服务",
      campagnes: "活动",
      contact: "联系我们",
      rendezVous: "预约",
    },
    common: {
      seConnecter: "登录",
      rechercher: "搜索",
      fermer: "关闭",
      voirTous: "查看全部",
      voirToutes: "查看全部",
      enSavoirPlus: "了解更多",
      plusInfos: "更多信息",
      liensRapides: "快捷链接",
      nosServices: "我们的服务",
      contact: "联系我们",
      mentionsLegales: "法律声明",
      confidentialite: "隐私政策",
      espacePersonnel: "员工门户",
      droitsReserves: "版权所有。",
      responsable: "负责人",
      reseauSocial: "社交媒体",
      ouvrirMenu: "打开菜单",
      fermerMenu: "关闭菜单",
      navigationPrincipale: "主导航",
      navigationMobile: "移动端导航",
    },
    hopital: {
      typeEtablissement: "医学诊断与分析中心",
      slogan: "您的健康是我们的责任，可靠是我们的首要追求",
      titreAccueil: "您的健康是我们的责任，",
      titreAccueilSuite: "可靠是我们的首要追求",
      description:
        "优质医疗、先进设备与专业医疗团队，竭诚为您服务。",
    },
    accueil: {
      nosServices: "我们的服务",
      prestationsMedicales: "医疗服务",
      sousTitreServices:
        "诊断、实验室检验与医疗护理 — 为您的健康提供全面服务",
      campagnesEnCours: "进行中的活动",
      santePublique: "公共卫生",
      sousTitreCampagnes: "筛查、科普与预防行动",
      nosServicesBtn: "我们的服务",
      prendreRdv: "预约",
      appMobile: "移动应用",
      appTitre: "您的健康，触手可及",
      appDescription:
        "下载我们的移动应用，预约就诊、查看检验结果并管理您的医疗记录。",
      appEnSavoirPlus: "了解更多",
      googlePlay: "Google Play",
      appStore: "App Store",
      disponibleSur: "可在以下平台获取",
      telechargerSur: "下载于",
      stats: {
        medecins: "专科医生",
        departements: "科室",
        patients: "服务患者",
        certification: "质量认证",
      },
      accesRapide: {
        rdv: { titre: "预约", sousTitre: "全天候在线" },
        resultats: { titre: "检验结果", sousTitre: "在线可查" },
        paiement: { titre: "安全支付", sousTitre: "在线支付" },
        support: { titre: "患者服务", sousTitre: "专属协助" },
      },
      services: {
        consultations: {
          titre: "门诊咨询",
          description:
            "由经验丰富的医生提供普通与专科门诊服务。",
        },
        laboratoire: {
          titre: "实验室",
          description:
            "使用先进设备提供全面的医学检验。",
        },
        pharmacie: {
          titre: "药房",
          description:
            "优质药品与个性化药学咨询。",
        },
        hospitalisation: {
          titre: "住院",
          description:
            "住院医疗与持续医学监护。",
        },
        urgences: {
          titre: "急诊",
          description:
            "全天候急诊服务，应对危急情况。",
        },
        imagerie: {
          titre: "医学影像",
          description:
            "放射、超声与磁共振，助力精准诊断。",
        },
      },
    },
    footer: {
      consultations: "门诊咨询",
      laboratoire: "实验室",
      pharmacie: "药房",
      urgences: "急诊",
      applicationMobile: "移动应用",
    },
    recherche: {
      titre: "站内搜索",
      placeholder: "服务、活动、页面…",
      hint: "请输入至少 2 个字符进行搜索。",
      suggestions: "建议",
      aucunResultat: "未找到相关结果。",
      aucunResultatTitre: "未找到结果",
      aucunResultatPour: "未找到与 \"{{query}}\" 相关的结果",
      aucunResultatConseil:
        "请尝试其他关键词、检查拼写或浏览我们的主要页面。",
      compteur: "{{count}} 条结果",
      navigation: "↑↓ 导航 · Enter 打开 · Esc 关闭",
      raccourci: "Ctrl+K 搜索",
      categories: {
        page: "页面",
        service: "服务",
        campagne: "活动",
        acces: "快捷入口",
        faq: "常见问题",
        prestation: "服务类型",
      },
      pages: {
        "/": "首页",
        "/a-propos": "关于 HAM Laboratoire",
        "/services": "我们的医疗服务",
        "/campagnes": "健康活动",
        "/contact": "联系我们",
        "/rendez-vous": "在线预约",
        "/resultats": "查看检验结果",
        "/connexion": "员工门户 — 登录",
        "/application": "HAM 移动应用",
      },
    },
    pages: pagesZh,
    reception: receptionZh,
    caisse: caisseZh,
    laboratoire: laboratoireZh,
    medecins: medecinsZh,
    infirmiers: infirmiersZh,
    pharmacie: pharmacieZh,
    ...communZh,
  },
};

export default zh;
