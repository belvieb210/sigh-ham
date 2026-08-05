"use client";

import { useTranslation } from "react-i18next";
import { ScrollText } from "lucide-react";
import {
  MiseEnPageMedecins,
  type UtilisateurMedecins,
} from "@/features/medecins/mise-en-page-medecins";

interface Props {
  utilisateur: UtilisateurMedecins;
}

export function ContenuModelesOrdonnanceMedecins({ utilisateur }: Props) {
  const { t } = useTranslation();

  return (
    <MiseEnPageMedecins
      utilisateur={utilisateur}
      titre={t("medecins.modelesOrdonnance.titre")}
      sousTitre={t("medecins.modelesOrdonnance.sousTitre")}
    >
      <div className="mx-auto flex w-full max-w-[640px] flex-col items-center gap-3 rounded-xl border border-dashed border-gris-bordure bg-white p-10 text-center">
        <ScrollText className="h-8 w-8 text-bleu-medical" />
        <p className="text-sm text-texte-secondaire">
          {t("medecins.modelesOrdonnance.aVenir")}
        </p>
      </div>
    </MiseEnPageMedecins>
  );
}
