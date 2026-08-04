"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  MiseEnPageMedecinsExternes,
  type UtilisateurMedecinsExternes,
} from "@/features/medecins-externes/mise-en-page-medecins-externes";
import { InterfaceMessagerie } from "@/features/messagerie/interface-messagerie";

interface Props {
  utilisateur: UtilisateurMedecinsExternes & { id: string };
  estAdmin?: boolean;
}

export function ContenuMessagerieMedecinsExternes({ utilisateur, estAdmin }: Props) {
  const { t } = useTranslation();

  return (
    <MiseEnPageMedecinsExternes
      utilisateur={utilisateur}
      titre={t("medecinsExternes.messagerie.titre")}
      sousTitre={t("medecinsExternes.messagerie.description")}
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
    </MiseEnPageMedecinsExternes>
  );
}
