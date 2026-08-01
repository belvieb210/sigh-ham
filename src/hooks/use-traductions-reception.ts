"use client";

import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ASSURANCES,
  ETATS_CIVILS,
  GROUPES_SANGUINS,
  MOTIFS_PRINCIPAUX,
  TYPES_PATIENT,
} from "@/constants/reception";
import { useLangueActive } from "@/hooks/use-langue-active";

const CLES_ETAPES = [
  "infosPatient",
  "motifVisite",
  "examensInitiaux",
  "orientation",
] as const;

export function useTraductionsReception() {
  const { t } = useTranslation();
  const langue = useLangueActive();

  const etapesDesktop = useMemo(
    () => CLES_ETAPES.map((cle) => t(`reception.formulaire.etapes.${cle}`)),
    [t, langue]
  );

  const etapesMobile = useMemo(
    () => CLES_ETAPES.map((cle) => t(`reception.formulaire.etapesMobile.${cle}`)),
    [t, langue]
  );

  const typesPatient = useMemo(
    () =>
      TYPES_PATIENT.map((item) => ({
        ...item,
        label: t(`reception.formulaire.options.typesPatient.${item.value}`),
      })),
    [t, langue]
  );

  const etatsCivils = useMemo(
    () =>
      ETATS_CIVILS.map((item) => ({
        ...item,
        label: t(`reception.formulaire.options.etatsCivils.${item.value}`),
      })),
    [t, langue]
  );

  const motifsPrincipaux = useMemo(
    () =>
      MOTIFS_PRINCIPAUX.map((item) => ({
        ...item,
        label: t(`reception.formulaire.options.motifs.${item.value}`),
      })),
    [t, langue]
  );

  const assurances = useMemo(
    () =>
      ASSURANCES.map((valeur) => ({
        value: valeur,
        label: t(`reception.formulaire.options.assurances.${valeur}`),
      })),
    [t, langue]
  );

  const groupesSanguins = useMemo(
    () =>
      GROUPES_SANGUINS.map((groupe) =>
        groupe === "Inconnu"
          ? t("reception.formulaire.options.groupeInconnu")
          : groupe
      ),
    [t, langue]
  );

  const traduireStatut = useCallback(
    (statut: string) =>
      t(`reception.liste.filtresStatut.${statut}`, { defaultValue: statut }),
    [t, langue]
  );

  const traduireOrientation = useCallback(
    (orientation: string) =>
      t(`reception.liste.filtresOrientation.${orientation}`, {
        defaultValue: orientation,
      }),
    [t, langue]
  );

  const traduireTypeVisite = useCallback(
    (typeVisite: string) =>
      t(`reception.formulaire.options.typesPatient.${typeVisite}`, {
        defaultValue: t("reception.resume.patient"),
      }),
    [t, langue]
  );

  const traduireAge = useCallback(
    (age: number) => t("reception.resume.ageAns", { age }),
    [t, langue]
  );

  const afficherResumeVide = useCallback(
    () => t("reception.panneau.aucunPatient"),
    [t, langue]
  );

  return {
    t,
    langue,
    etapesDesktop,
    etapesMobile,
    typesPatient,
    etatsCivils,
    motifsPrincipaux,
    assurances,
    groupesSanguins,
    traduireStatut,
    traduireOrientation,
    traduireTypeVisite,
    traduireAge,
    afficherResumeVide,
  };
}
