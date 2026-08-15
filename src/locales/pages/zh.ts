/** 中文翻译 — 页面内容（首页内容已在 locales/zh.ts 中） */

import { pagesServicesLaboratoireEn } from "./fragments/services-laboratoire-en";

export const pagesZh = {
  contact: {
    hero: {
      surtitre: "保持联系",
      titre: "我们",
      titreAccent: "随时为您服务",
      description:
        "对我们的服务、检验结果或健康活动有疑问？HAM LABORATOIRE 团队将以专业与关怀为您解答。",
      stats: {
        delai: "响应时间",
        lignes: "电话线路",
        accueil: "接待与急诊",
        ville: "Kinshasa，刚果（金）",
      },
    },
    coordonnees: {
      surtitre: "我们的联系方式",
      titre: "如何联系我们",
      sousTitre: "快捷访问、完整地址与营业时间",
      rdv: "预约",
      rdvDesc: "在线预约",
      resultats: "检验结果",
      resultatsDesc: "查看您的检验报告",
      site: "官方网站",
      adresse: "地址",
      telephones: "电话",
      accueil: "接待处",
      responsable: "负责人",
      email: "电子邮箱",
      horaires: "营业时间",
    },
    formulaire: {
      surtitre: "给我们写信",
      titre: "发送消息",
      sousTitre: "填写表单 — 我们将在 24 至 48 个工作小时内回复",
      nom: "姓名 *",
      email: "电子邮箱 *",
      telephone: "电话",
      sujet: "请求主题 *",
      message: "消息 *",
      consentement:
        "我同意 HAM LABORATOIRE 根据隐私政策处理我的数据以回应我的请求。*",
      envoyer: "发送消息",
      envoi: "正在发送...",
      aideImmediate: "需要立即回复？",
      aideTexte: "请直接致电我们的接待处 — 我们随时为您提供帮助。",
      horairesLabel: "周一至周五：7:00 — 19:00",
      carteLegende: "MATETE 区，Kinshasa — Debonhomme Tercera Parcela 入口",
    },
    sujets: {
      "rendez-vous": "预约",
      resultats: "检验结果",
      campagnes: "活动与筛查",
      tarifs: "价格与服务",
      partenariat: "机构合作",
      reclamation: "投诉",
      autre: "其他请求",
    },
    horaires: {
      titre: "营业时间",
      lunVen: "周一至周五",
      lunVenHeures: "7:00 — 19:00",
      sam: "周六",
      samHeures: "7:00 — 14:00",
      dim: "周日",
      dimHeures: "仅急诊检验",
    },
    faq: {
      surtitre: "帮助与信息",
      titre: "常见问题",
      sousTitre:
        "快速找到关于我们的服务、检验结果及实验室访问的常见问题解答。",
      aideTitre: "找不到您要的答案？",
      aideTexte: "请使用联系表单或致电 — 我们的接待团队将为您指引。",
      aideLien: "联系团队 →",
      items: [
        {
          question: "如何获取检验结果？",
          reponse:
            "您的结果可在实验室领取，或通过我们的患者门户在线查看。请出示采样单或联系我们并提供您的档案编号。",
        },
        {
          question: "检验是否需要预约？",
          reponse:
            "大多数检验无需预约即可进行。对于某些专项检查，我们建议提前预约。",
        },
        {
          question: "接受哪些支付方式？",
          reponse:
            "我们接受现金、移动支付和银行转账。筛查活动可能提供分期付款便利。",
        },
        {
          question: "HAM LABORATOIRE 在哪里？",
          reponse:
            "259, Avenue Lumière，Debonhomme Tercera Parcela 入口右侧，MATETE 区，Kinshasa，刚果（金）。请查看下方地图获取路线指引。",
        },
      ],
    },
    cta: {
      titre: "需要紧急预约？",
      description:
        "在线预约或致电 — 我们的接待团队随时为您提供指引。",
      boutonRdv: "预约",
      boutonFormulaire: "发送消息",
    },
  },

  rendezVous: {
    hero: {
      surtitre: "在线预约",
      titre: "预约您的",
      titreAccent: "就诊",
      description:
        "几步即可安排您的实验室访问 — 检验、咨询、影像或筛查。即时确认，并通过短信或电子邮件提醒。",
      commencer: "开始预约",
      voirCoords: "前往表单",
      stats: {
        rapide: "快速预约",
        enLigne: "在线可用",
        confirmation: "即时确认",
        qualite: "质量认证",
      },
    },
    reservation: {
      surtitre: "在线预约",
      titre: "安排您的访问",
      sousTitre: "完成以下步骤 — 即时确认并获取参考编号",
      securise: "安全预约",
      securiseTexte:
        "您的数据受到保护，仅用于管理您在实验室的预约。",
      aide: "需要帮助？",
      aideTexte: "我们的接待团队将为您指引至合适的服务。",
      horaires: "营业时间",
      adresse: "地址",
      voirCarte: "查看地图 →",
    },
    form: {
      etapes: ["服务", "日期与时间", "您的信息", "确认"],
      typeTitre: "您需要哪种服务？",
      typeSousTitre: "请选择符合您需求的服务",
      dateTitre: "选择日期和时间段",
      dateLabel: "首选日期",
      creneauLabel: "时间段",
      pasCreneau: "该日期暂无可用时间段。请选择其他日期。",
      infosTitre: "您的联系信息",
      infosSousTitre: "用于接收确认及准备说明",
      nom: "姓名 *",
      email: "电子邮箱 *",
      telephone: "电话 *",
      naissance: "出生日期",
      premiereVisite: "首次到访实验室",
      motif: "事由或详情（可选）",
      consentement:
        "我同意 HAM LABORATOIRE 根据隐私政策处理我的数据以管理我的预约。*",
      continuer: "继续",
      retour: "返回",
      confirmer: "确认预约",
      confirmationEnCours: "正在确认...",
      succesTitre: "预约已登记！",
      succesTexte:
        "您的请求已发送给我们的团队。您将很快收到电子邮件或短信确认。",
      reference: "参考编号",
      prestation: "服务",
      date: "日期",
      heure: "时间",
      patient: "患者",
      autreRdv: "再次预约",
      sansRdv: "可无需预约",
    },
    types: {
      analyses: {
        titre: "实验室检验",
        description: "血液、尿液及生物样本 — 全面检测或专项检验。",
      },
      consultation: {
        titre: "医疗咨询",
        description:
          "普通或专科咨询，用于解读检验结果或指导后续检验。",
      },
      imagerie: {
        titre: "医学影像",
        description: "超声、放射及影像检查，需提前预约。",
      },
      depistage: {
        titre: "筛查与活动",
        description:
          "参与 HAM LABORATOIRE 组织的公共卫生筛查与活动。",
      },
      prelevement: {
        titre: "专项采样",
        description:
          "需要特定准备或流程的采样（空腹、精确时间等）。",
      },
    },
    parcours: {
      titre: "如何操作？",
      sousTitre: "四个简单步骤确认您的预约",
      etapes: [
        { titre: "选择服务", description: "选择您需要的检验或咨询类型。" },
        { titre: "日期与时间段", description: "根据我们的可用时段选择适合您的日期和时间。" },
        { titre: "您的联系信息", description: "填写信息以接收确认及准备说明。" },
        { titre: "确认", description: "提交请求 — 您将通过电子邮件或短信收到参考编号。" },
      ],
    },
    infos: {
      surtitre: "到访前",
      titre: "实用信息",
      sousTitre: "为您的实验室访问做好准备",
      items: [
        { titre: "需携带的文件", description: "身份证件、如有则携带处方、健康手册及既往检验结果。" },
        { titre: "空腹与准备", description: "部分检验需空腹 8 至 12 小时。确认信息中将提供具体说明。" },
        { titre: "接待时间", description: "周一至周五：7:00 — 19:00 · 周六：7:00 — 14:00 · 周日：仅急诊检验。" },
        { titre: "交通与停车", description: "259, Avenue Lumière，MATETE — Kinshasa。交通便利，附近有停车位。" },
      ],
    },
    faq: {
      surtitre: "常见问题",
      titre: "预约须知",
      sousTitre: "变更、取消、准备 — 查找最常见问题的答案。",
      aideTitre: "需要协助？",
      aideTexte: "我们的接待团队周一至周六为您服务。",
      aideLien: "联系页面 →",
      items: [
        {
          question: "检验可以无需预约直接前往吗？",
          reponse:
            "可以，大多数实验室检验可在营业时间内无需预约进行。预约时段可确保优先接待。",
        },
        {
          question: "如何变更或取消预约？",
          reponse:
            "请致电 +243 819 191 643 或发送邮件至 obb5lab@gmail.com，并提供您的参考编号。请至少提前 24 小时通知我们。",
        },
        {
          question: "预约前会收到提醒吗？",
          reponse:
            "会，我们将在预约时间前 24 小时通过短信或电子邮件发送提醒，如有需要还会附上准备说明。",
        },
        {
          question: "在线预约是否免费？",
          reponse:
            "在线预约完全免费。仅按我们的价目表收取实际进行的检验与咨询费用。",
        },
      ],
    },
    cta: {
      titre: "预约前还有疑问？",
      description: "我们的接待团队随时为您指引至合适的服务。",
      boutonContact: "联系我们",
      boutonReserver: "立即预约",
    },
  },

  services: {
    hero: {
      surtitre: "医学诊断与分析中心",
      titre: "卓越",
      titreAccent: "医疗服务",
      description:
        "HAM LABORATOIRE 提供全面的诊断服务 — 实验室检验、咨询、影像与筛查 — 结果可靠、周期可控、人人可及。",
      decouvrir: "了解我们的服务",
      voirPrestations: "查看服务",
      badge: "服务 · ISO 9001:2015 认证实验室",
      stats: {
        analyses: "检验项目",
        delai: "平均出结果时间",
        iso: "9001:2015 认证",
        accueil: "患者接待",
      },
    },
    categories: {
      tous: "全部服务",
      diagnostic: "诊断",
      soins: "护理与随访",
      urgences: "急诊",
    },
    vedette: {
      badge: "特色服务",
      decouvrir: "了解实验室",
      chiffres: [
        { libelle: "检验项目" },
        { libelle: "平均周期" },
        { libelle: "认证" },
      ],
    },
    grille: {
      surtitre: "我们的服务",
      titre: "全部服务",
      sousTitre: "按类别筛选，找到符合您需求的服务",
      aucun: "该类别暂无服务。",
    },
    items: {
      laboratoire: {
        titre: "实验室检验",
        description: "我们的核心专长 — 生物、血液、生化及专项检验，配备先进设备。",
        badge: "特色服务",
        points: ["200 余项检测指标", "严格质量控制", "安全的在线结果"],
      },
      consultations: {
        titre: "医疗咨询",
        description: "普通与专科咨询，由合格医生指导检验并解读结果。",
        points: ["全科医生与专科医生", "结果解读", "个性化患者随访"],
      },
      imagerie: {
        titre: "医学影像",
        description: "放射、超声及影像检查，为生物检验提供精准的视觉诊断补充。",
        points: ["超声与放射", "数字化设备", "详细报告"],
      },
      pharmacie: {
        titre: "药房",
        description: "优质药品发放与药学咨询，支持诊断后的治疗。",
        points: ["认证药品", "个性化咨询", "优化供应"],
      },
      hospitalisation: {
        titre: "住院",
        description: "持续医学监护的住院护理，适用于需要深度随访的患者。",
        points: ["舒适病房", "全天候医学监护", "协调护理"],
      },
      urgences: {
        titre: "急诊",
        description: "急诊服务，应对需要立即处理及优先检验的危急情况。",
        points: ["延长服务时间", "急诊检验", "快速响应团队"],
      },
    },
    impact: {
      titre: "卓越数据",
      sousTitre: "可衡量的绩效，体现我们对诊断质量的承诺。",
      items: [
        { libelle: "检验项目", description: "生物学、血液学、微生物学、免疫学等。" },
        { libelle: "患者 / 年", description: "MATETE 中心每年服务的患者。" },
        { libelle: "平均周期", description: "结果快速出具，通常当日可取。" },
        { libelle: "认证", description: "认证的质量流程与严格质控。" },
      ],
    },
    specialites: {
      titre: "检验专科",
      sousTitre: "全面实验室，覆盖医学诊断所需的全部核心分析领域",
    },
    parcours: {
      titre: "您在 HAM 的就诊流程",
      sousTitre: "简单、快捷、透明 — 从接待到获取结果",
      etapes: [
        { titre: "接待与分诊", description: "接待团队在数分钟内为您指引并登记档案。" },
        { titre: "咨询", description: "医生根据您的临床情况开具相应检验。" },
        { titre: "采样与检验", description: "安全采样并在实验室进行质控处理。" },
        { titre: "可靠结果", description: "交付或在线获取认证并解读的结果。" },
      ],
    },
    engagements: {
      titre: "为何选择 HAM LABORATOIRE？",
      sousTitre: "切实承诺，与众不同",
      items: [
        { titre: "认证可靠", description: "结果符合 ISO 9001:2015 标准及实验室良好规范。" },
        { titre: "可控快捷", description: "通过有序流程与高性能设备优化周期。" },
        { titre: "可及性", description: "合理价格，让包括弱势群体在内的所有人都能获得优质诊断。" },
        { titre: "专业团队", description: "生物学家、技师与医生全程陪伴。" },
      ],
    },
    cta: {
      titre: "准备好关注您的健康了吗？",
      description: "在线预约或联系我们 — 我们的团队随时为您指引合适的检验。",
      boutonPrincipal: "预约",
      boutonSecondaire: "联系我们",
    },
  },

  servicesLaboratoire: pagesServicesLaboratoireEn,

  campagnes: {
    hero: {
      surtitre: "公共卫生行动",
      titre: "健康活动与",
      titreAccent: "科普宣传",
      description:
        "HAM LABORATOIRE 在 Kinshasa 开展预防、筛查与科普行动。了解进行中的项目，共同参与全民健康。",
      voirCampagnes: "查看活动",
      stats: {
        sensibilises: "每年科普人数",
        actions: "年均行动次数",
        satisfaction: "满意度",
        iso: "质量认证",
      },
    },
    grille: {
      surtitre: "全部行动",
      titre: "活动与科普",
      sousTitre: "按类别筛选或浏览进行中的项目",
      filtrerPublications: "筛选发布",
      resultatSingulier: "条结果",
      resultatPluriel: "条结果",
      filtrerStatutAria: "按状态筛选",
      erreurChargement: "无法加载活动。请重试。",
      aucunePublication: "未找到发布内容",
      modifierFiltres: "请尝试更改筛选条件以查看更多结果。",
      compteurSingulier: "条发布，共",
      compteurPluriel: "条发布，共",
      auTotal: "总计",
      filtres: {
        toutes: "全部类别",
        tous: "全部",
        depistage: "筛查",
        vaccination: "疫苗接种",
        sensibilisation: "科普",
        evenement: "活动",
      },
      statuts: { en_cours: "进行中", a_venir: "即将开始", terminee: "已结束" },
    },
    impact: {
      titre: "我们的影响数据",
      sousTitre: "结构化、可衡量、扎根刚果医疗现实的活动。",
      items: [
        { libelle: "已完成筛查", description: "HIV、疟疾、糖尿病及其他专项疾病。" },
        { libelle: "已接种疫苗", description: "流感、肝炎及季节性活动。" },
        { libelle: "机构合作伙伴", description: "非政府组织、企业及公共卫生机构。" },
        { libelle: "覆盖区域", description: "Kinshasa 及周边社区行动。" },
      ],
    },
    parcours: {
      titre: "如何参与？",
      sousTitre: "简单可及的流程，方便您参与我们的行动。",
      etapes: [
        { titre: "了解", description: "浏览进行中的活动，查看日期、地点及参与条件。" },
        { titre: "登记", description: "在线预约、电话预约或直接前往实验室。" },
        { titre: "参与", description: "在专业保密的环境中享受筛查、疫苗接种或咨询。" },
        { titre: "随访", description: "获取结果，如有需要转介至合适的医疗机构。" },
      ],
    },
    cta: {
      titre: "与 HAM 共同组织活动？",
      description: "机构、企业与协会 — 携手开展可衡量的公共卫生行动。",
      bouton: "联系我们",
      boutonSecondaire: "预约",
    },
    items: {
      "paludisme-2026": {
        titre: "疟疾筛查活动",
        extrait: "优惠价格的快速疟疾筛查 — 保护您的家人。",
        description:
          "HAM LABORATOIRE 推出优惠疟疾筛查活动。合格技师进行快速诊断检测（RDT），30 分钟内出具可靠结果。含热带地区预防科普。",
        periode: "2026 年 7 月 1 日至 8 月 31 日",
        lieu: "HAM Laboratoire — MATETE",
      },
      "depistage-vih-2026": {
        titre: "HIV 筛查 — 免费且保密",
        extrait: "免费 HIV 检测，结果保密，贴心陪伴。",
        description:
          "作为公共卫生承诺的一部分，HAM LABORATOIRE 提供免费且完全保密的 HIV 筛查。安全采样、可靠结果，必要时转介至护理机构。",
        periode: "2026 年 7 月 15 日至 8 月 15 日",
        lieu: "HAM Laboratoire — MATETE",
      },
      "cancer-sein": {
        titre: "乳腺癌筛查",
        extrait: "粉红十月 — 早期筛查与乳腺癌科普。",
        description:
          "年度乳腺癌科普与筛查活动。临床检查、乳腺摄影转介及医疗团队提供的预防建议。",
        periode: "2026 年 5 月 1 日至 31 日",
      },
      "vaccination-grippe": {
        titre: "流感疫苗接种",
        extrait: "预防季节性流感 — 疫苗接种现已开放。",
        description:
          "面向高危人群及普通公众的流感疫苗接种活动。由合格医护人员接种认证疫苗。",
        periode: "2026 年 4 月 15 日至 30 日",
      },
      "depistage-diabete": {
        titre: "糖尿病筛查",
        extrait: "血糖、HbA1c 与营养建议 — 及早发现糖尿病。",
        description:
          "糖尿病筛查周，优惠全套血糖检测。医生解读结果并提供个性化建议。",
        periode: "2026 年 6 月 1 日至 15 日",
      },
      "journee-cardiologie": {
        titre: "心脏病学开放日",
        extrait: "优惠价格的心血管咨询与筛查。",
        description:
          "在世界心脏日，HAM LABORATOIRE 举办心血管健康开放日：心电图、血脂谱及专科咨询。",
        periode: "2026 年 9 月 29 日",
        lieu: "HAM Laboratoire — Kinshasa",
      },
      "hypertension-2026": {
        titre: "高血压科普周",
        extrait: "免费血压测量与危险因素筛查。",
        description:
          "高血压预防活动：免费测量、肾功能检测及护士与医生的生活方式建议。",
        periode: "2026 年 9 月 1 日至 7 日",
      },
      "pub-equipements-2026": {
        titre: "新实验室设备",
        extrait: "HAM LABORATOIRE 升级分析设备 — 可靠性进一步提升。",
        description:
          "机构公告：HAM LABORATOIRE 投资新一代全自动分析仪，结果更快、更可靠。",
        periode: "长期发布",
      },
    },
  },

  aPropos: {
    hero: {
      typeEtablissement: "医学诊断与分析中心",
      badgeSlogan: "您的健康是我们的责任，",
      suiteSlogan: "可靠是我们的首要追求",
    },
    mission: {
      titre: "我们的使命",
      texte:
        "HAM 凭借其实验室与合格团队，致力于遵守法规标准与最佳实践，以可负担的成本满足客户对可靠结果的需求，让包括弱势群体在内的所有人都能获得适当诊断。",
    },
    vision: {
      titre: "我们的愿景",
      texte:
        "成为刚果民主共和国及非洲医学诊断与分析领域的标杆中心，以卓越、可及性与结果可靠性著称。",
    },
    valeurs: {
      titre: "我们的价值观",
      items: [
        { titre: "可靠", description: "精确结果，符合国际实验室标准。" },
        { titre: "可及", description: "优质且负担得起的服务，向所有人开放，包括弱势群体。" },
        { titre: "卓越", description: "合格团队、现代设备与最佳实践。" },
        { titre: "人文", description: "您的健康是我们的责任 — 每位患者都受到尊重与关怀。" },
      ],
    },
    histoire: {
      titre: "我们的历史",
      paragraphes: [
        "HAM LABORATOIRE 是位于 Kinshasa、刚果民主共和国的医学诊断与分析中心。自创立以来，机构始终致力于向全体民众提供可靠、可及的医疗服务。",
        "凭借配备完善的实验室与合格专业团队，HAM LABORATOIRE 以严谨与关怀陪伴医生、患者及机构合作伙伴完成整个诊断流程。",
      ],
    },
    direction: {
      titre: "我们的领导",
      sousTitre: "中心负责人",
      responsable: {
        nom: "Olivier Bokulu",
        fonction: "总经理 — HAM Laboratoire",
        biographie:
          "Olivier Bokulu 领导 HAM LABORATOIRE，坚信健康是共同的责任，可靠的结果应人人可及。在他的领导下，中心继续践行医学诊断卓越使命，将质量、诚信与医疗可及性置于每项决策的核心。",
      },
    },
    equipe: {
      titre: "我们的团队",
      sousTitre: "合格专业人员，竭诚为您服务",
      membres: [
        { nom: "实验室团队", fonction: "生物学家与技师" },
        { nom: "接待团队", fonction: "接待与分诊" },
        { nom: "医疗团队", fonction: "医生与护士" },
        { nom: "行政团队", fonction: "管理与质量" },
      ],
    },
    certifications: {
      titre: "认证与承诺",
      items: [
        { titre: "ISO 9001:2015", description: "认证的质量管理体系。" },
        { titre: "实验室良好规范", description: "符合国内外法规要求。" },
        { titre: "结果可靠性", description: "每个分析环节严格质控。" },
      ],
    },
    impact: {
      titre: "HAM 数据一览",
      sousTitre: "在 Kinshasa 扎根深耕，服务刚果公共卫生。",
      items: [
        { libelle: "患者 / 年", description: "每年完成的就诊与检验。" },
        { libelle: "检验项目", description: "完整的医学检验技术平台。" },
        { libelle: "专业人员", description: "生物学家、技师、医生及合格员工。" },
        { libelle: "认证", description: "认证的质量管理。" },
      ],
    },
    bandeau: {
      slogan: "HAM LABORATOIRE，守护健康的可靠之选！",
      telephone: "电话",
      siteWeb: "网站",
    },
    cta: {
      titre: "加入数千名信赖我们的患者",
      description: "预约或联系我们 — HAM LABORATOIRE 在 Kinshasa MATETE 恭候您的到来。",
      boutonPrincipal: "预约",
      boutonSecondaire: "联系我们",
    },
  },
} as const;

export type PagesEs = typeof pagesZh;
