/** Translations SW — page content (excluding home already in locales/sw.ts) */

import { pagesServicesLaboratoireEn } from "./fragments/services-laboratoire-en";
import { extensionFormRdvMedecinEn } from "./fragments/extension-form-rdv-medecin-en";
import { resultatsPagesFallback } from "./fragments/resultats-fr";

export const pagesSw = {
  contact: {
    hero: {
      surtitre: "Tuwasiliane",
      titre: "Tuko",
      titreAccent: "hapa kwa ajili yako",
      description:
        "Una swali kuhusu huduma zetu, matokeo ya vipimo vyako, au kampeni ya afya? Timu ya HAM LABORATOIRE inajibu kwa uprofesional na utunzaji.",
      stats: {
        delai: "Muda wa majibu",
        lignes: "Simu za simu",
        accueil: "Mapokezi na dharura",
        ville: "Kinshasa, DRC",
      },
    },
    coordonnees: {
      surtitre: "Maelezo yetu ya mawasiliano",
      titre: "Jinsi ya kutufikia",
      sousTitre: "Ufikiaji wa haraka, anwani kamili, na masaa ya kufunguliwa",
      rdv: "Miadi",
      rdvDesc: "Hifadhi mtandaoni",
      resultats: "Matokeo",
      resultatsDesc: "Angalia vipimo vyako",
      site: "Tovuti rasmi",
      adresse: "Anwani",
      telephones: "Simu",
      accueil: "Mapokezi",
      responsable: "Mkurugenzi",
      email: "Barua pepe",
      horaires: "Masaa ya kufunguliwa",
    },
    formulaire: {
      surtitre: "Tuandikie",
      titre: "Tutumie ujumbe",
      sousTitre: "Jaza fomu — tutajibu ndani ya saa 24 hadi 48 za kazi",
      nom: "Jina kamili *",
      email: "Barua pepe *",
      telephone: "Simu",
      sujet: "Mada ya ombi lako *",
      message: "Ujumbe *",
      consentement:
        "Nakubali kwamba data yangu inaweza kushughulikiwa na HAM LABORATOIRE kuhusiana na ombi langu, kwa mujibu wa sera ya faragha. *",
      envoyer: "Tuma ujumbe",
      envoi: "Inatumwa...",
      aideImmediate: "Unahitaji majibu ya haraka?",
      aideTexte: "Piga simu mapokezi yetu moja kwa moja — tuko hapa kukusaidia.",
      horairesLabel: "Jumatatu — Ijumaa: 7 AM — 7 PM",
      carteLegende: "MATETE Commune, Kinshasa — Debonhomme Third Parcel Entrance",
    },
    sujets: {
      "rendez-vous": "Uhifadhi wa miadi",
      resultats: "Matokeo ya vipimo",
      campagnes: "Kampeni na uchunguzi",
      tarifs: "Bei na huduma",
      partenariat: "Ushirikiano wa kitaasisi",
      reclamation: "Malalamiko",
      autre: "Ombi lingine",
    },
    horaires: {
      titre: "Masaa ya kufunguliwa",
      lunVen: "Jumatatu — Ijumaa",
      lunVenHeures: "7:00 AM — 7:00 PM",
      sam: "Jumamosi",
      samHeures: "7:00 AM — 2:00 PM",
      dim: "Jumapili",
      dimHeures: "Vipimo vya dharura pekee",
    },
    faq: {
      surtitre: "Msaada na taarifa",
      titre: "Maswali yanayoulizwa mara kwa mara",
      sousTitre:
        "Pata majibu ya haraka kwa maswali yako kuhusu huduma zetu, matokeo, na ufikiaji wa maabara.",
      aideTitre: "Huwezi kupata jibu lako?",
      aideTexte: "Tumia fomu ya mawasiliano au tupigie simu — timu yetu ya mapokezi itakuongoza.",
      aideLien: "Wasiliana na timu →",
      items: [
        {
          question: "Ninawezaje kupata matokeo ya vipimo vyangu?",
          reponse:
            "Matokeo yako yanapatikana maabara au mtandaoni kupitia lango letu la wagonjwa. Wasilisha fomu yako ya sampuli au wasiliana nasi na nambari yako ya faili.",
        },
        {
          question: "Je, ninahitaji miadi kwa vipimo?",
          reponse:
            "Vipimo vingi vinaweza kufanywa bila miadi. Kwa vipimo fulani maalum, tunapendekeza kuhifadhi mapema.",
        },
        {
          question: "Je, mnakubali njia gani za malipo?",
          reponse:
            "Tunakubali pesa taslimu, pesa za simu, na uhamisho wa benki. Mpango wa malipo unaweza kupatikana kwa kampeni za uchunguzi.",
        },
        {
          question: "HAM LABORATOIRE iko wapi?",
          reponse:
            "259, Avenue Lumière, Debonhomme Third Parcel Entrance upande wa kulia, MATETE Commune, Kinshasa, DRC. Angalia ramani hapa chini kwa maelekezo.",
        },
      ],
    },
    cta: {
      titre: "Unahitaji miadi haraka?",
      description:
        "Hifadhi mtandaoni au tupigie simu — timu yetu ya mapokezi inapatikana kukuongoza.",
      boutonRdv: "Hifadhi miadi",
      boutonFormulaire: "Tuma ujumbe",
    },
  },

  rendezVous: {
    hero: {
      surtitre: "Uhifadhi wa miadi mtandaoni",
      titre: "Hifadhi",
      titreAccent: "ushauri wako",
      description:
        "Panga ziara yako ya maabara kwa mibofyo michache — vipimo, mashauriano, picha za matibabu, au uchunguzi. Uthibitisho wa papo hapo na ukumbusho kwa SMS au barua pepe.",
      commencer: "Anza kuhifadhi",
      voirCoords: "Nenda kwenye fomu",
      stats: {
        rapide: "Uhifadhi wa haraka",
        enLigne: "Inapatikana mtandaoni",
        confirmation: "Uthibitisho wa papo hapo",
        qualite: "Ubora uliothibitishwa",
      },
    },
    reservation: {
      surtitre: "Uhifadhi mtandaoni",
      titre: "Panga ziara yako",
      sousTitre: "Kamilisha hatua zilizo hapa chini — uthibitisho wa papo hapo na nambari ya kumbukumbu",
      securise: "Uhifadhi salama",
      securiseTexte:
        "Data yako inalindwa na inatumika tu kusimamia miadi yako ya maabara.",
      aide: "Unahitaji msaada?",
      aideTexte: "Timu yetu ya mapokezi itakuongoza kwenye huduma sahihi.",
      horaires: "Masaa",
      adresse: "Anwani",
      voirCarte: "Angalia ramani →",
    },
    form: {
      etapes: ["Huduma", "Tarehe na muda", "Maelezo yako", "Doctor", "Uthibitisho"],
      typeTitre: "Unahitaji aina gani ya huduma?",
      typeSousTitre: "Chagua huduma inayolingana na mahitaji yako",
      dateTitre: "Chagua tarehe na muda",
      dateLabel: "Tarehe unayopendelea",
      creneauLabel: "Muda",
      pasCreneau: "Hakuna muda unaopatikana kwa tarehe hii. Tafadhali chagua nyingine.",
      infosTitre: "Maelezo yako ya mawasiliano",
      infosSousTitre: "Kupokea uthibitisho na maelekezo ya maandalizi",
      nom: "Jina kamili *",
      email: "Barua pepe *",
      telephone: "Simu *",
      naissance: "Tarehe ya kuzaliwa",
      premiereVisite: "Ziara ya kwanza kwenye maabara",
      motif: "Sababu au maelezo (hiari)",
      consentement:
        "Nakubali kwamba data yangu inaweza kushughulikiwa na HAM LABORATOIRE kwa usimamizi wa miadi yangu, kwa mujibu wa sera ya faragha. *",
      continuer: "Endelea",
      retour: "Rudi",
      confirmer: "Thibitisha miadi",
      confirmationEnCours: "Inathibitishwa...",
      succesTitre: "Miadi imesajiliwa!",
      succesTexte:
        "Ombi lako limetumwa kwa timu yetu. Utapokea uthibitisho kwa barua pepe au SMS hivi karibuni.",
      reference: "Nambari ya kumbukumbu",
      prestation: "Huduma",
      date: "Tarehe",
      heure: "Muda",
      patient: "Mgonjwa",
      medecinTitre: extensionFormRdvMedecinEn.medecinTitre,
      medecinSousTitre: extensionFormRdvMedecinEn.medecinSousTitre,
      sansPreference: extensionFormRdvMedecinEn.sansPreference,
      medecin: extensionFormRdvMedecinEn.medecin,
      medecinSpecialite: extensionFormRdvMedecinEn.medecinSpecialite,
      medecinDisponibilite: extensionFormRdvMedecinEn.medecinDisponibilite,
      medecinHorairesDefaut: extensionFormRdvMedecinEn.medecinHorairesDefaut,
      autreRdv: "Hifadhi miadi nyingine",
      sansRdv: "Kuja bila miadi kunawezekana",
    },
    types: {
      analyses: {
        titre: "Vipimo vya maabara",
        description: "Damu, mkojo, na sampuli za kibiolojia — paneli kamili au vipimo maalum.",
      },
      consultation: {
        titre: "Ushauri wa matibabu",
        description:
          "Ushauri wa jumla au maalum kuelewa matokeo yako au kuongoza vipimo vyako.",
      },
      imagerie: {
        titre: "Picha za matibabu",
        description: "Ultrasound, radiolojia, na vipimo vya picha kwa miadi.",
      },
      depistage: {
        titre: "Uchunguzi na kampeni",
        description:
          "Kushiriki katika kampeni za afya ya umma na uchunguzi zilizoandaliwa na HAM LABORATOIRE.",
      },
      prelevement: {
        titre: "Uchukuzi wa sampuli maalum",
        description:
          "Sampuli zinazohitaji maandalizi au itifaki maalum (kufunga chakula, muda sahihi).",
      },
    },
    parcours: {
      titre: "Inafanyaje kazi?",
      sousTitre: "Hatua nne rahisi kuthibitisha miadi yako",
      etapes: [
        { titre: "Chagua huduma", description: "Chagua aina ya kipimo au ushauri unachohitaji." },
        { titre: "Tarehe na muda", description: "Chagua tarehe na muda unaokufaa kutoka kwa upatikanaji wetu." },
        { titre: "Maelezo yako ya mawasiliano", description: "Weka taarifa zako kupokea uthibitisho na maelekezo." },
        { titre: "Uthibitisho", description: "Wasilisha ombi lako — utapokea nambari ya kumbukumbu kwa barua pepe au SMS." },
      ],
    },
    infos: {
      surtitre: "Kabla ya ziara yako",
      titre: "Taarifa za vitendo",
      sousTitre: "Jiandae kwa ziara yako ya maabara",
      items: [
        { titre: "Nyaraka za kuleta", description: "Kitambulisho, dawa ya daktari ikiwa inahitajika, rekodi ya afya, na matokeo ya awali." },
        { titre: "Kufunga chakula na maandalizi", description: "Baadhi ya vipimo vinahitaji saa 8 hadi 12 bila chakula. Maelekezo yatatolewa wakati wa uthibitisho." },
        { titre: "Masaa ya mapokezi", description: "Jumatatu — Ijumaa: 7 AM — 7 PM · Jumamosi: 7 AM — 2 PM · Jumapili: vipimo vya dharura pekee." },
        { titre: "Ufikiaji na maegesho", description: "259, Avenue Lumière, MATETE — Kinshasa. Ufikiaji rahisi, maegesho yanapatikana karibu." },
      ],
    },
    faq: {
      surtitre: "Maswali yanayoulizwa mara kwa mara",
      titre: "Kila kitu kuhusu miadi",
      sousTitre: "Mabadiliko, kughairi, maandalizi — pata majibu ya maswali ya kawaida zaidi.",
      aideTitre: "Unahitaji msaada?",
      aideTexte: "Timu yetu ya mapokezi inapatikana Jumatatu hadi Jumamosi.",
      aideLien: "Ukurasa wa mawasiliano →",
      items: [
        {
          question: "Je, naweza kuja bila miadi kwa vipimo?",
          reponse:
            "Ndiyo, vipimo vingi vya maabara vinaweza kufanywa bila miadi wakati wa masaa yetu ya kufunguliwa. Muda uliowekwa unahakikisha mapokezi ya kipaumbele.",
        },
        {
          question: "Ninawezaje kubadilisha au kughairi miadi yangu?",
          reponse:
            "Wasiliana na mapokezi yetu kwa +243 819 191 643 au kwa barua pepe obb5lab@gmail.com na nambari yako ya kumbukumbu. Tafadhali tujulishe angalau saa 24 mapema.",
        },
        {
          question: "Je, nitapokea ukumbusho kabla ya miadi yangu?",
          reponse:
            "Ndiyo, ukumbusho unatumwa kwa SMS au barua pepe saa 24 kabla ya muda wako, na maelekezo ya maandalizi ikiwa inahitajika.",
        },
        {
          question: "Je, miadi ya mtandaoni ni bure?",
          reponse:
            "Uhifadhi mtandaoni ni bure kabisa. Vipimo na mashauriano vilivyofanywa pekee ndivyo vinavyolipishwa kulingana na orodha yetu ya bei.",
        },
      ],
    },
    cta: {
      titre: "Una swali kabla ya kuhifadhi?",
      description: "Timu yetu ya mapokezi inapatikana kukuongoza kwenye huduma sahihi.",
      boutonContact: "Wasiliana nasi",
      boutonReserver: "Hifadhi sasa",
    },
  },

  services: {
    hero: {
      surtitre: "Kituo cha utambuzi na vipimo vya matibabu",
      titre: "Huduma za matibabu",
      titreAccent: "za ubora",
      description:
        "HAM LABORATOIRE inatoa huduma kamili za utambuzi — vipimo vya maabara, mashauriano, picha za matibabu, na uchunguzi — na matokeo ya kuaminika, muda uliodhibitiwa, na upatikanaji kwa wote.",
      decouvrir: "Gundua huduma zetu",
      voirPrestations: "Angalia huduma",
      badge: "huduma · maabara iliyothibitishwa ISO 9001:2015",
      stats: {
        analyses: "Aina za vipimo",
        delai: "Muda wa wastani wa matokeo",
        iso: "Imethibitishwa 9001:2015",
        accueil: "Mapokezi ya wagonjwa",
      },
    },
    categories: {
      tous: "Huduma zote",
      diagnostic: "Utambuzi",
      soins: "Utunzaji na ufuatiliaji",
      urgences: "Dharura",
    },
    vedette: {
      badge: "Huduma maalum",
      decouvrir: "Gundua maabara",
      chiffres: [
        { libelle: "Aina za vipimo" },
        { libelle: "Muda wa wastani" },
        { libelle: "Uthibitisho" },
      ],
    },
    grille: {
      surtitre: "Ofa yetu",
      titre: "Huduma zetu zote",
      sousTitre: "Chuja kwa kategoria kupata huduma inayokufaa",
      aucun: "Hakuna huduma katika kategoria hii.",
    },
    items: {
      laboratoire: {
        titre: "Vipimo vya maabara",
        description: "Msingi wa utaalam wetu — vipimo vya kibiolojia, hematolojia, biokemia, na maalum na vifaa vya kisasa.",
        badge: "Huduma maalum",
        points: ["Zaidi ya vigezo 200 vimechambuliwa", "Udhibiti mkali wa ubora", "Matokeo salama mtandaoni"],
      },
      consultations: {
        titre: "Mashauriano ya matibabu",
        description: "Mashauriano ya jumla na maalum kuongoza vipimo vyako na kuelewa matokeo yako na madaktari wetu waliohitimu.",
        points: ["Madaktari wa jumla na wataalamu", "Ufafanuzi wa matokeo", "Ufuatiliaji wa kibinafsi wa mgonjwa"],
      },
      imagerie: {
        titre: "Picha za matibabu",
        description: "Radiolojia, ultrasound, na vipimo vya picha kwa utambuzi sahihi wa kuona unaokamilisha vipimo vya kibiolojia.",
        points: ["Ultrasound na radiolojia", "Vifaa vya kidijitali", "Ripoti za kina"],
      },
      pharmacie: {
        titre: "Duka la dawa",
        description: "Usambazaji wa dawa za ubora na ushauri wa dawa kusaidia matibabu yako baada ya utambuzi.",
        points: ["Dawa zilizothibitishwa", "Ushauri wa kibinafsi", "Upatikanaji ulioboreshwa"],
      },
      hospitalisation: {
        titre: "Kulazwa hospitalini",
        description: "Utunzaji wa wagonjwa waliolazwa na ufuatiliaji wa matibabu endelevu kwa wagonjwa wanaohitaji ufuatiliaji wa kina.",
        points: ["Vyumba vya starehe", "Ufuatiliaji wa matibabu 24/7", "Utunzaji ulioratibiwa"],
      },
      urgences: {
        titre: "Dharura",
        description: "Huduma ya dharura inapatikana kwa hali za hatari zinazohitaji utunzaji wa haraka na vipimo vya kipaumbele.",
        points: ["Upatikanaji uliopanuliwa", "Vipimo vya dharura", "Timu inayojibu haraka"],
      },
    },
    impact: {
      titre: "Ubora kwa nambari",
      sousTitre: "Utendaji unaoweza kupimwa unaonyesha kujitolea kwetu kwa ubora wa utambuzi.",
      items: [
        { libelle: "Aina za vipimo", description: "Biolojia, hematolojia, microbiolojia, immunolojia, na zaidi." },
        { libelle: "Wagonjwa / mwaka", description: "Utunzaji uliotolewa katika kituo chetu cha MATETE." },
        { libelle: "Muda wa wastani", description: "Matokeo yanapatikana haraka, mara nyingi siku hiyo hiyo." },
        { libelle: "Uthibitisho", description: "Michakato ya ubora iliyothibitishwa na udhibiti mkali." },
      ],
    },
    specialites: {
      titre: "Maalum ya vipimo",
      sousTitre: "Maabara kamili inayoshughulikia maeneo yote muhimu ya uchambuzi kwa utambuzi wa matibabu",
    },
    parcours: {
      titre: "Safari yako HAM",
      sousTitre: "Mchakato rahisi, wa haraka, na wa uwazi — kutoka mapokezi hadi matokeo yako",
      etapes: [
        { titre: "Mapokezi na uongozi", description: "Timu yetu ya mapokezi inakuongoza na kusajili faili yako kwa dakika." },
        { titre: "Ushauri", description: "Daktari anaandika vipimo vinavyofaa hali yako ya kliniki." },
        { titre: "Uchukuzi wa sampuli na vipimo", description: "Uchukuzi salama wa sampuli na uchakataji wa maabara na udhibiti wa ubora." },
        { titre: "Matokeo ya kuaminika", description: "Uwasilishaji au ufikiaji mtandaoni wa matokeo yako yaliyothibitishwa na kueleweka." },
      ],
    },
    engagements: {
      titre: "Kwa nini uchague HAM LABORATOIRE?",
      sousTitre: "Ahadi za kweli zinazofanya tofauti",
      items: [
        { titre: "Uaminifu uliothibitishwa", description: "Matokeo yanayolingana na viwango vya ISO 9001:2015 na mbinu bora za maabara." },
        { titre: "Kasi iliyodhibitiwa", description: "Muda ulioboreshwa kutokana na mtiririko wa kazi uliopangwa na vifaa vya utendaji wa juu." },
        { titre: "Upatikanaji", description: "Bei nafuu zinazowawezesha hata walio katika hali ngumu kupata utambuzi wa ubora." },
        { titre: "Timu iliyohitimu", description: "Wanabiolojia, wataalamu, madaktari, na wafanyakazi wenye uzoefu pamoja nawe kila hatua." },
      ],
    },
    cta: {
      titre: "Uko tayari kujali afya yako?",
      description: "Hifadhi mtandaoni au wasiliana nasi — timu yetu inapatikana kukuongoza kwenye vipimo sahihi.",
      boutonPrincipal: "Hifadhi miadi",
      boutonSecondaire: "Wasiliana nasi",
    },
  },

  servicesLaboratoire: pagesServicesLaboratoireEn,

  campagnes: {
    hero: {
      surtitre: "Vitendo vya afya ya umma",
      titre: "Kampeni na",
      titreAccent: "ufikiaji",
      description:
        "HAM LABORATOIRE inaendesha vitendo vya kinga, uchunguzi, na uhamasishaji kwa watu wa Kinshasa. Gundua mipango yetu inayoendelea na shiriki katika afya ya kila mtu.",
      voirCampagnes: "Angalia kampeni",
      stats: {
        sensibilises: "Watu waliofikiwa / mwaka",
        actions: "Vitendo kwa mwaka kwa wastani",
        satisfaction: "Kiwango cha kuridhika",
        iso: "Uthibitisho wa ubora",
      },
    },
    grille: {
      surtitre: "Vitendo vyetu vyote",
      titre: "Kampeni na ufikiaji",
      sousTitre: "Chuja kwa kategoria au vinjari mipango yetu inayoendelea",
      filtrerPublications: "Chuja machapisho",
      resultatSingulier: "matokeo",
      resultatPluriel: "matokeo",
      filtrerStatutAria: "Chuja kwa hali",
      erreurChargement: "Imeshindwa kupakia kampeni. Tafadhali jaribu tena.",
      aucunePublication: "Hakuna machapisho yaliyopatikana",
      modifierFiltres: "Jaribu kubadilisha vichujio vyako kuona matokeo zaidi.",
      compteurSingulier: "chapisho limeshonyeshwa kati ya",
      compteurPluriel: "machapisho yameshonyeshwa kati ya",
      auTotal: "jumla",
      filtres: {
        toutes: "Kategoria zote",
        tous: "Zote",
        depistage: "Uchunguzi",
        vaccination: "Chanjo",
        sensibilisation: "Uhamasishaji",
        evenement: "Tukio",
      },
      statuts: { en_cours: "Inaendelea", a_venir: "Inakuja", terminee: "Imekamilika" },
    },
    impact: {
      titre: "Athari yetu kwa nambari",
      sousTitre: "Kampeni zilizopangwa, zinazoweza kupimwa, zilizojikita katika hali halisi ya afya ya Kongo.",
      items: [
        { libelle: "Uchunguzi uliofanywa", description: "VVU, malaria, kisukari, na hali nyingine zilizolengwa." },
        { libelle: "Chanjo zilizotolewa", description: "Mafua, homa ya ini, na kampeni za msimu." },
        { libelle: "Washirika wa kitaasisi", description: "NGO, kampuni, na miundo ya afya ya umma." },
        { libelle: "Commune zilizofikiwa", description: "Vitendo vya jamii katika Kinshasa na maeneo ya karibu." },
      ],
    },
    parcours: {
      titre: "Jinsi ya kushiriki?",
      sousTitre: "Mchakato rahisi na unaopatikana ulioundwa kurahisisha kujiunga na vitendo vyetu.",
      etapes: [
        { titre: "Gundua", description: "Vinjari kampeni zetu zinazoendelea na angalia tarehe, maeneo, na masharti ya kushiriki." },
        { titre: "Jisajili", description: "Hifadhi mtandaoni, kwa simu, au njoo moja kwa moja kwenye maabara." },
        { titre: "Shiriki", description: "Faidika na uchunguzi, chanjo, au mashauriano katika mazingira ya kitaalamu na ya siri." },
        { titre: "Ufuatiliaji", description: "Pokea matokeo yako na, ikiwa inahitajika, rufaa kwenye vituo vya utunzaji vinavyofaa." },
      ],
    },
    cta: {
      titre: "Kuandaa kampeni na HAM?",
      description: "Taasisi, kampuni, na vyama — tujenge pamoja vitendo vya afya ya umma vinavyoweza kupimwa.",
      bouton: "Wasiliana nasi",
      boutonSecondaire: "Hifadhi miadi",
    },
    items: {
      "paludisme-2026": {
        titre: "Kampeni ya uchunguzi wa malaria",
        extrait: "Uchunguzi wa haraka wa malaria kwa bei nafuu — linda familia yako.",
        description:
          "HAM LABORATOIRE inazindua kampeni ya uchunguzi wa malaria kwa bei nafuu. Wataalamu wetu waliohitimu wanafanya kipimo cha haraka cha utambuzi (RDT) na matokeo ya kuaminika chini ya dakika 30. Uhamasishaji kuhusu kinga katika maeneo ya kitropiki umejumuishwa.",
        periode: "Julai 1 hadi Agosti 31, 2026",
        lieu: "HAM Laboratory — MATETE",
      },
      "depistage-vih-2026": {
        titre: "Uchunguzi wa VVU — bure na siri",
        extrait: "Kipimo cha VVU bure, matokeo ya siri, na utunzaji wa kusaidia.",
        description:
          "Kama sehemu ya kujitolea kwetu kwa afya ya umma, HAM LABORATOIRE inatoa uchunguzi wa VVU bure na wa siri kabisa. Uchukuzi salama wa sampuli, matokeo ya kuaminika, na rufaa kwenye vituo vya utunzaji inapohitajika.",
        periode: "Julai 15 hadi Agosti 15, 2026",
        lieu: "HAM Laboratory — MATETE",
      },
      "cancer-sein": {
        titre: "Uchunguzi wa saratani ya matiti",
        extrait: "Oktoba ya Pink — uchunguzi wa mapema na uhamasishaji wa saratani ya matiti.",
        description:
          "Kampeni ya kila mwaka ya uhamasishaji na uchunguzi wa saratani ya matiti. Uchunguzi wa kliniki, rufaa ya mammography, na ushauri wa kinga kutoka kwa timu yetu ya matibabu.",
        periode: "Mei 1 hadi 31, 2026",
      },
      "vaccination-grippe": {
        titre: "Chanjo ya mafua",
        extrait: "Jilinde dhidi ya mafua ya msimu — chanjo inapatikana.",
        description:
          "Kampeni ya chanjo ya mafua kwa watu walio hatarini na umma kwa ujumla. Chanjo zilizothibitishwa zinatolewa na wataalamu wa afya waliohitimu.",
        periode: "Aprili 15 hadi 30, 2026",
      },
      "depistage-diabete": {
        titre: "Uchunguzi wa kisukari",
        extrait: "Sukari ya damu, HbA1c, na ushauri wa lishe — gundua kisukari mapema.",
        description:
          "Wiki ya uchunguzi wa kisukari na paneli kamili ya glycemic kwa bei nafuu. Matokeo yamefafanuliwa na daktari na mapendekezo ya kibinafsi.",
        periode: "Juni 1 hadi 15, 2026",
      },
      "journee-cardiologie": {
        titre: "Siku ya kardiologia",
        extrait: "Mashauriano na uchunguzi wa moyo kwa bei nafuu.",
        description:
          "Siku ya Dunia ya Moyo, HAM LABORATOIRE inaandaa siku wazi iliyojikita kwenye afya ya moyo: ECG, paneli ya lipid, na mashauriano maalum.",
        periode: "Septemba 29, 2026",
        lieu: "HAM Laboratory — Kinshasa",
      },
      "hypertension-2026": {
        titre: "Wiki ya uhamasishaji wa shinikizo la damu",
        extrait: "Uchunguzi wa bure wa shinikizo la damu na vipimo vya sababu za hatari.",
        description:
          "Kampeni ya kinga ya shinikizo la damu: vipimo vya bure, paneli ya figo, na ushauri wa mtindo wa maisha kutoka kwa wauguzi na madaktari wetu.",
        periode: "Septemba 1 hadi 7, 2026",
      },
      "pub-equipements-2026": {
        titre: "Vifaa vipya vya maabara",
        extrait: "HAM LABORATOIRE inafanya upya msafara wake wa uchambuzi — uaminifu ulioboreshwa.",
        description:
          "Tangazo la kitaasisi: HAM LABORATOIRE inawekeza katika vichambuzi vipya vya kisasa vya kiotomatiki kwa matokeo ya haraka zaidi na ya kuaminika zaidi.",
        periode: "Uchapishaji wa kudumu",
      },
    },
  },

  aPropos: {
    hero: {
      typeEtablissement: "KITUO CHA UTAMBUZI NA VIPIMO VYA MATIBABU",
      badgeSlogan: "AFYA YAKO NI MZIGO WANGU,",
      suiteSlogan: "UAMINIFU NI KIPAUMBELE CHETU",
    },
    mission: {
      titre: "Dhamira yetu",
      texte:
        "HAM, na maabara yake na wafanyakazi waliohitimu, imejitolea kutimiza viwango vya udhibiti na mbinu bora huku ikiridhisha mahitaji ya wateja kwa matokeo ya kuaminika kwa gharama nafuu, ili hata walio katika hali ngumu zaidi waweze kupata utambuzi sahihi.",
    },
    vision: {
      titre: "Maono yetu",
      texte:
        "Kuwa kituo cha kumbukumbu cha utambuzi na vipimo vya matibabu katika Jamhuri ya Kidemokrasia ya Kongo na Afrika, kinachotambuliwa kwa ubora, upatikanaji, na uaminifu wa matokeo yetu.",
    },
    valeurs: {
      titre: "Maadili yetu",
      items: [
        { titre: "Uaminifu", description: "Matokeo sahihi yanayolingana na viwango vya kimataifa vya maabara." },
        { titre: "Upatikanaji", description: "Huduma za ubora kwa gharama nafuu, wazi kwa wote, ikiwa ni pamoja na walio katika hali ngumu zaidi." },
        { titre: "Ubora", description: "Wafanyakazi waliohitimu, vifaa vya kisasa, na kufuata mbinu bora." },
        { titre: "Ubinadamu", description: "Afya yako ni mzigo wetu — kila mgonjwa anakaribishwa kwa heshima na umakini." },
      ],
    },
    histoire: {
      titre: "Historia yetu",
      paragraphes: [
        "HAM LABORATOIRE ni kituo cha utambuzi na vipimo vya matibabu kilichoko Kinshasa, Jamhuri ya Kidemokrasia ya Kongo. Tangu kuanzishwa kwake, kituo hiki kimejitolea kutoa huduma za afya za kuaminika na zinazopatikana kwa idadi ya watu wote.",
        "Na maabara yake iliyojengwa na timu ya wataalamu waliohitimu, HAM LABORATOIRE inasaidia madaktari, wagonjwa, na washirika wa kitaasisi katika safari ya utambuzi kwa ukali na utunzaji.",
      ],
    },
    direction: {
      titre: "Uongozi wetu",
      sousTitre: "Mkurugenzi wa kituo",
      responsable: {
        nom: "Olivier Bokulu",
        fonction: "Mkurugenzi Mkuu — HAM Laboratoire",
        biographie:
          "Olivier Bokulu anaongoza HAM LABORATOIRE kwa imani kwamba afya ni mzigo wa pamoja na kwamba matokeo ya kuaminika lazima yapatikane kwa wote. Chini ya uongozi wake, kituo kinaendelea na dhamira yake ya ubora katika utambuzi wa matibabu, ikiweka ubora, uadilifu, na upatikanaji wa utunzaji moyoni mwa kila uamuzi.",
      },
    },
    equipe: {
      titre: "Timu yetu",
      sousTitre: "Wataalamu waliohitimu kwa ajili yako",
      membres: [
        { nom: "Timu ya Maabara", fonction: "Wanabiolojia na wataalamu" },
        { nom: "Timu ya Mapokezi", fonction: "Mapokezi na uongozi" },
        { nom: "Timu ya Matibabu", fonction: "Madaktari na wauguzi" },
        { nom: "Timu ya Utawala", fonction: "Usimamizi na ubora" },
      ],
    },
    certifications: {
      titre: "Uthibitisho na ahadi",
      items: [
        { titre: "ISO 9001:2015", description: "Mfumo wa usimamizi wa ubora uliothibitishwa." },
        { titre: "Mbinu bora za maabara", description: "Kufuata mahitaji ya udhibiti wa kitaifa na kimataifa." },
        { titre: "Uaminifu wa matokeo", description: "Udhibiti mkali wa ubora katika kila hatua ya uchambuzi." },
      ],
    },
    impact: {
      titre: "HAM kwa nambari",
      sousTitre: "Uwepo uliokita mizizi katika Kinshasa, ukihudumia afya ya umma ya Kongo.",
      items: [
        { libelle: "Wagonjwa / mwaka", description: "Utunzaji na vipimo vilivyofanywa kila mwaka." },
        { libelle: "Aina za vipimo", description: "Jukwaa kamili la kiufundi katika biolojia ya matibabu." },
        { libelle: "Wataalamu", description: "Wanabiolojia, wataalamu, madaktari, na wafanyakazi waliohitimu." },
        { libelle: "Uthibitisho", description: "Usimamizi wa ubora uliothibitishwa." },
      ],
    },
    bandeau: {
      slogan: "HAM LABORATOIRE, CHAGUO SALAMA KWA AFYA BORA!",
      telephone: "Simu",
      siteWeb: "Tovuti",
    },
    cta: {
      titre: "Jiunge na maelfu ya wagonjwa wanaotuamini",
      description: "Hifadhi miadi au wasiliana nasi — HAM LABORATOIRE inakukaribisha MATETE, Kinshasa.",
      boutonPrincipal: "Hifadhi miadi",
      boutonSecondaire: "Wasiliana nasi",
    },
  },

  resultats: resultatsPagesFallback,
} as const;

export type PagesSw = typeof pagesSw;
