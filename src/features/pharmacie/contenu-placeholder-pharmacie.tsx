"use client";

import { useTranslation } from "react-i18next";
import {
  MiseEnPagePharmacie,
  type UtilisateurPharmacie,
} from "@/features/pharmacie/mise-en-page-pharmacie";

interface Props {
  utilisateur: UtilisateurPharmacie;
  titreKey: string;
  sousTitreKey: string;
  messageKey: string;
}

export function ContenuPlaceholderPharmacie({
  utilisateur,
  titreKey,
  sousTitreKey,
  messageKey,
}: Props) {
  const { t } = useTranslation();

  return (
    <MiseEnPagePharmacie
      utilisateur={utilisateur}
      titre={t(titreKey)}
      sousTitre={t(sousTitreKey)}
    >
      <p className="text-sm text-texte-secondaire">{t(messageKey)}</p>
    </MiseEnPagePharmacie>
  );
}
