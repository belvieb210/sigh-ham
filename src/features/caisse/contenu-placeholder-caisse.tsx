"use client";

import { useTranslation } from "react-i18next";
import { MiseEnPageCaisse, type UtilisateurCaisse } from "@/features/caisse/mise-en-page-caisse";

interface PropsContenuPlaceholderCaisse {
  utilisateur: UtilisateurCaisse;
  titreKey?: string;
  descriptionKey?: string;
}

export function ContenuPlaceholderCaisse({
  utilisateur,
  titreKey = "caisse.aVenir.titre",
  descriptionKey = "caisse.aVenir.description",
}: PropsContenuPlaceholderCaisse) {
  const { t } = useTranslation();

  return (
    <MiseEnPageCaisse
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
    </MiseEnPageCaisse>
  );
}
