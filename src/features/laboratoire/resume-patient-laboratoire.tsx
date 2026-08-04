"use client";

import { useTranslation } from "react-i18next";
import { UserRound } from "lucide-react";
import type { PatientFileLaboratoire } from "@/lib/laboratoire/types";
import { initialesPatient } from "@/features/laboratoire/utils-affichage";

interface PropsResumePatientLaboratoire {
  patient: PatientFileLaboratoire | null;
}

export function ResumePatientLaboratoire({ patient }: PropsResumePatientLaboratoire) {
  const { t } = useTranslation();

  if (!patient) {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-50 text-violet-400">
          <UserRound className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <p className="mt-3 text-sm font-bold text-texte-principal">
          {t("laboratoire.panneau.aucunPatient")}
        </p>
        <dl className="mt-4 w-full space-y-2 text-left text-xs">
          <div className="flex justify-between gap-2">
            <dt className="text-texte-secondaire">{t("laboratoire.panneau.age")}</dt>
            <dd className="font-medium text-texte-principal">—</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-texte-secondaire">
              {t("laboratoire.panneau.telephone")}
            </dt>
            <dd className="font-medium text-texte-principal">—</dd>
          </div>
        </dl>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-degrade-ham text-lg font-bold text-white">
        {initialesPatient(patient.prenom, patient.nom)}
      </div>
      <p className="mt-3 text-base font-bold text-texte-principal">
        {patient.nom} {patient.prenom}
      </p>
      <p className="font-mono text-xs text-texte-secondaire">
        {patient.numeroDossier}
      </p>
      <dl className="mt-4 w-full space-y-2 text-left text-xs">
        <div className="flex justify-between gap-2">
          <dt className="text-texte-secondaire">{t("laboratoire.panneau.age")}</dt>
          <dd className="font-medium text-texte-principal">
            {patient.age != null ? `${patient.age} ans` : "—"}
            {patient.sexe ? ` / ${patient.sexe}` : ""}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-texte-secondaire">
            {t("laboratoire.panneau.telephone")}
          </dt>
          <dd className="font-medium text-texte-principal">
            {patient.telephone || "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-texte-secondaire">
            {t("laboratoire.panneau.service")}
          </dt>
          <dd className="max-w-[60%] truncate font-medium text-texte-principal">
            {patient.provenance || "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-texte-secondaire">
            {t("laboratoire.panneau.examens")}
          </dt>
          <dd className="font-medium text-texte-principal">
            {patient.nombreExamens}
          </dd>
        </div>
      </dl>
    </div>
  );
}
