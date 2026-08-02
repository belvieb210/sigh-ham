"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MiseEnPageCaisse, type UtilisateurCaisse } from "@/features/caisse/mise-en-page-caisse";
import { InterfaceMessagerie } from "@/features/messagerie/interface-messagerie";

interface PropsContenuMessagerieCaisse {
  utilisateur: UtilisateurCaisse & { id: string };
  estAdmin?: boolean;
}

export function ContenuMessagerieCaisse({ utilisateur, estAdmin }: PropsContenuMessagerieCaisse) {
  const { t } = useTranslation();

  return (
    <MiseEnPageCaisse
      utilisateur={utilisateur}
      titre={t("caisse.pages.messagerie.titre")}
      sousTitre={t("caisse.pages.messagerie.description")}
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
    </MiseEnPageCaisse>
  );
}
