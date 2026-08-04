"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  EVENEMENT_RECEPTION_FOCUS_RECHERCHE,
  EVENEMENT_RECEPTION_PATIENT_RECHERCHE,
  EVENEMENT_RECEPTION_PATIENTS_MODIFIES,
} from "@/constants/reception";

/** Configuration d'un espace type réception (réception ou médecins externes). */
export interface EspaceApiReceptionLike {
  /** Préfixe API, ex. `/api/reception` */
  prefixeApi: string;
  /** Racine des pages, ex. `/sigh/reception` */
  cheminBase: string;
  /** Clé i18n commune pour le fil d'Ariane (ex. `reception.common.reception`) */
  cleFilRacine: string;
  evenementPatientsModifies: string;
  evenementPatientRecherche: string;
  evenementFocusRecherche: string;
  /** Affiche paroisse / date mariage / conjoint dans le formulaire. */
  afficherChampsEglise?: boolean;
  /** Orientation initiale du wizard (défaut INFIRMIERS). */
  orientationDefaut?: string;
}

export const ESPACE_API_RECEPTION: EspaceApiReceptionLike = {
  prefixeApi: "/api/reception",
  cheminBase: "/sigh/reception",
  cleFilRacine: "reception.common.reception",
  evenementPatientsModifies: EVENEMENT_RECEPTION_PATIENTS_MODIFIES,
  evenementPatientRecherche: EVENEMENT_RECEPTION_PATIENT_RECHERCHE,
  evenementFocusRecherche: EVENEMENT_RECEPTION_FOCUS_RECHERCHE,
};

export const ESPACE_API_MEDECINS_EXTERNES: EspaceApiReceptionLike = {
  prefixeApi: "/api/medecins-externes",
  cheminBase: "/sigh/medecins-externes",
  cleFilRacine: "medecinsExternes.common.salle",
  evenementPatientsModifies: "sigh:medecins-externes-patients-modifies",
  evenementPatientRecherche: "sigh:medecins-externes-patient-recherche-selectionne",
  evenementFocusRecherche: "sigh:medecins-externes-focus-recherche",
};

export const ESPACE_API_EGLISE: EspaceApiReceptionLike = {
  prefixeApi: "/api/eglise",
  cheminBase: "/sigh/eglise",
  cleFilRacine: "eglise.common.salle",
  evenementPatientsModifies: "sigh:eglise-patients-modifies",
  evenementPatientRecherche: "sigh:eglise-patient-recherche-selectionne",
  evenementFocusRecherche: "sigh:eglise-focus-recherche",
  afficherChampsEglise: true,
  orientationDefaut: "CAISSE",
};

const ContexteEspaceApi = createContext<EspaceApiReceptionLike>(ESPACE_API_RECEPTION);

export function FournisseurEspaceApi({
  espace,
  children,
}: {
  espace: EspaceApiReceptionLike;
  children: ReactNode;
}) {
  return (
    <ContexteEspaceApi.Provider value={espace}>{children}</ContexteEspaceApi.Provider>
  );
}

export function useEspaceApi(): EspaceApiReceptionLike {
  return useContext(ContexteEspaceApi);
}
