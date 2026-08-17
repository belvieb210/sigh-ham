"use client";

import { useTranslation } from "react-i18next";
import { OrientationRapide } from "@/features/reception/orientation-rapide";
import { ActionsRapidesReception } from "@/features/reception/actions-rapides-reception";
import { AffichageResumePatient } from "@/features/reception/affichage-resume-patient";
import { useResumePatient } from "@/features/reception/contexte-resume-patient";
import { useOrientationRapide } from "@/features/reception/contexte-orientation-rapide";
import { useSelectionTransfertOptionnel } from "@/features/reception/contexte-selection-transfert";
import { useEspaceApi } from "@/features/reception/contexte-espace-api";
import {
  ORIENTATIONS_RAPIDES_MEDECINS_EXTERNES,
} from "@/constants/medecins-externes";
import {
  ORIENTATIONS_RAPIDES_EGLISE,
} from "@/constants/eglise";
import { cn } from "@/lib/utils";

interface PropsPanneauDroit {
  variante?: "defaut" | "transferts";
  afficherTransfertManuel?: boolean;
}

function useGestionOrientation(variante: "defaut" | "transferts") {
  const { orientation, orientations, definirOrientation, definirOrientations } =
    useOrientationRapide();
  const selection = useSelectionTransfertOptionnel();

  const onOrientationChange = (code: string) => {
    definirOrientation(code);
  };

  const onOrientationsChange = (codes: string[]) => {
    const netoyes = codes.filter(Boolean);
    if (variante === "transferts") {
      if (netoyes.length === 0) return;
      if (!selection?.peutAppliquerOrientationRapide) return;
      definirOrientations(netoyes);
      void selection.changerOrientationsTransfert(netoyes);
      return;
    }
    definirOrientations(netoyes);
  };

  const desactiveOrientation =
    variante === "transferts"
      ? !(selection?.peutAppliquerOrientationRapide ?? false)
      : false;

  return {
    orientation,
    orientations,
    onOrientationChange,
    onOrientationsChange,
    selection,
    desactiveOrientation,
  };
}

function MessageAideOrientation({
  selection,
}: {
  selection: NonNullable<ReturnType<typeof useSelectionTransfertOptionnel>>;
}) {
  const { t } = useTranslation();

  if (!selection.patientSelectionne) {
    return (
      <p className="mb-2 text-xs text-texte-secondaire">{t("reception.panneau.aucunPatient")}</p>
    );
  }

  if (selection.orientationVerrouillee && (selection.dossiersCoches?.length ?? 0) === 0) {
    return (
      <p className="mb-2 text-xs text-amber-700">{t("reception.panneau.destinationVerrouillee")}</p>
    );
  }

  if ((selection.dossiersCoches?.length ?? 0) > 0) {
    return (
      <p className="mb-2 text-xs text-texte-secondaire">
        {t("reception.panneau.aideOrientationLot", {
          count: selection.dossiersCoches.length,
        })}
      </p>
    );
  }

  if (selection.peutCreerTransfertRapide) {
    return (
      <p className="mb-2 text-xs text-texte-secondaire">
        {t("reception.panneau.creerTransfertRapide")}
      </p>
    );
  }

  return (
    <p className="mb-2 text-xs text-texte-secondaire">
      {t("reception.panneau.modifierAvantConfirmer")}
    </p>
  );
}

function MessageResultatOrientation({
  message,
}: {
  message: string;
}) {
  const estErreur =
    /impossible|invalide|déjà|ne peut|erreur|sélectionnez/i.test(message);

  return (
    <p className={cn("mt-2 text-xs", estErreur ? "text-red-600" : "text-emerald-700")}>
      {message}
    </p>
  );
}

function BlocOrientation({
  variante,
}: {
  variante: "defaut" | "transferts";
}) {
  const { t } = useTranslation();
  const espace = useEspaceApi();
  const estMedecinsExternes = espace.prefixeApi.includes("medecins-externes");
  const estEglise = espace.prefixeApi.includes("eglise");
  const transfertCaisseUniquement = estMedecinsExternes || estEglise;
  const {
    orientation,
    orientations,
    onOrientationChange,
    onOrientationsChange,
    selection,
    desactiveOrientation,
  } = useGestionOrientation(variante);

  return (
    <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
        {t("reception.panneau.orientationRapide")}
      </h2>
      {variante === "transferts" && selection ? (
        <MessageAideOrientation selection={selection} />
      ) : transfertCaisseUniquement ? (
        <p className="mb-2 text-xs text-texte-secondaire">
          {estEglise
            ? t("eglise.panneau.aideOrientationCaisse", {
                defaultValue: "Transfert vers la Caisse uniquement.",
              })
            : t("medecinsExternes.panneau.aideOrientationCaisse", {
                defaultValue: "Transfert vers la Caisse uniquement.",
              })}
        </p>
      ) : (
        <p className="mb-2 text-xs text-texte-secondaire">
          {t("reception.panneau.aideOrientationReception", {
            defaultValue:
              "Cochez la ou les salles de destination (Caisse, Infirmiers, Médecin, Laboratoire, Pharmacie, etc.).",
          })}
        </p>
      )}
      <OrientationRapide
        variante="liste"
        orientation={orientation}
        orientations={orientations}
        onOrientationChange={onOrientationChange}
        onOrientationsChange={onOrientationsChange}
        multiple={!transfertCaisseUniquement}
        desactive={desactiveOrientation}
        options={
          estMedecinsExternes
            ? ORIENTATIONS_RAPIDES_MEDECINS_EXTERNES
            : estEglise
              ? ORIENTATIONS_RAPIDES_EGLISE
              : undefined
        }
      />
      {selection?.messagePanneau && (
        <MessageResultatOrientation message={selection.messagePanneau} />
      )}
    </section>
  );
}

/** Sections du panneau droit — visibles sur mobile et tablette (< xl) */
export function SectionsMobileReception({
  variante = "defaut",
  afficherTransfertManuel = false,
}: PropsPanneauDroit) {
  return (
    <div className="space-y-4 xl:hidden">
      <BlocOrientation variante={variante} />
      <ActionsRapidesReception afficherTransfertManuel={afficherTransfertManuel} />
    </div>
  );
}

/** Panneau droit complet — desktop uniquement (≥ xl) */
export function PanneauDroitReception({
  variante = "defaut",
  afficherTransfertManuel = false,
}: PropsPanneauDroit) {
  const { t } = useTranslation();
  const { resume } = useResumePatient();

  return (
    <aside className="flex w-full shrink-0 flex-col gap-4">
      <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
          {t("reception.panneau.resumePatient")}
        </h2>
        <AffichageResumePatient resume={resume} variante="complet" />
      </section>

      <BlocOrientation variante={variante} />

      <ActionsRapidesReception afficherTransfertManuel={afficherTransfertManuel} />
    </aside>
  );
}
