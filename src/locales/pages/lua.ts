/** Traductions LUA — makanda ya ba pages (libanda ya munda kele déjà na locales/lua.ts) */

import { pagesServicesLaboratoireEn } from "./fragments/services-laboratoire-en";
import { extensionFormRdvMedecinEn } from "./fragments/extension-form-rdv-medecin-en";
import { resultatsPagesFallback } from "./fragments/resultats-fr";

export const pagesLua = {
  contact: {
    hero: {
      surtitre: "Vanda na boyokani",
      titre: "Tudi",
      titreAccent: "na kuyidika bwe",
      description:
        "Muntu wa mutuna mpo na mishindu yetu, ba résultats bwa bwe to campagne ya bulwadji ? Équipe ya HAM LABORATOIRE ke yanola bwe na professionnalisme ne na bolingo.",
      stats: {
        delai: "Ntangu ya réponse",
        lignes: "Ba lignes téléphoniques",
        accueil: "Accueil & urgences",
        ville: "Kinshasa, RDC",
      },
    },
    coordonnees: {
      surtitre: "Ba coordonnées yetu",
      titre: "Ndeni bwe ke koka kutana ne betu",
      sousTitre: "Accès noki, adresse mobimba ne ba horaires ya ouverture",
      rdv: "Rendez-vous",
      rdvDesc: "Réserver na internet",
      resultats: "Ba résultats",
      resultatsDesc: "Tala ba examens bwa bwe",
      site: "Site officiel",
      adresse: "Adresse",
      telephones: "Ba téléphones",
      accueil: "Accueil",
      responsable: "Responsable",
      email: "Email",
      horaires: "Ba horaires ya ouverture",
    },
    formulaire: {
      surtitre: "Koma ne betu",
      titre: "Tinda betu message",
      sousTitre: "Tondisa formulaire — betu ke yanola bwe na kati ya 24 ne 48 heures ouvrées",
      nom: "Dina mobimba *",
      email: "Email *",
      telephone: "Téléphone",
      sujet: "Sujet ya demande bwa bwe *",
      message: "Message *",
      consentement:
        "Ndimi ete ba données dianyi ke bongisama na HAM LABORATOIRE mpo na demande dianyi, selon politique ya confidentialité. *",
      envoyer: "Tinda message",
      envoi: "Ke tindama...",
      aideImmediate: "Bwe ke na besoin ya réponse mbala moko ?",
      aideTexte: "Benga accueil yetu directement — betu kele na bokaboli bwa bwe.",
      horairesLabel: "Lun — Ven : 07h — 19h",
      carteLegende: "Commune MATETE, Kinshasa — Entrée Debonhomme Troisième Parcelle",
    },
    sujets: {
      "rendez-vous": "Prise de rendez-vous",
      resultats: "Ba résultats d'examens",
      campagnes: "Ba campagnes & dépistages",
      tarifs: "Ba tarifs & prestations",
      partenariat: "Partenariat institutionnel",
      reclamation: "Réclamation",
      autre: "Demande mosusu",
    },
    horaires: {
      titre: "Ba horaires ya ouverture",
      lunVen: "Lundi — Vendredi",
      lunVenHeures: "07h00 — 19h00",
      sam: "Samedi",
      samHeures: "07h00 — 14h00",
      dim: "Dimanche",
      dimHeures: "Urgences analyses kaka",
    },
    faq: {
      surtitre: "Lisalisi & ba renseignements",
      titre: "Mituna oyo batunaka mingi",
      sousTitre:
        "Luka réponse na noki mpo na mituna bwa bwe mpo na mishindu, ba résultats ne accès na laboratoire.",
      aideTitre: "Bwe zui réponse te ?",
      aideTexte: "Salisa formulaire ya contact to benga betu — équipe ya accueil ke yangola bwe.",
      aideLien: "Kutana ne équipe →",
      items: [
        {
          question: "Ndeni mono ke koka kozua ba résultats dianyi ya analyses ?",
          reponse:
            "Ba résultats bwa bwe kele na laboratoire to na internet na portail patient yetu. Leta fiche ya prélèvement to benga betu na numéro ya dossier bwa bwe.",
        },
        {
          question: "Esengeli rendez-vous mpo na ba analyses ?",
          reponse:
            "Ba analyses mingi ke koka kosalema sans rendez-vous. Mpo na ba examens spécialisés mosusu, betu recommande kozwa rendez-vous liboso.",
        },
        {
          question: "Ba moyens ya paiement nini bo ke kondima ?",
          reponse:
            "Beto ke kondima cash, mobile money ne virement bancaire. Ba facilités ke koka kopesama mpo na ba campagnes ya dépistage.",
        },
        {
          question: "HAM LABORATOIRE kele wapi ?",
          reponse:
            "259, Avenue Lumière, Entrée Debonhomme Troisième Parcelle À Droit, Commune MATETE, Kinshasa, RDC. Tala carte na nse mpo na itinéraire.",
        },
      ],
    },
    cta: {
      titre: "Bwe ke na besoin ya rendez-vous na noki ?",
      description:
        "Zwa rendez-vous na internet to benga betu — équipe ya accueil kele mpo na kuyangola bwe.",
      boutonRdv: "Zwa rendez-vous",
      boutonFormulaire: "Tinda message",
    },
  },

  rendezVous: {
    hero: {
      surtitre: "Prise de rendez-vous na internet",
      titre: "Réservez",
      titreAccent: "consultation bwa bwe",
      description:
        "Planifiez visite bwa bwe na laboratoire na ba clics moke — analyses, consultations, imagerie to dépistages. Confirmation mbala moko ne rappel na SMS to email.",
      commencer: "Bandela réservation",
      voirCoords: "Kokende na formulaire",
      stats: {
        rapide: "Réservation noki",
        enLigne: "Kele na internet",
        confirmation: "Confirmation instantanée",
        qualite: "Qualité certifiée",
      },
    },
    reservation: {
      surtitre: "Réservation na internet",
      titre: "Planifiez visite bwa bwe",
      sousTitre: "Tondisa ba étapes na nse — confirmation mbala moko na numéro ya référence",
      securise: "Réservation sécurisée",
      securiseTexte:
        "Ba données bwa bwe ke batama ne ke salelami kaka mpo na gestion ya rendez-vous bwa bwe na laboratoire.",
      aide: "Bwe ke na besoin ya lisalisi ?",
      aideTexte: "Accueil yetu ke yangola bwe na prestation ya malamu.",
      horaires: "Ba horaires",
      adresse: "Adresse",
      voirCarte: "Tala carte →",
    },
    form: {
      etapes: ["Prestation", "Date & heure", "Ba infos bwa bwe", "Doctor", "Confirmation"],
      typeTitre: "Prestation ya ndenge nini bwe ke linga ?",
      typeSousTitre: "Pona service oyo ekokani na besoin bwa bwe",
      dateTitre: "Pona date ne créneau",
      dateLabel: "Date oyo bwe ke linga",
      creneauLabel: "Créneau horaire",
      pasCreneau: "Créneau kele te mpo na date oyo. Pona mosusu.",
      infosTitre: "Ba coordonnées bwa bwe",
      infosSousTitre: "Mpo na kozua confirmation ne ba consignes ya préparation",
      nom: "Dina mobimba *",
      email: "Email *",
      telephone: "Téléphone *",
      naissance: "Date ya mbotama",
      premiereVisite: "Visite ya liboso na laboratoire",
      motif: "Motif to ba précisions (optionnel)",
      consentement:
        "Ndimi ete ba données dianyi ke bongisama na HAM LABORATOIRE mpo na gestion ya rendez-vous dianyi, selon politique ya confidentialité. *",
      continuer: "Kokoba",
      retour: "Kozonga",
      confirmer: "Confirmer rendez-vous",
      confirmationEnCours: "Ke confirmer...",
      succesTitre: "Rendez-vous enregistré !",
      succesTexte:
        "Demande bwa bwe etindami na équipe yetu. Bwe ke zua confirmation na email to SMS kala te.",
      reference: "Numéro ya référence",
      prestation: "Prestation",
      date: "Date",
      heure: "Heure",
      patient: "Patient",
      medecinTitre: extensionFormRdvMedecinEn.medecinTitre,
      medecinSousTitre: extensionFormRdvMedecinEn.medecinSousTitre,
      sansPreference: extensionFormRdvMedecinEn.sansPreference,
      medecin: extensionFormRdvMedecinEn.medecin,
      medecinSpecialite: extensionFormRdvMedecinEn.medecinSpecialite,
      medecinDisponibilite: extensionFormRdvMedecinEn.medecinDisponibilite,
      medecinHorairesDefaut: extensionFormRdvMedecinEn.medecinHorairesDefaut,
      autreRdv: "Zwa rendez-vous mosusu",
      sansRdv: "Sans RDV ke koka",
    },
    types: {
      analyses: {
        titre: "Analyses ya laboratoire",
        description: "Ba prélèvements ya ngolo, urine ne biologiques — bilan complet to examens ciblés.",
      },
      consultation: {
        titre: "Consultation médicale",
        description:
          "Consultation générale to spécialisée mpo na kuyebisa ba résultats bwa bwe to kuyangola ba examens bwa bwe.",
      },
      imagerie: {
        titre: "Imagerie médicale",
        description: "Échographie, radiologie ne ba examens ya imagerie na rendez-vous.",
      },
      depistage: {
        titre: "Dépistage & campagne",
        description:
          "Participation na ba campagnes ya santé publique ne ba dépistages oyo HAM LABORATOIRE ke bongisaka.",
      },
      prelevement: {
        titre: "Prélèvement spécialisé",
        description:
          "Ba prélèvements oyo esengeli préparation to protocole spécifique (jeûne, horaire précis).",
      },
    },
    parcours: {
      titre: "Ke salema ndenge nini ?",
      sousTitre: "Ba étapes minei ya peto mpo na koconfirmer rendez-vous bwa bwe",
      etapes: [
        { titre: "Pona prestation", description: "Pona ndenge ya examen to consultation oyo bwe ke na besoin." },
        { titre: "Date & créneau", description: "Lakisa date ne heure oyo ekokani na bwe na ba disponibilités yetu." },
        { titre: "Ba coordonnées bwa bwe", description: "Tondisa ba informations bwa bwe mpo na kozua confirmation ne ba consignes." },
        { titre: "Confirmation", description: "Confirmer demande bwa bwe — bwe ke zua numéro ya référence na email to SMS." },
      ],
    },
    infos: {
      surtitre: "Liboso ya visite bwa bwe",
      titre: "Ba informations pratiques",
      sousTitre: "Bongisa visite bwa bwe na laboratoire",
      items: [
        { titre: "Ba pièces ya komema", description: "Carte d'identité, ordonnance médicale soki esengeli, carnet ya santé ne ba résultats ya kala." },
        { titre: "Jeûne & préparation", description: "Ba examens mosusu esengeli jeûne ya 8 ne 12 h. Ba consignes ke yebisama na confirmation." },
        { titre: "Ba horaires ya accueil", description: "Lun — Ven : 07h — 19h · Sam : 07h — 14h · Dim : urgences analyses kaka." },
        { titre: "Accès & parking", description: "259, Avenue Lumière, MATETE — Kinshasa. Accès facile, parking kele pene pene." },
      ],
    },
    faq: {
      surtitre: "Mituna oyo batunaka mingi",
      titre: "Yebisa nyonso mpo na ba rendez-vous",
      sousTitre: "Modification, annulation, préparation — luka ba réponses na mituna ya mingi.",
      aideTitre: "Bwe ke na besoin ya assistance ?",
      aideTexte: "Équipe ya accueil kele na lundi tii samedi.",
      aideLien: "Page contact →",
      items: [
        {
          question: "Mono ke koka koya sans rendez-vous mpo na ba analyses ?",
          reponse:
            "Ee, ba analyses mingi ya laboratoire ke koka kosalema sans rendez-vous na ba heures ya ouverture. Créneau oyo reserve ke pesa bwe accueil prioritaire.",
        },
        {
          question: "Ndeni mono ke koka kobongola to koboya rendez-vous dianyi ?",
          reponse:
            "Benga accueil yetu na +243 819 191 643 to na email obb5lab@gmail.com en indiquant numéro ya référence bwa bwe. Betu sengi bwe koyebisa liboso na 24 h.",
        },
        {
          question: "Mono ke zua rappel liboso ya rendez-vous dianyi ?",
          reponse:
            "Ee, rappel etindami na SMS to email 24 heures liboso ya créneau bwa bwe, na ba consignes ya préparation soki esengeli.",
        },
        {
          question: "Ba rendez-vous na internet kele ofele ?",
          reponse:
            "Prise de rendez-vous na internet kele ofele mobimba. Kaka ba examens ne consultations oyo esalemi nde ke solola selon grille tarifaire yetu.",
        },
      ],
    },
    cta: {
      titre: "Muntu wa mutuna liboso ya kozwa rendez-vous ?",
      description: "Équipe ya accueil kele mpo na kuyangola bwe na prestation ya malamu.",
      boutonContact: "Kutana ne betu",
      boutonReserver: "Réserver sik'oyo",
    },
  },

  services: {
    hero: {
      surtitre: "Centre ya diagnostic & analyses médicales",
      titre: "Mishindu ya monganga",
      titreAccent: "ya excellence",
      description:
        "HAM LABORATOIRE ke pesa gamme mobimba ya ba prestations ya diagnostic — analyses ya laboratoire, consultations, imagerie ne dépistages — na ba résultats ya kondima, ba délais oyo ke bongisami ne accessibilité mpo na bantu nyonso.",
      decouvrir: "Découvrir mishindu yetu",
      voirPrestations: "Tala ba prestations",
      badge: "ba prestations · Laboratoire certifié ISO 9001:2015",
      stats: {
        analyses: "Ba ndenge ya analyses",
        delai: "Délai moyen ya ba résultats",
        iso: "9001:2015 certifié",
        accueil: "Accueil patients",
      },
    },
    categories: {
      tous: "Mishindu nyonso",
      diagnostic: "Diagnostic",
      soins: "Soins & suivi",
      urgences: "Urgences",
    },
    vedette: {
      badge: "Service phare",
      decouvrir: "Découvrir laboratoire",
      chiffres: [
        { libelle: "Ba ndenge ya analyses" },
        { libelle: "Délai moyen" },
        { libelle: "Certification" },
      ],
    },
    grille: {
      surtitre: "Offre yetu",
      titre: "Ba prestations yetu nyonso",
      sousTitre: "Filtre na catégorie mpo na kozua service oyo ekokani na besoin bwa bwe",
      aucun: "Service kele te na catégorie oyo.",
    },
    items: {
      laboratoire: {
        titre: "Laboratoire d'analyses",
        description: "Ntima ya expertise yetu — ba analyses biologiques, hématologiques, biochimiques ne spécialisées na ba équipements ya sika.",
        badge: "Service phare",
        points: ["Paramètres koleka 200 oyo ke talami", "Ba contrôles qualité rigoureux", "Ba résultats sécurisés na internet"],
      },
      consultations: {
        titre: "Ba consultations médicales",
        description: "Ba consultations générales ne spécialisées mpo na kuyangola ba examens bwa bwe ne kuyebisa ba résultats bwa bwe na ba médecins qualifiés yetu.",
        points: ["Ba médecins généralistes & spécialistes", "Interprétation ya ba résultats", "Suivi personnalisé ya patient"],
      },
      imagerie: {
        titre: "Imagerie médicale",
        description: "Radiologie, échographie ne ba examens ya imagerie mpo na diagnostic visuel ya malamu ne complémentaire na ba analyses biologiques.",
        points: ["Échographie & radiologie", "Ba équipements numériques", "Ba compte-rendus détaillés"],
      },
      pharmacie: {
        titre: "Pharmacie",
        description: "Dispensation ya ba médicaments ya qualité ne ba conseils pharmaceutiques mpo na kuyamba traitement bwa bwe nsima ya diagnostic.",
        points: ["Ba médicaments certifiés", "Ba conseils personnalisés", "Disponibilité optimisée"],
      },
      hospitalisation: {
        titre: "Hospitalisation",
        description: "Prise en charge hospitalière na surveillance médicale continue mpo na ba patients oyo esengeli suivi approfondi.",
        points: ["Ba chambres confortables", "Suivi médical 24h/24", "Coordination ya ba soins"],
      },
      urgences: {
        titre: "Urgences",
        description: "Service ya urgences kele mpo na ba situations critiques oyo esengeli prise en charge mbala moko ne ba analyses prioritaires.",
        points: ["Disponibilité étendue", "Ba analyses en urgence", "Équipe réactive"],
      },
    },
    impact: {
      titre: "Excellence na ba chiffres",
      sousTitre: "Ba performances oyo ke monisami oyo ke tindimi engagement yetu mpo na qualité diagnostique.",
      items: [
        { libelle: "Ba ndenge ya analyses", description: "Biologie, hématologie, microbiologie, immunologie ne mosusu." },
        { libelle: "Ba patients / mbula", description: "Ba prises en charge na centre yetu ya MATETE." },
        { libelle: "Délai moyen", description: "Ba résultats kele na noki, mbala mingi mokolo moko." },
        { libelle: "Certification", description: "Ba processus qualité certifiés ne ba contrôles rigoureux." },
      ],
    },
    specialites: {
      titre: "Ba spécialités ya analyses",
      sousTitre: "Laboratoire mobimba oyo ke kokisi ba domaines analytiques nyonso ya ntina mpo na diagnostic médical",
    },
    parcours: {
      titre: "Parcours bwa bwe na HAM",
      sousTitre: "Processus ya peto, ya noki ne ya polele — kowuta na accueil tii na ba résultats bwa bwe",
      etapes: [
        { titre: "Accueil & orientation", description: "Équipe ya accueil ke yangola bwe ne enregistre dossier bwa bwe na ba minutes moke." },
        { titre: "Consultation", description: "Médecin ke pesa ba examens oyo ekokani na situation clinique bwa bwe." },
        { titre: "Prélèvement & analyses", description: "Prélèvement sécurisé ne traitement na laboratoire na ba contrôles qualité." },
        { titre: "Ba résultats ya kondima", description: "Remise to consultation na internet ya ba résultats certifiés ne interprétés." },
      ],
    },
    engagements: {
      titre: "Mpo na nini kopona HAM LABORATOIRE ?",
      sousTitre: "Ba engagements concrets oyo ke salela différence",
      items: [
        { titre: "Fiabilité certifiée", description: "Ba résultats oyo ekokani na ba normes ISO 9001:2015 ne bonnes pratiques ya laboratoire." },
        { titre: "Rapidité maîtrisée", description: "Ba délais optimisés grâce na flux ya travail organisé ne ba équipements performants." },
        { titre: "Accessibilité", description: "Ba tarifs favorables oyo ke pesa nzela na ba démunis ne kozua diagnostic ya qualité." },
        { titre: "Équipe qualifiée", description: "Ba biologistes, techniciens ne médecins expérimentés na bokaboli bwa bwe na étape nyonso." },
      ],
    },
    cta: {
      titre: "Bwe ke prêt kutala bulwadji bwa bwe ?",
      description: "Zwa rendez-vous na internet to benga betu — équipe yetu kele mpo na kuyangola bwe na ba examens oyo ekokani.",
      boutonPrincipal: "Zwa rendez-vous",
      boutonSecondaire: "Kutana ne betu",
    },
  },

  servicesLaboratoire: pagesServicesLaboratoireEn,

  campagnes: {
    hero: {
      surtitre: "Ba actions ya santé publique",
      titre: "Ba campagnes &",
      titreAccent: "publicités",
      description:
        "HAM LABORATOIRE ke saleli ba actions ya prévention, dépistage ne sensibilisation mpo na bantu ya Kinshasa. Découvrez ba initiatives oyo ke salela ne participez na bulwadji bwa bantu nyonso.",
      voirCampagnes: "Tala ba campagnes",
      stats: {
        sensibilises: "Bantu oyo ke sensibilisés / mbula",
        actions: "Ba actions na mbula na moyenne",
        satisfaction: "Taux ya satisfaction",
        iso: "Certification qualité",
      },
    },
    grille: {
      surtitre: "Ba actions yetu nyonso",
      titre: "Ba campagnes & publicités",
      sousTitre: "Filtre na catégorie to tala ba initiatives oyo ke salela",
      filtrerPublications: "Filtre ba publications",
      resultatSingulier: "résultat",
      resultatPluriel: "ba résultats",
      filtrerStatutAria: "Filtre na statut",
      erreurChargement: "Impossible ya ko charger ba campagnes. Meka lisusu.",
      aucunePublication: "Publication ezwami te",
      modifierFiltres: "Meka kobongola ba filtres mpo na kutala ba résultats mosusu.",
      compteurSingulier: "publication emonisami na",
      compteurPluriel: "ba publications emonisami na",
      auTotal: "na total",
      filtres: {
        toutes: "Ba catégories nyonso",
        tous: "Nyonso",
        depistage: "Dépistage",
        vaccination: "Vaccination",
        sensibilisation: "Sensibilisation",
        evenement: "Événement",
      },
      statuts: { en_cours: "Ke salela", a_venir: "Ke koya", terminee: "Esili" },
    },
    impact: {
      titre: "Impact yetu na ba chiffres",
      sousTitre: "Ba campagnes oyo ke bongisami, oyo ke monisami ne oyo etiamami na réalité sanitaire congolaise.",
      items: [
        { libelle: "Ba dépistages esalemi", description: "VIH, paludisme, diabète ne ba pathologies mosusu oyo ciblés." },
        { libelle: "Ba vaccinations apesami", description: "Grippe, hépatites ne ba campagnes saisonnières." },
        { libelle: "Ba partenaires institutionnels", description: "ONG, ba entreprises ne ba structures ya santé publique." },
        { libelle: "Ba communes oyo couvri", description: "Ba actions ya proximité na Kinshasa ne pene pene." },
      ],
    },
    parcours: {
      titre: "Ndeni bwe ke koka kozala na participation ?",
      sousTitre: "Parcours ya peto ne accessible, oyo ke bongisami mpo na kolakisa participation bwa bwe na ba actions yetu.",
      etapes: [
        { titre: "Découvrir", description: "Parcourir ba campagnes oyo ke salela ne tala ba dates, ba lieux ne ba conditions ya participation." },
        { titre: "S'inscrire", description: "Zwa rendez-vous na internet, na téléphone to koya directement na laboratoire." },
        { titre: "Participer", description: "Bozwa dépistages, vaccinations to consultations na cadre professionnel ne confidentiel." },
        { titre: "Suivi", description: "Zua ba résultats bwa bwe ne, soki esengeli, orientation na ba structures ya prise en charge." },
      ],
    },
    cta: {
      titre: "Organiser campagne na HAM ?",
      description: "Ba institutions, entreprises ne associations — bongisana ne betu ba actions ya santé publique na impact oyo ke monisami.",
      bouton: "Kutana ne betu",
      boutonSecondaire: "Zwa rendez-vous",
    },
    items: {
      "paludisme-2026": {
        titre: "Campagne ya dépistage ya paludisme",
        extrait: "Dépistage rapide ya paludisme na tarif réduit — batela libota bwa bwe.",
        description:
          "HAM LABORATOIRE ke launchi campagne ya dépistage ya paludisme na ba tarifs préférentiels. Ba techniciens yetu ke sala test rapide (TDR) na résultat ya kondima na miniti 30. Sensibilisation mpo na prévention kele kati.",
        periode: "Kowuta 01 Juillet tii 31 Août 2026",
        lieu: "HAM Laboratoire — MATETE",
      },
      "depistage-vih-2026": {
        titre: "Dépistage VIH — ofele ne confidentiel",
        extrait: "Test VIH ofele, ba résultats confidentiels ne accompagnement ya bolingo.",
        description:
          "Na cadre ya engagement yetu mpo na santé publique, HAM LABORATOIRE ke pesa dépistage VIH ofele ne confidentiel mobimba. Prélèvement ya sécurité, ba résultats ya kondima ne orientation soki esengeli.",
        periode: "Kowuta 15 Juillet tii 15 Août 2026",
        lieu: "HAM Laboratoire — MATETE",
      },
      "cancer-sein": {
        titre: "Dépistage ya cancer ya mabele",
        extrait: "Octobre rose — dépistage précoce ne sensibilisation mpo na cancer ya mabele.",
        description:
          "Campagne ya mbula na mbula mpo na sensibilisation ne dépistage ya cancer ya mabele. Ba examens cliniques, orientation mammographie ne ba conseils ya prévention.",
        periode: "Kowuta 01 tii 31 Mai 2026",
      },
      "vaccination-grippe": {
        titre: "Vaccination antigrippe",
        extrait: "Batela yo mpo na grippe saisonnière — vaccination kele.",
        description:
          "Campagne ya vaccination antigrippe mpo na ba populations ya risk ne bantu nyonso. Ba vaccins certifiés epesami na ba professionnels qualifiés.",
        periode: "Kowuta 15 tii 30 Avril 2026",
      },
      "depistage-diabete": {
        titre: "Dépistage ya diabète",
        extrait: "Glycémie, HbA1c ne ba conseils nutritionnels — yeba diabète noki.",
        description:
          "Semaine ya dépistage ya diabète na bilan glycémique complet na prix réduit. Ba résultats ke interpréter na médecin ne ba recommandations personnalisées.",
        periode: "Kowuta 01 tii 15 Juin 2026",
      },
      "journee-cardiologie": {
        titre: "Journée ya cardiologie",
        extrait: "Ba consultations ne ba dépistages cardiovasculaires na ba tarifs préférentiels.",
        description:
          "Na occasion ya Journée mondiale ya motema, HAM LABORATOIRE ke organiser journée portes ouvertes mpo na santé cardiovasculaire : ECG, bilan lipidique ne ba consultations spécialisées.",
        periode: "29 Septembre 2026",
        lieu: "HAM Laboratoire — Kinshasa",
      },
      "hypertension-2026": {
        titre: "Semaine ya sensibilisation — Hypertension",
        extrait: "Mesure ofele ya tension ne dépistage ya ba facteurs ya risk.",
        description:
          "Campagne ya prévention ya hypertension : mesure ofele, bilan rénal ne ba conseils hygiéno-diététiques na ba infirmiers ne ba médecins yetu.",
        periode: "Kowuta 01 tii 07 Septembre 2026",
      },
      "pub-equipements-2026": {
        titre: "Ba équipements ya sika ya laboratoire",
        extrait: "HAM LABORATOIRE ke moderniser parc analytique na ye — fiabilité ematisami.",
        description:
          "Publicité institutionnelle : HAM LABORATOIRE ke investir na ba analyseurs automatiques ya sika mpo na ba résultats ya noki ne ya kondima koleka.",
        periode: "Publication ya libela",
      },
    },
  },

  aPropos: {
    hero: {
      typeEtablissement: "CENTRE YA DIAGNOSTIC ET D'ANALYSES MÉDICALES",
      badgeSlogan: "BULWADJI BWA BWE MOLOTO WETU,",
      suiteSlogan: "FIABILITÉ EZALI PREMIER WETU",
    },
    mission: {
      titre: "Mission yetu",
      texte:
        "HAM na laboratoire na ye ne ba personnels qualifiés esengeli kobongisa na niveau ya exigence normative ne bonnes pratiques, ne kondima ba clients na exigences ya fiabilité ya ba résultats na coût favorable oyo ke pesa nzela na ba démunis ne kozua diagnostic ya malamu.",
    },
    vision: {
      titre: "Vision yetu",
      texte:
        "Kozala centre ya référence na diagnostic ne analyses médicales na République Démocratique du Congo ne na Afrique, oyo ke monisami mpo na excellence, accessibilité ne fiabilité ya ba résultats yetu.",
    },
    valeurs: {
      titre: "Ba valeurs yetu",
      items: [
        { titre: "Fiabilité", description: "Ba résultats ya malamu ne oyo ekokani na ba normes internationales ya laboratoire." },
        { titre: "Accessibilité", description: "Ba prestations ya qualité na coût favorable, ouvertes na bantu nyonso, ata ba démunis." },
        { titre: "Excellence", description: "Ba personnels qualifiés, ba équipements modernes ne respect ya bonnes pratiques." },
        { titre: "Humanité", description: "Bulwadji bwa bwe ezali moloto wetu — patient nyonso ayambami na respect ne attention." },
      ],
    },
    histoire: {
      titre: "Histoire yetu",
      paragraphes: [
        "HAM LABORATOIRE kele centre ya diagnostic ne analyses médicales oyo etiamami na Kinshasa, na République Démocratique du Congo. Kowuta na création na ye, établissement esengeli kopesa ba services ya santé ya kondima ne accessibles na bantu nyonso.",
        "Na laboratoire na ye oyo ke bongisami ne équipe ya ba professionnels qualifiés, HAM LABORATOIRE ke yambaka ba médecins, ba patients ne ba partenaires institutionnels na parcours diagnostique na rigueur ne bolingo.",
      ],
    },
    direction: {
      titre: "Direction yetu",
      sousTitre: "Responsable ya centre",
      responsable: {
        nom: "Olivier Bokulu",
        fonction: "Directeur général — HAM Laboratoire",
        biographie:
          "Olivier Bokulu ke tambwisa HAM LABORATOIRE na conviction ete bulwadji ezali moloto oyo bantu nyonso babomaka ne ete fiabilité ya ba résultats esengeli kozala accessible na bantu nyonso. Na direction na ye, centre ke koba mission na ye ya excellence na diagnostic médical, en plaçant qualité, intégrité ne accessibilité ya ba soins na ntima ya décision nyonso.",
      },
    },
    equipe: {
      titre: "Équipe yetu",
      sousTitre: "Ba professionnels qualifiés na bokaboli bwa bwe",
      membres: [
        { nom: "Équipe Laboratoire", fonction: "Ba biologistes & techniciens" },
        { nom: "Équipe Accueil", fonction: "Réception & orientation" },
        { nom: "Équipe Médicale", fonction: "Ba médecins & infirmiers" },
        { nom: "Équipe Administrative", fonction: "Gestion & qualité" },
      ],
    },
    certifications: {
      titre: "Ba certifications & engagements",
      items: [
        { titre: "ISO 9001:2015", description: "Système ya management ya qualité oyo certifié." },
        { titre: "Bonnes pratiques ya laboratoire", description: "Conformité na ba exigences normatives nationales ne internationales." },
        { titre: "Fiabilité ya ba résultats", description: "Ba contrôles qualité rigoureux na étape analytique nyonso." },
      ],
    },
    impact: {
      titre: "HAM na ba chiffres",
      sousTitre: "Présence oyo etiamami na Kinshasa, na bokaboli ya santé publique congolaise.",
      items: [
        { libelle: "Ba patients / mbula", description: "Ba prises en charge ne ba analyses esalemi mbula na mbula." },
        { libelle: "Ba ndenge ya analyses", description: "Plateau technique mobimba na biologie médicale." },
        { libelle: "Ba professionnels", description: "Ba biologistes, techniciens, médecins ne personnel qualifié." },
        { libelle: "Certification", description: "Management ya qualité oyo certifié." },
      ],
    },
    bandeau: {
      slogan: "HAM LABORATOIRE, CHOIX YA SÛR MPO NA BULWADJI BWA MALAMU !",
      telephone: "Téléphone",
      siteWeb: "Site web",
    },
    cta: {
      titre: "Bongisa ne ba patients ebele oyo batyaka confiance yetu",
      description: "Zwa rendez-vous to benga betu — HAM LABORATOIRE ke yambaka bwe na MATETE, Kinshasa.",
      boutonPrincipal: "Zwa rendez-vous",
      boutonSecondaire: "Kutana ne betu",
    },
  },

  resultats: resultatsPagesFallback,
} as const;

export type PagesLua = typeof pagesLua;
