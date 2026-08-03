"use client";

import { useTranslation } from "react-i18next";
import { OrientationRapide } from "@/features/reception/orientation-rapide";
import { ActionsRapidesReception } from "@/features/reception/actions-rapides-reception";
import { AffichageResumePatient } from "@/features/reception/affichage-resume-patient";
import { useResumePatient } from "@/features/reception/contexte-resume-patient";
import { useOrientationRapide } from "@/features/reception/contexte-orientation-rapide";
import { useSelectionTransfertOptionnel } from "@/features/reception/contexte-selection-transfert";
import { cn } from "@/lib/utils";

interface PropsPanneauDroit {
  variante?: "defaut" | "transferts";
  afficherTransfertManuel?: boolean;
}

function useGestionOrientation(variante: "defaut" | "transferts") {
  const { orientation, definirOrientation } = useOrientationRapide();
  const selection = useSelectionTransfertOptionnel();

  const onOrientationChange = (code: string) => {
    if (variante === "transferts") {
      if (!selection?.peutAppliquerOrientationRapide) return;
      definirOrientation(code);
      void selection.changerOrientationTransfert(code);
      return;
    }
    definirOrientation(code);
  };

  const desactiveOrientation =
    variante === "transferts" ? !(selection?.peutAppliquerOrientationRapide ?? false) : false;

  return {
    orientation,
    onOrientationChange,
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

  if (selection.orientationVerrouillee) {
    return (
      <p className="mb-2 text-xs text-amber-700">{t("reception.panneau.destinationVerrouillee")}</p>
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

/** Sections du panneau droit — visibles sur mobile et tablette (< xl) */
export function SectionsMobileReception({
  variante = "defaut",
  afficherTransfertManuel = false,
}: PropsPanneauDroit) {
  const { t } = useTranslation();
  const { orientation, onOrientationChange, selection, desactiveOrientation } =
    useGestionOrientation(variante);

  return (
    <div className="space-y-4 xl:hidden">
      <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
          {t("reception.panneau.orientationRapide")}
        </h2>
        {variante === "transferts" && selection && (
          <MessageAideOrientation selection={selection} />
        )}
        <OrientationRapide
          variante="liste"
          orientation={orientation}
          onOrientationChange={onOrientationChange}
          desactive={desactiveOrientation}
        />
        {selection?.messagePanneau && (
          <MessageResultatOrientation message={selection.messagePanneau} />
        )}
      </section>

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
  const { orientation, onOrientationChange, selection, desactiveOrientation } =
    useGestionOrientation(variante);

  return (
    <aside className="flex w-full shrink-0 flex-col gap-4">
      <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
          {t("reception.panneau.resumePatient")}
        </h2>
        <AffichageResumePatient resume={resume} variante="complet" />
      </section>

      <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
          {t("reception.panneau.orientationRapide")}
        </h2>
        {variante === "transferts" && selection && (
          <MessageAideOrientation selection={selection} />
        )}
        <OrientationRapide
          variante="liste"
          orientation={orientation}
          onOrientationChange={onOrientationChange}
          desactive={desactiveOrientation}
        />
        {selection?.messagePanneau && (
          <MessageResultatOrientation message={selection.messagePanneau} />
        )}
      </section>

      <ActionsRapidesReception afficherTransfertManuel={afficherTransfertManuel} />
    </aside>
  );
}
