"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  MiseEnPageLaboratoire,
  type UtilisateurLaboratoire,
} from "@/features/laboratoire/mise-en-page-laboratoire";
import { InterfaceMessagerie } from "@/features/messagerie/interface-messagerie";

interface PropsContenuMessagerieLaboratoire {
  utilisateur: UtilisateurLaboratoire & { id: string };
  estAdmin?: boolean;
}

export function ContenuMessagerieLaboratoire({
  utilisateur,
  estAdmin,
}: PropsContenuMessagerieLaboratoire) {
  const { t } = useTranslation();

  return (
    <MiseEnPageLaboratoire
      utilisateur={utilisateur}
      titre={t("laboratoire.pages.messagerie.titre")}
      sousTitre={t("laboratoire.pages.messagerie.description")}
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
    </MiseEnPageLaboratoire>
  );
}
