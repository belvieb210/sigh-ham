"use client";

import { useTranslation } from "react-i18next";
import { UserRound } from "lucide-react";
import type { PatientFileLaboratoire } from "@/lib/laboratoire/types";
import {
  codeTransfertLaboratoire,
  initialesPatient,
  numeroEnregistrementLaboratoire,
} from "@/features/laboratoire/utils-affichage";

interface PropsResumePatientLaboratoire {
  patient: PatientFileLaboratoire | null;
}

function Ligne({
  label,
  valeur,
}: {
  label: string;
  valeur: string;
}) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="shrink-0 text-texte-secondaire">{label}</dt>
      <dd className="max-w-[65%] truncate text-right font-medium text-texte-principal">
        {valeur}
      </dd>
    </div>
  );
}

export function ResumePatientLaboratoire({ patient }: PropsResumePatientLaboratoire) {
  const { t, i18n } = useTranslation();

  const formaterDateHeure = (iso: string | null | undefined) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString(i18n.language || "fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
          <Ligne label={t("laboratoire.panneau.age")} valeur="—" />
          <Ligne label={t("laboratoire.panneau.telephone")} valeur="—" />
          <Ligne label={t("laboratoire.panneau.numeroEnregistrement")} valeur="—" />
          <Ligne label={t("laboratoire.panneau.numeroTransfert")} valeur="—" />
          <Ligne label={t("laboratoire.panneau.heureTransfert")} valeur="—" />
          <Ligne label={t("laboratoire.panneau.heureEnregistrement")} valeur="—" />
          <Ligne label={t("laboratoire.panneau.enregistrePar")} valeur="—" />
          <Ligne label={t("laboratoire.panneau.transferePar")} valeur="—" />
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
        {codeTransfertLaboratoire(patient)}
      </p>
      <dl className="mt-4 w-full space-y-2 text-left text-xs">
        <Ligne
          label={t("laboratoire.panneau.age")}
          valeur={`${patient.age != null ? `${patient.age} ans` : "—"}${
            patient.sexe ? ` / ${patient.sexe}` : ""
          }`}
        />
        <Ligne
          label={t("laboratoire.panneau.telephone")}
          valeur={patient.telephone || "—"}
        />
        <Ligne
          label={t("laboratoire.panneau.service")}
          valeur={patient.provenance || "—"}
        />
        <Ligne
          label={t("laboratoire.panneau.examens")}
          valeur={String(patient.nombreExamens)}
        />
        <Ligne
          label={t("laboratoire.panneau.numeroEnregistrement")}
          valeur={numeroEnregistrementLaboratoire(patient)}
        />
        <Ligne
          label={t("laboratoire.panneau.numeroTransfert")}
          valeur={codeTransfertLaboratoire(patient)}
        />
        <Ligne
          label={t("laboratoire.panneau.heureTransfert")}
          valeur={formaterDateHeure(patient.heureTransfert)}
        />
        <Ligne
          label={t("laboratoire.panneau.heureEnregistrement")}
          valeur={formaterDateHeure(patient.heureEnregistrement)}
        />
        <Ligne
          label={t("laboratoire.panneau.enregistrePar")}
          valeur={patient.enregistrePar || "—"}
        />
        <Ligne
          label={t("laboratoire.panneau.transferePar")}
          valeur={patient.transferePar || "—"}
        />
      </dl>
    </div>
  );
}
