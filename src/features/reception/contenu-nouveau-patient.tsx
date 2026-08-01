"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { MiseEnPageReception, type UtilisateurReception } from "@/features/reception/mise-en-page-reception";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import { FormulaireEnregistrement } from "@/features/reception/formulaire-enregistrement";
import {
  PanneauDroitReception,
  SectionsMobileReception,
} from "@/features/reception/panneau-droit-reception";
import { ResumePatientMobile } from "@/features/reception/resume-patient-mobile";
import type { DonneesFormulairePatient } from "@/lib/reception/types";

interface PropsContenuNouveauPatient {
  utilisateur: UtilisateurReception;
}

export function ContenuNouveauPatient({ utilisateur }: PropsContenuNouveauPatient) {
  const { t } = useTranslation();
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

    fetch(`/api/reception/patients/${encodeURIComponent(numeroModifier)}`)
      .then(async (res) => {
        const data = (await res.json()) as DonneesFormulairePatient & { message?: string };
        if (!res.ok) {
          throw new Error(data.message ?? t("reception.erreurs.chargementPatientImpossible"));
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
  }, [numeroModifier, t]);

  const modeEdition = Boolean(numeroModifier && donneesEdition);

  return (
    <MiseEnPageReception
      utilisateur={utilisateur}
      titre={t("reception.layout.titre")}
      sousTitre={t("reception.layout.sousTitre")}
      panneauDroit={<PanneauDroitReception />}
    >
      <div className="mx-auto w-full max-w-[960px] xl:max-w-[1100px]">
        <EnTetePageReception
          titre={
            modeEdition
              ? t("reception.pages.nouveau.titreModification")
              : t("reception.pages.nouveau.titre")
          }
          description={
            modeEdition
              ? t("reception.pages.nouveau.descriptionModification")
              : t("reception.pages.nouveau.description")
          }
          fil={[
            { label: t("reception.common.reception"), href: "/sigh/reception" },
            {
              label: modeEdition
                ? t("reception.pages.nouveau.filModification")
                : t("reception.pages.nouveau.fil"),
            },
          ]}
        />

        <div className="space-y-4 lg:space-y-5">
          <ResumePatientMobile />

          {chargementEdition ? (
            <div className="rounded-xl border border-gris-bordure bg-white px-6 py-16 text-center text-sm text-texte-secondaire shadow-sm">
              {t("reception.common.chargement")}
            </div>
          ) : erreurEdition ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center shadow-sm">
              <p className="text-sm text-red-700">{erreurEdition}</p>
            </div>
          ) : (
            <FormulaireEnregistrement
              variante="complet"
              modeEdition={modeEdition}
              donneesPrefill={modeEdition ? donneesEdition : null}
            />
          )}

          <SectionsMobileReception />
        </div>
      </div>
    </MiseEnPageReception>
  );
}
