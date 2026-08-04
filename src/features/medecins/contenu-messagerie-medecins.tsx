"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  MiseEnPageMedecins,
  type UtilisateurMedecins,
} from "@/features/medecins/mise-en-page-medecins";
import { InterfaceMessagerie } from "@/features/messagerie/interface-messagerie";

interface Props {
  utilisateur: UtilisateurMedecins & { id: string };
  estAdmin?: boolean;
}

export function ContenuMessagerieMedecins({ utilisateur, estAdmin }: Props) {
  const { t } = useTranslation();

  return (
    <MiseEnPageMedecins
      utilisateur={utilisateur}
      titre={t("medecins.messagerie.titre")}
      sousTitre={t("medecins.messagerie.description")}
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
    </MiseEnPageMedecins>
  );
}
