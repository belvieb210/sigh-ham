"use client";

import { useTranslation } from "react-i18next";
import { Printer, Search } from "lucide-react";
import { ResumePatientLaboratoire } from "@/features/laboratoire/resume-patient-laboratoire";
import { SectionExamensFacturePanneauCaisse } from "@/features/caisse/section-examens-facture-panneau-caisse";
import type { PatientFileLaboratoire } from "@/lib/laboratoire/types";
import { cn } from "@/lib/utils";

interface PropsPanneauExamensDisponiblesCaisse {
  patient: PatientFileLaboratoire | null;
  nbExamensSelectionnes: number;
  peutImprimer: boolean;
  onRechercher: () => void;
  onImprimer: () => void;
  impressionEnCours?: boolean;
}

export function PanneauExamensDisponiblesCaisse({
  patient,
  nbExamensSelectionnes,
  peutImprimer,
  onRechercher,
  onImprimer,
  impressionEnCours = false,
}: PropsPanneauExamensDisponiblesCaisse) {
  const { t } = useTranslation();

  const libelleImprimer =
    nbExamensSelectionnes > 0
      ? t("caisse.examensDisponibles.imprimerSelection", {
          count: nbExamensSelectionnes,
        })
      : t("caisse.examensDisponibles.imprimerTous");

  return (
    <aside className="flex w-full min-w-0 shrink-0 flex-col gap-4">
      <section className="min-w-0 rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
          {t("laboratoire.panneau.resumePatient")}
        </h2>
        <ResumePatientLaboratoire patient={patient} variante="salle" />
      </section>

      <SectionExamensFacturePanneauCaisse dossierId={patient?.dossierId ?? null} />

      <section className="min-w-0 rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
          {t("laboratoire.panneau.actionsRapides")}
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onRechercher}
            className="flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-xl border border-gris-bordure bg-[#f8fafc] p-2.5 text-center text-[11px] font-medium leading-tight text-texte-principal transition-colors hover:border-bleu-medical hover:bg-bleu-medical-clair active:scale-[0.98] sm:min-h-[88px] sm:gap-2 sm:p-3 sm:text-xs"
          >
            <Search
              className="h-6 w-6 shrink-0 text-bleu-medical"
              strokeWidth={1.75}
            />
            <span>{t("laboratoire.actions.rechercherPatient")}</span>
          </button>
          <button
            type="button"
            disabled={!peutImprimer || impressionEnCours}
            onClick={onImprimer}
            className={cn(
              "flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-xl border border-gris-bordure bg-[#f8fafc] p-2.5 text-center text-[11px] font-medium leading-tight text-texte-principal transition-colors hover:border-amber-300 hover:bg-amber-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[88px] sm:gap-2 sm:p-3 sm:text-xs",
              nbExamensSelectionnes > 0 && "border-amber-300 bg-amber-50"
            )}
          >
            <Printer
              className="h-6 w-6 shrink-0 text-amber-700"
              strokeWidth={1.75}
            />
            <span>{libelleImprimer}</span>
          </button>
        </div>
      </section>
    </aside>
  );
}

/** Version empilée sous le tableau (mobile / tablette) */
export function SectionsMobileExamensDisponiblesCaisse(
  props: PropsPanneauExamensDisponiblesCaisse
) {
  return (
    <div className="xl:hidden">
      <PanneauExamensDisponiblesCaisse {...props} />
    </div>
  );
}
