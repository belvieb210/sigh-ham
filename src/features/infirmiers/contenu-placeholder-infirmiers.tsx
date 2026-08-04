"use client";

import { useTranslation } from "react-i18next";
import {
  MiseEnPageInfirmiers,
  type UtilisateurInfirmiers,
} from "@/features/infirmiers/mise-en-page-infirmiers";

interface Props {
  utilisateur: UtilisateurInfirmiers;
  titreKey: string;
  sousTitreKey: string;
  messageKey: string;
}

export function ContenuPlaceholderInfirmiers({
  utilisateur,
  titreKey,
  sousTitreKey,
  messageKey,
}: Props) {
  const { t } = useTranslation();

  return (
    <MiseEnPageInfirmiers
      utilisateur={utilisateur}
      titre={t(titreKey)}
      sousTitre={t(sousTitreKey)}
    >
      <p className="text-sm text-texte-secondaire">{t(messageKey)}</p>
    </MiseEnPageInfirmiers>
  );
}
