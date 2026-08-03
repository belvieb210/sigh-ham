"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MiseEnPageReception, type UtilisateurReception } from "@/features/reception/mise-en-page-reception";
import { InterfaceMessagerie } from "@/features/messagerie/interface-messagerie";

interface PropsContenuMessagerieReception {
  utilisateur: UtilisateurReception & { id: string };
  estAdmin?: boolean;
}

export function ContenuMessagerieReception({ utilisateur, estAdmin }: PropsContenuMessagerieReception) {
  const { t } = useTranslation();

  return (
    <MiseEnPageReception
      utilisateur={utilisateur}
      titre={t("reception.pages.messagerie.titre")}
      sousTitre={t("reception.layout.sousTitre")}
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
    </MiseEnPageReception>
  );
}
