"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Calendar } from "lucide-react";
import {
  MiseEnPageClient,
  type UtilisateurClient,
} from "@/features/client/mise-en-page-client";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import { InboxDemandesRendezVous } from "@/features/rdv/inbox-demandes-rendez-vous";

export function ContenuRendezVousClient({
  utilisateur,
}: {
  utilisateur: UtilisateurClient;
}) {
  const { t } = useTranslation();

  const libelles = useMemo(
    () => ({
      recherche: t("client.rdv.recherche"),
      tousStatuts: t("client.rdv.tousStatuts"),
      vide: t("client.rdv.vide"),
      charger: t("client.common.chargement"),
      erreur: t("client.common.erreur"),
      notes: t("client.rdv.notes"),
      enregistrer: t("client.common.enregistrer"),
      statut: t("client.rdv.statut"),
      nouvelle: t("client.rdv.nouvelle"),
      aujourdhui: t("client.rdv.aujourdhui"),
      premiereVisite: t("client.rdv.premiereVisite"),
      oui: t("client.rdv.oui"),
      non: t("client.rdv.non"),
      source: t("client.rdv.source"),
      reference: t("client.rdv.reference"),
      motif: t("client.rdv.motif"),
      type: t("client.rdv.type"),
      identite: t("client.rdv.identite"),
      contact: t("client.rdv.contact"),
      planning: t("client.rdv.planning"),
      libelleStatut: (s: string) => t(`client.rdv.statuts.${s}`, s),
    }),
    [t]
  );

  return (
    <MiseEnPageClient
      utilisateur={utilisateur}
      titre={t("client.rdv.titre")}
      sousTitre={t("client.rdv.description")}
    >
      <div className="mx-auto w-full max-w-[1200px] space-y-6">
        <EnTetePageReception
          icone={Calendar}
          titre={t("client.rdv.titre")}
          description={t("client.rdv.description")}
          fil={[
            { label: t("client.common.salle"), href: "/sigh/client" },
            { label: t("client.rdv.titre") },
          ]}
        />
        <InboxDemandesRendezVous
          apiBase="/api/client/rendez-vous"
          modeSauvegarde="patch-id"
          libelles={libelles}
        />
      </div>
    </MiseEnPageClient>
  );
}
