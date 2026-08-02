import type { TraductionsSite } from "./types";
import { communPt } from "./commun/pt";
import { pagesPt } from "./pages/pt";
import { receptionPt } from "./reception/pt";
import { caissePt } from "./caisse/pt";

const pt: { translation: TraductionsSite } = {
  translation: {
    nav: {
      accueil: "Início",
      aPropos: "Sobre",
      services: "Serviços",
      campagnes: "Campanhas",
      contact: "Contacto",
      rendezVous: "Consultas",
    },
    common: {
      seConnecter: "Iniciar sessão",
      rechercher: "Pesquisar",
      fermer: "Fechar",
      voirTous: "Ver todos",
      voirToutes: "Ver todas",
      enSavoirPlus: "Saber mais",
      plusInfos: "Mais informações",
      liensRapides: "Links rápidos",
      nosServices: "Os nossos serviços",
      contact: "Contacto",
      mentionsLegales: "Aviso legal",
      confidentialite: "Política de privacidade",
      espacePersonnel: "Portal do pessoal",
      droitsReserves: "Todos os direitos reservados.",
      responsable: "Dir.",
      reseauSocial: "Rede social",
      ouvrirMenu: "Abrir menu",
      fermerMenu: "Fechar menu",
      navigationPrincipale: "Navegação principal",
      navigationMobile: "Navegação móvel",
    },
    hopital: {
      typeEtablissement: "Centro de Diagnóstico e Análises Médicas",
      slogan: "A SUA SAÚDE O NOSSO FARDO, A FIABILIDADE A NOSSA PREEMINÊNCIA",
      titreAccueil: "A sua saúde o nosso fardo,",
      titreAccueilSuite: "a fiabilidade a nossa preeminência",
      description:
        "Cuidados de qualidade, equipamentos de ponta e uma equipa médica ao seu serviço.",
    },
    accueil: {
      nosServices: "Os nossos serviços",
      prestationsMedicales: "Serviços médicos",
      sousTitreServices:
        "Diagnósticos, análises de laboratório e cuidados — uma oferta completa para a sua saúde",
      campagnesEnCours: "Campanhas em curso",
      santePublique: "Saúde pública",
      sousTitreCampagnes: "Rastreios, sensibilização e iniciativas de prevenção",
      nosServicesBtn: "Os nossos serviços",
      prendreRdv: "Marcar consulta",
      appMobile: "Aplicação móvel",
      appTitre: "A sua saúde, ao alcance da mão",
      appDescription:
        "Descarregue a nossa aplicação móvel para marcar consultas, consultar os seus resultados e gerir o seu registo médico.",
      appEnSavoirPlus: "Saber mais",
      googlePlay: "Google Play",
      appStore: "App Store",
      disponibleSur: "Disponível em",
      telechargerSur: "Descarregar em",
      stats: {
        medecins: "Médicos especialistas",
        departements: "Departamentos",
        patients: "Doentes tratados",
        certification: "Certificação de qualidade",
      },
      accesRapide: {
        rdv: { titre: "Marcar consulta", sousTitre: "Online 24/7" },
        resultats: { titre: "Resultados de exames", sousTitre: "Disponíveis online" },
        paiement: { titre: "Pagamento seguro", sousTitre: "Online" },
        support: { titre: "Apoio ao doente", sousTitre: "Assistência dedicada" },
      },
      services: {
        consultations: {
          titre: "Consultas",
          description:
            "Consultas gerais e especializadas com os nossos médicos experientes.",
        },
        laboratoire: {
          titre: "Laboratório",
          description:
            "Análises médicas completas com equipamentos de última geração.",
        },
        pharmacie: {
          titre: "Farmácia",
          description:
            "Medicamentos de qualidade e aconselhamento farmacêutico personalizado.",
        },
        hospitalisation: {
          titre: "Hospitalização",
          description:
            "Cuidados hospitalares com acompanhamento médico contínuo.",
        },
        urgences: {
          titre: "Urgências",
          description:
            "Serviço de urgências 24/7 para situações críticas.",
        },
        imagerie: {
          titre: "Imagiologia médica",
          description:
            "Radiologia, ecografia e ressonância magnética para um diagnóstico preciso.",
        },
      },
    },
    footer: {
      consultations: "Consultas",
      laboratoire: "Laboratório",
      pharmacie: "Farmácia",
      urgences: "Urgências",
      applicationMobile: "Aplicação móvel",
    },
    recherche: {
      titre: "Pesquisar no site",
      placeholder: "Serviços, campanhas, páginas…",
      hint: "Escreva pelo menos 2 caracteres para pesquisar.",
      suggestions: "Sugestões",
      aucunResultat: "Nenhum resultado para esta pesquisa.",
      aucunResultatTitre: "Nenhum resultado encontrado",
      aucunResultatPour: "Nenhum resultado para \"{{query}}\"",
      aucunResultatConseil:
        "Tente outras palavras-chave, verifique a ortografia ou explore as nossas páginas principais.",
      compteur: "{{count}} resultado(s)",
      navigation: "↑↓ navegar · Enter abrir · Esc fechar",
      raccourci: "Ctrl+K para pesquisar",
      categories: {
        page: "Página",
        service: "Serviço",
        campagne: "Campanha",
        acces: "Acesso rápido",
        faq: "FAQ",
        prestation: "Tipo de serviço",
      },
      pages: {
        "/": "Início",
        "/a-propos": "Sobre o HAM Laboratoire",
        "/services": "Os nossos serviços médicos",
        "/campagnes": "Campanhas de saúde",
        "/contact": "Contacte-nos",
        "/rendez-vous": "Marcar consulta online",
        "/resultats": "Consultar os seus resultados de exames",
        "/connexion": "Portal do pessoal — Iniciar sessão",
        "/application": "Aplicação móvel HAM",
      },
    },
    pages: pagesPt,
    reception: receptionPt,
    caisse: caissePt,
    ...communPt,
  },
};

export default pt;
