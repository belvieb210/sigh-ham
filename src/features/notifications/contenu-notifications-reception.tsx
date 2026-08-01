"use client";

import { useTranslation } from "react-i18next";
import { MiseEnPageReception, type UtilisateurReception } from "@/features/reception/mise-en-page-reception";
import { InterfaceNotifications } from "@/features/notifications/interface-notifications";

export function ContenuNotificationsReception({
  utilisateur,
}: {
  utilisateur: UtilisateurReception;
}) {
  const { t } = useTranslation();
  return (
    <MiseEnPageReception
      utilisateur={utilisateur}
      titre={t("reception.pages.notifications.titre")}
      sousTitre={t("reception.pages.notifications.description")}
    >
      <InterfaceNotifications />
    </MiseEnPageReception>
  );
}
