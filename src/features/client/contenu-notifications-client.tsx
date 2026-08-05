"use client";

import { useTranslation } from "react-i18next";
import {
  MiseEnPageClient,
  type UtilisateurClient,
} from "@/features/client/mise-en-page-client";
import { InterfaceNotifications } from "@/features/notifications/interface-notifications";

export function ContenuNotificationsClient({
  utilisateur,
}: {
  utilisateur: UtilisateurClient;
}) {
  const { t } = useTranslation();
  return (
    <MiseEnPageClient
      utilisateur={utilisateur}
      titre={t("client.notifications.titre")}
      sousTitre={t("client.notifications.description")}
    >
      <InterfaceNotifications />
    </MiseEnPageClient>
  );
}
