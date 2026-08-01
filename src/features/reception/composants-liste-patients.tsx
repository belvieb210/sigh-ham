"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Check,
  Eye,
  FlaskConical,
  MoreVertical,
  Pencil,
  Printer,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import type { PatientEnregistre } from "@/constants/reception";
import { EVENEMENT_RECEPTION_PATIENTS_MODIFIES } from "@/constants/reception";
import { ModaleConfirmation } from "@/components/ui/modale-confirmation";
import { useTraductionsReception } from "@/hooks/use-traductions-reception";
import { cn } from "@/lib/utils";

interface PropsCartePatient {
  patient: PatientEnregistre;
  selectionne?: boolean;
  onSelectionner?: (patient: PatientEnregistre) => void;
  varianteActions?: VarianteActionsPatient;
  onRafraichirTransferts?: () => void;
  onVoirExamens?: (patient: PatientEnregistre) => void;
}

export function CartePatientEnregistre({
  patient,
  selectionne = false,
  onSelectionner,
  varianteActions = "defaut",
  onRafraichirTransferts,
  onVoirExamens,
}: PropsCartePatient) {
  const { t } = useTranslation();
  const cliquer = () => onSelectionner?.(patient);

  return (
    <article
      role={onSelectionner ? "button" : undefined}
      tabIndex={onSelectionner ? 0 : undefined}
      onClick={onSelectionner ? cliquer : undefined}
      onKeyDown={
        onSelectionner
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                cliquer();
              }
            }
          : undefined
      }
      className={cn(
        "rounded-xl border bg-white p-4 shadow-sm transition-shadow",
        onSelectionner && "cursor-pointer hover:shadow-md",
        selectionne
          ? "border-bleu-medical ring-2 ring-bleu-medical/20"
          : "border-gris-bordure"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-texte-principal">{patient.nom}</p>
          <p className="mt-0.5 font-mono text-[11px] text-texte-secondaire">{patient.id}</p>
          <p className="mt-1 text-xs text-texte-secondaire">{patient.telephone}</p>
        </div>
        <span className="shrink-0 text-xs font-medium tabular-nums text-texte-secondaire">
          {patient.heure}
        </span>
      </div>

      <p className="mt-2 text-sm text-texte-secondaire">{patient.motif}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <BadgeOrientation patient={patient} />
        <BadgeStatut patient={patient} />
      </div>

      <div className="mt-3 flex gap-2 border-t border-gris-bordure pt-3">
        {varianteActions === "transferts" ? (
          <div className="flex w-full items-center justify-end gap-1">
            <ActionsPatient
              patient={patient}
              onSelectionner={onSelectionner}
              variante="transferts"
              onRafraichirTransferts={onRafraichirTransferts}
              onVoirExamens={onVoirExamens}
            />
          </div>
        ) : (
          <>
            {patient.transfertId && onVoirExamens && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onVoirExamens(patient);
                }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gris-bordure py-2 text-xs font-medium text-texte-principal transition-colors hover:border-bleu-medical/40 hover:bg-bleu-medical-clair/30"
              >
                <FlaskConical className="h-3.5 w-3.5" />
                {t("reception.common.examens")}
              </button>
            )}
            <div
              className="flex shrink-0 items-center gap-0.5"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <ActionsGestionPatient
                patient={patient}
                onApresSuppression={onRafraichirTransferts}
              />
              {patient.transfertId && onRafraichirTransferts && (
                <MenuActionsTransfert patient={patient} onRafraichir={onRafraichirTransferts} />
              )}
            </div>
            {!patient.transfertId && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectionner?.(patient);
                }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gris-bordure py-2 text-xs font-medium text-texte-principal transition-colors hover:border-bleu-medical/40 hover:bg-bleu-medical-clair/30"
              >
                <Eye className="h-3.5 w-3.5" />
                {t("reception.common.selectionner")}
              </button>
            )}
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gris-bordure py-2 text-xs font-medium text-texte-principal transition-colors hover:border-bleu-medical/40 hover:bg-bleu-medical-clair/30"
            >
              <Printer className="h-3.5 w-3.5" />
              {t("reception.common.imprimer")}
            </button>
          </>
        )}
      </div>
    </article>
  );
}

export function BadgeOrientation({ patient }: { patient: PatientEnregistre }) {
  const { traduireOrientation } = useTraductionsReception();
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${patient.orientationCouleur}`}
    >
      {traduireOrientation(patient.orientation)}
    </span>
  );
}

export function BadgeStatut({ patient }: { patient: PatientEnregistre }) {
  const { traduireStatut } = useTraductionsReception();
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${patient.statutCouleur}`}
    >
      {traduireStatut(patient.statut)}
    </span>
  );
}

export type VarianteActionsPatient = "defaut" | "transferts";

