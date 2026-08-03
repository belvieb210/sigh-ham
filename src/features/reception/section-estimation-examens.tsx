"use client";

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Calculator, Loader2, Printer } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import { CLASSE_CHAMP_RECEPTION, CLASSE_LABEL_RECEPTION } from "@/constants/reception";
import type { TypeExamenReception } from "@/lib/reception/types";
import { cn } from "@/lib/utils";
import { imprimerDevisEstimation } from "@/lib/reception/imprimer-devis-estimation";

function formaterPrix(prix: number): string {
  return `$ ${prix.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

interface PropsSectionEstimationExamens {
  medecinResponsable: string;
  onMedecinChange: (valeur: string) => void;
  modeEstimation: boolean;
  onModeEstimationChange: (actif: boolean) => void;
  examens: TypeExamenReception[];
  nomPatient: string;
  prenomPatient: string;
  telephonePatient?: string;
  numeroEnregistrement: string;
  dateEnregistrement: string;
  /** Nom de l'agent connecté qui émet le devis */
  agentNom?: string;
  remise: number;
  onRemiseChange: (valeur: number) => void;
  onErreur?: (message: string) => void;
}

export function SectionEstimationExamens({
  medecinResponsable,
  onMedecinChange,
  modeEstimation,
  onModeEstimationChange,
  examens,
  nomPatient,
  prenomPatient,
  telephonePatient = "",
  numeroEnregistrement,
  dateEnregistrement,
  agentNom = "",
  remise,
  onRemiseChange,
  onErreur,
}: PropsSectionEstimationExamens) {
  const { t } = useTranslation();
  const [impressionEnCours, setImpressionEnCours] = useState(false);
  const verrouImpression = useRef(false);

  const sousTotal = examens.reduce((total, examen) => total + examen.prix, 0);
  const remiseEffective = Math.min(Math.max(0, remise || 0), sousTotal);
  const totalNet = Math.max(0, sousTotal - remiseEffective);

  const imprimerDevis = () => {
    if (verrouImpression.current || impressionEnCours) return;
    if (examens.length === 0) {
      onErreur?.(t("reception.estimations.examenRequis"));
      return;
    }
    if (!medecinResponsable.trim()) {
      onErreur?.(t("reception.erreurs.medecinObligatoire"));
      return;
    }
    onErreur?.("");
    const dateHeure =
      dateEnregistrement && !dateEnregistrement.includes(":")
        ? `${dateEnregistrement} ${new Date().toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}`
        : dateEnregistrement ||
          new Date().toLocaleString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

    verrouImpression.current = true;
    setImpressionEnCours(true);

    void imprimerDevisEstimation({
      examens,
      medecinResponsable: medecinResponsable.trim(),
      nomPatient,
      prenomPatient,
      telephonePatient,
      numeroEnregistrement,
      dateEnregistrement: dateHeure,
      agentNom: agentNom.trim(),
      remise: remiseEffective,
      labels: {
        titreTicket: t("reception.estimations.ticket.titre"),
        numero: t("reception.estimations.ticket.numero"),
        date: t("reception.estimations.ticket.date"),
        patient: t("reception.estimations.ticket.patient"),
        telephone: t("reception.estimations.ticket.telephone"),
        medecin: t("reception.estimations.ticket.medecin"),
        description: t("reception.estimations.ticket.description"),
        prix: t("reception.estimations.ticket.prix"),
        total: t("reception.estimations.ticket.total"),
        genereLe: t("reception.estimations.ticket.genereLe"),
        agent: t("reception.estimations.ticket.agent"),
      },
    })
      .then((ok) => {
        if (!ok) {
          onErreur?.("Impossible de générer le PDF. Réessayez.");
        }
      })
      .finally(() => {
        verrouImpression.current = false;
        setImpressionEnCours(false);
      });
  };

  return (
    <div className="mt-6 space-y-4 border-t border-gris-bordure pt-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={CLASSE_LABEL_RECEPTION} htmlFor="medecin-responsable">
            {t("reception.formulaire.champs.medecinResponsable")}
            <span className="text-red-500">*</span>
          </label>
          <input
            id="medecin-responsable"
            type="text"
            value={medecinResponsable}
            onChange={(e) => onMedecinChange(e.target.value)}
            placeholder={t("reception.formulaire.placeholders.medecinResponsable")}
            className={CLASSE_CHAMP_RECEPTION}
            autoComplete="off"
          />
        </div>

        <div>
          <label className={CLASSE_LABEL_RECEPTION} htmlFor="remise-estimation">
            {t("reception.formulaire.champs.remise")}
          </label>
          <div className="relative">
            <input
              id="remise-estimation"
              type="number"
              min={0}
              max={sousTotal > 0 ? sousTotal : undefined}
              step="0.01"
              inputMode="decimal"
              value={Number.isFinite(remise) ? remise : 0}
              onChange={(e) => {
                const brut = Number(e.target.value);
                if (!Number.isFinite(brut) || brut < 0) {
                  onRemiseChange(0);
                  return;
                }
                onRemiseChange(sousTotal > 0 ? Math.min(brut, sousTotal) : brut);
              }}
              placeholder={t("reception.formulaire.placeholders.remise")}
              className={cn(CLASSE_CHAMP_RECEPTION, "pr-12")}
              autoComplete="off"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-medium text-texte-secondaire">
              $
            </span>
          </div>
          <p className="mt-1.5 text-xs text-texte-secondaire">
            {t("reception.estimations.remiseHint")}
          </p>
        </div>

        {examens.length > 0 && (
          <div className="flex flex-col justify-end rounded-xl border border-gris-bordure bg-gris-tres-clair px-4 py-3">
            <div className="flex items-center justify-between text-sm text-texte-secondaire">
              <span>{t("reception.estimations.sousTotal")}</span>
              <span className="font-medium text-texte-principal">
                {formaterPrix(sousTotal)}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm text-texte-secondaire">
              <span>{t("reception.estimations.remise")}</span>
              <span className="font-medium text-texte-principal">
                − {formaterPrix(remiseEffective)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-gris-bordure pt-2 text-sm font-bold text-texte-principal">
              <span>{t("reception.estimations.totalNet")}</span>
              <span className="text-bleu-medical">{formaterPrix(totalNet)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Bouton
          type="button"
          variante={modeEstimation ? "primaire" : "contour"}
          taille="moyen"
          className="rounded-xl"
          onClick={() => onModeEstimationChange(!modeEstimation)}
        >
          <Calculator className="h-4 w-4" />
          {t("reception.estimations.etapes.estimation")}
        </Bouton>
      </div>

      {modeEstimation && (
        <section className="rounded-xl border border-bleu-medical/30 bg-bleu-medical-clair/20 p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="text-sm font-bold text-texte-principal">
                {t("reception.estimations.devisTitre")}
              </h4>
              <p className="mt-1 text-sm text-texte-secondaire">
                {examens.length === 0
                  ? t("reception.estimations.introExamens")
                  : t("reception.examens.count", { count: examens.length })}{" "}
                {examens.length > 0 && (
                  <span className="font-semibold text-bleu-medical">
                    · {formaterPrix(totalNet)}
                    {remiseEffective > 0 && (
                      <span className="ml-1 font-normal text-texte-secondaire">
                        ({t("reception.estimations.remise")} −{formaterPrix(remiseEffective)})
                      </span>
                    )}
                  </span>
                )}
              </p>
            </div>
            <Bouton
              type="button"
              variante="primaire"
              taille="moyen"
              className={cn("shrink-0 rounded-xl print:hidden")}
              onClick={imprimerDevis}
              disabled={examens.length === 0 || impressionEnCours}
            >
              {impressionEnCours ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Printer className="h-4 w-4" />
              )}
              {impressionEnCours
                ? t("reception.common.chargement")
                : t("reception.estimations.imprimerDevis")}
            </Bouton>
          </div>
        </section>
      )}
    </div>
  );
}
