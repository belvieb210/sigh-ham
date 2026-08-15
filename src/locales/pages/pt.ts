/** Traduções PT — conteúdo das páginas (exceto início já em locales/pt.ts) */

import { pagesServicesLaboratoireEn } from "./fragments/services-laboratoire-en";
import { extensionFormRdvMedecinEn } from "./fragments/extension-form-rdv-medecin-en";

export const pagesPt = {
  contact: {
    hero: {
      surtitre: "Mantenha contacto",
      titre: "Estamos",
      titreAccent: "aqui para si",
      description:
        "Tem uma pergunta sobre os nossos serviços, os seus resultados de exames ou uma campanha de saúde? A equipa do HAM LABORATOIRE responde com profissionalismo e cuidado.",
      stats: {
        delai: "Tempo de resposta",
        lignes: "Linhas telefónicas",
        accueil: "Receção e urgências",
        ville: "Kinshasa, RDC",
      },
    },
    coordonnees: {
      surtitre: "Os nossos contactos",
      titre: "Como contactar-nos",
      sousTitre: "Acesso rápido, morada completa e horários de funcionamento",
      rdv: "Consulta",
      rdvDesc: "Marcar online",
      resultats: "Resultados",
      resultatsDesc: "Consultar os seus exames",
      site: "Site oficial",
      adresse: "Morada",
      telephones: "Telefones",
      accueil: "Receção",
      responsable: "Diretor",
      email: "E-mail",
      horaires: "Horários de funcionamento",
    },
    formulaire: {
      surtitre: "Escreva-nos",
      titre: "Envie-nos uma mensagem",
      sousTitre: "Preencha o formulário — responderemos em 24 a 48 horas úteis",
      nom: "Nome completo *",
      email: "E-mail *",
      telephone: "Telefone",
      sujet: "Assunto do seu pedido *",
      message: "Mensagem *",
      consentement:
        "Concordo que os meus dados sejam processados pelo HAM LABORATOIRE no âmbito do meu pedido, de acordo com a política de privacidade. *",
      envoyer: "Enviar mensagem",
      envoi: "A enviar...",
      aideImmediate: "Precisa de uma resposta imediata?",
      aideTexte: "Ligue diretamente para a nossa receção — estamos aqui para ajudar.",
      horairesLabel: "Seg — Sex: 7h — 19h",
      carteLegende: "Comuna MATETE, Kinshasa — Entrada Debonhomme Terceira Parcela",
    },
    sujets: {
      "rendez-vous": "Marcação de consulta",
      resultats: "Resultados de exames",
      campagnes: "Campanhas e rastreios",
      tarifs: "Tarifas e serviços",
      partenariat: "Parceria institucional",
      reclamation: "Reclamação",
      autre: "Outro pedido",
    },
    horaires: {
      titre: "Horários de funcionamento",
      lunVen: "Segunda — Sexta",
      lunVenHeures: "7h00 — 19h00",
      sam: "Sábado",
      samHeures: "7h00 — 14h00",
      dim: "Domingo",
      dimHeures: "Apenas exames de urgência",
    },
    faq: {
      surtitre: "Ajuda e informações",
      titre: "Perguntas frequentes",
      sousTitre:
        "Encontre rapidamente respostas às suas perguntas sobre os nossos serviços, resultados e acesso ao laboratório.",
      aideTitre: "Não encontra a sua resposta?",
      aideTexte: "Use o formulário de contacto ou ligue-nos — a nossa equipa de receção irá orientá-lo.",
      aideLien: "Contactar a equipa →",
      items: [
        {
          question: "Como obtenho os meus resultados de exames?",
          reponse:
            "Os seus resultados estão disponíveis no laboratório ou online através do nosso portal do paciente. Apresente a sua ficha de amostra ou contacte-nos com o número do seu processo.",
        },
        {
          question: "Preciso de marcação para os exames?",
          reponse:
            "A maioria dos exames pode ser realizada sem marcação. Para certos exames especializados, recomendamos reservar com antecedência.",
        },
        {
          question: "Que métodos de pagamento aceitam?",
          reponse:
            "Aceitamos dinheiro, mobile money e transferências bancárias. Podem existir facilidades de pagamento para campanhas de rastreio.",
        },
        {
          question: "Onde se encontra o HAM LABORATOIRE?",
          reponse:
            "259, Avenue Lumière, Entrada Debonhomme Terceira Parcela à direita, Comuna MATETE, Kinshasa, RDC. Consulte o mapa abaixo para indicações.",
        },
      ],
    },
    cta: {
      titre: "Precisa de uma consulta com urgência?",
      description:
        "Marque online ou ligue-nos — a nossa equipa de receção está disponível para orientá-lo.",
      boutonRdv: "Marcar uma consulta",
      boutonFormulaire: "Enviar uma mensagem",
    },
  },

  rendezVous: {
    hero: {
      surtitre: "Marcação de consultas online",
      titre: "Marque a sua",
      titreAccent: "consulta",
      description:
        "Agende a sua visita ao laboratório em poucos cliques — exames, consultas, imagiologia ou rastreios. Confirmação instantânea e lembrete por SMS ou e-mail.",
      commencer: "Iniciar marcação",
      voirCoords: "Ir para o formulário",
      stats: {
        rapide: "Marcação rápida",
        enLigne: "Disponível online",
        confirmation: "Confirmação instantânea",
        qualite: "Qualidade certificada",
      },
    },
    reservation: {
      surtitre: "Marcação online",
      titre: "Agende a sua visita",
      sousTitre: "Complete os passos abaixo — confirmação instantânea com número de referência",
      securise: "Marcação segura",
      securiseTexte:
        "Os seus dados estão protegidos e são utilizados apenas para gerir a sua consulta no laboratório.",
      aide: "Precisa de ajuda?",
      aideTexte: "A nossa equipa de receção irá orientá-lo para o serviço adequado.",
      horaires: "Horários",
      adresse: "Morada",
      voirCarte: "Ver mapa →",
    },
    form: {
      etapes: ["Serviço", "Data e hora", "Os seus dados", "Doctor", "Confirmação"],
      typeTitre: "Que tipo de serviço precisa?",
      typeSousTitre: "Selecione o serviço que corresponde às suas necessidades",
      dateTitre: "Escolha uma data e horário",
      dateLabel: "Data preferida",
      creneauLabel: "Horário",
      pasCreneau: "Não há horários disponíveis para esta data. Escolha outra.",
      infosTitre: "Os seus contactos",
      infosSousTitre: "Para receber confirmação e instruções de preparação",
      nom: "Nome completo *",
      email: "E-mail *",
      telephone: "Telefone *",
      naissance: "Data de nascimento",
      premiereVisite: "Primeira visita ao laboratório",
      motif: "Motivo ou detalhes (opcional)",
      consentement:
        "Concordo que os meus dados sejam processados pelo HAM LABORATOIRE para a gestão da minha consulta, de acordo com a política de privacidade. *",
      continuer: "Continuar",
      retour: "Voltar",
      confirmer: "Confirmar consulta",
      confirmationEnCours: "A confirmar...",
      succesTitre: "Consulta registada!",
      succesTexte:
        "O seu pedido foi enviado à nossa equipa. Receberá confirmação por e-mail ou SMS em breve.",
      reference: "Número de referência",
      prestation: "Serviço",
      date: "Data",
      heure: "Hora",
      patient: "Paciente",
      medecinTitre: extensionFormRdvMedecinEn.medecinTitre,
      medecinSousTitre: extensionFormRdvMedecinEn.medecinSousTitre,
      sansPreference: extensionFormRdvMedecinEn.sansPreference,
      medecin: extensionFormRdvMedecinEn.medecin,
      autreRdv: "Marcar outra consulta",
      sansRdv: "Sem marcação possível",
    },
    types: {
      analyses: {
        titre: "Exames de laboratório",
        description: "Amostras de sangue, urina e biológicas — painel completo ou exames específicos.",
      },
      consultation: {
        titre: "Consulta médica",
        description:
          "Consulta geral ou especializada para interpretar os seus resultados ou orientar os seus exames.",
      },
      imagerie: {
        titre: "Imagiologia médica",
        description: "Ecografia, radiologia e exames de imagem com marcação.",
      },
      depistage: {
        titre: "Rastreio e campanha",
        description:
          "Participação em campanhas de saúde pública e rastreios organizados pelo HAM LABORATOIRE.",
      },
      prelevement: {
        titre: "Colheita especializada",
        description:
          "Amostras que requerem preparação ou protocolo específico (jejum, horário preciso).",
      },
    },
    parcours: {
      titre: "Como funciona?",
      sousTitre: "Quatro passos simples para confirmar a sua consulta",
      etapes: [
        { titre: "Escolher o serviço", description: "Selecione o tipo de exame ou consulta de que precisa." },
        { titre: "Data e horário", description: "Escolha a data e hora que lhe convêm a partir da nossa disponibilidade." },
        { titre: "Os seus contactos", description: "Introduza as suas informações para receber confirmação e instruções." },
        { titre: "Confirmação", description: "Envie o seu pedido — receberá um número de referência por e-mail ou SMS." },
      ],
    },
    infos: {
      surtitre: "Antes da sua visita",
      titre: "Informações práticas",
      sousTitre: "Prepare-se para a sua visita ao laboratório",
      items: [
        { titre: "Documentos a trazer", description: "Cartão de identidade, receita médica se aplicável, caderneta de saúde e resultados anteriores." },
        { titre: "Jejum e preparação", description: "Alguns exames requerem 8 a 12 horas de jejum. As instruções serão fornecidas na confirmação." },
        { titre: "Horários de receção", description: "Seg — Sex: 7h — 19h · Sáb: 7h — 14h · Dom: apenas exames de urgência." },
        { titre: "Acesso e estacionamento", description: "259, Avenue Lumière, MATETE — Kinshasa. Fácil acesso, estacionamento disponível nas proximidades." },
      ],
    },
    faq: {
      surtitre: "Perguntas frequentes",
      titre: "Tudo sobre consultas",
      sousTitre: "Alterações, cancelamentos, preparação — encontre respostas às perguntas mais comuns.",
      aideTitre: "Precisa de assistência?",
      aideTexte: "A nossa equipa de receção está disponível de segunda a sábado.",
      aideLien: "Página de contacto →",
      items: [
        {
          question: "Posso ir sem marcação para exames?",
          reponse:
            "Sim, a maioria dos exames de laboratório pode ser realizada sem marcação durante o nosso horário de funcionamento. Um horário reservado garante receção prioritária.",
        },
        {
          question: "Como altero ou cancelo a minha consulta?",
          reponse:
            "Contacte a nossa receção em +243 819 191 643 ou por e-mail em obb5lab@gmail.com indicando o seu número de referência. Pedimos que nos avise com pelo menos 24 horas de antecedência.",
        },
        {
          question: "Receberei um lembrete antes da minha consulta?",
          reponse:
            "Sim, é enviado um lembrete por SMS ou e-mail 24 horas antes do seu horário, com instruções de preparação se necessário.",
        },
        {
          question: "As consultas online são gratuitas?",
          reponse:
            "A marcação online é completamente gratuita. Apenas os exames e consultas realizados são faturados de acordo com a nossa tabela de preços.",
        },
      ],
    },
    cta: {
      titre: "Tem uma pergunta antes de marcar?",
      description: "A nossa equipa de receção está disponível para orientá-lo para o serviço adequado.",
      boutonContact: "Contacte-nos",
      boutonReserver: "Marcar agora",
    },
  },

  services: {
    hero: {
      surtitre: "Centro de diagnóstico e exames médicos",
      titre: "Serviços médicos",
      titreAccent: "de excelência",
      description:
        "O HAM LABORATOIRE oferece uma gama completa de serviços de diagnóstico — exames de laboratório, consultas, imagiologia e rastreios — com resultados fiáveis, prazos controlados e acessibilidade para todos.",
      decouvrir: "Descobrir os nossos serviços",
      voirPrestations: "Ver serviços",
      badge: "serviços · Laboratório certificado ISO 9001:2015",
      stats: {
        analyses: "Tipos de exames",
        delai: "Prazo médio de resultados",
        iso: "9001:2015 certificado",
        accueil: "Receção de pacientes",
      },
    },
    categories: {
      tous: "Todos os serviços",
      diagnostic: "Diagnóstico",
      soins: "Cuidados e acompanhamento",
      urgences: "Urgências",
    },
    vedette: {
      badge: "Serviço em destaque",
      decouvrir: "Descobrir o laboratório",
      chiffres: [
        { libelle: "Tipos de exames" },
        { libelle: "Prazo médio" },
        { libelle: "Certificação" },
      ],
    },
    grille: {
      surtitre: "A nossa oferta",
      titre: "Todos os nossos serviços",
      sousTitre: "Filtre por categoria para encontrar o serviço adequado às suas necessidades",
      aucun: "Não há serviços nesta categoria.",
    },
    items: {
      laboratoire: {
        titre: "Exames de laboratório",
        description: "Núcleo da nossa expertise — exames biológicos, hematológicos, bioquímicos e especializados com equipamento de última geração.",
        badge: "Serviço em destaque",
        points: ["Mais de 200 parâmetros analisados", "Controlos de qualidade rigorosos", "Resultados seguros online"],
      },
      consultations: {
        titre: "Consultas médicas",
        description: "Consultas gerais e especializadas para orientar os seus exames e interpretar os seus resultados com os nossos médicos qualificados.",
        points: ["Médicos generalistas e especialistas", "Interpretação de resultados", "Acompanhamento personalizado do paciente"],
      },
      imagerie: {
        titre: "Imagiologia médica",
        description: "Radiologia, ecografia e exames de imagem para diagnóstico visual preciso complementar aos exames biológicos.",
        points: ["Ecografia e radiologia", "Equipamento digital", "Relatórios detalhados"],
      },
      pharmacie: {
        titre: "Farmácia",
        description: "Dispensação de medicamentos de qualidade e aconselhamento farmacêutico para apoiar o seu tratamento após o diagnóstico.",
        points: ["Medicamentos certificados", "Aconselhamento personalizado", "Disponibilidade otimizada"],
      },
      hospitalisation: {
        titre: "Hospitalização",
        description: "Cuidados hospitalares com monitorização médica contínua para pacientes que requerem acompanhamento aprofundado.",
        points: ["Quartos confortáveis", "Monitorização médica 24/7", "Cuidados coordenados"],
      },
      urgences: {
        titre: "Urgências",
        description: "Serviço de urgências disponível para situações críticas que requerem cuidados imediatos e exames prioritários.",
        points: ["Disponibilidade alargada", "Exames de urgência", "Equipa reativa"],
      },
    },
    impact: {
      titre: "Excelência em números",
      sousTitre: "Desempenho mensurável que reflete o nosso compromisso com a qualidade diagnóstica.",
      items: [
        { libelle: "Tipos de exames", description: "Biologia, hematologia, microbiologia, imunologia e mais." },
        { libelle: "Pacientes / ano", description: "Cuidados prestados no nosso centro de MATETE." },
        { libelle: "Prazo médio", description: "Resultados disponíveis rapidamente, muitas vezes no mesmo dia." },
        { libelle: "Certificação", description: "Processos de qualidade certificados e controlos rigorosos." },
      ],
    },
    specialites: {
      titre: "Especialidades de exames",
      sousTitre: "Um laboratório completo que cobre todas as áreas analíticas essenciais para o diagnóstico médico",
    },
    parcours: {
      titre: "O seu percurso no HAM",
      sousTitre: "Um processo simples, rápido e transparente — da receção aos seus resultados",
      etapes: [
        { titre: "Receção e orientação", description: "A nossa equipa de receção orienta-o e regista o seu processo em minutos." },
        { titre: "Consulta", description: "Um médico prescreve os exames adequados à sua situação clínica." },
        { titre: "Colheita e exames", description: "Colheita segura e processamento laboratorial com controlos de qualidade." },
        { titre: "Resultados fiáveis", description: "Entrega ou acesso online aos seus resultados certificados e interpretados." },
      ],
    },
    engagements: {
      titre: "Porquê escolher o HAM LABORATOIRE?",
      sousTitre: "Compromissos concretos que fazem a diferença",
      items: [
        { titre: "Fiabilidade certificada", description: "Resultados conformes às normas ISO 9001:2015 e boas práticas de laboratório." },
        { titre: "Rapidez controlada", description: "Prazos otimizados graças a um fluxo de trabalho organizado e equipamento de alto desempenho." },
        { titre: "Acessibilidade", description: "Tarifas acessíveis que permitem mesmo aos mais desfavorecidos aceder a um diagnóstico de qualidade." },
        { titre: "Equipa qualificada", description: "Biólogos, técnicos e médicos experientes ao seu lado em cada passo." },
      ],
    },
    cta: {
      titre: "Pronto para cuidar da sua saúde?",
      description: "Marque online ou contacte-nos — a nossa equipa está disponível para orientá-lo para os exames adequados.",
      boutonPrincipal: "Marcar uma consulta",
      boutonSecondaire: "Contacte-nos",
    },
  },

  servicesLaboratoire: pagesServicesLaboratoireEn,

  campagnes: {
    hero: {
      surtitre: "Ações de saúde pública",
      titre: "Campanhas e",
      titreAccent: "divulgação",
      description:
        "O HAM LABORATOIRE realiza ações de prevenção, rastreio e sensibilização para a população de Kinshasa. Descubra as nossas iniciativas em curso e participe na saúde de todos.",
      voirCampagnes: "Ver campanhas",
      stats: {
        sensibilises: "Pessoas sensibilizadas / ano",
        actions: "Ações por ano em média",
        satisfaction: "Taxa de satisfação",
        iso: "Certificação de qualidade",
      },
    },
    grille: {
      surtitre: "Todas as nossas ações",
      titre: "Campanhas e divulgação",
      sousTitre: "Filtre por categoria ou explore as nossas iniciativas em curso",
      filtrerPublications: "Filtrar publicações",
      resultatSingulier: "resultado",
      resultatPluriel: "resultados",
      filtrerStatutAria: "Filtrar por estado",
      erreurChargement: "Não foi possível carregar as campanhas. Tente novamente.",
      aucunePublication: "Nenhuma publicação encontrada",
      modifierFiltres: "Tente alterar os filtros para ver mais resultados.",
      compteurSingulier: "publicação mostrada de",
      compteurPluriel: "publicações mostradas de",
      auTotal: "no total",
      filtres: {
        toutes: "Todas as categorias",
        tous: "Todos",
        depistage: "Rastreio",
        vaccination: "Vacinação",
        sensibilisation: "Sensibilização",
        evenement: "Evento",
      },
      statuts: { en_cours: "Em curso", a_venir: "Próximamente", terminee: "Concluída" },
    },
    impact: {
      titre: "O nosso impacto em números",
      sousTitre: "Campanhas estruturadas, mensuráveis e enraizadas na realidade sanitária congolesa.",
      items: [
        { libelle: "Rastreios realizados", description: "VIH, malária, diabetes e outras patologias específicas." },
        { libelle: "Vacinações administradas", description: "Gripe, hepatites e campanhas sazonais." },
        { libelle: "Parceiros institucionais", description: "ONGs, empresas e estruturas de saúde pública." },
        { libelle: "Comunas cobertas", description: "Ações comunitárias em Kinshasa e arredores." },
      ],
    },
    parcours: {
      titre: "Como participar?",
      sousTitre: "Um processo simples e acessível concebido para facilitar a sua participação nas nossas ações.",
      etapes: [
        { titre: "Descobrir", description: "Explore as nossas campanhas em curso e consulte datas, locais e condições de participação." },
        { titre: "Inscrever-se", description: "Marque online, por telefone ou venha diretamente ao laboratório." },
        { titre: "Participar", description: "Beneficie de rastreios, vacinações ou consultas num ambiente profissional e confidencial." },
        { titre: "Acompanhamento", description: "Receba os seus resultados e, se necessário, encaminhamento para estruturas de cuidados adequadas." },
      ],
    },
    cta: {
      titre: "Organizar uma campanha com o HAM?",
      description: "Instituições, empresas e associações — construamos juntos ações de saúde pública mensuráveis.",
      bouton: "Contacte-nos",
      boutonSecondaire: "Marcar uma consulta",
    },
    items: {
      "paludisme-2026": {
        titre: "Campanha de rastreio de malária",
        extrait: "Rastreio rápido de malária a tarifas reduzidas — proteja a sua família.",
        description:
          "O HAM LABORATOIRE lança uma campanha de rastreio de malária com tarifas preferenciais. Os nossos técnicos qualificados realizam um teste de diagnóstico rápido (TDR) com resultados fiáveis em menos de 30 minutos. Inclui sensibilização sobre prevenção em zonas tropicais.",
        periode: "De 1 de julho a 31 de agosto de 2026",
        lieu: "HAM Laboratoire — MATETE",
      },
      "depistage-vih-2026": {
        titre: "Rastreio de VIH — gratuito e confidencial",
        extrait: "Teste de VIH gratuito, resultados confidenciais e acompanhamento solidário.",
        description:
          "No âmbito do nosso compromisso de saúde pública, o HAM LABORATOIRE oferece rastreio de VIH gratuito e totalmente confidencial. Colheita segura, resultados fiáveis e encaminhamento quando necessário.",
        periode: "De 15 de julho a 15 de agosto de 2026",
        lieu: "HAM Laboratoire — MATETE",
      },
      "cancer-sein": {
        titre: "Rastreio de cancro da mama",
        extrait: "Outubro rosa — rastreio precoce e sensibilização sobre cancro da mama.",
        description:
          "Campanha anual de sensibilização e rastreio de cancro da mama. Exames clínicos, encaminhamento para mamografia e conselhos de prevenção fornecidos pela nossa equipa médica.",
        periode: "De 1 a 31 de maio de 2026",
      },
      "vaccination-grippe": {
        titre: "Vacinação antigripal",
        extrait: "Proteja-se contra a gripe sazonal — vacinação disponível.",
        description:
          "Campanha de vacinação antigripal para populações de risco e público geral. Vacinas certificadas administradas por profissionais de saúde qualificados.",
        periode: "De 15 a 30 de abril de 2026",
      },
      "depistage-diabete": {
        titre: "Rastreio de diabetes",
        extrait: "Glicemia, HbA1c e conselhos nutricionais — detete a diabetes cedo.",
        description:
          "Semana de rastreio de diabetes com painel glicémico completo a preço reduzido. Resultados interpretados por um médico com recomendações personalizadas.",
        periode: "De 1 a 15 de junho de 2026",
      },
      "journee-cardiologie": {
        titre: "Dia de cardiologia",
        extrait: "Consultas e rastreios cardiovasculares a tarifas preferenciais.",
        description:
          "No Dia Mundial do Coração, o HAM LABORATOIRE organiza um dia de portas abertas dedicado à saúde cardiovascular: ECG, painel lipídico e consultas especializadas.",
        periode: "29 de setembro de 2026",
        lieu: "HAM Laboratoire — Kinshasa",
      },
      "hypertension-2026": {
        titre: "Semana de sensibilização sobre hipertensão",
        extrait: "Medições gratuitas de tensão arterial e rastreio de fatores de risco.",
        description:
          "Campanha de prevenção da hipertensão: medições gratuitas, painel renal e conselhos de estilo de vida dos nossos enfermeiros e médicos.",
        periode: "De 1 a 7 de setembro de 2026",
      },
      "pub-equipements-2026": {
        titre: "Novo equipamento de laboratório",
        extrait: "O HAM LABORATOIRE moderniza o seu parque analítico — fiabilidade reforçada.",
        description:
          "Anúncio institucional: o HAM LABORATOIRE investe em novos analisadores automáticos de última geração para resultados ainda mais rápidos e fiáveis.",
        periode: "Publicação permanente",
      },
    },
  },

  aPropos: {
    hero: {
      typeEtablissement: "CENTRO DE DIAGNÓSTICO E EXAMES MÉDICOS",
      badgeSlogan: "A SUA SAÚDE É O MEU FARDO,",
      suiteSlogan: "A FIABILIDADE É A NOSSA PRIORIDADE",
    },
    mission: {
      titre: "A nossa missão",
      texte:
        "O HAM, com o seu laboratório e pessoal qualificado, compromete-se a cumprir as normas regulamentares e as melhores práticas, satisfazendo os requisitos dos clientes em termos de resultados fiáveis a um custo acessível, permitindo mesmo aos mais desfavorecidos receber um diagnóstico adequado.",
    },
    vision: {
      titre: "A nossa visão",
      texte:
        "Tornar-se o centro de referência em diagnóstico e exames médicos na República Democrática do Congo e em África, reconhecido pela excelência, acessibilidade e fiabilidade dos nossos resultados.",
    },
    valeurs: {
      titre: "Os nossos valores",
      items: [
        { titre: "Fiabilidade", description: "Resultados precisos conformes às normas internacionais de laboratório." },
        { titre: "Acessibilidade", description: "Serviços de qualidade a um custo acessível, abertos a todos, incluindo os mais desfavorecidos." },
        { titre: "Excelência", description: "Pessoal qualificado, equipamento moderno e adesão às melhores práticas." },
        { titre: "Humanidade", description: "A sua saúde é o nosso fardo — cada paciente é recebido com respeito e atenção." },
      ],
    },
    histoire: {
      titre: "A nossa história",
      paragraphes: [
        "O HAM LABORATOIRE é um centro de diagnóstico e exames médicos sediado em Kinshasa, República Democrática do Congo. Desde a sua fundação, o estabelecimento tem-se comprometido a oferecer serviços de saúde fiáveis e acessíveis a toda a população.",
        "Com o seu laboratório equipado e uma equipa de profissionais qualificados, o HAM LABORATOIRE acompanha médicos, pacientes e parceiros institucionais ao longo do percurso diagnóstico com rigor e cuidado.",
      ],
    },
    direction: {
      titre: "A nossa direção",
      sousTitre: "O diretor do centro",
      responsable: {
        nom: "Olivier Bokulu",
        fonction: "Diretor geral — HAM Laboratoire",
        biographie:
          "Olivier Bokulu lidera o HAM LABORATOIRE com a convicção de que a saúde é um fardo partilhado e que os resultados fiáveis devem permanecer acessíveis a todos. Sob a sua liderança, o centro continua a sua missão de excelência em diagnóstico médico, colocando a qualidade, a integridade e a acessibilidade dos cuidados no centro de cada decisão.",
      },
    },
    equipe: {
      titre: "A nossa equipa",
      sousTitre: "Profissionais qualificados ao seu serviço",
      membres: [
        { nom: "Equipa de Laboratório", fonction: "Biólogos e técnicos" },
        { nom: "Equipa de Receção", fonction: "Receção e orientação" },
        { nom: "Equipa Médica", fonction: "Médicos e enfermeiros" },
        { nom: "Equipa Administrativa", fonction: "Gestão e qualidade" },
      ],
    },
    certifications: {
      titre: "Certificações e compromissos",
      items: [
        { titre: "ISO 9001:2015", description: "Sistema de gestão da qualidade certificado." },
        { titre: "Boas práticas de laboratório", description: "Conformidade com os requisitos normativos nacionais e internacionais." },
        { titre: "Fiabilidade dos resultados", description: "Controlos de qualidade rigorosos em cada etapa analítica." },
      ],
    },
    impact: {
      titre: "HAM em números",
      sousTitre: "Uma presença estabelecida em Kinshasa, ao serviço da saúde pública congolesa.",
      items: [
        { libelle: "Pacientes / ano", description: "Cuidados e exames realizados anualmente." },
        { libelle: "Tipos de exames", description: "Plataforma técnica completa em biologia médica." },
        { libelle: "Profissionais", description: "Biólogos, técnicos, médicos e pessoal qualificado." },
        { libelle: "Certificação", description: "Gestão da qualidade certificada." },
      ],
    },
    bandeau: {
      slogan: "HAM LABORATOIRE, A ESCOLHA SEGURA PARA UMA MELHOR SAÚDE!",
      telephone: "Telefone",
      siteWeb: "Site web",
    },
    cta: {
      titre: "Junte-se a milhares de pacientes que confiam em nós",
      description: "Marque uma consulta ou contacte-nos — o HAM LABORATOIRE recebe-o em MATETE, Kinshasa.",
      boutonPrincipal: "Marcar uma consulta",
      boutonSecondaire: "Contacte-nos",
    },
  },
} as const;

export type PagesPt = typeof pagesPt;
