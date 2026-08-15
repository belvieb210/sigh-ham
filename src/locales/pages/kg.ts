/** Traductions KG — makanda ya ba pages (libanda ya ebandeli kele déjà na locales/kg.ts) */

import { pagesServicesLaboratoireEn } from "./fragments/services-laboratoire-en";
import { extensionFormRdvMedecinEn } from "./fragments/extension-form-rdv-medecin-en";

export const pagesKg = {
  contact: {
    hero: {
      surtitre: "Vanda na boyokani",
      titre: "Beto kele",
      titreAccent: "na kuyidika beno",
      description:
        "Moto na motuna mpo na bisalu na beto, ba résultats na beno to campagne ya santé ? Équipe ya HAM LABORATOIRE ke yanola beno na professionnalisme mpe na bolingo.",
      stats: {
        delai: "Ntangu ya réponse",
        lignes: "Ba lignes téléphoniques",
        accueil: "Accueil & urgences",
        ville: "Kinshasa, RDC",
      },
    },
    coordonnees: {
      surtitre: "Ba coordonnées na beto",
      titre: "Ndeni beno ke koka kutana na beto",
      sousTitre: "Accès noki, adresse mobimba mpe ba horaires ya ouverture",
      rdv: "Rendez-vous",
      rdvDesc: "Réserver na internet",
      resultats: "Ba résultats",
      resultatsDesc: "Tala ba examens na beno",
      site: "Site officiel",
      adresse: "Adresse",
      telephones: "Ba téléphones",
      accueil: "Accueil",
      responsable: "Responsable",
      email: "Email",
      horaires: "Ba horaires ya ouverture",
    },
    formulaire: {
      surtitre: "Koma na beto",
      titre: "Tinda beto message",
      sousTitre: "Tondisa formulaire — beto ke yanola beno na kati ya 24 na 48 heures ouvrées",
      nom: "Nkombo mobimba *",
      email: "Email *",
      telephone: "Téléphone",
      sujet: "Sujet ya demande na beno *",
      message: "Message *",
      consentement:
        "Ndimi ete ba données na mono ke bongisama na HAM LABORATOIRE mpo na demande na mono, selon politique ya confidentialité. *",
      envoyer: "Tinda message",
      envoi: "Ke tindama...",
      aideImmediate: "Beno ke na besoin ya réponse mbala moko ?",
      aideTexte: "Benga accueil na beto directement — beto kele na bokaboli na beno.",
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
        "Luka réponse na noki mpo na mituna na beno mpo na bisalu, ba résultats mpe accès na laboratoire.",
      aideTitre: "Beno zui réponse te ?",
      aideTexte: "Salisa formulaire ya contact to benga beto — équipe ya accueil ke yangola beno.",
      aideLien: "Kutana na équipe →",
      items: [
        {
          question: "Ndeni mono ke koka kozua ba résultats na mono ya analyses ?",
          reponse:
            "Ba résultats na beno kele na laboratoire to na internet na portail patient na beto. Leta fiche ya prélèvement to benga beto na numéro ya dossier na beno.",
        },
        {
          question: "Esengeli rendez-vous mpo na ba analyses ?",
          reponse:
            "Ba analyses mingi ke koka kosalema sans rendez-vous. Mpo na ba examens spécialisés mosusu, beto recommande kozwa rendez-vous liboso.",
        },
        {
          question: "Ba moyens ya paiement nini bo ke kondima ?",
          reponse:
            "Beto ke kondima cash, mobile money mpe virement bancaire. Ba facilités ke koka kopesama mpo na ba campagnes ya dépistage.",
        },
        {
          question: "HAM LABORATOIRE kele wapi ?",
          reponse:
            "259, Avenue Lumière, Entrée Debonhomme Troisième Parcelle À Droit, Commune MATETE, Kinshasa, RDC. Tala carte na nse mpo na itinéraire.",
        },
      ],
    },
    cta: {
      titre: "Beno ke na besoin ya rendez-vous na noki ?",
      description:
        "Zwa rendez-vous na internet to benga beto — équipe ya accueil kele mpo na kuyangola beno.",
      boutonRdv: "Zwa rendez-vous",
      boutonFormulaire: "Tinda message",
    },
  },

  rendezVous: {
    hero: {
      surtitre: "Prise de rendez-vous na internet",
      titre: "Réservez",
      titreAccent: "consultation na beno",
      description:
        "Planifiez visite na beno na laboratoire na ba clics moke — analyses, consultations, imagerie to dépistages. Confirmation mbala moko mpe rappel na SMS to email.",
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
      titre: "Planifiez visite na beno",
      sousTitre: "Tondisa ba étapes na nse — confirmation mbala moko na numéro ya référence",
      securise: "Réservation sécurisée",
      securiseTexte:
        "Ba données na beno ke batama mpe ke salelami kaka mpo na gestion ya rendez-vous na beno na laboratoire.",
      aide: "Beno ke na besoin ya lisalisi ?",
      aideTexte: "Accueil na beto ke yangola beno na prestation ya malamu.",
      horaires: "Ba horaires",
      adresse: "Adresse",
      voirCarte: "Tala carte →",
    },
    form: {
      etapes: ["Prestation", "Date & heure", "Ba infos na beno", "Doctor", "Confirmation"],
      typeTitre: "Prestation ya ndenge nini beno ke linga ?",
      typeSousTitre: "Pona service oyo ekokani na besoin na beno",
      dateTitre: "Pona date mpe créneau",
      dateLabel: "Date oyo beno ke linga",
      creneauLabel: "Créneau horaire",
      pasCreneau: "Créneau kele te mpo na date oyo. Pona mosusu.",
      infosTitre: "Ba coordonnées na beno",
      infosSousTitre: "Mpo na kozua confirmation mpe ba consignes ya préparation",
      nom: "Nkombo mobimba *",
      email: "Email *",
      telephone: "Téléphone *",
      naissance: "Date ya mbotama",
      premiereVisite: "Visite ya liboso na laboratoire",
      motif: "Motif to ba précisions (optionnel)",
      consentement:
        "Ndimi ete ba données na mono ke bongisama na HAM LABORATOIRE mpo na gestion ya rendez-vous na mono, selon politique ya confidentialité. *",
      continuer: "Kokoba",
      retour: "Kozonga",
      confirmer: "Confirmer rendez-vous",
      confirmationEnCours: "Ke confirmer...",
      succesTitre: "Rendez-vous enregistré !",
      succesTexte:
        "Demande na beno etindami na équipe na beto. Beno ke zua confirmation na email to SMS kala te.",
      reference: "Numéro ya référence",
      prestation: "Prestation",
      date: "Date",
      heure: "Heure",
      patient: "Patient",
      medecinTitre: extensionFormRdvMedecinEn.medecinTitre,
      medecinSousTitre: extensionFormRdvMedecinEn.medecinSousTitre,
      sansPreference: extensionFormRdvMedecinEn.sansPreference,
      medecin: extensionFormRdvMedecinEn.medecin,
      autreRdv: "Zwa rendez-vous mosusu",
      sansRdv: "Sans RDV ke koka",
    },
    types: {
      analyses: {
        titre: "Analyses ya laboratoire",
        description: "Ba prélèvements ya ngolo, urine mpe biologiques — bilan complet to examens ciblés.",
      },
      consultation: {
        titre: "Consultation médicale",
        description:
          "Consultation générale to spécialisée mpo na koyebisa ba résultats na beno to kuyangola ba examens na beno.",
      },
      imagerie: {
        titre: "Imagerie médicale",
        description: "Échographie, radiologie mpe ba examens ya imagerie na rendez-vous.",
      },
      depistage: {
        titre: "Dépistage & campagne",
        description:
          "Participation na ba campagnes ya santé publique mpe ba dépistages oyo HAM LABORATOIRE ke bongisaka.",
      },
      prelevement: {
        titre: "Prélèvement spécialisé",
        description:
          "Ba prélèvements oyo esengeli préparation to protocole spécifique (jeûne, horaire précis).",
      },
    },
    parcours: {
      titre: "Ke salema ndenge nini ?",
      sousTitre: "Ba étapes minei ya peto mpo na koconfirmer rendez-vous na beno",
      etapes: [
        { titre: "Pona prestation", description: "Pona ndenge ya examen to consultation oyo beno ke na besoin." },
        { titre: "Date & créneau", description: "Lakisa date mpe heure oyo ekokani na beno na ba disponibilités na beto." },
        { titre: "Ba coordonnées na beno", description: "Tondisa ba informations na beno mpo na kozua confirmation mpe ba consignes." },
        { titre: "Confirmation", description: "Confirmer demande na beno — beno ke zua numéro ya référence na email to SMS." },
      ],
    },
    infos: {
      surtitre: "Liboso ya visite na beno",
      titre: "Ba informations pratiques",
      sousTitre: "Bongisa visite na beno na laboratoire",
      items: [
        { titre: "Ba pièces ya komema", description: "Carte d'identité, ordonnance médicale soki esengeli, carnet ya santé mpe ba résultats ya kala." },
        { titre: "Jeûne & préparation", description: "Ba examens mosusu esengeli jeûne ya 8 na 12 h. Ba consignes ke yebisama na confirmation." },
        { titre: "Ba horaires ya accueil", description: "Lun — Ven : 07h — 19h · Sam : 07h — 14h · Dim : urgences analyses kaka." },
        { titre: "Accès & parking", description: "259, Avenue Lumière, MATETE — Kinshasa. Accès facile, parking kele pene pene." },
      ],
    },
    faq: {
      surtitre: "Mituna oyo batunaka mingi",
      titre: "Yebisa nyonso mpo na ba rendez-vous",
      sousTitre: "Modification, annulation, préparation — luka ba réponses na mituna ya mingi.",
      aideTitre: "Beno ke na besoin ya assistance ?",
      aideTexte: "Équipe ya accueil kele na lundi tii samedi.",
      aideLien: "Page contact →",
      items: [
        {
          question: "Mono ke koka koya sans rendez-vous mpo na ba analyses ?",
          reponse:
            "Ee, ba analyses mingi ya laboratoire ke koka kosalema sans rendez-vous na ba heures ya ouverture. Créneau oyo reserve ke pesa beno accueil prioritaire.",
        },
        {
          question: "Ndeni mono ke koka kobongola to koboya rendez-vous na mono ?",
          reponse:
            "Benga accueil na beto na +243 819 191 643 to na email obb5lab@gmail.com en indiquant numéro ya référence na beno. Beto sengi beno koyebisa liboso na 24 h.",
        },
        {
          question: "Mono ke zua rappel liboso ya rendez-vous na mono ?",
          reponse:
            "Ee, rappel etindami na SMS to email 24 heures liboso ya créneau na beno, na ba consignes ya préparation soki esengeli.",
        },
        {
          question: "Ba rendez-vous na internet kele ofele ?",
          reponse:
            "Prise de rendez-vous na internet kele ofele mobimba. Kaka ba examens mpe consultations oyo esalemi nde ke solola selon grille tarifaire na beto.",
        },
      ],
    },
    cta: {
      titre: "Moto na motuna liboso ya kozwa rendez-vous ?",
      description: "Équipe ya accueil kele mpo na kuyangola beno na prestation ya malamu.",
      boutonContact: "Kutana na beto",
      boutonReserver: "Réserver sik'oyo",
    },
  },

  services: {
    hero: {
      surtitre: "Centre ya diagnostic & analyses médicales",
      titre: "Bisalu ya monganga",
      titreAccent: "ya excellence",
      description:
        "HAM LABORATOIRE ke pesa gamme mobimba ya ba prestations ya diagnostic — analyses ya laboratoire, consultations, imagerie mpe dépistages — na ba résultats ya kondima, ba délais oyo ke bongisami mpe accessibilité mpo na bato nyonso.",
      decouvrir: "Découvrir bisalu na beto",
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
      tous: "Bisalu nyonso",
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
      surtitre: "Offre na beto",
      titre: "Ba prestations na beto nyonso",
      sousTitre: "Filtre na catégorie mpo na kozua service oyo ekokani na besoin na beno",
      aucun: "Service kele te na catégorie oyo.",
    },
    items: {
      laboratoire: {
        titre: "Laboratoire d'analyses",
        description: "Ntima ya expertise na beto — ba analyses biologiques, hématologiques, biochimiques mpe spécialisées na ba équipements ya sika.",
        badge: "Service phare",
        points: ["Paramètres koleka 200 oyo ke talami", "Ba contrôles qualité rigoureux", "Ba résultats sécurisés na internet"],
      },
      consultations: {
        titre: "Ba consultations médicales",
        description: "Ba consultations générales mpe spécialisées mpo na kuyangola ba examens na beno mpe koyebisa ba résultats na beno na ba médecins qualifiés na beto.",
        points: ["Ba médecins généralistes & spécialistes", "Interprétation ya ba résultats", "Suivi personnalisé ya patient"],
      },
      imagerie: {
        titre: "Imagerie médicale",
        description: "Radiologie, échographie mpe ba examens ya imagerie mpo na diagnostic visuel ya malamu mpe complémentaire na ba analyses biologiques.",
        points: ["Échographie & radiologie", "Ba équipements numériques", "Ba compte-rendus détaillés"],
      },
      pharmacie: {
        titre: "Pharmacie",
        description: "Dispensation ya ba médicaments ya qualité mpe ba conseils pharmaceutiques mpo na koyamba traitement na beno nsima ya diagnostic.",
        points: ["Ba médicaments certifiés", "Ba conseils personnalisés", "Disponibilité optimisée"],
      },
      hospitalisation: {
        titre: "Hospitalisation",
        description: "Prise en charge hospitalière na surveillance médicale continue mpo na ba patients oyo esengeli suivi approfondi.",
        points: ["Ba chambres confortables", "Suivi médical 24h/24", "Coordination ya ba soins"],
      },
      urgences: {
        titre: "Urgences",
        description: "Service ya urgences kele mpo na ba situations critiques oyo esengeli prise en charge mbala moko mpe ba analyses prioritaires.",
        points: ["Disponibilité étendue", "Ba analyses en urgence", "Équipe réactive"],
      },
    },
    impact: {
      titre: "Excellence na ba chiffres",
      sousTitre: "Ba performances oyo ke monisami oyo ke tindimi engagement na beto mpo na qualité diagnostique.",
      items: [
        { libelle: "Ba ndenge ya analyses", description: "Biologie, hématologie, microbiologie, immunologie mpe mosusu." },
        { libelle: "Ba patients / mbula", description: "Ba prises en charge na centre na beto ya MATETE." },
        { libelle: "Délai moyen", description: "Ba résultats kele na noki, mbala mingi mokolo moko." },
        { libelle: "Certification", description: "Ba processus qualité certifiés mpe ba contrôles rigoureux." },
      ],
    },
    specialites: {
      titre: "Ba spécialités ya analyses",
      sousTitre: "Laboratoire mobimba oyo ke kokisi ba domaines analytiques nyonso ya ntina mpo na diagnostic médical",
    },
    parcours: {
      titre: "Parcours na beno na HAM",
      sousTitre: "Processus ya peto, ya noki mpe ya polele — kowuta na accueil tii na ba résultats na beno",
      etapes: [
        { titre: "Accueil & orientation", description: "Équipe ya accueil ke yangola beno mpe enregistre dossier na beno na ba minutes moke." },
        { titre: "Consultation", description: "Médecin ke pesa ba examens oyo ekokani na situation clinique na beno." },
        { titre: "Prélèvement & analyses", description: "Prélèvement sécurisé mpe traitement na laboratoire na ba contrôles qualité." },
        { titre: "Ba résultats ya kondima", description: "Remise to consultation na internet ya ba résultats certifiés mpe interprétés." },
      ],
    },
    engagements: {
      titre: "Mpo na nini kopona HAM LABORATOIRE ?",
      sousTitre: "Ba engagements concrets oyo ke salela différence",
      items: [
        { titre: "Fiabilité certifiée", description: "Ba résultats oyo ekokani na ba normes ISO 9001:2015 mpe bonnes pratiques ya laboratoire." },
        { titre: "Rapidité maîtrisée", description: "Ba délais optimisés grâce na flux ya travail organisé mpe ba équipements performants." },
        { titre: "Accessibilité", description: "Ba tarifs favorables oyo ke pesa nzela na ba démunis mpe kozua diagnostic ya qualité." },
        { titre: "Équipe qualifiée", description: "Ba biologistes, techniciens mpe médecins expérimentés na bokaboli na beno na étape nyonso." },
      ],
    },
    cta: {
      titre: "Beno ke prêt kotala santé na beno ?",
      description: "Zwa rendez-vous na internet to benga beto — équipe na beto kele mpo na kuyangola beno na ba examens oyo ekokani.",
      boutonPrincipal: "Zwa rendez-vous",
      boutonSecondaire: "Kutana na beto",
    },
  },

  servicesLaboratoire: pagesServicesLaboratoireEn,

  campagnes: {
    hero: {
      surtitre: "Ba actions ya santé publique",
      titre: "Ba campagnes &",
      titreAccent: "publicités",
      description:
        "HAM LABORATOIRE ke saleli ba actions ya prévention, dépistage mpe sensibilisation mpo na bato ya Kinshasa. Découvrez ba initiatives oyo ke salela mpe participez na santé ya bato nyonso.",
      voirCampagnes: "Tala ba campagnes",
      stats: {
        sensibilises: "Bato oyo ke sensibilisés / mbula",
        actions: "Ba actions na mbula na moyenne",
        satisfaction: "Taux ya satisfaction",
        iso: "Certification qualité",
      },
    },
    grille: {
      surtitre: "Ba actions na beto nyonso",
      titre: "Ba campagnes & publicités",
      sousTitre: "Filtre na catégorie to tala ba initiatives oyo ke salela",
      filtrerPublications: "Filtre ba publications",
      resultatSingulier: "résultat",
      resultatPluriel: "ba résultats",
      filtrerStatutAria: "Filtre na statut",
      erreurChargement: "Impossible ya ko charger ba campagnes. Meka lisusu.",
      aucunePublication: "Publication ezwami te",
      modifierFiltres: "Meka kobongola ba filtres mpo na kotala ba résultats mosusu.",
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
      titre: "Impact na beto na ba chiffres",
      sousTitre: "Ba campagnes oyo ke bongisami, oyo ke monisami mpe oyo etiamami na réalité sanitaire congolaise.",
      items: [
        { libelle: "Ba dépistages esalemi", description: "VIH, paludisme, diabète mpe ba pathologies mosusu oyo ciblés." },
        { libelle: "Ba vaccinations apesami", description: "Grippe, hépatites mpe ba campagnes saisonnières." },
        { libelle: "Ba partenaires institutionnels", description: "ONG, ba entreprises mpe ba structures ya santé publique." },
        { libelle: "Ba communes oyo couvri", description: "Ba actions ya proximité na Kinshasa mpe pene pene." },
      ],
    },
    parcours: {
      titre: "Ndeni beno ke koka kozala na participation ?",
      sousTitre: "Parcours ya peto mpe accessible, oyo ke bongisami mpo na kolakisa participation na beno na ba actions na beto.",
      etapes: [
        { titre: "Découvrir", description: "Parcourir ba campagnes oyo ke salela mpe tala ba dates, ba lieux mpe ba conditions ya participation." },
        { titre: "S'inscrire", description: "Zwa rendez-vous na internet, na téléphone to koya directement na laboratoire." },
        { titre: "Participer", description: "Bozwa dépistages, vaccinations to consultations na cadre professionnel mpe confidentiel." },
        { titre: "Suivi", description: "Zua ba résultats na beno mpe, soki esengeli, orientation na ba structures ya prise en charge." },
      ],
    },
    cta: {
      titre: "Organiser campagne na HAM ?",
      description: "Ba institutions, entreprises mpe associations — bongisana na beto ba actions ya santé publique na impact oyo ke monisami.",
      bouton: "Kutana na beto",
      boutonSecondaire: "Zwa rendez-vous",
    },
    items: {
      "paludisme-2026": {
        titre: "Campagne ya dépistage ya paludisme",
        extrait: "Dépistage rapide ya paludisme na tarif réduit — batela libota na beno.",
        description:
          "HAM LABORATOIRE ke launchi campagne ya dépistage ya paludisme na ba tarifs préférentiels. Ba techniciens na beto ke sala test rapide (TDR) na résultat ya kondima na miniti 30. Sensibilisation mpo na prévention kele kati.",
        periode: "Kowuta 01 Juillet tii 31 Août 2026",
        lieu: "HAM Laboratoire — MATETE",
      },
      "depistage-vih-2026": {
        titre: "Dépistage VIH — ofele mpe confidentiel",
        extrait: "Test VIH ofele, ba résultats confidentiels mpe accompagnement ya bolingo.",
        description:
          "Na cadre ya engagement na beto mpo na santé publique, HAM LABORATOIRE ke pesa dépistage VIH ofele mpe confidentiel mobimba. Prélèvement ya sécurité, ba résultats ya kondima mpe orientation soki esengeli.",
        periode: "Kowuta 15 Juillet tii 15 Août 2026",
        lieu: "HAM Laboratoire — MATETE",
      },
      "cancer-sein": {
        titre: "Dépistage ya cancer ya mabele",
        extrait: "Octobre rose — dépistage précoce mpe sensibilisation mpo na cancer ya mabele.",
        description:
          "Campagne ya mbula na mbula mpo na sensibilisation mpe dépistage ya cancer ya mabele. Ba examens cliniques, orientation mammographie mpe ba conseils ya prévention.",
        periode: "Kowuta 01 tii 31 Mai 2026",
      },
      "vaccination-grippe": {
        titre: "Vaccination antigrippe",
        extrait: "Batela yo mpo na grippe saisonnière — vaccination kele.",
        description:
          "Campagne ya vaccination antigrippe mpo na ba populations ya risk mpe bato nyonso. Ba vaccins certifiés epesami na ba professionnels qualifiés.",
        periode: "Kowuta 15 tii 30 Avril 2026",
      },
      "depistage-diabete": {
        titre: "Dépistage ya diabète",
        extrait: "Glycémie, HbA1c mpe ba conseils nutritionnels — yeba diabète noki.",
        description:
          "Semaine ya dépistage ya diabète na bilan glycémique complet na prix réduit. Ba résultats ke interpréter na médecin mpe ba recommandations personnalisées.",
        periode: "Kowuta 01 tii 15 Juin 2026",
      },
      "journee-cardiologie": {
        titre: "Journée ya cardiologie",
        extrait: "Ba consultations mpe ba dépistages cardiovasculaires na ba tarifs préférentiels.",
        description:
          "Na occasion ya Journée mondiale ya motema, HAM LABORATOIRE ke organiser journée portes ouvertes mpo na santé cardiovasculaire : ECG, bilan lipidique mpe ba consultations spécialisées.",
        periode: "29 Septembre 2026",
        lieu: "HAM Laboratoire — Kinshasa",
      },
      "hypertension-2026": {
        titre: "Semaine ya sensibilisation — Hypertension",
        extrait: "Mesure ofele ya tension mpe dépistage ya ba facteurs ya risk.",
        description:
          "Campagne ya prévention ya hypertension : mesure ofele, bilan rénal mpe ba conseils hygiéno-diététiques na ba infirmiers mpe ba médecins na beto.",
        periode: "Kowuta 01 tii 07 Septembre 2026",
      },
      "pub-equipements-2026": {
        titre: "Ba équipements ya sika ya laboratoire",
        extrait: "HAM LABORATOIRE ke moderniser parc analytique na ye — fiabilité ematisami.",
        description:
          "Publicité institutionnelle : HAM LABORATOIRE ke investir na ba analyseurs automatiques ya sika mpo na ba résultats ya noki mpe ya kondima koleka.",
        periode: "Publication ya libela",
      },
    },
  },

  aPropos: {
    hero: {
      typeEtablissement: "CENTRE YA DIAGNOSTIC ET D'ANALYSES MÉDICALES",
      badgeSlogan: "SANTÉ NA BENO MOLOTO NA BETO,",
      suiteSlogan: "FIABILITÉ EZALI PREMIER NA BETO",
    },
    mission: {
      titre: "Mission na beto",
      texte:
        "HAM na laboratoire na ye mpe ba personnels qualifiés esengeli kobongisa na niveau ya exigence normative mpe bonnes pratiques, mpe kondima ba clients na exigences ya fiabilité ya ba résultats na coût favorable oyo ke pesa nzela na ba démunis mpe kozua diagnostic ya malamu.",
    },
    vision: {
      titre: "Vision na beto",
      texte:
        "Kozala centre ya référence na diagnostic mpe analyses médicales na République Démocratique du Congo mpe na Afrique, oyo ke monisami mpo na excellence, accessibilité mpe fiabilité ya ba résultats na beto.",
    },
    valeurs: {
      titre: "Ba valeurs na beto",
      items: [
        { titre: "Fiabilité", description: "Ba résultats ya malamu mpe oyo ekokani na ba normes internationales ya laboratoire." },
        { titre: "Accessibilité", description: "Ba prestations ya qualité na coût favorable, ouvertes na bato nyonso, ata ba démunis." },
        { titre: "Excellence", description: "Ba personnels qualifiés, ba équipements modernes mpe respect ya bonnes pratiques." },
        { titre: "Humanité", description: "Santé na beno ezali moloto na beto — patient nyonso ayambami na respect mpe attention." },
      ],
    },
    histoire: {
      titre: "Histoire na beto",
      paragraphes: [
        "HAM LABORATOIRE kele centre ya diagnostic mpe analyses médicales oyo etiamami na Kinshasa, na République Démocratique du Congo. Kowuta na création na ye, établissement esengeli kopesa ba services ya santé ya kondima mpe accessibles na bato nyonso.",
        "Na laboratoire na ye oyo ke bongisami mpe équipe ya ba professionnels qualifiés, HAM LABORATOIRE ke yambaka ba médecins, ba patients mpe ba partenaires institutionnels na parcours diagnostique na rigueur mpe bolingo.",
      ],
    },
    direction: {
      titre: "Direction na beto",
      sousTitre: "Responsable ya centre",
      responsable: {
        nom: "Olivier Bokulu",
        fonction: "Directeur général — HAM Laboratoire",
        biographie:
          "Olivier Bokulu ke tambwisa HAM LABORATOIRE na conviction ete santé ezali moloto oyo bato nyonso babomaka mpe ete fiabilité ya ba résultats esengeli kozala accessible na bato nyonso. Na direction na ye, centre ke koba mission na ye ya excellence na diagnostic médical, en plaçant qualité, intégrité mpe accessibilité ya ba soins na ntima ya décision nyonso.",
      },
    },
    equipe: {
      titre: "Équipe na beto",
      sousTitre: "Ba professionnels qualifiés na bokaboli na beno",
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
        { titre: "Bonnes pratiques ya laboratoire", description: "Conformité na ba exigences normatives nationales mpe internationales." },
        { titre: "Fiabilité ya ba résultats", description: "Ba contrôles qualité rigoureux na étape analytique nyonso." },
      ],
    },
    impact: {
      titre: "HAM na ba chiffres",
      sousTitre: "Présence oyo etiamami na Kinshasa, na bokaboli ya santé publique congolaise.",
      items: [
        { libelle: "Ba patients / mbula", description: "Ba prises en charge mpe ba analyses esalemi mbula na mbula." },
        { libelle: "Ba ndenge ya analyses", description: "Plateau technique mobimba na biologie médicale." },
        { libelle: "Ba professionnels", description: "Ba biologistes, techniciens, médecins mpe personnel qualifié." },
        { libelle: "Certification", description: "Management ya qualité oyo certifié." },
      ],
    },
    bandeau: {
      slogan: "HAM LABORATOIRE, CHOIX YA SÛR MPO NA SANTÉ YA MALAMU !",
      telephone: "Téléphone",
      siteWeb: "Site web",
    },
    cta: {
      titre: "Bongisa na ba patients ebele oyo batyaka confiance na beto",
      description: "Zwa rendez-vous to benga beto — HAM LABORATOIRE ke yambaka beno na MATETE, Kinshasa.",
      boutonPrincipal: "Zwa rendez-vous",
      boutonSecondaire: "Kutana na beto",
    },
  },
} as const;

export type PagesKg = typeof pagesKg;
