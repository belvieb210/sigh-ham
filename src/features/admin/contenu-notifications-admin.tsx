"use client";

import { useTranslation } from "react-i18next";
import {
  MiseEnPageAdmin,
  type UtilisateurAdmin,
} from "@/features/admin/mise-en-page-admin";
import { InterfaceNotifications } from "@/features/notifications/interface-notifications";

export function ContenuNotificationsAdmin({
  utilisateur,
}: {
  utilisateur: UtilisateurAdmin;
}) {
  const { t } = useTranslation();
  return (
    <MiseEnPageAdmin
      utilisateur={utilisateur}
      titre={t("admin.notifications.titre")}
      sousTitre={t("admin.notifications.description")}
    >
      <InterfaceNotifications />
    </MiseEnPageAdmin>
  );
}
