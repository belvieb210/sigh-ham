"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader2 } from "lucide-react";
import { InterfaceMessagerie } from "@/features/messagerie/interface-messagerie";interface Props {
  utilisateur: {
    id: string;
    prenom: string;
    nom: string;
    role: string;
    salle: string;
  };
  estAdmin?: boolean;
}

export function ContenuMessagerieTransversal({ utilisateur, estAdmin }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#f1f5f9]">
      <header className="flex shrink-0 items-center gap-3 border-b border-gris-bordure bg-white px-4 py-3">
        <Link
          href="/sigh/reception"
          className="rounded-lg p-2 text-texte-secondaire hover:bg-gris-tres-clair"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-texte-secondaire">
            SIGH — {utilisateur.salle}
          </p>
          <h1 className="text-lg font-bold text-texte-principal">
            {t("reception.pages.messagerie.titre")}
          </h1>        </div>
      </header>
      <main className="min-h-0 flex-1 p-3 lg:p-4">
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
      </main>    </div>
  );
}
