"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Activity, History } from "lucide-react";
import { OrientationRapideInfirmiers } from "@/features/infirmiers/orientation-rapide-infirmiers";
import { useOrientationInfirmiers } from "@/features/infirmiers/contexte-orientation-infirmiers";
import { useSelectionInfirmiersOptionnel } from "@/features/infirmiers/contexte-selection-infirmiers";
import { LigneNumeroVisiteResume } from "@/components/ui/ligne-numero-visite-resume";
import { cn } from "@/lib/utils";

function useGestionOrientation() {
  const { orientation, orientations, definirOrientations } = useOrientationInfirmiers();
  const selection = useSelectionInfirmiersOptionnel();

  const onOrientationsChange = (codes: string[]) => {
    definirOrientations(codes);
    if (codes.length === 0) return;
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
          {t("infirmiers.panneau.resumePatient")}
        </h2>
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
            {resume && !resume.vide ? resume.initiales : "â"}
          </div>
          <p className="mt-3 text-sm font-semibold text-texte-principal">
            {resume?.nomComplet ?? t("infirmiers.panneau.aucunPatient")}
          </p>
          {resume?.numeroPatient && (
            <p className="mt-0.5 font-mono text-[11px] text-texte-secondaire">
              {resume.numeroPatient}
            </p>
          )}
        </div>
        <div className="mt-4 space-y-2 text-left text-xs">
          <LigneNumeroVisiteResume
            label={t("infirmiers.panneau.numeroVisite")}
            numeroDossier={resume?.numeroDossier}
          />
          <div className="flex justify-between gap-2">
            <span className="text-texte-secondaire">{t("infirmiers.panneau.age")}</span>
            <span className="font-medium text-texte-principal">{resume?.age ?? "â"}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-texte-secondaire">{t("infirmiers.panneau.telephone")}</span>
            <span className="font-medium text-texte-principal">
              {resume?.telephone ?? "â"}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-texte-secondaire">{t("infirmiers.panneau.motif")}</span>
            <span className="max-w-[60%] truncate font-medium text-texte-principal">
              {resume?.motif ?? "â"}
            </span>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
          {t("infirmiers.panneau.orientationRapide")}
        </h2>
        {selection?.patientSelectionne || (selection?.dossiersCoches?.length ?? 0) > 0 ? (
          <p className="mb-2 text-xs text-texte-secondaire">
            {(selection?.dossiersCoches?.length ?? 0) > 0
              ? t("infirmiers.panneau.aideOrientationLot", {
                  count: selection!.dossiersCoches.length,
                })
              : t("infirmiers.panneau.aideOrientation")}
          </p>
        ) : (
          <p className="mb-2 text-xs text-texte-secondaire">
            {t("infirmiers.panneau.selectionnerPourOrienter")}
          </p>
        )}
        <OrientationRapideInfirmiers
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
                selection.messagePanneau.toLowerCase().includes("dÃ©jÃ ")
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
          {t("infirmiers.panneau.actionsRapides")}
        </h2>
        <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
          <Link
            href={
              selection?.resume.dossierId
                ? `/sigh/infirmiers/consultation?dossier=${selection.resume.dossierId}`
                : "/sigh/infirmiers/consultation"
            }
            className="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl border border-gris-bordure bg-[#f8fafc] p-3 text-center text-xs font-medium text-texte-principal hover:border-bleu-medical hover:bg-bleu-medical-clair"
          >
            <Activity className="h-6 w-6 text-bleu-medical" strokeWidth={1.75} />
            {t("infirmiers.panneau.actionConstantes")}
          </Link>
          <Link
            href="/sigh/infirmiers/historique"
            className="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl border border-gris-bordure bg-[#f8fafc] p-3 text-center text-xs font-medium text-texte-principal hover:border-bleu-medical hover:bg-bleu-medical-clair"
          >
            <History className="h-6 w-6 text-bleu-medical" strokeWidth={1.75} />
            {t("infirmiers.panneau.actionHistorique")}
          </Link>
        </div>
      </section>
    </>
  );
}

export function PanneauDroitInfirmiers() {
  return (
    <aside className="flex w-full shrink-0 flex-col gap-4">
      <ResumeEtOrientation />
    </aside>
  );
}

export function SectionsMobileInfirmiersPatients() {
  return (
    <div className="space-y-4 xl:hidden">
      <ResumeEtOrientation />
    </div>
  );
}
