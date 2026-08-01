"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { CONTENU_CONTACT } from "@/constants/contact";
import { CONTENU_RENDEZ_VOUS } from "@/constants/rendez-vous";
import { useLangueActive } from "@/hooks/use-langue-active";

const idsSujet = CONTENU_CONTACT.sujetsFormulaire.map((s) => s.value) as [
  string,
  ...string[],
];

const idsPrestation = CONTENU_RENDEZ_VOUS.typesPrestation.map((t) => t.id) as [
  string,
  ...string[],
];

export function useSchemaFormulaireContact() {
  const { t } = useTranslation();
  const langue = useLangueActive();

  return useMemo(
    () =>
      z.object({
        nomComplet: z
          .string()
          .min(2, t("validation.nomMin"))
          .max(100, t("validation.nomMax")),
        email: z.string().email(t("validation.emailInvalide")),
        telephone: z.string().optional(),
        sujet: z.enum(idsSujet, { message: t("validation.sujetRequis") }),
        message: z
          .string()
          .min(10, t("validation.messageMin"))
          .max(2000, t("validation.messageMax")),
        consentement: z.literal(true, {
          errorMap: () => ({
            message: t("validation.consentementRequis"),
          }),
        }),
      }),
    [t, langue]
  );
}

export function useSchemaReservationRendezVous() {
  const { t } = useTranslation();
  const langue = useLangueActive();

  return useMemo(
    () =>
      z.object({
        typePrestation: z.enum(idsPrestation, {
          message: t("validation.typePrestationRequis"),
        }),
        date: z.string().min(1, t("validation.dateRequise")),
        creneau: z.string().min(1, t("validation.creneauRequis")),
        nomComplet: z
          .string()
          .min(2, t("validation.nomMin"))
          .max(100, t("validation.nomMax")),
        email: z.string().email(t("validation.emailInvalide")),
        telephone: z
          .string()
          .min(9, t("validation.telephoneInvalide"))
          .max(20, t("validation.telephoneMax")),
        dateNaissance: z.string().optional(),
        motif: z.string().max(500, t("validation.motifMax")).optional(),
        premiereVisite: z.boolean().optional(),
        consentement: z.literal(true, {
          errorMap: () => ({
            message: t("validation.consentementRequis"),
          }),
        }),
      }),
    [t, langue]
  );
}

export type DonneesFormulaireContact = z.infer<
  ReturnType<typeof useSchemaFormulaireContact>
>;

export type DonneesReservationRendezVous = z.infer<
  ReturnType<typeof useSchemaReservationRendezVous>
>;
