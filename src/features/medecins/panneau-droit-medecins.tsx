"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { BedDouble, FlaskConical, Pill, Stethoscope } from "lucide-react";
import { OrientationRapideMedecins } from "@/features/medecins/orientation-rapide-medecins";
import { useOrientationMedecins } from "@/features/medecins/contexte-orientation-medecins";
import { useSelectionMedecinsOptionnel } from "@/features/medecins/contexte-selection-medecins";
import { LigneNumeroVisiteResume } from "@/components/ui/ligne-numero-visite-resume";
import { cn } from "@/lib/utils";

function useGestionOrientation() {
  const { orientation, orientations, definirOrientations } = useOrientationMedecins();
  const selection = useSelectionMedecinsOptionnel();

  const onOrientationsChange = (codes: string[]) => {
    definirOrientations(codes);
    if (
      selection?.patientSelectionne ||
      (selection?.dossiersCoches?.length ?? 0) > 0
    ) {
      void selection!.demanderOrientations(codes);
    }
  };

  return { orientation, orientations, onOrientationsChange, selection };
}

function ResumeEtOrientation() {
  const { t } = useTranslation();
  const { orientation, orientations, onOrientationsChange, selection } =
    useGestionOrientation();
  const resume = selection?.resume;

  return (
    <>
      <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
          {t("medecins.panneau.resumePatient")}
        </h2>
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
            {resume && !resume.vide ? resume.initiales : "—"}
          </div>
          <p className="mt-3 text-sm font-semibold text-texte-principal">
            {resume?.nomComplet ?? t("medecins.panneau.aucunPatient")}
          </p>
          {resume?.numeroPatient && (
            <p className="mt-0.5 font-mono text-[11px] text-texte-secondaire">
              {resume.numeroPatient}
            </p>
          )}
        </div>
        <div className="mt-4 space-y-2 text-left text-xs">
          <LigneNumeroVisiteResume
            label={t("medecins.panneau.numeroVisite")}
            numeroDossier={resume?.numeroDossier}
          />
          <div className="flex justify-between gap-2">
            <span className="text-texte-secondaire">{t("medecins.panneau.age")}</span>
            <span className="font-medium text-texte-principal">{resume?.age ?? "—"}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-texte-secondaire">{t("medecins.panneau.telephone")}</span>
            <span className="font-medium text-texte-principal">
              {resume?.telephone ?? "—"}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-texte-secondaire">{t("medecins.panneau.motif")}</span>
            <span className="max-w-[60%] truncate font-medium text-texte-principal">
              {resume?.motif ?? "—"}
            </span>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
          {t("medecins.panneau.orientationRapide")}
        </h2>
        {selection?.patientSelectionne || (selection?.dossiersCoches?.length ?? 0) > 0 ? (
          <p className="mb-2 text-xs text-texte-secondaire">
            {(selection?.dossiersCoches?.length ?? 0) > 0
              ? t("medecins.panneau.aideOrientationLot", {
                  count: selection!.dossiersCoches.length,
                })
              : t("medecins.panneau.aideOrientation")}
          </p>
        ) : (
          <p className="mb-2 text-xs text-texte-secondaire">
            {t("medecins.panneau.selectionnerPourOrienter")}
          </p>
        )}
        <OrientationRapideMedecins
          orientation={orientation}
          orientations={orientations}
          onOrientationsChange={onOrientationsChange}
          multiple
          desactive={
            selection?.modificationEnCours ||
            (!(selection?.dossiersCoches?.length) && !selection?.patientSelectionne)
          }
        />
        {selection?.messagePanneau && (
          <p
            className={cn(
              "mt-2 text-xs",
              selection.messagePanneau.toLowerCase().includes("impossible") ||
                selection.messagePanneau.toLowerCase().includes("déjà") ||
                selection.messagePanneau.toLowerCase().includes("sélectionnez")
                ? "text-red-600"
                : "text-emerald-700"
            )}
          >
            {selection.messagePanneau}
          </p>
        )}
      </section>

      <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
          {t("medecins.panneau.actionsRapides")}
        </h2>
        <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
          <Link
            href={
              selection?.resume.dossierId
                ? `/sigh/medecins/consultation?dossier=${selection.resume.dossierId}`
                : "/sigh/medecins/consultation"
            }
            className="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl border border-gris-bordure bg-[#f8fafc] p-3 text-center text-xs font-medium text-texte-principal hover:border-bleu-medical hover:bg-bleu-medical-clair"
          >
            <Stethoscope className="h-6 w-6 text-bleu-medical" strokeWidth={1.75} />
            {t("medecins.panneau.actionConsultation")}
          </Link>
          <Link
            href="/sigh/medecins/examens"
            className="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl border border-gris-bordure bg-[#f8fafc] p-3 text-center text-xs font-medium text-texte-principal hover:border-bleu-medical hover:bg-bleu-medical-clair"
          >
            <FlaskConical className="h-6 w-6 text-bleu-medical" strokeWidth={1.75} />
            {t("medecins.panneau.actionExamens")}
          </Link>
          <Link
            href="/sigh/medecins/ordonnances"
            className="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl border border-gris-bordure bg-[#f8fafc] p-3 text-center text-xs font-medium text-texte-principal hover:border-bleu-medical hover:bg-bleu-medical-clair"
          >
            <Pill className="h-6 w-6 text-bleu-medical" strokeWidth={1.75} />
            {t("medecins.panneau.actionOrdonnance")}
          </Link>
          <Link
            href="/sigh/medecins/hospitalisations"
            className="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl border border-gris-bordure bg-[#f8fafc] p-3 text-center text-xs font-medium text-texte-principal hover:border-bleu-medical hover:bg-bleu-medical-clair"
          >
            <BedDouble className="h-6 w-6 text-bleu-medical" strokeWidth={1.75} />
            {t("medecins.panneau.actionHospitaliser")}
          </Link>
        </div>
      </section>
    </>
  );
}

export function PanneauDroitMedecins() {
  return (
    <aside className="flex w-full shrink-0 flex-col gap-4">
      <ResumeEtOrientation />
    </aside>
  );
}

export function SectionsMobileMedecinsPatients() {
  return (
    <div className="space-y-4 xl:hidden">
      <ResumeEtOrientation />
    </div>
  );
}
