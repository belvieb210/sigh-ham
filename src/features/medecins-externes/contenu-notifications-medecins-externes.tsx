"use client";

import { useTranslation } from "react-i18next";
import {
  MiseEnPageMedecinsExternes,
  type UtilisateurMedecinsExternes,
} from "@/features/medecins-externes/mise-en-page-medecins-externes";
import { InterfaceNotifications } from "@/features/notifications/interface-notifications";

export function ContenuNotificationsMedecinsExternes({
  utilisateur,
}: {
  utilisateur: UtilisateurMedecinsExternes;
}) {
  const { t } = useTranslation();
  return (
    <MiseEnPageMedecinsExternes
      utilisateur={utilisateur}
      titre={t("medecinsExternes.notifications.titre")}
      sousTitre={t("medecinsExternes.notifications.description")}
    >
      <InterfaceNotifications />
    </MiseEnPageMedecinsExternes>
  );
}
