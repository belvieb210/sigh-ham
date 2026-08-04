"use client";

import { useTranslation } from "react-i18next";
import {
  MiseEnPagePharmacie,
  type UtilisateurPharmacie,
} from "@/features/pharmacie/mise-en-page-pharmacie";
import { InterfaceNotifications } from "@/features/notifications/interface-notifications";

export function ContenuNotificationsPharmacie({
  utilisateur,
}: {
  utilisateur: UtilisateurPharmacie;
}) {
  const { t } = useTranslation();
  return (
    <MiseEnPagePharmacie
      utilisateur={utilisateur}
      titre={t("pharmacie.notifications.titre")}
      sousTitre={t("pharmacie.notifications.description")}
    >
      <InterfaceNotifications />
    </MiseEnPagePharmacie>
  );
}
