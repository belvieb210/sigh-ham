"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { CalendarPlus, Printer, Receipt, Search } from "lucide-react";
import { OrientationRapideCaisse } from "@/features/caisse/orientation-rapide-caisse";
import { useOrientationCaisse } from "@/features/caisse/contexte-orientation-caisse";
import { useSelectionTransfertCaisseOptionnel } from "@/features/caisse/contexte-selection-transfert-caisse";
import { LigneNumeroVisiteResume } from "@/components/ui/ligne-numero-visite-resume";
import { cn } from "@/lib/utils";

function useGestionOrientation() {
  const { orientation, orientations, definirOrientations } = useOrientationCaisse();
  const selection = useSelectionTransfertCaisseOptionnel();

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
          {t("caisse.transferts.resumePatient")}
        </h2>
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
            {resume && !resume.vide ? resume.initiales : "—"}
          </div>
          <p className="mt-3 text-sm font-semibold text-texte-principal">
            {resume?.nomComplet ?? t("caisse.transferts.aucunPatient")}
          </p>
          {resume?.numeroPatient && (
            <p className="mt-0.5 font-mono text-[11px] text-texte-secondaire">
              {resume.numeroPatient}
            </p>
          )}
        </div>
        <div className="mt-4 space-y-2 text-left text-xs">
          <LigneNumeroVisiteResume
            label={t("caisse.transferts.numeroVisite")}
            numeroDossier={resume?.numeroDossier}
          />
          <div className="flex justify-between gap-2">
            <span className="text-texte-secondaire">{t("caisse.transferts.age")}</span>
            <span className="font-medium text-texte-principal">{resume?.age ?? "—"}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-texte-secondaire">{t("caisse.transferts.telephone")}</span>
            <span className="font-medium text-texte-principal">
              {resume?.telephone ?? "—"}
            </span>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
          {t("caisse.transferts.orientationRapide")}
        </h2>
        {selection?.patientSelectionne || (selection?.dossiersCoches?.length ?? 0) > 0 ? (
          <p className="mb-2 text-xs text-texte-secondaire">
            {(selection?.dossiersCoches?.length ?? 0) > 0
              ? t("caisse.transferts.aideOrientationLot", {
                  count: selection!.dossiersCoches.length,
                })
              : t("caisse.transferts.aideOrientation")}
          </p>
        ) : (
          <p className="mb-2 text-xs text-texte-secondaire">
            {selection?.patientSelectionne &&
            !selection.patientSelectionne.peutOrienterSortant &&
            !(selection?.dossiersCoches?.length ?? 0)
              ? t("caisse.transferts.selectionnerPourOrienterEntrant")
              : t("caisse.transferts.selectionnerPourOrienter")}
          </p>
        )}
        <OrientationRapideCaisse
          orientation={orientation}
          orientations={orientations}
          onOrientationsChange={onOrientationsChange}
          multiple
          desactive={
            selection?.modificationEnCours ||
            (!(selection?.dossiersCoches?.length) && !selection?.patientSelectionne) ||
            Boolean(
              selection?.patientSelectionne &&
                !selection.patientSelectionne.peutOrienterSortant &&
                !(selection?.dossiersCoches?.length ?? 0)
            )
          }
        />
        {selection?.messagePanneau && (
          <p
            className={cn(
              "mt-2 text-xs",
              selection.messagePanneau.toLowerCase().includes("impossible") ||
                selection.messagePanneau.toLowerCase().includes("déjà")
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
          {t("caisse.transferts.actionsRapides")}
        </h2>
        <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
          <Link
            href="/sigh/caisse/transferts"
            className="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl border border-gris-bordure bg-[#f8fafc] p-3 text-center text-xs font-medium text-texte-principal hover:border-bleu-medical hover:bg-bleu-medical-clair"
          >
            <Search className="h-6 w-6 text-bleu-medical" strokeWidth={1.75} />
            {t("caisse.transferts.actionRechercher")}
          </Link>
          <Link
            href={
              selection?.resume.dossierId
                ? `/sigh/caisse/facturation?dossier=${selection.resume.dossierId}`
                : "/sigh/caisse/facturation"
            }
            className="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl border border-gris-bordure bg-[#f8fafc] p-3 text-center text-xs font-medium text-texte-principal hover:border-bleu-medical hover:bg-bleu-medical-clair"
          >
            <Receipt className="h-6 w-6 text-bleu-medical" strokeWidth={1.75} />
            {t("caisse.transferts.actionFacturer")}
          </Link>
          <button
            type="button"
            className="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl border border-gris-bordure bg-[#f8fafc] p-3 text-center text-xs font-medium text-texte-principal hover:border-bleu-medical hover:bg-bleu-medical-clair"
          >
            <Printer className="h-6 w-6 text-bleu-medical" strokeWidth={1.75} />
            {t("caisse.transferts.actionImprimer")}
          </button>
          <button
            type="button"
            className="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl border border-gris-bordure bg-[#f8fafc] p-3 text-center text-xs font-medium text-texte-principal hover:border-bleu-medical hover:bg-bleu-medical-clair"
          >
            <CalendarPlus className="h-6 w-6 text-bleu-medical" strokeWidth={1.75} />
            {t("caisse.transferts.actionRdv")}
          </button>
        </div>
      </section>
    </>
  );
}

export function PanneauDroitCaisse() {
  return (
    <aside className="flex w-full shrink-0 flex-col gap-4">
      <ResumeEtOrientation />
    </aside>
  );
}

export function SectionsMobileCaisseTransferts() {
  return (
    <div className="space-y-4 xl:hidden">
      <ResumeEtOrientation />
    </div>
  );
}
