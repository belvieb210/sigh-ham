"use client";

import { useTranslation } from "react-i18next";
import {
  MiseEnPageLaboratoire,
  type UtilisateurLaboratoire,
} from "@/features/laboratoire/mise-en-page-laboratoire";
import { InterfaceNotifications } from "@/features/notifications/interface-notifications";

export function ContenuNotificationsLaboratoire({
  utilisateur,
}: {
  utilisateur: UtilisateurLaboratoire;
}) {
  const { t } = useTranslation();
  return (
    <MiseEnPageLaboratoire
      utilisateur={utilisateur}
      titre={t("laboratoire.pages.notifications.titre")}
      sousTitre={t("laboratoire.pages.notifications.description")}
    >
      <InterfaceNotifications />
    </MiseEnPageLaboratoire>
  );
}
