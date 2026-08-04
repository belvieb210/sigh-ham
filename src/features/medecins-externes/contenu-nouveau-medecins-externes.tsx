"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { UserPlus } from "lucide-react";
import {
  MiseEnPageMedecinsExternes,
  type UtilisateurMedecinsExternes,
} from "@/features/medecins-externes/mise-en-page-medecins-externes";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import { FormulaireEnregistrement } from "@/features/reception/formulaire-enregistrement";
import {
  PanneauDroitReception,
  SectionsMobileReception,
} from "@/features/reception/panneau-droit-reception";
import { ResumePatientMobile } from "@/features/reception/resume-patient-mobile";
import { useEspaceApi } from "@/features/reception/contexte-espace-api";
import type { DonneesFormulairePatient } from "@/lib/reception/types";

export function ContenuNouveauMedecinsExternes({
  utilisateur,
}: {
  utilisateur: UtilisateurMedecinsExternes;
}) {
  const { t } = useTranslation();
  const espace = useEspaceApi();
  const searchParams = useSearchParams();
  const numeroModifier = searchParams.get("modifier")?.trim() || null;

  const [donneesEdition, setDonneesEdition] = useState<DonneesFormulairePatient | null>(null);
  const [chargementEdition, setChargementEdition] = useState(Boolean(numeroModifier));
  const [erreurEdition, setErreurEdition] = useState<string | null>(null);

  useEffect(() => {
    if (!numeroModifier) {
      setDonneesEdition(null);
      setChargementEdition(false);
      setErreurEdition(null);
      return;
    }

    let annule = false;
    setChargementEdition(true);
    setErreurEdition(null);

    fetch(`${espace.prefixeApi}/patients/${encodeURIComponent(numeroModifier)}`)
      .then(async (res) => {
        const data = (await res.json()) as DonneesFormulairePatient & {
          message?: string;
        };
        if (!res.ok) {
          throw new Error(
            data.message ?? t("reception.erreurs.chargementPatientImpossible")
          );
        }
        return data;
      })
      .then((patient) => {
        if (!annule) {
          setDonneesEdition(patient);
          setChargementEdition(false);
        }
      })
      .catch((error: unknown) => {
        if (!annule) {
          setErreurEdition(
            error instanceof Error
              ? error.message
              : t("reception.erreurs.chargementPatientImpossible")
          );
          setDonneesEdition(null);
          setChargementEdition(false);
        }
      });

    return () => {
      annule = true;
    };
  }, [numeroModifier, t, espace.prefixeApi]);

  const modeEdition = Boolean(numeroModifier && donneesEdition);

  return (
    <MiseEnPageMedecinsExternes
      utilisateur={utilisateur}
      titre={
        modeEdition
          ? t("reception.pages.nouveau.titreModification")
          : t("reception.pages.nouveau.titre")
      }
      sousTitre={t("medecinsExternes.layout.sousTitre")}
      panneauDroit={<PanneauDroitReception />}
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <EnTetePageReception
          icone={UserPlus}
          titre={
            modeEdition
              ? t("reception.pages.nouveau.titreModification")
              : t("reception.pages.nouveau.titre")
          }
          description={t("reception.pages.nouveau.description")}
          fil={[
            { label: t(espace.cleFilRacine), href: espace.cheminBase },
            {
              label: modeEdition
                ? t("reception.pages.nouveau.filModification")
                : t("reception.pages.nouveau.fil"),
            },
          ]}
        />

        {chargementEdition ? (
          <p className="mt-6 text-sm text-texte-secondaire">
            {t("reception.common.chargement")}
          </p>
        ) : erreurEdition ? (
          <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erreurEdition}
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            <FormulaireEnregistrement
              variante="complet"
              modeEdition={modeEdition}
              donneesPrefill={donneesEdition}
              agentNom={`${utilisateur.prenom} ${utilisateur.nom}`.trim()}
            />
            <ResumePatientMobile />
            <SectionsMobileReception />
          </div>
        )}
      </div>
    </MiseEnPageMedecinsExternes>
  );
}
