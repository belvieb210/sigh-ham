/** Structure des traductions du site public HAM LABORATOIRE */

import type { CommunFr } from "./commun/fr";
import type { PagesFr } from "./pages/fr";

/** Élargit les littéraux string de PagesFr pour accepter toutes les langues */
type DeepString<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly DeepString<U>[]
    : T extends object
      ? { readonly [K in keyof T]: DeepString<T[K]> }
      : T;

export interface TraductionsSite {
  nav: {
    accueil: string;
    aPropos: string;
    services: string;
    campagnes: string;
    contact: string;
    rendezVous: string;
  };
  common: {
    seConnecter: string;
    rechercher: string;
    fermer: string;
    voirTous: string;
    voirToutes: string;
    enSavoirPlus: string;
    plusInfos: string;
    liensRapides: string;
    nosServices: string;
    contact: string;
    mentionsLegales: string;
    confidentialite: string;
    espacePersonnel: string;
    droitsReserves: string;
    responsable: string;
    reseauSocial: string;
    ouvrirMenu: string;
    fermerMenu: string;
    navigationPrincipale: string;
    navigationMobile: string;
  };
  hopital: {
    typeEtablissement: string;
    slogan: string;
    titreAccueil: string;
    titreAccueilSuite: string;
    description: string;
  };
  accueil: {
    nosServices: string;
    prestationsMedicales: string;
    sousTitreServices: string;
    campagnesEnCours: string;
    santePublique: string;
    sousTitreCampagnes: string;
    nosServicesBtn: string;
    prendreRdv: string;
    appMobile: string;
    appTitre: string;
    appDescription: string;
    appEnSavoirPlus: string;
    googlePlay: string;
    appStore: string;
    disponibleSur: string;
    telechargerSur: string;
    stats: {
      medecins: string;
      departements: string;
      patients: string;
      certification: string;
    };
    accesRapide: {
      rdv: { titre: string; sousTitre: string };
      resultats: { titre: string; sousTitre: string };
      paiement: { titre: string; sousTitre: string };
      support: { titre: string; sousTitre: string };
    };
    services: {
      consultations: { titre: string; description: string };
      laboratoire: { titre: string; description: string };
      pharmacie: { titre: string; description: string };
      hospitalisation: { titre: string; description: string };
      urgences: { titre: string; description: string };
      imagerie: { titre: string; description: string };
    };
  };
  footer: {
    consultations: string;
    laboratoire: string;
    pharmacie: string;
    urgences: string;
    applicationMobile: string;
  };
  recherche: {
    titre: string;
    placeholder: string;
    hint: string;
    suggestions: string;
    aucunResultat: string;
    aucunResultatTitre: string;
    aucunResultatPour: string;
    aucunResultatConseil: string;
    compteur: string;
    navigation: string;
    raccourci: string;
    categories: {
      page: string;
      service: string;
      campagne: string;
      acces: string;
      faq: string;
      prestation: string;
    };
    pages: Record<string, string>;
  };
  pages: DeepString<PagesFr>;
  validation: DeepString<CommunFr["validation"]>;
  messages: DeepString<CommunFr["messages"]>;
  meta: DeepString<CommunFr["meta"]>;
  connexion: DeepString<CommunFr["connexion"]>;
  reinitialisationMotDePasse: DeepString<CommunFr["reinitialisationMotDePasse"]>;
  construction: DeepString<CommunFr["construction"]>;
  campagnesDetail: DeepString<CommunFr["campagnesDetail"]>;
  placeholders: DeepString<CommunFr["placeholders"]>;
  reception: DeepString<import("./reception/fr").ReceptionFr>;
  caisse: DeepString<import("./caisse/fr").CaisseFr>;
  laboratoire: DeepString<import("./laboratoire/fr").LaboratoireFr>;
  medecins: DeepString<import("./medecins/fr").MedecinsFr>;
  infirmiers: DeepString<import("./infirmiers/fr").InfirmiersFr>;
  pharmacie: DeepString<import("./pharmacie/fr").PharmacieFr>;
  medecinsExternes: DeepString<import("./medecins-externes/fr").MedecinsExternesFr>;
  eglise: DeepString<import("./eglise/fr").EgliseFr>;
}

export type CodeLangue =
  | "fr"
  | "en"
  | "ln"
  | "sw"
  | "kg"
  | "lua"
  | "es"
  | "de"
  | "hi"
  | "pt"
  | "zh"
  | "he"
  | "ar";
