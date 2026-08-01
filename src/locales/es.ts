import type { TraductionsSite } from "./types";
import { communEs } from "./commun/es";
import { pagesEs } from "./pages/es";
import { receptionEs } from "./reception/es";

const es: { translation: TraductionsSite } = {
  translation: {
    nav: {
      accueil: "Inicio",
      aPropos: "Acerca de",
      services: "Servicios",
      campagnes: "Campañas",
      contact: "Contacto",
      rendezVous: "Citas",
    },
    common: {
      seConnecter: "Iniciar sesión",
      rechercher: "Buscar",
      fermer: "Cerrar",
      voirTous: "Ver todos",
      voirToutes: "Ver todas",
      enSavoirPlus: "Saber más",
      plusInfos: "Más información",
      liensRapides: "Enlaces rápidos",
      nosServices: "Nuestros servicios",
      contact: "Contacto",
      mentionsLegales: "Aviso legal",
      confidentialite: "Política de privacidad",
      espacePersonnel: "Portal del personal",
      droitsReserves: "Todos los derechos reservados.",
      responsable: "Dir.",
      reseauSocial: "Red social",
      ouvrirMenu: "Abrir menú",
      fermerMenu: "Cerrar menú",
      navigationPrincipale: "Navegación principal",
      navigationMobile: "Navegación móvil",
    },
    hopital: {
      typeEtablissement: "Centro de Diagnóstico y Análisis Médicos",
      slogan: "SU SALUD MI CARGA, LA FIABILIDAD NUESTRA PREEMINENCIA",
      titreAccueil: "Su salud mi carga,",
      titreAccueilSuite: "la fiabilidad nuestra preeminencia",
      description:
        "Atención de calidad, equipos de última generación y un equipo médico a su servicio.",
    },
    accueil: {
      nosServices: "Nuestros servicios",
      prestationsMedicales: "Servicios médicos",
      sousTitreServices:
        "Diagnósticos, análisis de laboratorio y atención — una oferta completa para su salud",
      campagnesEnCours: "Campañas en curso",
      santePublique: "Salud pública",
      sousTitreCampagnes: "Detección, sensibilización e iniciativas de prevención",
      nosServicesBtn: "Nuestros servicios",
      prendreRdv: "Reservar cita",
      appMobile: "Aplicación móvil",
      appTitre: "Su salud, al alcance de su mano",
      appDescription:
        "Descargue nuestra aplicación móvil para reservar citas, consultar sus resultados y gestionar su historial médico.",
      appEnSavoirPlus: "Saber más",
      googlePlay: "Google Play",
      appStore: "App Store",
      disponibleSur: "Disponible en",
      telechargerSur: "Descargar en",
      stats: {
        medecins: "Médicos especialistas",
        departements: "Departamentos",
        patients: "Pacientes atendidos",
        certification: "Certificación de calidad",
      },
      accesRapide: {
        rdv: { titre: "Reservar cita", sousTitre: "En línea 24/7" },
        resultats: { titre: "Resultados de pruebas", sousTitre: "Disponibles en línea" },
        paiement: { titre: "Pago seguro", sousTitre: "En línea" },
        support: { titre: "Atención al paciente", sousTitre: "Asistencia dedicada" },
      },
      services: {
        consultations: {
          titre: "Consultas",
          description:
            "Consultas generales y especializadas con nuestros médicos experimentados.",
        },
        laboratoire: {
          titre: "Laboratorio",
          description:
            "Análisis médicos completos con equipos de última generación.",
        },
        pharmacie: {
          titre: "Farmacia",
          description:
            "Medicamentos de calidad y asesoramiento farmacéutico personalizado.",
        },
        hospitalisation: {
          titre: "Hospitalización",
          description:
            "Atención hospitalaria con seguimiento médico continuo.",
        },
        urgences: {
          titre: "Urgencias",
          description:
            "Servicio de urgencias 24/7 para situaciones críticas.",
        },
        imagerie: {
          titre: "Imagen médica",
          description:
            "Radiología, ecografía y resonancia magnética para un diagnóstico preciso.",
        },
      },
    },
    footer: {
      consultations: "Consultas",
      laboratoire: "Laboratorio",
      pharmacie: "Farmacia",
      urgences: "Urgencias",
      applicationMobile: "Aplicación móvil",
    },
    recherche: {
      titre: "Buscar en el sitio",
      placeholder: "Servicios, campañas, páginas…",
      hint: "Escriba al menos 2 caracteres para buscar.",
      suggestions: "Sugerencias",
      aucunResultat: "No hay resultados para esta búsqueda.",
      aucunResultatTitre: "No se encontraron resultados",
      aucunResultatPour: "No hay resultados para \"{{query}}\"",
      aucunResultatConseil:
        "Pruebe con otras palabras clave, revise la ortografía o explore nuestras páginas principales.",
      compteur: "{{count}} resultado(s)",
      navigation: "↑↓ navegar · Enter abrir · Esc cerrar",
      raccourci: "Ctrl+K para buscar",
      categories: {
        page: "Página",
        service: "Servicio",
        campagne: "Campaña",
        acces: "Acceso rápido",
        faq: "Preguntas frecuentes",
        prestation: "Tipo de servicio",
      },
      pages: {
        "/": "Inicio",
        "/a-propos": "Acerca de HAM Laboratoire",
        "/services": "Nuestros servicios médicos",
        "/campagnes": "Campañas de salud",
        "/contact": "Contáctenos",
        "/rendez-vous": "Reservar cita en línea",
        "/resultats": "Consultar sus resultados de pruebas",
        "/connexion": "Portal del personal — Iniciar sesión",
        "/application": "Aplicación móvil HAM",
      },
    },
    pages: pagesEs,
    reception: receptionEs,
    ...communEs,
  },
};

export default es;
