"use client";

import { useTranslation } from "react-i18next";
import { Calculator, Printer } from "lucide-react";
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
  onErreur,
}: PropsSectionEstimationExamens) {
  const { t } = useTranslation();

  const montantTotal = examens.reduce((total, examen) => total + examen.prix, 0);

  const imprimerDevis = () => {
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
    const ok = imprimerDevisEstimation({
      examens,
      medecinResponsable: medecinResponsable.trim(),
      nomPatient,
      prenomPatient,
      telephonePatient,
      numeroEnregistrement,
      dateEnregistrement: dateHeure,
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
      },
    });
    if (!ok) {
      onErreur?.("Impossible de lancer l'impression. Réessayez.");
    }
  };

  return (
    <div className="mt-6 space-y-4 border-t border-gris-bordure pt-5">
        <div>
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
                      · {formaterPrix(montantTotal)}
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
                disabled={examens.length === 0}
              >
                <Printer className="h-4 w-4" />
                {t("reception.estimations.imprimerDevis")}
              </Bouton>
            </div>
          </section>
        )}
    </div>
  );
}
