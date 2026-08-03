"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { CalendarPlus, Printer, Receipt, Search } from "lucide-react";
import { OrientationRapideCaisse } from "@/features/caisse/orientation-rapide-caisse";
import { useOrientationCaisse } from "@/features/caisse/contexte-orientation-caisse";
import { useSelectionTransfertCaisseOptionnel } from "@/features/caisse/contexte-selection-transfert-caisse";
import { cn } from "@/lib/utils";

function useGestionOrientation() {
  const { orientation } = useOrientationCaisse();
  const selection = useSelectionTransfertCaisseOptionnel();

  const onOrientationChange = (code: string) => {
    if (selection?.patientSelectionne) {
      void selection.demanderOrientation(code);
    }
  };

  return { orientation, onOrientationChange, selection };
}

function ResumeEtOrientation() {
  const { t } = useTranslation();
  const { orientation, onOrientationChange, selection } = useGestionOrientation();
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
        <dl className="mt-4 space-y-2 text-left text-xs">
          <div className="flex justify-between gap-2">
            <dt className="text-texte-secondaire">{t("caisse.transferts.age")}</dt>
            <dd className="font-medium text-texte-principal">{resume?.age ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-texte-secondaire">{t("caisse.transferts.telephone")}</dt>
            <dd className="font-medium text-texte-principal">{resume?.telephone ?? "—"}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
          {t("caisse.transferts.orientationRapide")}
        </h2>
        {selection?.patientSelectionne ? (
          <p className="mb-2 text-xs text-texte-secondaire">
            {t("caisse.transferts.aideOrientation")}
          </p>
        ) : (
          <p className="mb-2 text-xs text-texte-secondaire">
            {t("caisse.transferts.selectionnerPourOrienter")}
          </p>
        )}
        <OrientationRapideCaisse
          orientation={orientation}
          onOrientationChange={onOrientationChange}
          desactive={selection?.modificationEnCours || !selection?.patientSelectionne}
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
        <div className="grid grid-cols-2 gap-2">
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
