"use client";

import { useTranslation } from "react-i18next";
import { MiseEnPageCaisse, type UtilisateurCaisse } from "@/features/caisse/mise-en-page-caisse";
import { InterfaceNotifications } from "@/features/notifications/interface-notifications";

export function ContenuNotificationsCaisse({
  utilisateur,
}: {
  utilisateur: UtilisateurCaisse;
}) {
  const { t } = useTranslation();
  return (
    <MiseEnPageCaisse
      utilisateur={utilisateur}
      titre={t("caisse.pages.notifications.titre")}
      sousTitre={t("caisse.pages.notifications.description")}
    >
      <InterfaceNotifications />
    </MiseEnPageCaisse>
  );
}
