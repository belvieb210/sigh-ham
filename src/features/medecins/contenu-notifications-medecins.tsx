"use client";

import { useTranslation } from "react-i18next";
import {
  MiseEnPageMedecins,
  type UtilisateurMedecins,
} from "@/features/medecins/mise-en-page-medecins";
import { InterfaceNotifications } from "@/features/notifications/interface-notifications";

export function ContenuNotificationsMedecins({
  utilisateur,
}: {
  utilisateur: UtilisateurMedecins;
}) {
  const { t } = useTranslation();
  return (
    <MiseEnPageMedecins
      utilisateur={utilisateur}
      titre={t("medecins.notifications.titre")}
      sousTitre={t("medecins.notifications.description")}
    >
      <InterfaceNotifications />
    </MiseEnPageMedecins>
  );
}
