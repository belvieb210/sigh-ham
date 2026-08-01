"use client";

import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  couleurBadgeTypeVisite,
  type DonneesResumePatient,
} from "@/lib/reception/resume-patient";
import { useTraductionsReception } from "@/hooks/use-traductions-reception";

interface PropsAffichageResumePatient {
  resume: DonneesResumePatient;
  variante?: "complet" | "compact";
}

export function AffichageResumePatient({
  resume,
  variante = "complet",
}: PropsAffichageResumePatient) {
  const { t } = useTranslation();
  const { traduireTypeVisite, afficherResumeVide, traduireAge } = useTraductionsReception();
  const libelleType = traduireTypeVisite(resume.typeVisite);
  const nomAffiche = resume.vide ? afficherResumeVide() : resume.nomComplet;
  const ageAffiche =
    resume.age === "—" || resume.vide
      ? resume.age
      : /^\d+$/.test(resume.age)
        ? traduireAge(Number(resume.age))
        : resume.age;

  if (variante === "compact") {
    return (
      <>
        <div className="flex items-center gap-3">
          {resume.photoUrl ? (
            <img
              src={resume.photoUrl}
              alt=""
              className="h-12 w-12 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-degrade-ham text-sm font-bold text-white">
              {resume.initiales}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-texte-principal">{nomAffiche}</p>
            <p className="font-mono text-[11px] text-texte-secondaire">
              {resume.numeroPatient ?? "—"}
            </p>
          </div>
          {!resume.vide && (
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                couleurBadgeTypeVisite(resume.typeVisite)
              )}
            >
              {libelleType}
            </span>
          )}
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
          <div>
            <dt className="text-texte-secondaire">{t("reception.panneau.age")}</dt>
            <dd className="font-medium text-texte-principal">{ageAffiche}</dd>
          </div>
          <div>
            <dt className="text-texte-secondaire">{t("reception.panneau.assurance")}</dt>
            <dd className="font-medium text-texte-principal">{resume.assurance}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-texte-secondaire">{t("reception.panneau.telephone")}</dt>
            <dd className="font-medium text-texte-principal">{resume.telephone}</dd>
          </div>
        </dl>
      </>
    );
  }

  return (
    <div className="flex flex-col items-center text-center">
      {resume.photoUrl ? (
        <img
          src={resume.photoUrl}
          alt=""
          className="h-16 w-16 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-degrade-ham text-xl font-bold text-white">
          {resume.initiales}
        </div>
      )}
      <p className="mt-3 text-base font-bold text-texte-principal">{nomAffiche}</p>
      <p className="font-mono text-xs text-texte-secondaire">
        {resume.numeroPatient ?? "—"}
      </p>
      {!resume.vide && (
        <span
          className={cn(
            "mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
            couleurBadgeTypeVisite(resume.typeVisite)
          )}
        >
          {libelleType}
        </span>
      )}
      <dl className="mt-4 w-full space-y-2 text-left text-sm">
        <div className="flex justify-between gap-2">
          <dt className="text-texte-secondaire">{t("reception.panneau.age")}</dt>
          <dd className="font-medium text-texte-principal">{ageAffiche}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-texte-secondaire">{t("reception.panneau.telephone")}</dt>
          <dd className="font-medium text-texte-principal">{resume.telephone}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-texte-secondaire">{t("reception.panneau.adresse")}</dt>
          <dd className="max-w-[58%] text-right font-medium text-texte-principal">
            {resume.adresse}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-texte-secondaire">{t("reception.panneau.assurance")}</dt>
          <dd className="font-medium text-texte-principal">{resume.assurance}</dd>
        </div>
      </dl>
    </div>
  );
}
