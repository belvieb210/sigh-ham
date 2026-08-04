"use client";

import { useTranslation } from "react-i18next";
import {
  MiseEnPageEglise,
  type UtilisateurEglise,
} from "@/features/eglise/mise-en-page-eglise";
import { InterfaceNotifications } from "@/features/notifications/interface-notifications";

export function ContenuNotificationsEglise({
  utilisateur,
}: {
  utilisateur: UtilisateurEglise;
}) {
  const { t } = useTranslation();
  return (
    <MiseEnPageEglise
      utilisateur={utilisateur}
      titre={t("eglise.notifications.titre")}
      sousTitre={t("eglise.notifications.description")}
    >
      <InterfaceNotifications />
    </MiseEnPageEglise>
  );
}
