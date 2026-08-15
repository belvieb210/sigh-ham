/** Übersetzungen DE — Seiteninhalte (Startseite bereits in locales/de.ts) */

import { pagesServicesLaboratoireEn } from "./fragments/services-laboratoire-en";

export const pagesDe = {
  contact: {
    hero: {
      surtitre: "Bleiben Sie in Kontakt",
      titre: "Wir sind",
      titreAccent: "für Sie da",
      description:
        "Haben Sie eine Frage zu unseren Leistungen, Ihren Testergebnissen oder einer Gesundheitskampagne? Das Team von HAM LABORATOIRE antwortet professionell und einfühlsam.",
      stats: {
        delai: "Antwortzeit",
        lignes: "Telefonleitungen",
        accueil: "Empfang & Notfälle",
        ville: "Kinshasa, DRK",
      },
    },
    coordonnees: {
      surtitre: "Unsere Kontaktdaten",
      titre: "So erreichen Sie uns",
      sousTitre: "Schneller Zugang, vollständige Adresse und Öffnungszeiten",
      rdv: "Termin",
      rdvDesc: "Online buchen",
      resultats: "Ergebnisse",
      resultatsDesc: "Ihre Tests einsehen",
      site: "Offizielle Website",
      adresse: "Adresse",
      telephones: "Telefone",
      accueil: "Empfang",
      responsable: "Direktor",
      email: "E-Mail",
      horaires: "Öffnungszeiten",
    },
    formulaire: {
      surtitre: "Schreiben Sie uns",
      titre: "Senden Sie uns eine Nachricht",
      sousTitre: "Füllen Sie das Formular aus — wir antworten innerhalb von 24 bis 48 Werktagen",
      nom: "Vollständiger Name *",
      email: "E-Mail *",
      telephone: "Telefon",
      sujet: "Betreff Ihrer Anfrage *",
      message: "Nachricht *",
      consentement:
        "Ich stimme zu, dass meine Daten von HAM LABORATOIRE im Zusammenhang mit meiner Anfrage gemäß der Datenschutzrichtlinie verarbeitet werden. *",
      envoyer: "Nachricht senden",
      envoi: "Wird gesendet...",
      aideImmediate: "Benötigen Sie eine sofortige Antwort?",
      aideTexte: "Rufen Sie unseren Empfang direkt an — wir helfen Ihnen gerne.",
      horairesLabel: "Mo — Fr: 7:00 — 19:00",
      carteLegende: "Gemeinde MATETE, Kinshasa — Eingang Debonhomme Drittes Parzelle",
    },
    sujets: {
      "rendez-vous": "Terminbuchung",
      resultats: "Testergebnisse",
      campagnes: "Kampagnen & Vorsorgeuntersuchungen",
      tarifs: "Preise & Leistungen",
      partenariat: "Institutionelle Partnerschaft",
      reclamation: "Beschwerde",
      autre: "Sonstige Anfrage",
    },
    horaires: {
      titre: "Öffnungszeiten",
      lunVen: "Montag — Freitag",
      lunVenHeures: "7:00 — 19:00",
      sam: "Samstag",
      samHeures: "7:00 — 14:00",
      dim: "Sonntag",
      dimHeures: "Nur Notfallanalysen",
    },
    faq: {
      surtitre: "Hilfe & Informationen",
      titre: "Häufig gestellte Fragen",
      sousTitre:
        "Finden Sie schnell Antworten auf Ihre Fragen zu unseren Leistungen, Ergebnissen und dem Zugang zum Labor.",
      aideTitre: "Finden Sie Ihre Antwort nicht?",
      aideTexte: "Nutzen Sie das Kontaktformular oder rufen Sie uns an — unser Empfangsteam berät Sie.",
      aideLien: "Team kontaktieren →",
      items: [
        {
          question: "Wie erhalte ich meine Testergebnisse?",
          reponse:
            "Ihre Ergebnisse sind im Labor oder online über unser Patientenportal verfügbar. Legen Sie Ihren Probenzettel vor oder kontaktieren Sie uns mit Ihrer Aktennummer.",
        },
        {
          question: "Benötige ich einen Termin für Tests?",
          reponse:
            "Die meisten Tests können ohne Termin durchgeführt werden. Für bestimmte Spezialuntersuchungen empfehlen wir eine vorherige Buchung.",
        },
        {
          question: "Welche Zahlungsmethoden akzeptieren Sie?",
          reponse:
            "Wir akzeptieren Bargeld, Mobile Money und Banküberweisungen. Für Vorsorgekampagnen können Zahlungsvereinbarungen möglich sein.",
        },
        {
          question: "Wo befindet sich HAM LABORATOIRE?",
          reponse:
            "259, Avenue Lumière, Eingang Debonhomme Drittes Parzelle rechts, Gemeinde MATETE, Kinshasa, DRK. Siehe Karte unten für Wegbeschreibung.",
        },
      ],
    },
    cta: {
      titre: "Benötigen Sie schnell einen Termin?",
      description:
        "Buchen Sie online oder rufen Sie uns an — unser Empfangsteam steht Ihnen zur Verfügung.",
      boutonRdv: "Termin buchen",
      boutonFormulaire: "Nachricht senden",
    },
  },

  rendezVous: {
    hero: {
      surtitre: "Online-Terminbuchung",
      titre: "Buchen Sie Ihre",
      titreAccent: "Konsultation",
      description:
        "Planen Sie Ihren Laborbesuch in wenigen Klicks — Tests, Konsultationen, Bildgebung oder Vorsorgeuntersuchungen. Sofortige Bestätigung und Erinnerung per SMS oder E-Mail.",
      commencer: "Buchung starten",
      voirCoords: "Zum Formular",
      stats: {
        rapide: "Schnelle Buchung",
        enLigne: "Online verfügbar",
        confirmation: "Sofortige Bestätigung",
        qualite: "Zertifizierte Qualität",
      },
    },
    reservation: {
      surtitre: "Online-Buchung",
      titre: "Planen Sie Ihren Besuch",
      sousTitre: "Führen Sie die Schritte unten aus — sofortige Bestätigung mit Referenznummer",
      securise: "Sichere Buchung",
      securiseTexte:
        "Ihre Daten sind geschützt und werden nur zur Verwaltung Ihres Labortermins verwendet.",
      aide: "Benötigen Sie Hilfe?",
      aideTexte: "Unser Empfangsteam leitet Sie zum richtigen Service.",
      horaires: "Öffnungszeiten",
      adresse: "Adresse",
      voirCarte: "Karte anzeigen →",
    },
    form: {
      etapes: ["Leistung", "Datum & Uhrzeit", "Ihre Daten", "Bestätigung"],
      typeTitre: "Welche Art von Leistung benötigen Sie?",
      typeSousTitre: "Wählen Sie die Leistung, die Ihren Bedürfnissen entspricht",
      dateTitre: "Wählen Sie Datum und Zeitfenster",
      dateLabel: "Bevorzugtes Datum",
      creneauLabel: "Zeitfenster",
      pasCreneau: "Keine Zeitfenster für dieses Datum verfügbar. Bitte wählen Sie ein anderes.",
      infosTitre: "Ihre Kontaktdaten",
      infosSousTitre: "Um Bestätigung und Vorbereitungsanweisungen zu erhalten",
      nom: "Vollständiger Name *",
      email: "E-Mail *",
      telephone: "Telefon *",
      naissance: "Geburtsdatum",
      premiereVisite: "Erster Besuch im Labor",
      motif: "Grund oder Details (optional)",
      consentement:
        "Ich stimme zu, dass meine Daten von HAM LABORATOIRE zur Verwaltung meines Termins gemäß der Datenschutzrichtlinie verarbeitet werden. *",
      continuer: "Weiter",
      retour: "Zurück",
      confirmer: "Termin bestätigen",
      confirmationEnCours: "Wird bestätigt...",
      succesTitre: "Termin registriert!",
      succesTexte:
        "Ihre Anfrage wurde an unser Team gesendet. Sie erhalten in Kürze eine Bestätigung per E-Mail oder SMS.",
      reference: "Referenznummer",
      prestation: "Leistung",
      date: "Datum",
      heure: "Uhrzeit",
      patient: "Patient",
      autreRdv: "Weiteren Termin buchen",
      sansRdv: "Ohne Termin möglich",
    },
    types: {
      analyses: {
        titre: "Laboruntersuchungen",
        description: "Blut-, Urin- und biologische Proben — vollständiges Panel oder gezielte Tests.",
      },
      consultation: {
        titre: "Medizinische Konsultation",
        description:
          "Allgemeine oder spezialisierte Konsultation zur Interpretation Ihrer Ergebnisse oder zur Anleitung Ihrer Tests.",
      },
      imagerie: {
        titre: "Medizinische Bildgebung",
        description: "Ultraschall, Radiologie und Bildgebungsuntersuchungen nach Termin.",
      },
      depistage: {
        titre: "Vorsorge & Kampagne",
        description:
          "Teilnahme an öffentlichen Gesundheitskampagnen und Vorsorgeuntersuchungen von HAM LABORATOIRE.",
      },
      prelevement: {
        titre: "Spezialisierte Probenentnahme",
        description:
          "Proben, die spezielle Vorbereitung oder Protokoll erfordern (Nüchternheit, genaue Zeitangabe).",
      },
    },
    parcours: {
      titre: "Wie funktioniert es?",
      sousTitre: "Vier einfache Schritte zur Terminbestätigung",
      etapes: [
        { titre: "Leistung wählen", description: "Wählen Sie die Art der Untersuchung oder Konsultation, die Sie benötigen." },
        { titre: "Datum & Zeitfenster", description: "Wählen Sie Datum und Uhrzeit aus unserer Verfügbarkeit." },
        { titre: "Ihre Kontaktdaten", description: "Geben Sie Ihre Informationen ein, um Bestätigung und Anweisungen zu erhalten." },
        { titre: "Bestätigung", description: "Senden Sie Ihre Anfrage — Sie erhalten eine Referenznummer per E-Mail oder SMS." },
      ],
    },
    infos: {
      surtitre: "Vor Ihrem Besuch",
      titre: "Praktische Informationen",
      sousTitre: "Bereiten Sie sich auf Ihren Laborbesuch vor",
      items: [
        { titre: "Mitbringende Dokumente", description: "Personalausweis, ärztliche Verordnung falls zutreffend, Gesundheitsheft und frühere Ergebnisse." },
        { titre: "Nüchternheit & Vorbereitung", description: "Einige Tests erfordern 8 bis 12 Stunden Nüchternheit. Anweisungen werden bei der Bestätigung mitgeteilt." },
        { titre: "Empfangszeiten", description: "Mo — Fr: 7:00 — 19:00 · Sa: 7:00 — 14:00 · So: nur Notfallanalysen." },
        { titre: "Zugang & Parkplatz", description: "259, Avenue Lumière, MATETE — Kinshasa. Einfacher Zugang, Parkplätze in der Nähe verfügbar." },
      ],
    },
    faq: {
      surtitre: "Häufig gestellte Fragen",
      titre: "Alles über Termine",
      sousTitre: "Änderungen, Stornierungen, Vorbereitung — finden Sie Antworten auf die häufigsten Fragen.",
      aideTitre: "Benötigen Sie Unterstützung?",
      aideTexte: "Unser Empfangsteam ist Montag bis Samstag verfügbar.",
      aideLien: "Kontaktseite →",
      items: [
        {
          question: "Kann ich ohne Termin für Tests kommen?",
          reponse:
            "Ja, die meisten Laboruntersuchungen können während unserer Öffnungszeiten ohne Termin durchgeführt werden. Ein gebuchtes Zeitfenster garantiert vorrangigen Empfang.",
        },
        {
          question: "Wie ändere oder storniere ich meinen Termin?",
          reponse:
            "Kontaktieren Sie unseren Empfang unter +243 819 191 643 oder per E-Mail an obb5lab@gmail.com mit Ihrer Referenznummer. Bitte informieren Sie uns mindestens 24 Stunden im Voraus.",
        },
        {
          question: "Erhalte ich eine Erinnerung vor meinem Termin?",
          reponse:
            "Ja, eine Erinnerung wird 24 Stunden vor Ihrem Zeitfenster per SMS oder E-Mail gesendet, mit Vorbereitungsanweisungen falls nötig.",
        },
        {
          question: "Sind Online-Termine kostenlos?",
          reponse:
            "Die Online-Buchung ist vollständig kostenlos. Nur die durchgeführten Tests und Konsultationen werden gemäß unserer Gebührenordnung berechnet.",
        },
      ],
    },
    cta: {
      titre: "Haben Sie eine Frage vor der Buchung?",
      description: "Unser Empfangsteam steht Ihnen zur Verfügung, um Sie zum richtigen Service zu leiten.",
      boutonContact: "Kontaktieren Sie uns",
      boutonReserver: "Jetzt buchen",
    },
  },

  services: {
    hero: {
      surtitre: "Diagnose- & medizinisches Testzentrum",
      titre: "Medizinische Leistungen",
      titreAccent: "in Exzellenz",
      description:
        "HAM LABORATOIRE bietet ein vollständiges Spektrum diagnostischer Leistungen — Laboruntersuchungen, Konsultationen, Bildgebung und Vorsorge — mit zuverlässigen Ergebnissen, kontrollierten Bearbeitungszeiten und Zugänglichkeit für alle.",
      decouvrir: "Unsere Leistungen entdecken",
      voirPrestations: "Leistungen ansehen",
      badge: "Leistungen · ISO 9001:2015 zertifiziertes Labor",
      stats: {
        analyses: "Arten von Tests",
        delai: "Durchschnittliche Ergebniszeit",
        iso: "9001:2015 zertifiziert",
        accueil: "Patientenempfang",
      },
    },
    categories: {
      tous: "Alle Leistungen",
      diagnostic: "Diagnostik",
      soins: "Versorgung & Nachsorge",
      urgences: "Notfälle",
    },
    vedette: {
      badge: "Hervorgehobene Leistung",
      decouvrir: "Labor entdecken",
      chiffres: [
        { libelle: "Arten von Tests" },
        { libelle: "Durchschnittliche Bearbeitungszeit" },
        { libelle: "Zertifizierung" },
      ],
    },
    grille: {
      surtitre: "Unser Angebot",
      titre: "Alle unsere Leistungen",
      sousTitre: "Nach Kategorie filtern, um die passende Leistung zu finden",
      aucun: "Keine Leistungen in dieser Kategorie.",
    },
    items: {
      laboratoire: {
        titre: "Laboruntersuchungen",
        description: "Kern unserer Expertise — biologische, hämatologische, biochemische und spezialisierte Tests mit modernster Ausstattung.",
        badge: "Hervorgehobene Leistung",
        points: ["Über 200 analysierte Parameter", "Strenge Qualitätskontrollen", "Sichere Online-Ergebnisse"],
      },
      consultations: {
        titre: "Medizinische Konsultationen",
        description: "Allgemeine und spezialisierte Konsultationen zur Anleitung Ihrer Tests und Interpretation Ihrer Ergebnisse mit unseren qualifizierten Ärzten.",
        points: ["Allgemeinmediziner & Spezialisten", "Ergebnisinterpretation", "Personalisierte Patientenbetreuung"],
      },
      imagerie: {
        titre: "Medizinische Bildgebung",
        description: "Radiologie, Ultraschall und Bildgebungsuntersuchungen für präzise visuelle Diagnose ergänzend zu biologischen Tests.",
        points: ["Ultraschall & Radiologie", "Digitale Ausstattung", "Detaillierte Berichte"],
      },
      pharmacie: {
        titre: "Apotheke",
        description: "Abgabe qualitativ hochwertiger Medikamente und pharmazeutische Beratung zur Unterstützung Ihrer Behandlung nach der Diagnose.",
        points: ["Zertifizierte Medikamente", "Personalisierte Beratung", "Optimierte Verfügbarkeit"],
      },
      hospitalisation: {
        titre: "Hospitalisierung",
        description: "Stationäre Versorgung mit kontinuierlicher medizinischer Überwachung für Patienten, die intensive Nachsorge benötigen.",
        points: ["Komfortable Zimmer", "24/7 medizinische Überwachung", "Koordinierte Versorgung"],
      },
      urgences: {
        titre: "Notfälle",
        description: "Notdienst verfügbar für kritische Situationen, die sofortige Versorgung und prioritäre Tests erfordern.",
        points: ["Erweiterte Verfügbarkeit", "Notfalltests", "Reaktionsschnelles Team"],
      },
    },
    impact: {
      titre: "Exzellenz in Zahlen",
      sousTitre: "Messbare Leistung, die unser Engagement für diagnostische Qualität widerspiegelt.",
      items: [
        { libelle: "Arten von Tests", description: "Biologie, Hämatologie, Mikrobiologie, Immunologie und mehr." },
        { libelle: "Patienten / Jahr", description: "Versorgung in unserem MATETE-Zentrum." },
        { libelle: "Durchschnittliche Bearbeitungszeit", description: "Ergebnisse schnell verfügbar, oft am selben Tag." },
        { libelle: "Zertifizierung", description: "Zertifizierte Qualitätsprozesse und strenge Kontrollen." },
      ],
    },
    specialites: {
      titre: "Test-Spezialitäten",
      sousTitre: "Ein vollständiges Labor, das alle wesentlichen analytischen Bereiche für die medizinische Diagnose abdeckt",
    },
    parcours: {
      titre: "Ihr Weg bei HAM",
      sousTitre: "Ein einfacher, schneller und transparenter Prozess — vom Empfang bis zu Ihren Ergebnissen",
      etapes: [
        { titre: "Empfang & Orientierung", description: "Unser Empfangsteam berät Sie und registriert Ihre Akte in wenigen Minuten." },
        { titre: "Konsultation", description: "Ein Arzt verschreibt die Tests, die Ihrer klinischen Situation entsprechen." },
        { titre: "Probenentnahme & Tests", description: "Sichere Probenentnahme und Laborverarbeitung mit Qualitätskontrollen." },
        { titre: "Zuverlässige Ergebnisse", description: "Ausgabe oder Online-Zugang zu Ihren zertifizierten und interpretierten Ergebnissen." },
      ],
    },
    engagements: {
      titre: "Warum HAM LABORATOIRE wählen?",
      sousTitre: "Konkrete Verpflichtungen, die den Unterschied machen",
      items: [
        { titre: "Zertifizierte Zuverlässigkeit", description: "Ergebnisse gemäß ISO 9001:2015-Normen und Labor-Best-Practices." },
        { titre: "Kontrollierte Geschwindigkeit", description: "Optimierte Bearbeitungszeiten dank organisiertem Workflow und leistungsstarker Ausstattung." },
        { titre: "Zugänglichkeit", description: "Erschwingliche Preise, die auch den Benachteiligten Zugang zu qualitativ hochwertiger Diagnose ermöglichen." },
        { titre: "Qualifiziertes Team", description: "Erfahrene Biologen, Techniker und Ärzte an Ihrer Seite bei jedem Schritt." },
      ],
    },
    cta: {
      titre: "Bereit, sich um Ihre Gesundheit zu kümmern?",
      description: "Buchen Sie online oder kontaktieren Sie uns — unser Team steht Ihnen zur Verfügung.",
      boutonPrincipal: "Termin buchen",
      boutonSecondaire: "Kontaktieren Sie uns",
    },
  },

  servicesLaboratoire: pagesServicesLaboratoireEn,

  campagnes: {
    hero: {
      surtitre: "Öffentliche Gesundheitsaktionen",
      titre: "Kampagnen &",
      titreAccent: "Aufklärung",
      description:
        "HAM LABORATOIRE führt Präventions-, Vorsorge- und Aufklärungsaktionen für die Bevölkerung von Kinshasa durch. Entdecken Sie unsere laufenden Initiativen und beteiligen Sie sich an der Gesundheit aller.",
      voirCampagnes: "Kampagnen ansehen",
      stats: {
        sensibilises: "Erreichte Personen / Jahr",
        actions: "Aktionen pro Jahr im Durchschnitt",
        satisfaction: "Zufriedenheitsrate",
        iso: "Qualitätszertifizierung",
      },
    },
    grille: {
      surtitre: "Alle unsere Aktionen",
      titre: "Kampagnen & Aufklärung",
      sousTitre: "Nach Kategorie filtern oder unsere laufenden Initiativen durchsuchen",
      filtrerPublications: "Veröffentlichungen filtern",
      resultatSingulier: "Ergebnis",
      resultatPluriel: "Ergebnisse",
      filtrerStatutAria: "Nach Status filtern",
      erreurChargement: "Kampagnen konnten nicht geladen werden. Bitte versuchen Sie es erneut.",
      aucunePublication: "Keine Veröffentlichungen gefunden",
      modifierFiltres: "Versuchen Sie, Ihre Filter zu ändern, um mehr Ergebnisse zu sehen.",
      compteurSingulier: "Veröffentlichung angezeigt von",
      compteurPluriel: "Veröffentlichungen angezeigt von",
      auTotal: "insgesamt",
      filtres: {
        toutes: "Alle Kategorien",
        tous: "Alle",
        depistage: "Vorsorge",
        vaccination: "Impfung",
        sensibilisation: "Aufklärung",
        evenement: "Veranstaltung",
      },
      statuts: { en_cours: "Laufend", a_venir: "Bevorstehend", terminee: "Abgeschlossen" },
    },
    impact: {
      titre: "Unsere Wirkung in Zahlen",
      sousTitre: "Strukturierte, messbare Kampagnen, verwurzelt in der kongolesischen Gesundheitsrealität.",
      items: [
        { libelle: "Durchgeführte Vorsorgeuntersuchungen", description: "HIV, Malaria, Diabetes und andere gezielte Erkrankungen." },
        { libelle: "Verabreichte Impfungen", description: "Grippe, Hepatitis und saisonale Kampagnen." },
        { libelle: "Institutionelle Partner", description: "NGOs, Unternehmen und öffentliche Gesundheitsstrukturen." },
        { libelle: "Abgedeckte Gemeinden", description: "Gemeinschaftsaktionen in Kinshasa und Umgebung." },
      ],
    },
    parcours: {
      titre: "Wie kann man teilnehmen?",
      sousTitre: "Ein einfacher und zugänglicher Prozess, der die Teilnahme an unseren Aktionen erleichtert.",
      etapes: [
        { titre: "Entdecken", description: "Durchsuchen Sie unsere laufenden Kampagnen und prüfen Sie Termine, Orte und Teilnahmebedingungen." },
        { titre: "Anmelden", description: "Online buchen, telefonisch oder direkt im Labor erscheinen." },
        { titre: "Teilnehmen", description: "Profitieren Sie von Vorsorgeuntersuchungen, Impfungen oder Konsultationen in professionellem und vertraulichem Rahmen." },
        { titre: "Nachsorge", description: "Erhalten Sie Ihre Ergebnisse und bei Bedarf Weiterleitung an geeignete Versorgungseinrichtungen." },
      ],
    },
    cta: {
      titre: "Eine Kampagne mit HAM organisieren?",
      description: "Institutionen, Unternehmen und Vereine — lassen Sie uns gemeinsam messbare öffentliche Gesundheitsaktionen aufbauen.",
      bouton: "Kontaktieren Sie uns",
      boutonSecondaire: "Termin buchen",
    },
    items: {
      "paludisme-2026": {
        titre: "Malaria-Vorsorgekampagne",
        extrait: "Schnelle Malaria-Vorsorge zu reduzierten Preisen — schützen Sie Ihre Familie.",
        description:
          "HAM LABORATOIRE startet eine Malaria-Vorsorgekampagne mit Vorzugspreisen. Unsere qualifizierten Techniker führen einen Schnelltest (RDT) mit zuverlässigen Ergebnissen in unter 30 Minuten durch. Aufklärung zur Prävention in tropischen Gebieten ist enthalten.",
        periode: "1. Juli bis 31. August 2026",
        lieu: "HAM Laboratoire — MATETE",
      },
      "depistage-vih-2026": {
        titre: "HIV-Vorsorge — kostenlos und vertraulich",
        extrait: "Kostenloser HIV-Test, vertrauliche Ergebnisse und unterstützende Betreuung.",
        description:
          "Im Rahmen unseres Engagements für die öffentliche Gesundheit bietet HAM LABORATOIRE kostenlose und vollständig vertrauliche HIV-Vorsorge. Sichere Probenentnahme, zuverlässige Ergebnisse und Weiterleitung bei Bedarf.",
        periode: "15. Juli bis 15. August 2026",
        lieu: "HAM Laboratoire — MATETE",
      },
      "cancer-sein": {
        titre: "Brustkrebs-Vorsorge",
        extrait: "Pink October — Früherkennung und Aufklärung über Brustkrebs.",
        description:
          "Jährliche Aufklärungs- und Vorsorgekampagne für Brustkrebs. Klinische Untersuchungen, Mammographie-Überweisung und Präventionsberatung durch unser medizinisches Team.",
        periode: "1. bis 31. Mai 2026",
      },
      "vaccination-grippe": {
        titre: "Grippeimpfung",
        extrait: "Schützen Sie sich vor saisonaler Grippe — Impfung verfügbar.",
        description:
          "Grippeimpfkampagne für Risikogruppen und die Allgemeinbevölkerung. Zertifizierte Impfstoffe, verabreicht von qualifizierten Gesundheitsfachkräften.",
        periode: "15. bis 30. April 2026",
      },
      "depistage-diabete": {
        titre: "Diabetes-Vorsorge",
        extrait: "Blutzucker, HbA1c und Ernährungsberatung — Diabetes früh erkennen.",
        description:
          "Diabetes-Vorsorgewoche mit vollständigem glykämischen Panel zu reduziertem Preis. Ergebnisse von einem Arzt interpretiert mit personalisierten Empfehlungen.",
        periode: "1. bis 15. Juni 2026",
      },
      "journee-cardiologie": {
        titre: "Kardiologie-Tag",
        extrait: "Konsultationen und kardiovaskuläre Vorsorge zu Vorzugspreisen.",
        description:
          "Am Weltherztag veranstaltet HAM LABORATOIRE einen Tag der offenen Tür für kardiovaskuläre Gesundheit: EKG, Lipidprofil und spezialisierte Konsultationen.",
        periode: "29. September 2026",
        lieu: "HAM Laboratoire — Kinshasa",
      },
      "hypertension-2026": {
        titre: "Aufklärungswoche Hypertonie",
        extrait: "Kostenlose Blutdruckmessungen und Risikofaktor-Vorsorge.",
        description:
          "Hypertonie-Präventionskampagne: kostenlose Messungen, Nierenpanel und Lebensstilberatung von unseren Krankenschwestern und Ärzten.",
        periode: "1. bis 7. September 2026",
      },
      "pub-equipements-2026": {
        titre: "Neue Laborausstattung",
        extrait: "HAM LABORATOIRE modernisiert seinen analytischen Park — erhöhte Zuverlässigkeit.",
        description:
          "Institutionelle Ankündigung: HAM LABORATOIRE investiert in neue hochmoderne automatische Analysatoren für noch schnellere und zuverlässigere Ergebnisse.",
        periode: "Dauerhafte Veröffentlichung",
      },
    },
  },

  aPropos: {
    hero: {
      typeEtablissement: "DIAGNOSE- UND MEDIZINISCHES TESTZENTRUM",
      badgeSlogan: "IHRE GESUNDHEIT IST MEINE LAST,",
      suiteSlogan: "ZUVERLÄSSIGKEIT IST UNSERE PRIORITÄT",
    },
    mission: {
      titre: "Unsere Mission",
      texte:
        "HAM verpflichtet sich mit seinem Labor und qualifiziertem Personal, regulatorische Standards und Best Practices einzuhalten und die Anforderungen der Kunden an zuverlässige Ergebnisse zu einem erschwinglichen Preis zu erfüllen, damit auch die Benachteiligten eine angemessene Diagnose erhalten können.",
    },
    vision: {
      titre: "Unsere Vision",
      texte:
        "Das Referenzzentrum für Diagnose und medizinische Tests in der Demokratischen Republik Kongo und Afrika zu werden, anerkannt für Exzellenz, Zugänglichkeit und die Zuverlässigkeit unserer Ergebnisse.",
    },
    valeurs: {
      titre: "Unsere Werte",
      items: [
        { titre: "Zuverlässigkeit", description: "Genaue Ergebnisse gemäß internationalen Laborstandards." },
        { titre: "Zugänglichkeit", description: "Qualitätsleistungen zu erschwinglichen Kosten, offen für alle, einschließlich der Benachteiligten." },
        { titre: "Exzellenz", description: "Qualifiziertes Personal, moderne Ausstattung und Einhaltung von Best Practices." },
        { titre: "Menschlichkeit", description: "Ihre Gesundheit ist unsere Last — jeder Patient wird mit Respekt und Aufmerksamkeit empfangen." },
      ],
    },
    histoire: {
      titre: "Unsere Geschichte",
      paragraphes: [
        "HAM LABORATOIRE ist ein Diagnose- und medizinisches Testzentrum mit Sitz in Kinshasa, Demokratische Republik Kongo. Seit seiner Gründung verpflichtet sich die Einrichtung, der gesamten Bevölkerung zuverlässige und zugängliche Gesundheitsdienste anzubieten.",
        "Mit seinem ausgestatteten Labor und einem Team qualifizierter Fachkräfte begleitet HAM LABORATOIRE Ärzte, Patienten und institutionelle Partner durch den diagnostischen Weg mit Sorgfalt und Präzision.",
      ],
    },
    direction: {
      titre: "Unsere Leitung",
      sousTitre: "Der Zentrumsdirektor",
      responsable: {
        nom: "Olivier Bokulu",
        fonction: "Generaldirektor — HAM Laboratoire",
        biographie:
          "Olivier Bokulu leitet HAM LABORATOIRE mit der Überzeugung, dass Gesundheit eine gemeinsame Last ist und zuverlässige Ergebnisse für alle zugänglich bleiben müssen. Unter seiner Führung setzt das Zentrum seine Mission der medizinischen Diagnose-Exzellenz fort und stellt Qualität, Integrität und Zugänglichkeit der Versorgung in den Mittelpunkt jeder Entscheidung.",
      },
    },
    equipe: {
      titre: "Unser Team",
      sousTitre: "Qualifizierte Fachkräfte zu Ihren Diensten",
      membres: [
        { nom: "Labor-Team", fonction: "Biologen & Techniker" },
        { nom: "Empfangs-Team", fonction: "Empfang & Orientierung" },
        { nom: "Medizinisches Team", fonction: "Ärzte & Krankenschwestern" },
        { nom: "Administratives Team", fonction: "Management & Qualität" },
      ],
    },
    certifications: {
      titre: "Zertifizierungen & Verpflichtungen",
      items: [
        { titre: "ISO 9001:2015", description: "Zertifiziertes Qualitätsmanagementsystem." },
        { titre: "Labor-Best-Practices", description: "Einhaltung nationaler und internationaler regulatorischer Anforderungen." },
        { titre: "Ergebniszuverlässigkeit", description: "Strenge Qualitätskontrollen bei jedem analytischen Schritt." },
      ],
    },
    impact: {
      titre: "HAM in Zahlen",
      sousTitre: "Eine etablierte Präsenz in Kinshasa im Dienst der kongolesischen öffentlichen Gesundheit.",
      items: [
        { libelle: "Patienten / Jahr", description: "Jährlich durchgeführte Versorgung und Tests." },
        { libelle: "Arten von Tests", description: "Vollständige technische Plattform in medizinischer Biologie." },
        { libelle: "Fachkräfte", description: "Biologen, Techniker, Ärzte und qualifiziertes Personal." },
        { libelle: "Zertifizierung", description: "Zertifiziertes Qualitätsmanagement." },
      ],
    },
    bandeau: {
      slogan: "HAM LABORATOIRE, DIE SICHERE WAHL FÜR BESSERE GESUNDHEIT!",
      telephone: "Telefon",
      siteWeb: "Website",
    },
    cta: {
      titre: "Schließen Sie sich Tausenden von Patienten an, die uns vertrauen",
      description: "Buchen Sie einen Termin oder kontaktieren Sie uns — HAM LABORATOIRE empfängt Sie in MATETE, Kinshasa.",
      boutonPrincipal: "Termin buchen",
      boutonSecondaire: "Kontaktieren Sie uns",
    },
  },
} as const;

export type PagesDe = typeof pagesDe;
