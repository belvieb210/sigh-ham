/** 跨页面翻译 — 验证、消息、SEO、实用页面 */

export const communZh = {
  validation: {
    nomMin: "姓名至少需要 2 个字符",
    nomMax: "姓名过长",
    emailInvalide: "电子邮箱地址无效",
    sujetRequis: "请选择主题",
    messageMin: "消息至少需要 10 个字符",
    messageMax: "消息过长",
    consentementRequis: "您必须同意处理您的个人数据",
    typePrestationRequis: "请选择服务类型",
    dateRequise: "请选择日期",
    creneauRequis: "请选择时间段",
    telephoneInvalide: "电话号码无效",
    telephoneMax: "电话号码过长",
    motifMax: "事由说明过长",
    verifierInfos: "请检查所填信息。",
  },
  messages: {
    erreurGenerique: "发生错误。请重试或直接致电联系我们。",
    erreurGeneriqueContact:
      "发生错误。请重试或直接致电联系我们。",
    contactSucces:
      "您的消息已成功发送。我们的团队将尽快回复。",
    rdvSucces:
      "您的预约请求已登记。您将很快收到电子邮件或短信确认。",
  },
  meta: {
    site: "HAM Laboratoire",
    defaultTitle: "HAM Laboratoire — 医学诊断与分析中心",
    defaultDescription:
      "您的健康是我们的责任，可靠是我们的首要追求。Kinshasa 医学诊断与分析中心。",
    accueil: {
      title: "首页",
      description:
        "HAM LABORATOIRE — Kinshasa 医学诊断与分析中心。检验、咨询、筛查与健康宣传活动。",
    },
    contact: {
      title: "联系我们",
      description:
        "联系 Kinshasa 的 HAM LABORATOIRE — 地址、电话、电子邮箱、营业时间与联系表单。MATETE，Avenue Lumière。",
    },
    services: {
      title: "我们的服务",
      description:
        "了解 HAM LABORATOIRE 的服务 — 医学检验、咨询、影像、药房等。Kinshasa 可靠、快捷、可及。",
    },
    campagnes: {
      title: "活动与公告",
      description:
        "HAM LABORATOIRE 在 Kinshasa 的健康宣传、筛查、疫苗接种与公告。所有预防与科普行动。",
    },
    rendezVous: {
      title: "预约",
      description:
        "在 HAM LABORATOIRE 在线预约咨询或检验 — Kinshasa，MATETE。即时确认，周一至周六可预约。",
    },
    aPropos: {
      title: "关于我们",
      description:
        "了解 HAM LABORATOIRE — Kinshasa 医学诊断与分析中心。使命、团队、价值观与承诺。",
    },
    connexion: {
      title: "登录 — 员工门户",
      description: "仅限 HAM Laboratoire 员工访问。",
    },
    reinitialisationMotDePasse: {
      title: "重置密码",
      description:
        "重置 HAM Laboratoire 员工门户密码。",
    },
    application: {
      title: "移动应用",
      description: "下载 SIGH Hôpital Central 应用。",
    },
    campagneIntrouvable: "未找到该活动",
  },
  connexion: {
    badge: "员工门户",
    titre: "登录",
    description: "仅限以下人员访问",
    identifiant: "用户名或电子邮箱",
    placeholderIdentifiant: "your.username",
    motDePasse: "密码",
    afficherMotDePasse: "显示密码",
    masquerMotDePasse: "隐藏密码",
    securise: "安全登录",
    seSouvenir: "记住我",
    seSouvenirAide:
      "您的用户名将在此设备上保存 30 天。密码不会被存储。",
    motDePasseOublie: "忘记密码？",
    seConnecter: "登录",
    connexionEnCours: "正在登录...",
    noteDev:
      "此页面将提供 SIGH 内部系统访问（接待、医生、实验室等）— 开发中。",
    retourSite: "返回公开网站",
  },
  reinitialisationMotDePasse: {
    badge: "账户安全",
    titre: "忘记密码？",
    description:
      "请输入与您的员工账户关联的电子邮箱地址或用户名。我们将发送重置密码的说明。",
    email: "工作邮箱或用户名",
    placeholderEmail: "you@email.com",
    envoyer: "发送重置链接",
    envoiEnCours: "正在发送...",
    noteSecurite:
      "出于安全考虑，我们不会确认账户是否存在。请检查收件箱和垃圾邮件文件夹。",
    succesTitre: "请求已收到",
    succesTexte:
      "如有匹配的账户，您将收到一封包含安全链接的电子邮件，用于设置新密码。",
    emailEnvoye: "如账户存在，说明已发送至 {{email}}。",
    simulerLien: "继续 — 设置新密码",
    nouveauTitre: "新密码",
    nouveauDescription: "请选择一个安全且未在其他地方使用的密码。",
    nouveauMotDePasse: "新密码",
    confirmerMotDePasse: "确认密码",
    reglesMotDePasse:
      "至少 8 个字符 — 请组合字母、数字和符号以提高安全性。",
    enregistrer: "保存密码",
    enregistrement: "正在保存...",
    motDePasseDifferent: "两次输入的密码不一致。",
    enregistreTitre: "密码已更新",
    enregistreTexte:
      "您的密码已保存。您现在可以使用新凭据登录。",
    retourConnexion: "返回登录",
  },
  construction: {
    retourAccueil: "返回首页",
  },
  campagnesDetail: {
    retour: "返回活动列表",
    prendreRdv: "预约",
    nousContacter: "联系我们",
    a: "于",
  },
  placeholders: {
    nomContact: "例：张三",
    messageContact: "请详细描述您的请求...",
    nomRdv: "例：李四",
    motifRdv: "例：全血检验、Dr 处方...",
    email: "you@email.com",
  },
} as const;
