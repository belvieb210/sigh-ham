"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  MiseEnPageEglise,
  type UtilisateurEglise,
} from "@/features/eglise/mise-en-page-eglise";
import { InterfaceMessagerie } from "@/features/messagerie/interface-messagerie";

interface Props {
  utilisateur: UtilisateurEglise & { id: string };
  estAdmin?: boolean;
}

export function ContenuMessagerieEglise({ utilisateur, estAdmin }: Props) {
  const { t } = useTranslation();

  return (
    <MiseEnPageEglise
      utilisateur={utilisateur}
      titre={t("eglise.messagerie.titre")}
      sousTitre={t("eglise.messagerie.description")}
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
    </MiseEnPageEglise>
  );
}
