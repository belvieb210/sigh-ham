"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  MiseEnPageInfirmiers,
  type UtilisateurInfirmiers,
} from "@/features/infirmiers/mise-en-page-infirmiers";
import { InterfaceMessagerie } from "@/features/messagerie/interface-messagerie";

interface Props {
  utilisateur: UtilisateurInfirmiers & { id: string };
  estAdmin?: boolean;
}

export function ContenuMessagerieInfirmiers({ utilisateur, estAdmin }: Props) {
  const { t } = useTranslation();

  return (
    <MiseEnPageInfirmiers
      utilisateur={utilisateur}
      titre={t("infirmiers.messagerie.titre")}
      sousTitre={t("infirmiers.messagerie.description")}
    >
      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-bleu-medical" />
          </div>
        }
      >
        <InterfaceMessagerie
          utilisateurId={utilisateur.id}
          prenom={utilisateur.prenom}
          nom={utilisateur.nom}
          estAdmin={estAdmin}
        />
      </Suspense>
    </MiseEnPageInfirmiers>
  );
}
