/** Ba traductions transversales — validation, messages, SEO, ba pages utilitaires */

export const communLua = {
  validation: {
    nomMin: "Dina esengeli kuba na ba caractères 2 to koleka",
    nomMax: "Dina eleki monene",
    emailInvalide: "Adresse email ezali malamu te",
    sujetRequis: "Sungula sujet moko",
    messageMin: "Message esengeli kuba na ba caractères 10 to koleka",
    messageMax: "Message eleki monene",
    consentementRequis: "Osengeli kondima traitement ya ba données diawe",
    typePrestationRequis: "Sungula ndenge ya prestation moko",
    dateRequise: "Sungula date moko",
    creneauRequis: "Sungula créneau horaire moko",
    telephoneInvalide: "Numéro ya téléphone ezali malamu te",
    telephoneMax: "Numéro ya téléphone eleki monene",
    motifMax: "Motif eleki monene",
    verifierInfos: "Tala ba informations otiyi.",
  },
  messages: {
    erreurGenerique: "Libunga mu diambuluisha. Meka diaka to binga betu.",
    erreurGeneriqueContact:
      "Libunga mu diambuluisha. Meka diaka to binga betu directement.",
    contactSucces:
      "Message diawe mu tumina malamu. Équipe yetu ekoyanola mbangu mingi.",
    rdvSucces:
      "Demande diawe ya rendez-vous mu enregistrer. Okozwa confirmation na email to SMS kala ve.",
  },
  meta: {
    site: "HAM Laboratoire",
    defaultTitle:
      "HAM Laboratoire — Centre ya Diagnostic ne Ba Analyses Médicales",
    defaultDescription:
      "SANTÉ DIAWE EZALI FARDEAU YETU, FIABILITÉ EZALI PRÉÉMINENCE YETU. Centre ya diagnostic ne analyses médicales mu Kinshasa.",
    accueil: {
      title: "Ebandeli",
      description:
        "HAM LABORATOIRE — Centre ya Diagnostic ne Ba Analyses Médicales mu Kinshasa. Ba analyses, consultations, dépistages ne ba campagnes ya santé.",
    },
    contact: {
      title: "Contact",
      description:
        "Binga HAM LABORATOIRE mu Kinshasa — adresse, ba téléphones, email, ba horaires ne formulaire ya contact. MATETE, Avenue Lumière.",
    },
    services: {
      title: "Ba services yetu",
      description:
        "Yeba ba services ya HAM LABORATOIRE — ba analyses médicales, consultations, imagerie, pharmacie ne bantu badi. Fiabilité, mbangu ne accessibilité mu Kinshasa.",
    },
    campagnes: {
      title: "Ba campagnes & publicités",
      description:
        "Ba campagnes ya santé, dépistages, vaccinations ne publicités ya HAM LABORATOIRE mu Kinshasa. Ba actions yetu nionso ya prévention ne sensibilisation.",
    },
    rendezVous: {
      title: "Zwa rendez-vous",
      description:
        "Réservez consultation to ba analyses diawe na internet mu HAM LABORATOIRE — Kinshasa, MATETE. Confirmation mbala moko, ba créneaux ezali Lundi ti Samedi.",
    },
    aPropos: {
      title: "Mu ntina yetu",
      description:
        "Yeba HAM LABORATOIRE — Centre ya Diagnostic ne Ba Analyses Médicales mu Kinshasa. Mission, équipe, ba valeurs ne ba engagements.",
    },
    connexion: {
      title: "Connexion — Espace personnel",
      description: "Accès oyo mu pesama kaka na personnel ya HAM Laboratoire.",
    },
    reinitialisationMotDePasse: {
      title: "Réinitialiser mot de passe",
      description:
        "Réinitialiser mot de passe mpo na espace personnel ya HAM Laboratoire.",
    },
    application: {
      title: "Application mobile",
      description: "Télécharger application SIGH Hôpital Central.",
    },
    campagneIntrouvable: "Campagne mu zwama ve",
  },
  connexion: {
    badge: "Espace personnel",
    titre: "Connexion",
    description: "Accès oyo mu pesama kaka na personnel ya",
    identifiant: "Nom d'utilisateur to email",
    placeholderIdentifiant: "identifiant.diawe",
    motDePasse: "Mot de passe",
    afficherMotDePasse: "Monisa mot de passe",
    masquerMotDePasse: "Bomba mot de passe",
    securise: "Connexion ya sécurité",
    seSouvenir: "Kobosana mono",
    seSouvenirAide:
      "Identifiant diawe ekobomama mu appareil yayi mpo na mikolo 30. Mot de passe ekobomama mono ve.",
    motDePasseOublie: "Mot de passe obosani ?",
    seConnecter: "Kota",
    connexionEnCours: "Ezali kokota...",
    noteDev:
      "Page yayi ekopesa accès na système interne SIGH (Réception, Médecins, Laboratoire, etc.) — ezali kosala.",
    retourSite: "Vutuka na site public",
  },
  reinitialisationMotDePasse: {
    badge: "Sécurité ya compte",
    titre: "Mot de passe obosani ?",
    description:
      "Tia email to identifiant oyo ezali mu compte diawe ya basali. Tokotinda ba instructions mpo na réinitialiser mot de passe.",
    email: "Email ya mosala to identifiant",
    placeholderEmail: "diawe@email.com",
    envoyer: "Tinda lien ya réinitialisation",
    envoiEnCours: "Ezali kotinda...",
    noteSecurite:
      "Mpo na sécurité, tomonisi ve soki compte ezali. Tala boîte ya réception ne spam.",
    succesTitre: "Demande enregistrée",
    succesTexte:
      "Soki compte ezali, okozwa email na lien ya sécurité mpo na mot de passe ya sika.",
    emailEnvoye: "Ba instructions mu tumina na {{email}} soki compte ezali.",
    simulerLien: "Kokoba — tia mot de passe ya sika",
    compteIntrouvable: "Aucun compte trouvé pour cet email ou identifiant.",
    erreurReseau: "Impossible de contacter le serveur. Réessayez.",
    erreurEnregistrement: "Impossible d'enregistrer le mot de passe.",
    lienInvalide: "Lien de réinitialisation invalide ou expiré.",
    nouveauTitre: "Mot de passe ya sika",
    nouveauDescription: "Sungula mot de passe ya makasi oyo ozali kosalela esika mosusu ve.",
    nouveauDescriptionCompte: "Définissez un nouveau mot de passe pour le compte {{compte}}.",
    nouveauMotDePasse: "Mot de passe ya sika",
    confirmerMotDePasse: "Confirmer mot de passe",
    reglesMotDePasse:
      "Minimum 8 caractères — bongisa ba lettres, ba chiffres ne ba symboles.",
    enregistrer: "Enregistrer mot de passe",
    enregistrement: "Ezali ko enregistrer...",
    motDePasseDifferent: "Ba mots de passe ezali ndenge moko ve.",
    enregistreTitre: "Mot de passe mu bongisama",
    enregistreTexte:
      "Mot de passe diawe mu enregistrer. Okoki kuvutuka kota na ba identifiants ya sika.",
    retourConnexion: "Vutuka na connexion",
  },
  construction: {
    retourAccueil: "Vutuka na ebandeli",
  },
  campagnesDetail: {
    retour: "Vutuka na ba campagnes",
    prendreRdv: "Zwa rendez-vous",
    nousContacter: "Binga betu",
    a: "mu",
  },
  placeholders: {
    nomContact: "Mok. Jean Mukendi",
    messageContact: "Lakisa demande diawe na détail...",
    nomRdv: "Mok. Marie Kabongo",
    motifRdv: "Mok. Bilan sanguin complet, ordonnance ya Dr...",
    email: "diawe@email.com",
  },
} as const;
