"use client";

import { useTranslation } from "react-i18next";
import {
  MiseEnPageInfirmiers,
  type UtilisateurInfirmiers,
} from "@/features/infirmiers/mise-en-page-infirmiers";
import { InterfaceNotifications } from "@/features/notifications/interface-notifications";

export function ContenuNotificationsInfirmiers({
  utilisateur,
}: {
  utilisateur: UtilisateurInfirmiers;
}) {
  const { t } = useTranslation();
  return (
    <MiseEnPageInfirmiers
      utilisateur={utilisateur}
      titre={t("infirmiers.notifications.titre")}
      sousTitre={t("infirmiers.notifications.description")}
    >
      <InterfaceNotifications />
    </MiseEnPageInfirmiers>
  );
}
