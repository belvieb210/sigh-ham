"use client";

import { useTranslation } from "react-i18next";
import { AffichageResumePatient } from "@/features/reception/affichage-resume-patient";
import { useResumePatient } from "@/features/reception/contexte-resume-patient";

/** Résumé patient compact — visible sur mobile / tablette */
export function ResumePatientMobile() {
  const { t } = useTranslation();
  const { resume } = useResumePatient();

  return (
    <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm xl:hidden">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
        {t("reception.panneau.resumePatient")}
      </h2>
      <AffichageResumePatient resume={resume} variante="compact" />
    </section>
  );
}
