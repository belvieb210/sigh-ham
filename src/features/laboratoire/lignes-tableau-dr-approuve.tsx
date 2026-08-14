"use client";

import { useTranslation } from "react-i18next";
import { ChevronDown, ListChecks, Printer } from "lucide-react";
import { CaseCocheLigne } from "@/components/ui/case-coche-ligne";
import {
  CelluleBadgesStatutExamens,
  CelluleListeExamens,
} from "@/features/laboratoire/cellule-examens-statut-laboratoire";
import {
  examensPourPageStatut,
  numeroEnregistrementLaboratoire,
} from "@/features/laboratoire/utils-affichage";
import type { ExamenFileLaboratoire, PatientFileLaboratoire } from "@/lib/laboratoire/types";
import { cn } from "@/lib/utils";

const COLONNES_TABLEAU = 7;

interface PropsLignesTableauDrApprouve {
  patient: PatientFileLaboratoire;
  selectionne: boolean;
  developpe: boolean;
  patientCoche: boolean;
  examensCoches: Set<string>;
  onSelectionnerPatient: () => void;
  onBasculerCochePatient: (coche: boolean) => void;
  onBasculerDeveloppement: () => void;
  onBasculerCocheExamen: (examenId: string, coche: boolean) => void;
  onSelectionnerTousExamensPatient: (examens: ExamenFileLaboratoire[]) => void;
  onImprimerExamensSelectionnes: (examens: ExamenFileLaboratoire[]) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export function LignesTableauDrApprouve({
  patient,
  selectionne,
  developpe,
  patientCoche,
  examensCoches,
  onSelectionnerPatient,
  onBasculerCochePatient,
  onBasculerDeveloppement,
  onBasculerCocheExamen,
  onSelectionnerTousExamensPatient,
  onImprimerExamensSelectionnes,
  onContextMenu,
}: PropsLignesTableauDrApprouve) {
  const { t } = useTranslation();
  const examensDrApprouve = examensPourPageStatut(patient.examens, "DR_APPROUVE");

  const examensSelectionnes = examensDrApprouve.filter((ex) =>
    examensCoches.has(ex.id)
  );

  const tousExamensCoches =
    examensDrApprouve.length > 0 &&
    examensDrApprouve.every((ex) => examensCoches.has(ex.id));

  return (
    <>
      <tr
        id={`analyse-${patient.dossierId}`}
        onClick={onSelectionnerPatient}
        onContextMenu={onContextMenu}
        className={cn(
          "cursor-pointer transition-colors",
          selectionne ? "bg-bleu-medical-clair/40" : "hover:bg-slate-50/80"
        )}
      >
        <td className="px-1.5 py-1.5" onClick={(e) => e.stopPropagation()}>
          <CaseCocheLigne
            coche={patientCoche}
            onChange={onBasculerCochePatient}
            ariaLabel={t("laboratoire.selection.patient", {
              nom: `${patient.prenom} ${patient.nom}`,
            })}
          />
        </td>
        <td className="px-2 py-1.5 font-mono text-[11px] font-semibold text-bleu-medical">
          {numeroEnregistrementLaboratoire(patient)}
        </td>
        <td className="px-2 py-1.5">
          <p className="truncate text-xs font-semibold leading-tight">
            {patient.nom} {patient.prenom}
          </p>
          <p className="truncate text-[10px] text-texte-secondaire">
            {patient.age != null ? `${patient.age} ans` : "—"}
            {patient.sexe ? ` / ${patient.sexe}` : ""}
          </p>
        </td>
        <td className="hidden px-2 py-1.5 text-[11px] text-texte-secondaire lg:table-cell">
          {patient.provenance || "—"}
        </td>
        <td className="px-2 py-1.5">
          <CelluleListeExamens examens={patient.examens} pageStatut="DR_APPROUVE" />
        </td>
        <td className="px-2 py-1.5">
          <CelluleBadgesStatutExamens
            examens={patient.examens}
            pageStatut="DR_APPROUVE"
          />
        </td>
        <td className="px-1.5 py-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onBasculerDeveloppement();
            }}
            className={cn(
              "inline-flex h-7 w-7 items-center justify-center rounded-md border border-gris-bordure text-texte-secondaire transition-colors hover:bg-slate-50 hover:text-bleu-medical",
              developpe && "border-bleu-medical/40 bg-bleu-medical-clair/30 text-bleu-medical"
            )}
            title={
              developpe
                ? t("laboratoire.drApprouve.replierExamens")
                : t("laboratoire.drApprouve.developperExamens")
            }
            aria-expanded={developpe}
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                developpe ? "rotate-0" : "-rotate-90"
              )}
            />
          </button>
        </td>
      </tr>

      {developpe && examensDrApprouve.length > 0 ? (
        <tr className="bg-slate-50/60">
          <td colSpan={COLONNES_TABLEAU} className="px-2 py-2">
            <div className="rounded-lg border border-gris-bordure/80 bg-white">
              <div className="flex items-center justify-between gap-2 border-b border-gris-bordure/70 px-2 py-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-texte-secondaire">
                  {t("laboratoire.drApprouve.examensTitre", {
                    count: examensDrApprouve.length,
                  })}
                </p>
                <div className="flex shrink-0 items-center gap-1.5">
                  {examensSelectionnes.length > 0 ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onImprimerExamensSelectionnes(examensSelectionnes);
                      }}
                      className="inline-flex h-7 items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2 text-[11px] font-semibold text-amber-900 transition-colors hover:bg-amber-100"
                      title={t("laboratoire.drApprouve.imprimerSelection", {
                        count: examensSelectionnes.length,
                      })}
                    >
                      <Printer className="h-3.5 w-3.5" />
                      <span>
                        {t("laboratoire.drApprouve.imprimer")} ({examensSelectionnes.length})
                      </span>
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectionnerTousExamensPatient(examensDrApprouve);
                    }}
                    className={cn(
                      "inline-flex h-7 w-7 items-center justify-center rounded-md border border-gris-bordure text-texte-secondaire transition-colors hover:bg-slate-50 hover:text-bleu-medical",
                      tousExamensCoches &&
                        "border-bleu-medical/40 bg-bleu-medical-clair/30 text-bleu-medical"
                    )}
                    title={t("laboratoire.drApprouve.selectionnerTousExamens")}
                    aria-pressed={tousExamensCoches}
                  >
                    <ListChecks className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <ul className="divide-y divide-gris-bordure/60">
                {examensDrApprouve.map((examen) => {
                  const coche = examensCoches.has(examen.id);
                  return (
                    <li
                      key={examen.id}
                      className="flex items-center gap-2 px-2 py-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <CaseCocheLigne
                        coche={coche}
                        onChange={(next) => onBasculerCocheExamen(examen.id, next)}
                        ariaLabel={t("laboratoire.drApprouve.selectionnerExamen", {
                          libelle: examen.libelle,
                        })}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-texte-principal">
                          {examen.libelle}
                        </p>
                        {examen.code ? (
                          <p className="truncate font-mono text-[10px] text-texte-secondaire">
                            {examen.code}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}
