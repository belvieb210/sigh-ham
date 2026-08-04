"use client";

import { useTranslation } from "react-i18next";
import {
  MiseEnPageMedecinsExternes,
  type UtilisateurMedecinsExternes,
} from "@/features/medecins-externes/mise-en-page-medecins-externes";

interface Props {
  utilisateur: UtilisateurMedecinsExternes;
  titreKey: string;
  sousTitreKey: string;
  messageKey: string;
}

export function ContenuPlaceholderMedecinsExternes({
  utilisateur,
  titreKey,
  sousTitreKey,
  messageKey,
}: Props) {
  const { t } = useTranslation();

  return (
    <MiseEnPageMedecinsExternes
      utilisateur={utilisateur}
      titre={t(titreKey)}
      sousTitre={t(sousTitreKey)}
    >
      <p className="text-sm text-texte-secondaire">{t(messageKey)}</p>
    </MiseEnPageMedecinsExternes>
  );
}
