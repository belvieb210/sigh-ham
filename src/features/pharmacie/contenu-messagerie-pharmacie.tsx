"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  MiseEnPagePharmacie,
  type UtilisateurPharmacie,
} from "@/features/pharmacie/mise-en-page-pharmacie";
import { InterfaceMessagerie } from "@/features/messagerie/interface-messagerie";

interface Props {
  utilisateur: UtilisateurPharmacie & { id: string };
  estAdmin?: boolean;
}

export function ContenuMessageriePharmacie({ utilisateur, estAdmin }: Props) {
  const { t } = useTranslation();

  return (
    <MiseEnPagePharmacie
      utilisateur={utilisateur}
      titre={t("pharmacie.messagerie.titre")}
      sousTitre={t("pharmacie.messagerie.description")}
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
    </MiseEnPagePharmacie>
  );
}
