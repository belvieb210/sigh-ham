"use client";

import { useTranslation } from "react-i18next";
import { MiseEnPageReception, type UtilisateurReception } from "@/features/reception/mise-en-page-reception";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import { FormulaireEnregistrement } from "@/features/reception/formulaire-enregistrement";
import {
  PanneauDroitReception,
  SectionsMobileReception,
} from "@/features/reception/panneau-droit-reception";
import { ResumePatientMobile } from "@/features/reception/resume-patient-mobile";

interface PropsContenuNouveauPatient {
  utilisateur: UtilisateurReception;
}

export function ContenuNouveauPatient({ utilisateur }: PropsContenuNouveauPatient) {
  const { t } = useTranslation();

  return (
    <MiseEnPageReception
      utilisateur={utilisateur}
      titre={t("reception.layout.titre")}
      sousTitre={t("reception.layout.sousTitre")}
      panneauDroit={<PanneauDroitReception />}
    >
      <div className="mx-auto w-full max-w-[960px] xl:max-w-[1100px]">
        <EnTetePageReception
          titre={t("reception.pages.nouveau.titre")}
          description={t("reception.pages.nouveau.description")}
          fil={[
            { label: t("reception.common.reception"), href: "/sigh/reception" },
            { label: t("reception.pages.nouveau.fil") },
          ]}
        />

        <div className="space-y-4 lg:space-y-5">
          <ResumePatientMobile />
          <FormulaireEnregistrement variante="complet" />
          <SectionsMobileReception />
        </div>
      </div>
    </MiseEnPageReception>
  );
}