function ActionsGestionPatient({
  patient,
  onApresSuppression,
}: {
  patient: PatientEnregistre;
  onApresSuppression?: () => void;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const [modaleOuverte, setModaleOuverte] = useState(false);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const [erreurSuppression, setErreurSuppression] = useState<string | null>(null);

  const modifier = () => {
    router.push(
      `/sigh/reception/nouveau?modifier=${encodeURIComponent(patient.id)}`
    );
  };

  const fermerModale = () => {
    if (suppressionEnCours) return;
    setModaleOuverte(false);
    setErreurSuppression(null);
  };

  const confirmerSuppression = async () => {
    if (suppressionEnCours) return;

    setSuppressionEnCours(true);
    setErreurSuppression(null);

    try {
      const res = await fetch(
        `/api/reception/patients/${encodeURIComponent(patient.id)}`,
        { method: "DELETE" }
      );
      const data = (await res.json()) as { message?: string };
      if (!res.ok) {
        throw new Error(data.message ?? t("reception.erreurs.suppressionImpossible"));
      }
      setModaleOuverte(false);
      onApresSuppression?.();
      window.dispatchEvent(new CustomEvent(EVENEMENT_RECEPTION_PATIENTS_MODIFIES));
    } catch (error) {
      setErreurSuppression(
        error instanceof Error ? error.message : t("reception.erreurs.suppressionImpossible")
      );
    } finally {
      setSuppressionEnCours(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          modifier();
        }}
        className="rounded-lg p-1.5 text-texte-secondaire transition-colors hover:bg-bleu-medical-clair hover:text-bleu-medical"
        aria-label={t("reception.actions.modifierPatient")}
        title={t("reception.actions.modifierPatient")}
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        disabled={suppressionEnCours}
        onClick={(e) => {
          e.stopPropagation();
          setErreurSuppression(null);
          setModaleOuverte(true);
        }}
        className="rounded-lg p-1.5 text-texte-secondaire transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
        aria-label={t("reception.actions.supprimerPatient")}
        title={t("reception.actions.supprimerPatient")}
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <ModaleConfirmation
        ouverte={modaleOuverte}
        onFermer={fermerModale}
        onConfirmer={confirmerSuppression}
        variante="danger"
        titre={t("reception.modales.supprimerPatientTitre")}
        description={t("reception.modales.supprimerPatientDescription", {
          nom: patient.nom,
          id: patient.id,
        })}
        libelleConfirmer={
          suppressionEnCours
            ? t("reception.modales.suppressionEnCours")
            : t("reception.modales.supprimerPatientConfirmer")
        }
        libelleAnnuler={t("reception.common.annuler")}
        libelleFermer={t("reception.common.fermer")}
        enCours={suppressionEnCours}
        erreur={erreurSuppression}
      />
    </>
  );
}

function MenuActionsTransfert({
  patient,
  onRafraichir,
}: {
  patient: PatientEnregistre;
  onRafraichir?: () => void;
}) {
  const { t } = useTranslation();
  const [ouvert, setOuvert] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const boutonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const peutConfirmer = patient.statutTransfert === "EN_ATTENTE" && !patient.enRecuperation;
  const peutRejeter = patient.statutTransfert === "EN_ATTENTE" && !patient.enRecuperation;
  const peutRecuperer = patient.enRecuperation === true && patient.statutTransfert === "REFUSE";

  const mettreAJourPosition = useCallback(() => {
    const bouton = boutonRef.current;
    if (!bouton) return;

    const rect = bouton.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight ?? 140;
    const menuWidth = menuRef.current?.offsetWidth ?? 180;
    const marge = 8;
    const espaceSous = window.innerHeight - rect.bottom;
    const ouvrirVersLeHaut = espaceSous < menuHeight + marge && rect.top > menuHeight + marge;

    setPosition({
      top: ouvrirVersLeHaut ? rect.top - menuHeight - 4 : rect.bottom + 4,
      left: Math.max(marge, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - marge)),
    });
  }, []);

  useLayoutEffect(() => {
    if (!ouvert) return;
    mettreAJourPosition();
  }, [ouvert, mettreAJourPosition, peutConfirmer, peutRejeter, peutRecuperer, erreur]);

  useEffect(() => {
    if (!ouvert) return;

    const fermer = (event: MouseEvent) => {
      const cible = event.target as Node;
      if (boutonRef.current?.contains(cible) || menuRef.current?.contains(cible)) return;
      setOuvert(false);
    };

    const repositionner = () => mettreAJourPosition();

    document.addEventListener("mousedown", fermer);
    window.addEventListener("scroll", repositionner, true);
    window.addEventListener("resize", repositionner);

    return () => {
      document.removeEventListener("mousedown", fermer);
      window.removeEventListener("scroll", repositionner, true);
      window.removeEventListener("resize", repositionner);
    };
  }, [ouvert, mettreAJourPosition]);

  const executerAction = async (action: "confirmer" | "rejeter" | "recuperer") => {
    if (!patient.transfertId || enCours) return;

    setEnCours(true);
    setErreur(null);

    try {
      const res = await fetch(
        `/api/reception/transferts/${encodeURIComponent(patient.transfertId)}/actions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        }
      );

      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? t("reception.erreurs.actionImpossible"));

      setOuvert(false);
      onRafraichir?.();
      window.dispatchEvent(new CustomEvent(EVENEMENT_RECEPTION_PATIENTS_MODIFIES));
    } catch (error) {
      setErreur(error instanceof Error ? error.message : t("reception.erreurs.erreurInattendue"));
    } finally {
      setEnCours(false);
    }
  };

  const menu =
    ouvert &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        ref={menuRef}
        style={{ top: position.top, left: position.left }}
        className="fixed z-[100] min-w-[180px] rounded-lg border border-gris-bordure bg-white py-1 shadow-lg"
        role="menu"
      >
        {peutConfirmer && (
          <button
            type="button"
            disabled={enCours}
            onClick={(e) => {
              e.stopPropagation();
              void executerAction("confirmer");
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-50"
            role="menuitem"
          >
            <Check className="h-3.5 w-3.5" />
            {t("reception.common.confirmer")}
          </button>
        )}
        {peutRejeter && (
          <button
            type="button"
            disabled={enCours}
            onClick={(e) => {
              e.stopPropagation();
              void executerAction("rejeter");
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
            role="menuitem"
          >
            <X className="h-3.5 w-3.5" />
            {t("reception.common.rejeter")}
          </button>
        )}
        {peutRecuperer && (
          <button
            type="button"
            disabled={enCours}
            onClick={(e) => {
              e.stopPropagation();
              void executerAction("recuperer");
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-bleu-medical transition-colors hover:bg-bleu-medical-clair/40 disabled:opacity-50"
            role="menuitem"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {t("reception.common.recuperer")}
          </button>
        )}
        {!peutConfirmer && !peutRejeter && !peutRecuperer && (
          <p className="px-3 py-2 text-xs text-texte-secondaire">
            {t("reception.common.aucuneAction")}
          </p>
        )}
        {erreur && (
          <p className="border-t border-gris-bordure px-3 py-2 text-xs text-red-600">{erreur}</p>
        )}
      </div>,
      document.body
    );

  return (
    <>
      <button
        ref={boutonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOuvert((v) => !v);
          setErreur(null);
        }}
        disabled={!patient.transfertId}
        className="rounded-lg p-1.5 text-texte-secondaire transition-colors hover:bg-gris-tres-clair hover:text-texte-principal disabled:opacity-40"
        aria-label={t("reception.common.plusActions", { nom: patient.nom })}
        aria-expanded={ouvert ? "true" : "false"}
        aria-haspopup="menu"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {menu}
    </>
  );
}

export function ActionsPatient({
  patient,
  onSelectionner,
  variante = "defaut",
  onRafraichirTransferts,
  onVoirExamens,
}: {
  patient: PatientEnregistre;
  onSelectionner?: (patient: PatientEnregistre) => void;
  variante?: VarianteActionsPatient;
  onRafraichirTransferts?: () => void;
  onVoirExamens?: (patient: PatientEnregistre) => void;
}) {
  const { t } = useTranslation();

  if (variante === "transferts") {
    return (
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            (onVoirExamens ?? onSelectionner)?.(patient);
          }}
          className="rounded-lg p-1.5 text-texte-secondaire transition-colors hover:bg-gris-tres-clair hover:text-texte-principal"
          aria-label={t("reception.common.voirExamens")}
          title={t("reception.common.voirExamens")}
        >
          <Eye className="h-4 w-4" />
        </button>
        <MenuActionsTransfert patient={patient} onRafraichir={onRafraichirTransferts} />
      </div>
    );
  }

  return (
    <div className="flex gap-1">
      {patient.transfertId && onVoirExamens ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onVoirExamens(patient);
          }}
          className="rounded-lg p-1.5 text-texte-secondaire transition-colors hover:bg-gris-tres-clair hover:text-texte-principal"
          aria-label={t("reception.common.voirExamens")}
          title={t("reception.common.voirExamens")}
        >
          <Eye className="h-4 w-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectionner?.(patient);
          }}
          className="rounded-lg p-1.5 text-texte-secondaire transition-colors hover:bg-bleu-medical-clair hover:text-bleu-medical"
          aria-label={t("reception.common.selectionnerPatient")}
          title={t("reception.common.selectionnerPatient")}
        >
          <Eye className="h-4 w-4" />
        </button>
      )}
      <ActionsGestionPatient patient={patient} onApresSuppression={onRafraichirTransferts} />
      {patient.transfertId && onRafraichirTransferts && (
        <MenuActionsTransfert patient={patient} onRafraichir={onRafraichirTransferts} />
      )}
      <button
        type="button"
        onClick={(e) => e.stopPropagation()}
        className="rounded-lg p-1.5 text-texte-secondaire transition-colors hover:bg-bleu-medical-clair hover:text-bleu-medical"
        aria-label={t("reception.actions.imprimerFiche")}
      >
        <Printer className="h-4 w-4" />
      </button>
    </div>
  );
}

interface PropsTableauPatients {
  patients: PatientEnregistre[];
  titre?: string;
  afficherEnTete?: boolean;
  compact?: boolean;
  patientSelectionneId?: string | null;
  onSelectionnerPatient?: (patient: PatientEnregistre) => void;
  varianteActions?: VarianteActionsPatient;
  onRafraichirTransferts?: () => void;
  onVoirExamens?: (patient: PatientEnregistre) => void;
}

export function TableauPatients({
  patients,
  titre = "",
  afficherEnTete = true,
  compact = false,
  patientSelectionneId = null,
  onSelectionnerPatient,
  varianteActions = "defaut",
  onRafraichirTransferts,
  onVoirExamens,
}: PropsTableauPatients) {
  const { t } = useTranslation();

  return (
    <section className="rounded-xl border border-gris-bordure bg-white shadow-sm">
      {afficherEnTete && (
        <div className="border-b border-gris-bordure px-4 py-3 lg:px-5 lg:py-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-bleu-medical lg:text-texte-secondaire">
            {titre}
          </h2>
        </div>
      )}

      {/* Cartes mobile */}
      <div className={`space-y-3 lg:hidden ${compact ? "p-3" : "p-3 sm:p-4"}`}>
        {patients.length === 0 ? (
          <p className="py-8 text-center text-sm text-texte-secondaire">
            {t("reception.erreurs.aucunPatientCourt")}
          </p>
        ) : (
          patients.map((patient) => (
            <CartePatientEnregistre
              key={patient.cleListe}
              patient={patient}
              selectionne={patient.id === patientSelectionneId}
              onSelectionner={onSelectionnerPatient}
              varianteActions={varianteActions}
              onRafraichirTransferts={onRafraichirTransferts}
              onVoirExamens={onVoirExamens}
            />
          ))
        )}
      </div>

      {/* Tableau desktop */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-gris-bordure bg-gris-tres-clair/80 text-xs font-semibold uppercase tracking-wide text-texte-secondaire">
              <th className="px-5 py-3.5">{t("reception.liste.colonnes.id")}</th>
              <th className="px-5 py-3.5">{t("reception.liste.colonnes.nom")}</th>
              <th className="px-5 py-3.5">{t("reception.liste.colonnes.telephone")}</th>
              <th className="px-5 py-3.5">{t("reception.liste.colonnes.motif")}</th>
              <th className="px-5 py-3.5">{t("reception.liste.colonnes.orientation")}</th>
              <th className="px-5 py-3.5">{t("reception.liste.colonnes.statut")}</th>
              <th className="px-5 py-3.5">{t("reception.liste.colonnes.heure")}</th>
              <th className="px-5 py-3.5">{t("reception.liste.colonnes.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {patients.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-sm text-texte-secondaire">
                  {t("reception.liste.aucunPatient")}
                </td>
              </tr>
            ) : (
              patients.map((patient) => (
                <tr
                  key={patient.cleListe}
                  onClick={() => onSelectionnerPatient?.(patient)}
                  className={cn(
                    "border-b border-gris-bordure/60 transition-colors last:border-b-0",
                    onSelectionnerPatient && "cursor-pointer hover:bg-gris-tres-clair/40",
                    patient.id === patientSelectionneId && "bg-bleu-medical-clair/30"
                  )}
                >
                  <td className="px-5 py-3.5 font-mono text-xs text-texte-secondaire">
                    {patient.id}
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-texte-principal">
                    {patient.nom}
                  </td>
                  <td className="px-5 py-3.5 text-texte-secondaire">{patient.telephone}</td>
                  <td className="px-5 py-3.5 text-texte-secondaire">{patient.motif}</td>
                  <td className="px-5 py-3.5">
                    <BadgeOrientation patient={patient} />
                  </td>
                  <td className="px-5 py-3.5">
                    <BadgeStatut patient={patient} />
                  </td>
                  <td className="px-5 py-3.5 tabular-nums text-texte-secondaire">
                    {patient.heure}
                  </td>
                  <td className="relative overflow-visible px-5 py-3.5">
                    <ActionsPatient
                      patient={patient}
                      onSelectionner={onSelectionnerPatient}
                      variante={varianteActions}
                      onRafraichirTransferts={onRafraichirTransferts}
                      onVoirExamens={onVoirExamens}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
