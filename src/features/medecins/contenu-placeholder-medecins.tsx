"use client";

import { useTranslation } from "react-i18next";
import {
  MiseEnPageMedecins,
  type UtilisateurMedecins,
} from "@/features/medecins/mise-en-page-medecins";

interface Props {
  utilisateur: UtilisateurMedecins;
  titreKey?: string;
  descriptionKey?: string;
}

export function ContenuPlaceholderMedecins({
  utilisateur,
  titreKey = "medecins.aVenir.titre",
  descriptionKey = "medecins.aVenir.description",
}: Props) {
  const { t } = useTranslation();

  return (
    <MiseEnPageMedecins
      utilisateur={utilisateur}
      titre={t(titreKey)}
      sousTitre={t(descriptionKey)}
    >
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-xl border border-dashed border-gris-bordure bg-white px-6 py-16 text-center shadow-sm">
          <h2 className="text-lg font-bold text-texte-principal">{t(titreKey)}</h2>
          <p className="mt-2 text-sm text-texte-secondaire">{t(descriptionKey)}</p>
        </div>
      </div>
    </MiseEnPageMedecins>
  );
}
