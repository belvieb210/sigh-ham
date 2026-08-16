"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useEspaceApi } from "@/features/reception/contexte-espace-api";
import * as Dialog from "@radix-ui/react-dialog";
import { FlaskConical, Loader2, X } from "lucide-react";
import type { PatientEnregistre } from "@/constants/reception";
import { Bouton } from "@/components/ui/bouton";
import { SelectionExamensInitiaux } from "@/features/reception/selection-examens-initiaux";
import type { TypeExamenReception } from "@/lib/reception/types";

interface PropsModaleExamensTransfert {
  patient: PatientEnregistre | null;
  ouverte: boolean;
  onFermer: () => void;
  onModifie?: () => void;
}

function idsEgaux(a: TypeExamenReception[], b: TypeExamenReception[]) {
  if (a.length !== b.length) return false;
  const setA = new Set(a.map((e) => e.id));
  return b.every((e) => setA.has(e.id));
}

export function ModaleExamensTransfert({
  patient,
  ouverte,
  onFermer,
  onModifie,
}: PropsModaleExamensTransfert) {
  const espace = useEspaceApi();
  const { t } = useTranslation();
  const [selection, setSelection] = useState<TypeExamenReception[]>([]);
  const [selectionInitiale, setSelectionInitiale] = useState<TypeExamenReception[]>([]);
  const [modifiable, setModifiable] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [sauvegarde, setSauvegarde] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const modifie = useMemo(
    () => !idsEgaux(selection, selectionInitiale),
    [selection, selectionInitiale]
  );

  const chargerExamens = useCallback(async () => {
    if (!patient?.transfertId) return;

    setChargement(true);
    setErreur(null);

    try {
      const res = await fetch(
        `${espace.prefixeApi}/transferts/${encodeURIComponent(patient.transfertId)}/examens`
      );
      const data = (await res.json()) as {
        examens?: TypeExamenReception[];
        modifiable?: boolean;
        message?: string;
      };

      if (!res.ok) throw new Error(data.message ?? t("reception.erreurs.chargementImpossible"));

      const examens = data.examens ?? [];
      setSelection(examens);
      setSelectionInitiale(examens);
      setModifiable(data.modifiable ?? false);
    } catch (error) {
      setErreur(error instanceof Error ? error.message : t("reception.erreurs.erreurInattendue"));
      setSelection([]);
      setSelectionInitiale([]);
      setModifiable(false);
    } finally {
      setChargement(false);
    }
  }, [patient?.transfertId, t]);

  useEffect(() => {
    if (ouverte && patient?.transfertId) {
      void chargerExamens();
    }
    if (!ouverte) {
      setErreur(null);
      setSauvegarde(false);
    }
  }, [ouverte, patient?.transfertId, chargerExamens]);

  const fermer = () => {
    setSelection(selectionInitiale);
    onFermer();
  };

  const sauvegarder = async () => {
    if (!patient?.transfertId || !modifiable || sauvegarde) return;

    setSauvegarde(true);
    setErreur(null);

    try {
      const res = await fetch(
        `${espace.prefixeApi}/transferts/${encodeURIComponent(patient.transfertId)}/examens`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ examensIds: selection.map((e) => e.id) }),
        }
      );

      const data = (await res.json()) as {
        examens?: TypeExamenReception[];
        message?: string;
      };

      if (!res.ok) throw new Error(data.message ?? t("reception.erreurs.enregistrementImpossible"));

      const examens = data.examens ?? selection;
      setSelection(examens);
      setSelectionInitiale(examens);
      onModifie?.();
      onFermer();
    } catch (error) {
      setErreur(error instanceof Error ? error.message : t("reception.erreurs.erreurInattendue"));
    } finally {
      setSauvegarde(false);
    }
  };

  const descriptionPatient = patient
    ? `${patient.nom} · ${patient.id} — ${
        modifiable
          ? t("reception.modales.descriptionEditable")
          : t("reception.modales.descriptionLecture")
      }`
    : t("reception.modales.titrePatient");

  return (
    <Dialog.Root
      open={ouverte}
      onOpenChange={(open) => {
        if (!open) fermer();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[110] bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[111] flex max-h-[min(90vh,820px)] w-[min(calc(100vw-2rem),720px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-gris-bordure bg-white shadow-xl focus:outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-gris-bordure px-5 py-4 sm:px-6">
            <div className="min-w-0">
              <Dialog.Title className="flex items-center gap-2 text-lg font-bold text-texte-principal">
                <FlaskConical className="h-5 w-5 shrink-0 text-bleu-medical" />
                {t("reception.modales.titre")}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-texte-secondaire">
                {descriptionPatient}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-lg p-2 text-texte-secondaire transition-colors hover:bg-gris-tres-clair hover:text-texte-principal"
                aria-label={t("reception.common.fermer")}
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
            {chargement ? (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-texte-secondaire">
                <Loader2 className="h-5 w-5 animate-spin" />
                {t("reception.modales.chargement")}
              </div>
            ) : !patient?.transfertId ? (
              <p className="py-12 text-center text-sm text-texte-secondaire">
                {t("reception.modales.sansTransfert")}
              </p>
            ) : erreur && selection.length === 0 ? (
              <p className="py-12 text-center text-sm text-red-600">{erreur}</p>
            ) : (
            <SelectionExamensInitiaux
              selectionExamens={selection}
              selectionPaquets={[]}
              onChangeExamens={setSelection}
              onChangePaquets={() => {}}
              lectureSeule={!modifiable}
            />
            )}
            {erreur && selection.length > 0 && (
              <p className="mt-3 text-sm text-red-600">{erreur}</p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-gris-bordure bg-gris-tres-clair/30 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <Bouton type="button" variante="contour" taille="moyen" onClick={fermer}>
              {t("reception.common.annuler")}
            </Bouton>
            {modifiable && (
              <Bouton
                type="button"
                variante="primaire"
                taille="moyen"
                disabled={!modifie || sauvegarde || chargement}
                onClick={() => void sauvegarder()}
              >
                {sauvegarde ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("reception.modales.enregistrement")}
                  </>
                ) : (
                  t("reception.common.modifier")
                )}
              </Bouton>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
