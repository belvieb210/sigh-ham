/** Translations EN — page content (excluding home already in locales/en.ts) */

export const pagesEn = {
  contact: {
    hero: {
      surtitre: "Stay in touch",
      titre: "We are",
      titreAccent: "here for you",
      description:
        "Have a question about our services, your test results, or a health campaign? The HAM LABORATOIRE team responds with professionalism and care.",
      stats: {
        delai: "Response time",
        lignes: "Phone lines",
        accueil: "Reception & emergencies",
        ville: "Kinshasa, DRC",
      },
    },
    coordonnees: {
      surtitre: "Our contact details",
      titre: "How to reach us",
      sousTitre: "Quick access, full address, and opening hours",
      rdv: "Appointment",
      rdvDesc: "Book online",
      resultats: "Results",
      resultatsDesc: "View your tests",
      site: "Official website",
      adresse: "Address",
      telephones: "Phones",
      accueil: "Reception",
      responsable: "Director",
      email: "Email",
      horaires: "Opening hours",
    },
    formulaire: {
      surtitre: "Write to us",
      titre: "Send us a message",
      sousTitre: "Fill out the form — we will reply within 24 to 48 business hours",
      nom: "Full name *",
      email: "Email *",
      telephone: "Phone",
      sujet: "Subject of your request *",
      message: "Message *",
      consentement:
        "I agree that my data may be processed by HAM LABORATOIRE in connection with my request, in accordance with the privacy policy. *",
      envoyer: "Send message",
      envoi: "Sending...",
      aideImmediate: "Need an immediate response?",
      aideTexte: "Call our reception directly — we are here to help.",
      horairesLabel: "Mon — Fri: 7 AM — 7 PM",
      carteLegende: "MATETE Commune, Kinshasa — Debonhomme Third Parcel Entrance",
    },
    sujets: {
      "rendez-vous": "Appointment booking",
      resultats: "Test results",
      campagnes: "Campaigns & screenings",
      tarifs: "Rates & services",
      partenariat: "Institutional partnership",
      reclamation: "Complaint",
      autre: "Other request",
    },
    horaires: {
      titre: "Opening hours",
      lunVen: "Monday — Friday",
      lunVenHeures: "7:00 AM — 7:00 PM",
      sam: "Saturday",
      samHeures: "7:00 AM — 2:00 PM",
      dim: "Sunday",
      dimHeures: "Emergency tests only",
    },
    faq: {
      surtitre: "Help & information",
      titre: "Frequently asked questions",
      sousTitre:
        "Quickly find answers to your questions about our services, results, and access to the laboratory.",
      aideTitre: "Can't find your answer?",
      aideTexte: "Use the contact form or call us — our reception team will guide you.",
      aideLien: "Contact the team →",
      items: [
        {
          question: "How do I get my test results?",
          reponse:
            "Your results are available at the laboratory or online through our patient portal. Present your sample form or contact us with your file number.",
        },
        {
          question: "Do I need an appointment for tests?",
          reponse:
            "Most tests can be done without an appointment. For certain specialized exams, we recommend booking in advance.",
        },
        {
          question: "What payment methods do you accept?",
          reponse:
            "We accept cash, mobile money, and bank transfers. Payment arrangements may be available for screening campaigns.",
        },
        {
          question: "Where is HAM LABORATOIRE located?",
          reponse:
            "259, Avenue Lumière, Debonhomme Third Parcel Entrance on the right, MATETE Commune, Kinshasa, DRC. See the map below for directions.",
        },
      ],
    },
    cta: {
      titre: "Need an appointment quickly?",
      description:
        "Book online or call us — our reception team is available to guide you.",
      boutonRdv: "Book an appointment",
      boutonFormulaire: "Send a message",
    },
  },

  rendezVous: {
    hero: {
      surtitre: "Online appointment booking",
      titre: "Book your",
      titreAccent: "consultation",
      description:
        "Schedule your visit to the laboratory in a few clicks — tests, consultations, imaging, or screenings. Instant confirmation and reminder by SMS or email.",
      commencer: "Start booking",
      voirCoords: "Go to the form",
      stats: {
        rapide: "Fast booking",
        enLigne: "Available online",
        confirmation: "Instant confirmation",
        qualite: "Certified quality",
      },
    },
    reservation: {
      surtitre: "Online booking",
      titre: "Schedule your visit",
      sousTitre: "Complete the steps below — instant confirmation with a reference number",
      securise: "Secure booking",
      securiseTexte:
        "Your data is protected and used only to manage your laboratory appointment.",
      aide: "Need help?",
      aideTexte: "Our reception team will guide you to the right service.",
      horaires: "Hours",
      adresse: "Address",
      voirCarte: "View map →",
    },
    form: {
      etapes: ["Service", "Date & time", "Your details", "Doctor", "Confirmation"],
      typeTitre: "What type of service do you need?",
      typeSousTitre: "Select the service that matches your needs",
      dateTitre: "Choose a date and time slot",
      dateLabel: "Preferred date",
      creneauLabel: "Time slot",
      pasCreneau: "No time slots available for this date. Please choose another one.",
      infosTitre: "Your contact details",
      infosSousTitre: "To receive confirmation and preparation instructions",
      nom: "Full name *",
      email: "Email *",
      telephone: "Phone *",
      naissance: "Date of birth",
      premiereVisite: "First visit to the laboratory",
      motif: "Reason or details (optional)",
      consentement:
        "I agree that my data may be processed by HAM LABORATOIRE for the management of my appointment, in accordance with the privacy policy. *",
      continuer: "Continue",
      retour: "Back",
      confirmer: "Confirm appointment",
      confirmationEnCours: "Confirming...",
      succesTitre: "Appointment registered!",
      succesTexte:
        "Your request has been sent to our team. You will receive confirmation by email or SMS shortly.",
      reference: "Reference number",
      prestation: "Service",
      date: "Date",
      heure: "Time",
      patient: "Patient",
      medecinTitre: "Choose your doctor",
      medecinSousTitre: "Select a practitioner or leave no preference",
      sansPreference: "No preference — reception will guide me",
      medecin: "Doctor",
      autreRdv: "Book another appointment",
      sansRdv: "Walk-in possible",
    },
    types: {
      analyses: {
        titre: "Laboratory tests",
        description: "Blood, urine, and biological samples — full panel or targeted tests.",
      },
      consultation: {
        titre: "Medical consultation",
        description:
          "General or specialized consultation to interpret your results or guide your tests.",
      },
      imagerie: {
        titre: "Medical imaging",
        description: "Ultrasound, radiology, and imaging exams by appointment.",
      },
      depistage: {
        titre: "Screening & campaign",
        description:
          "Participation in public health campaigns and screenings organized by HAM LABORATOIRE.",
      },
      prelevement: {
        titre: "Specialized sampling",
        description:
          "Samples requiring specific preparation or protocol (fasting, precise timing).",
      },
    },
    parcours: {
      titre: "How does it work?",
      sousTitre: "Four simple steps to confirm your appointment",
      etapes: [
        { titre: "Choose the service", description: "Select the type of test or consultation you need." },
        { titre: "Date & time slot", description: "Pick the date and time that suit you from our availability." },
        { titre: "Your contact details", description: "Enter your information to receive confirmation and instructions." },
        { titre: "Confirmation", description: "Submit your request — you will receive a reference number by email or SMS." },
      ],
    },
    infos: {
      surtitre: "Before your visit",
      titre: "Practical information",
      sousTitre: "Prepare for your visit to the laboratory",
      items: [
        { titre: "Documents to bring", description: "ID card, medical prescription if applicable, health record, and previous results." },
        { titre: "Fasting & preparation", description: "Some tests require 8 to 12 hours of fasting. Instructions will be provided at confirmation." },
        { titre: "Reception hours", description: "Mon — Fri: 7 AM — 7 PM · Sat: 7 AM — 2 PM · Sun: emergency tests only." },
        { titre: "Access & parking", description: "259, Avenue Lumière, MATETE — Kinshasa. Easy access, parking available nearby." },
      ],
    },
    faq: {
      surtitre: "Frequently asked questions",
      titre: "Everything about appointments",
      sousTitre: "Changes, cancellations, preparation — find answers to the most common questions.",
      aideTitre: "Need assistance?",
      aideTexte: "Our reception team is available Monday through Saturday.",
      aideLien: "Contact page →",
      items: [
        {
          question: "Can I come without an appointment for tests?",
          reponse:
            "Yes, most laboratory tests can be done without an appointment during our opening hours. A booked slot guarantees priority reception.",
        },
        {
          question: "How do I change or cancel my appointment?",
          reponse:
            "Contact our reception at +243 819 191 643 or by email at obb5lab@gmail.com with your reference number. Please notify us at least 24 hours in advance.",
        },
        {
          question: "Will I receive a reminder before my appointment?",
          reponse:
            "Yes, a reminder is sent by SMS or email 24 hours before your slot, with preparation instructions if needed.",
        },
        {
          question: "Are online appointments free?",
          reponse:
            "Online booking is completely free. Only the tests and consultations performed are billed according to our fee schedule.",
        },
      ],
    },
    cta: {
      titre: "Have a question before booking?",
      description: "Our reception team is available to guide you to the right service.",
      boutonContact: "Contact us",
      boutonReserver: "Book now",
    },
  },

  services: {
    hero: {
      surtitre: "Diagnostic & medical testing center",
      titre: "Medical services",
      titreAccent: "of excellence",
      description:
        "HAM LABORATOIRE offers a full range of diagnostic services — laboratory tests, consultations, imaging, and screenings — with reliable results, controlled turnaround times, and accessibility for all.",
      decouvrir: "Discover our services",
      voirPrestations: "View services",
      badge: "services · ISO 9001:2015 certified laboratory",
      stats: {
        analyses: "Types of tests",
        delai: "Average result turnaround",
        iso: "9001:2015 certified",
        accueil: "Patient reception",
      },
    },
    categories: {
      tous: "All services",
      diagnostic: "Diagnostic",
      soins: "Care & follow-up",
      urgences: "Emergencies",
    },
    vedette: {
      badge: "Featured service",
      decouvrir: "Discover the laboratory",
      chiffres: [
        { libelle: "Types of tests" },
        { libelle: "Average turnaround" },
        { libelle: "Certification" },
      ],
    },
    grille: {
      surtitre: "Our offer",
      titre: "All our services",
      sousTitre: "Filter by category to find the service that suits your needs",
      aucun: "No services in this category.",
    },
    items: {
      laboratoire: {
        titre: "Laboratory testing",
        description: "Core of our expertise — biological, hematological, biochemical, and specialized tests with state-of-the-art equipment.",
        badge: "Featured service",
        points: ["Over 200 parameters analyzed", "Rigorous quality controls", "Secure online results"],
      },
      consultations: {
        titre: "Medical consultations",
        description: "General and specialized consultations to guide your tests and interpret your results with our qualified physicians.",
        points: ["General practitioners & specialists", "Results interpretation", "Personalized patient follow-up"],
      },
      imagerie: {
        titre: "Medical imaging",
        description: "Radiology, ultrasound, and imaging exams for precise visual diagnosis complementary to biological tests.",
        points: ["Ultrasound & radiology", "Digital equipment", "Detailed reports"],
      },
      pharmacie: {
        titre: "Pharmacy",
        description: "Dispensing of quality medications and pharmaceutical advice to support your treatment after diagnosis.",
        points: ["Certified medications", "Personalized advice", "Optimized availability"],
      },
      hospitalisation: {
        titre: "Hospitalization",
        description: "Inpatient care with continuous medical monitoring for patients requiring in-depth follow-up.",
        points: ["Comfortable rooms", "24/7 medical monitoring", "Coordinated care"],
      },
      urgences: {
        titre: "Emergencies",
        description: "Emergency service available for critical situations requiring immediate care and priority testing.",
        points: ["Extended availability", "Emergency testing", "Responsive team"],
      },
    },
    impact: {
      titre: "Excellence in numbers",
      sousTitre: "Measurable performance that reflects our commitment to diagnostic quality.",
      items: [
        { libelle: "Types of tests", description: "Biology, hematology, microbiology, immunology, and more." },
        { libelle: "Patients / year", description: "Care provided at our MATETE center." },
        { libelle: "Average turnaround", description: "Results available quickly, often the same day." },
        { libelle: "Certification", description: "Certified quality processes and rigorous controls." },
      ],
    },
    specialites: {
      titre: "Testing specialties",
      sousTitre: "A full laboratory covering all essential analytical areas for medical diagnosis",
    },
    parcours: {
      titre: "Your journey at HAM",
      sousTitre: "A simple, fast, and transparent process — from reception to your results",
      etapes: [
        { titre: "Reception & guidance", description: "Our reception team guides you and registers your file in minutes." },
        { titre: "Consultation", description: "A physician prescribes the tests suited to your clinical situation." },
        { titre: "Sampling & testing", description: "Secure sampling and laboratory processing with quality controls." },
        { titre: "Reliable results", description: "Delivery or online access to your certified and interpreted results." },
      ],
    },
    engagements: {
      titre: "Why choose HAM LABORATOIRE?",
      sousTitre: "Concrete commitments that make the difference",
      items: [
        { titre: "Certified reliability", description: "Results compliant with ISO 9001:2015 standards and laboratory best practices." },
        { titre: "Controlled speed", description: "Optimized turnaround thanks to an organized workflow and high-performance equipment." },
        { titre: "Accessibility", description: "Affordable rates allowing even the most disadvantaged to access quality diagnosis." },
        { titre: "Qualified team", description: "Experienced biologists, technicians, and physicians at your side at every step." },
      ],
    },
    cta: {
      titre: "Ready to take care of your health?",
      description: "Book online or contact us — our team is available to guide you to the right tests.",
      boutonPrincipal: "Book an appointment",
      boutonSecondaire: "Contact us",
    },
  },

  servicesLaboratoire: {
    hero: {
      surtitre: "Medical testing laboratory",
      titre: "Our medical",
      titreAccent: "tests",
      description:
        "Browse our full catalog of laboratory, imaging, and specialized tests. Transparent pricing, controlled turnaround, and ISO 9001:2015 certified results.",
      garanties: [
        { id: "fiabilite", titre: "Reliable results", description: "Rigorous quality controls" },
        { id: "equipements", titre: "Modern equipment", description: "State-of-the-art technology" },
        { id: "rapidite", titre: "Speed & efficiency", description: "Optimized turnaround" },
        { id: "confidentialite", titre: "Confidentiality", description: "Protected data" },
      ],
    },
    catalogue: {
      titreTous: "All tests",
      rechercheLabel: "Search for a test",
      recherchePlaceholder: "Search for a test (e.g. CBC, Blood glucose…)",
      filtreCategorie: "Filter by category",
      filtreService: "Filter by service",
      toutesCategories: "All categories",
      tousServices: "All services",
      trierPar: "Sort by",
      triNom: "Name (A → Z)",
      triPrixAsc: "Price ascending",
      triPrixDesc: "Price descending",
      categoriesTitre: "Test categories",
      tousExamens: "All tests",
      aideTitre: "Need help?",
      aideTexte: "Our reception team will guide you to the tests suited to your prescription.",
      aucunResultat: "No test matches your search.",
    },
    cta: {
      titre: "Book an appointment for your tests",
      description: "Save time by booking online or contact our reception desk.",
      boutonServices: "View our services",
      boutonRdv: "Book an appointment",
    },
  },

  campagnes: {
    hero: {
      surtitre: "Public health actions",
      titre: "Campaigns &",
      titreAccent: "outreach",
      description:
        "HAM LABORATOIRE runs prevention, screening, and awareness actions for the people of Kinshasa. Discover our ongoing initiatives and take part in everyone's health.",
      voirCampagnes: "View campaigns",
      stats: {
        sensibilises: "People reached / year",
        actions: "Actions per year on average",
        satisfaction: "Satisfaction rate",
        iso: "Quality certification",
      },
    },
    grille: {
      surtitre: "All our actions",
      titre: "Campaigns & outreach",
      sousTitre: "Filter by category or browse our ongoing initiatives",
      filtrerPublications: "Filter publications",
      resultatSingulier: "result",
      resultatPluriel: "results",
      filtrerStatutAria: "Filter by status",
      erreurChargement: "Unable to load campaigns. Please try again.",
      aucunePublication: "No publications found",
      modifierFiltres: "Try changing your filters to see more results.",
      compteurSingulier: "publication shown out of",
      compteurPluriel: "publications shown out of",
      auTotal: "total",
      filtres: {
        toutes: "All categories",
        tous: "All",
        depistage: "Screening",
        vaccination: "Vaccination",
        sensibilisation: "Awareness",
        evenement: "Event",
      },
      statuts: { en_cours: "Ongoing", a_venir: "Upcoming", terminee: "Completed" },
    },
    impact: {
      titre: "Our impact in numbers",
      sousTitre: "Structured, measurable campaigns rooted in the Congolese health reality.",
      items: [
        { libelle: "Screenings performed", description: "HIV, malaria, diabetes, and other targeted conditions." },
        { libelle: "Vaccinations administered", description: "Flu, hepatitis, and seasonal campaigns." },
        { libelle: "Institutional partners", description: "NGOs, companies, and public health structures." },
        { libelle: "Communes covered", description: "Community actions in Kinshasa and surrounding areas." },
      ],
    },
    parcours: {
      titre: "How to participate?",
      sousTitre: "A simple and accessible process designed to make it easy to join our actions.",
      etapes: [
        { titre: "Discover", description: "Browse our ongoing campaigns and check dates, locations, and participation conditions." },
        { titre: "Register", description: "Book online, by phone, or come directly to the laboratory." },
        { titre: "Participate", description: "Benefit from screenings, vaccinations, or consultations in a professional and confidential setting." },
        { titre: "Follow-up", description: "Receive your results and, if needed, referral to appropriate care facilities." },
      ],
    },
    cta: {
      titre: "Organize a campaign with HAM?",
      description: "Institutions, companies, and associations — let's build measurable public health actions together.",
      bouton: "Contact us",
      boutonSecondaire: "Book an appointment",
    },
    items: {
      "paludisme-2026": {
        titre: "Malaria screening campaign",
        extrait: "Rapid malaria screening at reduced rates — protect your family.",
        description:
          "HAM LABORATORY launches a malaria screening campaign with preferential rates. Our qualified technicians perform a rapid diagnostic test (RDT) with reliable results in under 30 minutes. Awareness on prevention in tropical areas is included.",
        periode: "July 1 to August 31, 2026",
        lieu: "HAM Laboratory — MATETE",
      },
      "depistage-vih-2026": {
        titre: "HIV screening — free and confidential",
        extrait: "Free HIV test, confidential results, and supportive care.",
        description:
          "As part of our public health commitment, HAM LABORATORY offers free and fully confidential HIV screening. Secure sampling, reliable results, and referral to care facilities when needed.",
        periode: "July 15 to August 15, 2026",
        lieu: "HAM Laboratory — MATETE",
      },
      "cancer-sein": {
        titre: "Breast cancer screening",
        extrait: "Pink October — early screening and breast cancer awareness.",
        description:
          "Annual breast cancer awareness and screening campaign. Clinical exams, mammography referral, and prevention advice provided by our medical team.",
        periode: "May 1 to 31, 2026",
      },
      "vaccination-grippe": {
        titre: "Flu vaccination",
        extrait: "Protect yourself against seasonal flu — vaccination available.",
        description:
          "Flu vaccination campaign for at-risk populations and the general public. Certified vaccines administered by qualified health professionals.",
        periode: "April 15 to 30, 2026",
      },
      "depistage-diabete": {
        titre: "Diabetes screening",
        extrait: "Blood glucose, HbA1c, and nutrition advice — detect diabetes early.",
        description:
          "Diabetes screening week with a full glycemic panel at reduced price. Results interpreted by a physician with personalized recommendations.",
        periode: "June 1 to 15, 2026",
      },
      "journee-cardiologie": {
        titre: "Cardiology day",
        extrait: "Consultations and cardiovascular screenings at preferential rates.",
        description:
          "On World Heart Day, HAM LABORATORY hosts an open day dedicated to cardiovascular health: ECG, lipid panel, and specialized consultations.",
        periode: "September 29, 2026",
        lieu: "HAM Laboratory — Kinshasa",
      },
      "hypertension-2026": {
        titre: "Hypertension awareness week",
        extrait: "Free blood pressure checks and risk factor screening.",
        description:
          "Hypertension prevention campaign: free measurements, kidney panel, and lifestyle advice from our nurses and physicians.",
        periode: "September 1 to 7, 2026",
      },
      "pub-equipements-2026": {
        titre: "New laboratory equipment",
        extrait: "HAM LABORATORY modernizes its analytical fleet — enhanced reliability.",
        description:
          "Institutional announcement: HAM LABORATORY invests in new state-of-the-art automated analyzers for even faster and more reliable results.",
        periode: "Permanent publication",
      },
    },
  },

  aPropos: {
    hero: {
      typeEtablissement: "DIAGNOSTIC AND MEDICAL TESTING CENTER",
      badgeSlogan: "YOUR HEALTH IS MY BURDEN,",
      suiteSlogan: "RELIABILITY IS OUR PRIORITY",
    },
    mission: {
      titre: "Our mission",
      texte:
        "HAM, with its laboratory and qualified staff, is committed to meeting regulatory standards and best practices while satisfying clients' requirements for reliable results at an affordable cost, enabling even the most disadvantaged to receive proper diagnosis.",
    },
    vision: {
      titre: "Our vision",
      texte:
        "To become the reference center for diagnostic and medical testing in the Democratic Republic of Congo and Africa, recognized for excellence, accessibility, and the reliability of our results.",
    },
    valeurs: {
      titre: "Our values",
      items: [
        { titre: "Reliability", description: "Accurate results compliant with international laboratory standards." },
        { titre: "Accessibility", description: "Quality services at an affordable cost, open to all, including the most disadvantaged." },
        { titre: "Excellence", description: "Qualified staff, modern equipment, and adherence to best practices." },
        { titre: "Humanity", description: "Your health is our burden — every patient is welcomed with respect and attention." },
      ],
    },
    histoire: {
      titre: "Our history",
      paragraphes: [
        "HAM LABORATOIRE is a diagnostic and medical testing center based in Kinshasa, Democratic Republic of Congo. Since its founding, the facility has been committed to providing reliable and accessible health services to the entire population.",
        "With its equipped laboratory and team of qualified professionals, HAM LABORATOIRE supports physicians, patients, and institutional partners throughout the diagnostic journey with rigor and care.",
      ],
    },
    direction: {
      titre: "Our leadership",
      sousTitre: "The center director",
      responsable: {
        nom: "Olivier Bokulu",
        fonction: "General Director — HAM Laboratoire",
        biographie:
          "Olivier Bokulu leads HAM LABORATOIRE with the conviction that health is a shared burden and that reliable results must remain accessible to all. Under his leadership, the center continues its mission of excellence in medical diagnosis, placing quality, integrity, and accessibility of care at the heart of every decision.",
      },
    },
    equipe: {
      titre: "Our team",
      sousTitre: "Qualified professionals at your service",
      membres: [
        { nom: "Laboratory Team", fonction: "Biologists & technicians" },
        { nom: "Reception Team", fonction: "Reception & guidance" },
        { nom: "Medical Team", fonction: "Physicians & nurses" },
        { nom: "Administrative Team", fonction: "Management & quality" },
      ],
    },
    certifications: {
      titre: "Certifications & commitments",
      items: [
        { titre: "ISO 9001:2015", description: "Certified quality management system." },
        { titre: "Laboratory best practices", description: "Compliance with national and international regulatory requirements." },
        { titre: "Result reliability", description: "Rigorous quality controls at every analytical step." },
      ],
    },
    impact: {
      titre: "HAM in numbers",
      sousTitre: "An established presence in Kinshasa, serving Congolese public health.",
      items: [
        { libelle: "Patients / year", description: "Care and tests performed each year." },
        { libelle: "Types of tests", description: "Full technical platform in medical biology." },
        { libelle: "Professionals", description: "Biologists, technicians, physicians, and qualified staff." },
        { libelle: "Certification", description: "Certified quality management." },
      ],
    },
    bandeau: {
      slogan: "HAM LABORATOIRE, THE SAFE CHOICE FOR BETTER HEALTH!",
      telephone: "Phone",
      siteWeb: "Website",
    },
    cta: {
      titre: "Join thousands of patients who trust us",
      description: "Book an appointment or contact us — HAM LABORATOIRE welcomes you in MATETE, Kinshasa.",
      boutonPrincipal: "Book an appointment",
      boutonSecondaire: "Contact us",
    },
  },
} as const;

export type PagesEn = typeof pagesEn;
