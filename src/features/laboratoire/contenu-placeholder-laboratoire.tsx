"use client";

import { useTranslation } from "react-i18next";
import {
  MiseEnPageLaboratoire,
  type UtilisateurLaboratoire,
} from "@/features/laboratoire/mise-en-page-laboratoire";

interface PropsContenuPlaceholderLaboratoire {
  utilisateur: UtilisateurLaboratoire;
  titreKey?: string;
  descriptionKey?: string;
}

export function ContenuPlaceholderLaboratoire({
  utilisateur,
  titreKey = "laboratoire.aVenir.titre",
  descriptionKey = "laboratoire.aVenir.description",
}: PropsContenuPlaceholderLaboratoire) {
  const { t } = useTranslation();

  return (
    <MiseEnPageLaboratoire
      utilisateur={utilisateur}
      titre={t(titreKey)}
      sousTitre={t(descriptionKey)}
    >
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-xl border border-dashed border-gris-bordure bg-white px-6 py-16 text-center shadow-sm">
          <h2 className="text-lg font-bold text-texte-principal">
            {t(titreKey)}
          </h2>
          <p className="mt-2 text-sm text-texte-secondaire">
            {t(descriptionKey)}
          </p>
        </div>
      </div>
    </MiseEnPageLaboratoire>
  );
}
