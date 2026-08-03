"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import * as Dialog from "@radix-ui/react-dialog";
import { FlaskConical, Loader2, Stethoscope, X } from "lucide-react";
import { formaterMontantCaisse } from "@/features/caisse/utils-format";
import type { PatientTransfertCaisse } from "@/lib/caisse/types";

interface ExamenDetail {
  id: string;
  libelle: string;
  categorie: string;
  prix: number;
}

interface PropsModaleExamensCaisse {
  patient: PatientTransfertCaisse | null;
  ouverte: boolean;
  onFermer: () => void;
}

export function ModaleExamensCaisse({
  patient,
  ouverte,
  onFermer,
}: PropsModaleExamensCaisse) {
  const { t } = useTranslation();
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [medecin, setMedecin] = useState<string | null>(null);
  const [examens, setExamens] = useState<ExamenDetail[]>([]);

  useEffect(() => {
    if (!ouverte || !patient?.dossierId) return;

    let annule = false;
    (async () => {
      setChargement(true);
      setErreur(null);
      try {
        const res = await fetch(
          `/api/caisse/dossiers/${encodeURIComponent(patient.dossierId)}/details`
        );
        const data = (await res.json()) as {
          examens?: ExamenDetail[];
          medecinResponsable?: string | null;
          message?: string;
        };
        if (!res.ok) throw new Error(data.message ?? "Chargement impossible.");
        if (!annule) {
          setExamens(data.examens ?? []);
          setMedecin(data.medecinResponsable ?? patient.medecinResponsable);
        }
      } catch (e) {
        if (!annule) {
          setErreur(e instanceof Error ? e.message : "Erreur inattendue.");
          setExamens([]);
          setMedecin(patient.medecinResponsable);
        }
      } finally {
        if (!annule) setChargement(false);
      }
    })();

    return () => {
      annule = true;
    };
  }, [ouverte, patient]);

  return (
    <Dialog.Root
      open={ouverte}
      onOpenChange={(o) => {
        if (!o) onFermer();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-[min(560px,92vw)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-xl">
          <div className="flex items-start justify-between gap-3 border-b border-gris-bordure px-4 py-3">
            <div>
              <Dialog.Title className="flex items-center gap-2 text-sm font-bold text-texte-principal">
                <FlaskConical className="h-4 w-4 text-bleu-medical" />
                {t("caisse.transferts.modaleExamens.titre")}
              </Dialog.Title>
              {patient && (
                <Dialog.Description className="mt-1 text-xs text-texte-secondaire">
                  {patient.nomComplet} · {patient.numeroPatient}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              className="rounded-lg p-1.5 text-texte-secondaire hover:bg-slate-100"
              aria-label={t("caisse.transferts.modaleExamens.fermer")}
            >
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-gris-bordure bg-slate-50 px-3 py-2.5">
              <Stethoscope className="mt-0.5 h-4 w-4 shrink-0 text-bleu-medical" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-texte-secondaire">
                  {t("caisse.transferts.modaleExamens.medecin")}
                </p>
                <p className="text-sm font-medium text-texte-principal">
                  {medecin?.trim() || t("caisse.transferts.modaleExamens.medecinInconnu")}
                </p>
              </div>
            </div>

            {chargement ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-texte-secondaire">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("caisse.transferts.chargement")}
              </div>
            ) : erreur ? (
              <p className="py-6 text-center text-sm text-red-600">{erreur}</p>
            ) : examens.length === 0 ? (
              <p className="py-6 text-center text-sm text-texte-secondaire">
                {t("caisse.transferts.modaleExamens.aucunExamen")}
              </p>
            ) : (
              <ul className="space-y-2">
                {examens.map((ex, index) => (
                  <li
                    key={ex.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-gris-bordure px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-texte-principal">
                        <span className="mr-2 text-texte-secondaire">{index + 1}.</span>
                        {ex.libelle}
                      </p>
                      <p className="text-[11px] text-texte-secondaire">{ex.categorie}</p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-bleu-medical">
                      {formaterMontantCaisse(ex.prix)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
