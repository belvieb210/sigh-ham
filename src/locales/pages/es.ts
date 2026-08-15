/** Traducciones ES — contenido de páginas (excluye inicio ya en locales/es.ts) */

import { pagesServicesLaboratoireEn } from "./fragments/services-laboratoire-en";
import { extensionFormRdvMedecinEn } from "./fragments/extension-form-rdv-medecin-en";

export const pagesEs = {
  contact: {
    hero: {
      surtitre: "Mantengámonos en contacto",
      titre: "Estamos",
      titreAccent: "a su disposición",
      description:
        "¿Tiene una pregunta sobre nuestros servicios, sus resultados de análisis o una campaña de salud? El equipo de HAM LABORATOIRE responde con profesionalismo y atención.",
      stats: {
        delai: "Tiempo de respuesta",
        lignes: "Líneas telefónicas",
        accueil: "Recepción y urgencias",
        ville: "Kinshasa, RDC",
      },
    },
    coordonnees: {
      surtitre: "Nuestros datos de contacto",
      titre: "Cómo contactarnos",
      sousTitre: "Acceso rápido, dirección completa y horarios de apertura",
      rdv: "Cita",
      rdvDesc: "Reservar en línea",
      resultats: "Resultados",
      resultatsDesc: "Consultar sus análisis",
      site: "Sitio web oficial",
      adresse: "Dirección",
      telephones: "Teléfonos",
      accueil: "Recepción",
      responsable: "Director",
      email: "Correo electrónico",
      horaires: "Horarios de apertura",
    },
    formulaire: {
      surtitre: "Escríbanos",
      titre: "Envíenos un mensaje",
      sousTitre: "Complete el formulario — responderemos en 24 a 48 horas laborables",
      nom: "Nombre completo *",
      email: "Correo electrónico *",
      telephone: "Teléfono",
      sujet: "Asunto de su solicitud *",
      message: "Mensaje *",
      consentement:
        "Acepto que mis datos sean procesados por HAM LABORATOIRE en relación con mi solicitud, de acuerdo con la política de privacidad. *",
      envoyer: "Enviar mensaje",
      envoi: "Enviando...",
      aideImmediate: "¿Necesita una respuesta inmediata?",
      aideTexte: "Llame directamente a nuestra recepción — estamos aquí para ayudarle.",
      horairesLabel: "Lun — Vie: 7:00 — 19:00",
      carteLegende: "Comuna MATETE, Kinshasa — Entrada Debonhomme Tercera Parcela",
    },
    sujets: {
      "rendez-vous": "Reserva de cita",
      resultats: "Resultados de análisis",
      campagnes: "Campañas y cribados",
      tarifs: "Tarifas y servicios",
      partenariat: "Asociación institucional",
      reclamation: "Reclamación",
      autre: "Otra solicitud",
    },
    horaires: {
      titre: "Horarios de apertura",
      lunVen: "Lunes — Viernes",
      lunVenHeures: "7:00 — 19:00",
      sam: "Sábado",
      samHeures: "7:00 — 14:00",
      dim: "Domingo",
      dimHeures: "Solo análisis de urgencia",
    },
    faq: {
      surtitre: "Ayuda e información",
      titre: "Preguntas frecuentes",
      sousTitre:
        "Encuentre rápidamente respuestas a sus preguntas sobre nuestros servicios, resultados y acceso al laboratorio.",
      aideTitre: "¿No encuentra su respuesta?",
      aideTexte: "Use el formulario de contacto o llámenos — nuestro equipo de recepción le orientará.",
      aideLien: "Contactar al equipo →",
      items: [
        {
          question: "¿Cómo obtengo mis resultados de análisis?",
          reponse:
            "Sus resultados están disponibles en el laboratorio o en línea a través de nuestro portal del paciente. Presente su ficha de muestra o contáctenos con su número de expediente.",
        },
        {
          question: "¿Necesito cita previa para los análisis?",
          reponse:
            "La mayoría de los análisis se pueden realizar sin cita previa. Para ciertos exámenes especializados, recomendamos reservar con antelación.",
        },
        {
          question: "¿Qué métodos de pago aceptan?",
          reponse:
            "Aceptamos efectivo, dinero móvil y transferencias bancarias. Pueden existir facilidades de pago para campañas de cribado.",
        },
        {
          question: "¿Dónde se encuentra HAM LABORATOIRE?",
          reponse:
            "259, Avenue Lumière, Entrada Debonhomme Tercera Parcela a la derecha, Comuna MATETE, Kinshasa, RDC. Consulte el mapa a continuación para las indicaciones.",
        },
      ],
    },
    cta: {
      titre: "¿Necesita una cita con urgencia?",
      description:
        "Reserve en línea o llámenos — nuestro equipo de recepción está disponible para orientarle.",
      boutonRdv: "Reservar una cita",
      boutonFormulaire: "Enviar un mensaje",
    },
  },

  rendezVous: {
    hero: {
      surtitre: "Reserva de citas en línea",
      titre: "Reserve su",
      titreAccent: "consulta",
      description:
        "Programe su visita al laboratorio en unos clics — análisis, consultas, imagenología o cribados. Confirmación instantánea y recordatorio por SMS o correo electrónico.",
      commencer: "Iniciar reserva",
      voirCoords: "Ir al formulario",
      stats: {
        rapide: "Reserva rápida",
        enLigne: "Disponible en línea",
        confirmation: "Confirmación instantánea",
        qualite: "Calidad certificada",
      },
    },
    reservation: {
      surtitre: "Reserva en línea",
      titre: "Programe su visita",
      sousTitre: "Complete los pasos a continuación — confirmación instantánea con número de referencia",
      securise: "Reserva segura",
      securiseTexte:
        "Sus datos están protegidos y se utilizan únicamente para gestionar su cita en el laboratorio.",
      aide: "¿Necesita ayuda?",
      aideTexte: "Nuestro equipo de recepción le orientará hacia el servicio adecuado.",
      horaires: "Horarios",
      adresse: "Dirección",
      voirCarte: "Ver mapa →",
    },
    form: {
      etapes: ["Servicio", "Fecha y hora", "Sus datos", "Doctor", "Confirmación"],
      typeTitre: "¿Qué tipo de servicio necesita?",
      typeSousTitre: "Seleccione el servicio que se adapte a sus necesidades",
      dateTitre: "Elija una fecha y franja horaria",
      dateLabel: "Fecha preferida",
      creneauLabel: "Franja horaria",
      pasCreneau: "No hay franjas horarias disponibles para esta fecha. Elija otra.",
      infosTitre: "Sus datos de contacto",
      infosSousTitre: "Para recibir la confirmación e instrucciones de preparación",
      nom: "Nombre completo *",
      email: "Correo electrónico *",
      telephone: "Teléfono *",
      naissance: "Fecha de nacimiento",
      premiereVisite: "Primera visita al laboratorio",
      motif: "Motivo o detalles (opcional)",
      consentement:
        "Acepto que mis datos sean procesados por HAM LABORATOIRE para la gestión de mi cita, de acuerdo con la política de privacidad. *",
      continuer: "Continuar",
      retour: "Volver",
      confirmer: "Confirmar cita",
      confirmationEnCours: "Confirmando...",
      succesTitre: "¡Cita registrada!",
      succesTexte:
        "Su solicitud ha sido enviada a nuestro equipo. Recibirá la confirmación por correo electrónico o SMS en breve.",
      reference: "Número de referencia",
      prestation: "Servicio",
      date: "Fecha",
      heure: "Hora",
      patient: "Paciente",
      medecinTitre: extensionFormRdvMedecinEn.medecinTitre,
      medecinSousTitre: extensionFormRdvMedecinEn.medecinSousTitre,
      sansPreference: extensionFormRdvMedecinEn.sansPreference,
      medecin: extensionFormRdvMedecinEn.medecin,
      autreRdv: "Reservar otra cita",
      sansRdv: "Posible sin cita previa",
    },
    types: {
      analyses: {
        titre: "Análisis de laboratorio",
        description: "Muestras de sangre, orina y biológicas — panel completo o análisis específicos.",
      },
      consultation: {
        titre: "Consulta médica",
        description:
          "Consulta general o especializada para interpretar sus resultados o orientar sus análisis.",
      },
      imagerie: {
        titre: "Imagenología médica",
        description: "Ecografía, radiología y exámenes de imagen con cita previa.",
      },
      depistage: {
        titre: "Cribado y campaña",
        description:
          "Participación en campañas de salud pública y cribados organizados por HAM LABORATOIRE.",
      },
      prelevement: {
        titre: "Toma de muestra especializada",
        description:
          "Muestras que requieren preparación o protocolo específico (ayuno, horario preciso).",
      },
    },
    parcours: {
      titre: "¿Cómo funciona?",
      sousTitre: "Cuatro pasos sencillos para confirmar su cita",
      etapes: [
        { titre: "Elija el servicio", description: "Seleccione el tipo de análisis o consulta que necesita." },
        { titre: "Fecha y franja horaria", description: "Elija la fecha y hora que le convengan según nuestra disponibilidad." },
        { titre: "Sus datos de contacto", description: "Introduzca su información para recibir la confirmación e instrucciones." },
        { titre: "Confirmación", description: "Envíe su solicitud — recibirá un número de referencia por correo electrónico o SMS." },
      ],
    },
    infos: {
      surtitre: "Antes de su visita",
      titre: "Información práctica",
      sousTitre: "Prepárese para su visita al laboratorio",
      items: [
        { titre: "Documentos a presentar", description: "Documento de identidad, receta médica si aplica, carnet de salud y resultados anteriores." },
        { titre: "Ayuno y preparación", description: "Algunos análisis requieren 8 a 12 horas de ayuno. Las instrucciones se proporcionarán en la confirmación." },
        { titre: "Horarios de recepción", description: "Lun — Vie: 7:00 — 19:00 · Sáb: 7:00 — 14:00 · Dom: solo análisis de urgencia." },
        { titre: "Acceso y aparcamiento", description: "259, Avenue Lumière, MATETE — Kinshasa. Fácil acceso, aparcamiento disponible en las proximidades." },
      ],
    },
    faq: {
      surtitre: "Preguntas frecuentes",
      titre: "Todo sobre las citas",
      sousTitre: "Cambios, cancelaciones, preparación — encuentre respuestas a las preguntas más frecuentes.",
      aideTitre: "¿Necesita asistencia?",
      aideTexte: "Nuestro equipo de recepción está disponible de lunes a sábado.",
      aideLien: "Página de contacto →",
      items: [
        {
          question: "¿Puedo acudir sin cita previa para análisis?",
          reponse:
            "Sí, la mayoría de los análisis de laboratorio se pueden realizar sin cita previa durante nuestro horario de apertura. Una franja reservada garantiza recepción prioritaria.",
        },
        {
          question: "¿Cómo cambio o cancelo mi cita?",
          reponse:
            "Contacte nuestra recepción al +243 819 191 643 o por correo a obb5lab@gmail.com indicando su número de referencia. Le rogamos avisar con al menos 24 horas de antelación.",
        },
        {
          question: "¿Recibiré un recordatorio antes de mi cita?",
          reponse:
            "Sí, se envía un recordatorio por SMS o correo electrónico 24 horas antes de su franja horaria, con instrucciones de preparación si es necesario.",
        },
        {
          question: "¿Las citas en línea son gratuitas?",
          reponse:
            "La reserva en línea es completamente gratuita. Solo se facturan los análisis y consultas realizados según nuestra tarifa.",
        },
      ],
    },
    cta: {
      titre: "¿Tiene una pregunta antes de reservar?",
      description: "Nuestro equipo de recepción está disponible para orientarle hacia el servicio adecuado.",
      boutonContact: "Contáctenos",
      boutonReserver: "Reservar ahora",
    },
  },

  services: {
    hero: {
      surtitre: "Centro de diagnóstico y análisis médicos",
      titre: "Servicios médicos",
      titreAccent: "de excelencia",
      description:
        "HAM LABORATOIRE ofrece una gama completa de servicios de diagnóstico — análisis de laboratorio, consultas, imagenología y cribados — con resultados fiables, plazos controlados y accesibilidad para todos.",
      decouvrir: "Descubrir nuestros servicios",
      voirPrestations: "Ver servicios",
      badge: "servicios · Laboratorio certificado ISO 9001:2015",
      stats: {
        analyses: "Tipos de análisis",
        delai: "Plazo medio de resultados",
        iso: "9001:2015 certificado",
        accueil: "Recepción de pacientes",
      },
    },
    categories: {
      tous: "Todos los servicios",
      diagnostic: "Diagnóstico",
      soins: "Atención y seguimiento",
      urgences: "Urgencias",
    },
    vedette: {
      badge: "Servicio destacado",
      decouvrir: "Descubrir el laboratorio",
      chiffres: [
        { libelle: "Tipos de análisis" },
        { libelle: "Plazo medio" },
        { libelle: "Certificación" },
      ],
    },
    grille: {
      surtitre: "Nuestra oferta",
      titre: "Todos nuestros servicios",
      sousTitre: "Filtre por categoría para encontrar el servicio que se adapte a sus necesidades",
      aucun: "No hay servicios en esta categoría.",
    },
    items: {
      laboratoire: {
        titre: "Análisis de laboratorio",
        description: "Núcleo de nuestra experiencia — análisis biológicos, hematológicos, bioquímicos y especializados con equipamiento de última generación.",
        badge: "Servicio destacado",
        points: ["Más de 200 parámetros analizados", "Controles de calidad rigurosos", "Resultados seguros en línea"],
      },
      consultations: {
        titre: "Consultas médicas",
        description: "Consultas generales y especializadas para orientar sus análisis e interpretar sus resultados con nuestros médicos cualificados.",
        points: ["Médicos generales y especialistas", "Interpretación de resultados", "Seguimiento personalizado del paciente"],
      },
      imagerie: {
        titre: "Imagenología médica",
        description: "Radiología, ecografía y exámenes de imagen para un diagnóstico visual preciso complementario a los análisis biológicos.",
        points: ["Ecografía y radiología", "Equipamiento digital", "Informes detallados"],
      },
      pharmacie: {
        titre: "Farmacia",
        description: "Dispensación de medicamentos de calidad y asesoramiento farmacéutico para apoyar su tratamiento tras el diagnóstico.",
        points: ["Medicamentos certificados", "Asesoramiento personalizado", "Disponibilidad optimizada"],
      },
      hospitalisation: {
        titre: "Hospitalización",
        description: "Atención hospitalaria con monitorización médica continua para pacientes que requieren seguimiento en profundidad.",
        points: ["Habitaciones confortables", "Monitorización médica 24/7", "Atención coordinada"],
      },
      urgences: {
        titre: "Urgencias",
        description: "Servicio de urgencias disponible para situaciones críticas que requieren atención inmediata y análisis prioritarios.",
        points: ["Disponibilidad ampliada", "Análisis de urgencia", "Equipo reactivo"],
      },
    },
    impact: {
      titre: "Excelencia en cifras",
      sousTitre: "Rendimiento medible que refleja nuestro compromiso con la calidad diagnóstica.",
      items: [
        { libelle: "Tipos de análisis", description: "Biología, hematología, microbiología, inmunología y más." },
        { libelle: "Pacientes / año", description: "Atención prestada en nuestro centro de MATETE." },
        { libelle: "Plazo medio", description: "Resultados disponibles rápidamente, a menudo el mismo día." },
        { libelle: "Certificación", description: "Procesos de calidad certificados y controles rigurosos." },
      ],
    },
    specialites: {
      titre: "Especialidades de análisis",
      sousTitre: "Un laboratorio completo que cubre todas las áreas analíticas esenciales para el diagnóstico médico",
    },
    parcours: {
      titre: "Su recorrido en HAM",
      sousTitre: "Un proceso sencillo, rápido y transparente — desde la recepción hasta sus resultados",
      etapes: [
        { titre: "Recepción y orientación", description: "Nuestro equipo de recepción le orienta y registra su expediente en minutos." },
        { titre: "Consulta", description: "Un médico prescribe los análisis adaptados a su situación clínica." },
        { titre: "Toma de muestra y análisis", description: "Toma de muestra segura y procesamiento en laboratorio con controles de calidad." },
        { titre: "Resultados fiables", description: "Entrega o acceso en línea a sus resultados certificados e interpretados." },
      ],
    },
    engagements: {
      titre: "¿Por qué elegir HAM LABORATOIRE?",
      sousTitre: "Compromisos concretos que marcan la diferencia",
      items: [
        { titre: "Fiabilidad certificada", description: "Resultados conformes a las normas ISO 9001:2015 y buenas prácticas de laboratorio." },
        { titre: "Rapidez controlada", description: "Plazos optimizados gracias a un flujo de trabajo organizado y equipamiento de alto rendimiento." },
        { titre: "Accesibilidad", description: "Tarifas asequibles que permiten incluso a los más desfavorecidos acceder a un diagnóstico de calidad." },
        { titre: "Equipo cualificado", description: "Biólogos, técnicos y médicos experimentados a su lado en cada paso." },
      ],
    },
    cta: {
      titre: "¿Listo para cuidar su salud?",
      description: "Reserve en línea o contáctenos — nuestro equipo está disponible para orientarle hacia los análisis adecuados.",
      boutonPrincipal: "Reservar una cita",
      boutonSecondaire: "Contáctenos",
    },
  },

  servicesLaboratoire: pagesServicesLaboratoireEn,

  campagnes: {
    hero: {
      surtitre: "Acciones de salud pública",
      titre: "Campañas y",
      titreAccent: "divulgación",
      description:
        "HAM LABORATOIRE lleva a cabo acciones de prevención, cribado y sensibilización para la población de Kinshasa. Descubra nuestras iniciativas en curso y participe en la salud de todos.",
      voirCampagnes: "Ver campañas",
      stats: {
        sensibilises: "Personas sensibilizadas / año",
        actions: "Acciones por año de media",
        satisfaction: "Tasa de satisfacción",
        iso: "Certificación de calidad",
      },
    },
    grille: {
      surtitre: "Todas nuestras acciones",
      titre: "Campañas y divulgación",
      sousTitre: "Filtre por categoría o explore nuestras iniciativas en curso",
      filtrerPublications: "Filtrar publicaciones",
      resultatSingulier: "resultado",
      resultatPluriel: "resultados",
      filtrerStatutAria: "Filtrar por estado",
      erreurChargement: "No se pudieron cargar las campañas. Inténtelo de nuevo.",
      aucunePublication: "No se encontraron publicaciones",
      modifierFiltres: "Intente cambiar los filtros para ver más resultados.",
      compteurSingulier: "publicación mostrada de",
      compteurPluriel: "publicaciones mostradas de",
      auTotal: "en total",
      filtres: {
        toutes: "Todas las categorías",
        tous: "Todos",
        depistage: "Cribado",
        vaccination: "Vacunación",
        sensibilisation: "Sensibilización",
        evenement: "Evento",
      },
      statuts: { en_cours: "En curso", a_venir: "Próximamente", terminee: "Finalizada" },
    },
    impact: {
      titre: "Nuestro impacto en cifras",
      sousTitre: "Campañas estructuradas, medibles y arraigadas en la realidad sanitaria congolesa.",
      items: [
        { libelle: "Cribados realizados", description: "VIH, malaria, diabetes y otras patologías específicas." },
        { libelle: "Vacunaciones administradas", description: "Gripe, hepatitis y campañas estacionales." },
        { libelle: "Socios institucionales", description: "ONG, empresas y estructuras de salud pública." },
        { libelle: "Comunas cubiertas", description: "Acciones comunitarias en Kinshasa y alrededores." },
      ],
    },
    parcours: {
      titre: "¿Cómo participar?",
      sousTitre: "Un proceso sencillo y accesible diseñado para facilitar su participación en nuestras acciones.",
      etapes: [
        { titre: "Descubrir", description: "Explore nuestras campañas en curso y consulte fechas, lugares y condiciones de participación." },
        { titre: "Inscribirse", description: "Reserve en línea, por teléfono o acuda directamente al laboratorio." },
        { titre: "Participar", description: "Benefíciese de cribados, vacunaciones o consultas en un entorno profesional y confidencial." },
        { titre: "Seguimiento", description: "Reciba sus resultados y, si es necesario, derivación a centros de atención adecuados." },
      ],
    },
    cta: {
      titre: "¿Organizar una campaña con HAM?",
      description: "Instituciones, empresas y asociaciones — construyamos juntos acciones de salud pública medibles.",
      bouton: "Contáctenos",
      boutonSecondaire: "Reservar una cita",
    },
    items: {
      "paludisme-2026": {
        titre: "Campaña de cribado de malaria",
        extrait: "Cribado rápido de malaria a tarifas reducidas — proteja a su familia.",
        description:
          "HAM LABORATOIRE lanza una campaña de cribado de malaria con tarifas preferenciales. Nuestros técnicos cualificados realizan una prueba diagnóstica rápida (TDR) con resultados fiables en menos de 30 minutos. Incluye sensibilización sobre prevención en zonas tropicales.",
        periode: "Del 1 de julio al 31 de agosto de 2026",
        lieu: "HAM Laboratoire — MATETE",
      },
      "depistage-vih-2026": {
        titre: "Cribado de VIH — gratuito y confidencial",
        extrait: "Prueba de VIH gratuita, resultados confidenciales y acompañamiento solidario.",
        description:
          "En el marco de nuestro compromiso de salud pública, HAM LABORATOIRE ofrece cribado de VIH gratuito y totalmente confidencial. Toma de muestra segura, resultados fiables y derivación a centros de atención cuando sea necesario.",
        periode: "Del 15 de julio al 15 de agosto de 2026",
        lieu: "HAM Laboratoire — MATETE",
      },
      "cancer-sein": {
        titre: "Cribado de cáncer de mama",
        extrait: "Octubre rosa — cribado precoz y sensibilización sobre cáncer de mama.",
        description:
          "Campaña anual de sensibilización y cribado de cáncer de mama. Exámenes clínicos, derivación para mamografía y consejos de prevención proporcionados por nuestro equipo médico.",
        periode: "Del 1 al 31 de mayo de 2026",
      },
      "vaccination-grippe": {
        titre: "Vacunación antigripal",
        extrait: "Protéjase contra la gripe estacional — vacunación disponible.",
        description:
          "Campaña de vacunación antigripal para poblaciones de riesgo y público general. Vacunas certificadas administradas por profesionales de salud cualificados.",
        periode: "Del 15 al 30 de abril de 2026",
      },
      "depistage-diabete": {
        titre: "Cribado de diabetes",
        extrait: "Glucemia, HbA1c y consejos nutricionales — detecte la diabetes a tiempo.",
        description:
          "Semana de cribado de diabetes con panel glucémico completo a precio reducido. Resultados interpretados por un médico con recomendaciones personalizadas.",
        periode: "Del 1 al 15 de junio de 2026",
      },
      "journee-cardiologie": {
        titre: "Jornada de cardiología",
        extrait: "Consultas y cribados cardiovasculares a tarifas preferenciales.",
        description:
          "En el Día Mundial del Corazón, HAM LABORATOIRE organiza una jornada de puertas abiertas dedicada a la salud cardiovascular: ECG, perfil lipídico y consultas especializadas.",
        periode: "29 de septiembre de 2026",
        lieu: "HAM Laboratoire — Kinshasa",
      },
      "hypertension-2026": {
        titre: "Semana de sensibilización sobre hipertensión",
        extrait: "Mediciones gratuitas de presión arterial y cribado de factores de riesgo.",
        description:
          "Campaña de prevención de la hipertensión: mediciones gratuitas, panel renal y consejos de estilo de vida de nuestros enfermeros y médicos.",
        periode: "Del 1 al 7 de septiembre de 2026",
      },
      "pub-equipements-2026": {
        titre: "Nuevo equipamiento de laboratorio",
        extrait: "HAM LABORATOIRE moderniza su parque analítico — fiabilidad reforzada.",
        description:
          "Anuncio institucional: HAM LABORATOIRE invierte en nuevos analizadores automáticos de última generación para resultados aún más rápidos y fiables.",
        periode: "Publicación permanente",
      },
    },
  },

  aPropos: {
    hero: {
      typeEtablissement: "CENTRO DE DIAGNÓSTICO Y ANÁLISIS MÉDICOS",
      badgeSlogan: "SU SALUD ES MI CARGA,",
      suiteSlogan: "LA FIABILIDAD ES NUESTRA PRIORIDAD",
    },
    mission: {
      titre: "Nuestra misión",
      texte:
        "HAM, con su laboratorio y personal cualificado, se compromete a cumplir las normas reglamentarias y las mejores prácticas, satisfaciendo los requisitos de los clientes en cuanto a resultados fiables a un coste asequible, permitiendo incluso a los más desfavorecidos recibir un diagnóstico adecuado.",
    },
    vision: {
      titre: "Nuestra visión",
      texte:
        "Convertirse en el centro de referencia en diagnóstico y análisis médicos en la República Democrática del Congo y África, reconocido por la excelencia, la accesibilidad y la fiabilidad de nuestros resultados.",
    },
    valeurs: {
      titre: "Nuestros valores",
      items: [
        { titre: "Fiabilidad", description: "Resultados precisos conformes a las normas internacionales de laboratorio." },
        { titre: "Accesibilidad", description: "Servicios de calidad a un coste asequible, abiertos a todos, incluidos los más desfavorecidos." },
        { titre: "Excelencia", description: "Personal cualificado, equipamiento moderno y adherencia a las mejores prácticas." },
        { titre: "Humanidad", description: "Su salud es nuestra carga — cada paciente es recibido con respeto y atención." },
      ],
    },
    histoire: {
      titre: "Nuestra historia",
      paragraphes: [
        "HAM LABORATOIRE es un centro de diagnóstico y análisis médicos con sede en Kinshasa, República Democrática del Congo. Desde su fundación, el establecimiento se ha comprometido a ofrecer servicios de salud fiables y accesibles a toda la población.",
        "Con su laboratorio equipado y un equipo de profesionales cualificados, HAM LABORATOIRE acompaña a médicos, pacientes y socios institucionales a lo largo del recorrido diagnóstico con rigor y atención.",
      ],
    },
    direction: {
      titre: "Nuestra dirección",
      sousTitre: "El director del centro",
      responsable: {
        nom: "Olivier Bokulu",
        fonction: "Director general — HAM Laboratoire",
        biographie:
          "Olivier Bokulu dirige HAM LABORATOIRE con la convicción de que la salud es una carga compartida y que los resultados fiables deben permanecer accesibles para todos. Bajo su liderazgo, el centro continúa su misión de excelencia en diagnóstico médico, colocando la calidad, la integridad y la accesibilidad de la atención en el centro de cada decisión.",
      },
    },
    equipe: {
      titre: "Nuestro equipo",
      sousTitre: "Profesionales cualificados a su servicio",
      membres: [
        { nom: "Equipo de Laboratorio", fonction: "Biólogos y técnicos" },
        { nom: "Equipo de Recepción", fonction: "Recepción y orientación" },
        { nom: "Equipo Médico", fonction: "Médicos y enfermeros" },
        { nom: "Equipo Administrativo", fonction: "Gestión y calidad" },
      ],
    },
    certifications: {
      titre: "Certificaciones y compromisos",
      items: [
        { titre: "ISO 9001:2015", description: "Sistema de gestión de calidad certificado." },
        { titre: "Buenas prácticas de laboratorio", description: "Cumplimiento de los requisitos normativos nacionales e internacionales." },
        { titre: "Fiabilidad de resultados", description: "Controles de calidad rigurosos en cada etapa analítica." },
      ],
    },
    impact: {
      titre: "HAM en cifras",
      sousTitre: "Una presencia consolidada en Kinshasa, al servicio de la salud pública congolesa.",
      items: [
        { libelle: "Pacientes / año", description: "Atenciones y análisis realizados cada año." },
        { libelle: "Tipos de análisis", description: "Plataforma técnica completa en biología médica." },
        { libelle: "Profesionales", description: "Biólogos, técnicos, médicos y personal cualificado." },
        { libelle: "Certificación", description: "Gestión de calidad certificada." },
      ],
    },
    bandeau: {
      slogan: "¡HAM LABORATOIRE, LA ELECCIÓN SEGURA PARA UNA MEJOR SALUD!",
      telephone: "Teléfono",
      siteWeb: "Sitio web",
    },
    cta: {
      titre: "Únase a miles de pacientes que confían en nosotros",
      description: "Reserve una cita o contáctenos — HAM LABORATOIRE le recibe en MATETE, Kinshasa.",
      boutonPrincipal: "Reservar una cita",
      boutonSecondaire: "Contáctenos",
    },
  },
} as const;

export type PagesEs = typeof pagesEs;
