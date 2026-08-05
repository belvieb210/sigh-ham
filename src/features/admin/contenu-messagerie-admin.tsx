"use client";

import { Suspense, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  MiseEnPageAdmin,
  type UtilisateurAdmin,
} from "@/features/admin/mise-en-page-admin";
import { InterfaceMessagerie } from "@/features/messagerie/interface-messagerie";

interface ConvItem {
  id: string;
  type: string;
  sujet: string | null;
  updatedAt: string;
  messages: number;
  participants: number;
  dernierMessage: string | null;
}

export function ContenuMessagerieAdmin({
  utilisateur,
  utilisateurId,
  estAdmin,
}: {
  utilisateur: UtilisateurAdmin;
  utilisateurId: string;
  estAdmin?: boolean;
}) {
  const { t } = useTranslation();
  const [conversations, setConversations] = useState<ConvItem[]>([]);

  useEffect(() => {
    fetch("/api/admin/conversations")
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) setConversations(data.conversations ?? []);
      })
      .catch(() => {
        /* ignore */
      });
  }, []);

  return (
    <MiseEnPageAdmin
      utilisateur={utilisateur}
      titre={t("admin.messagerie.titre")}
      sousTitre={t("admin.messagerie.description")}
    >
      {conversations.length > 0 ? (
        <div className="mb-4 overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
          <p className="border-b border-gris-bordure bg-gris-tres-clair px-4 py-2 text-xs font-bold uppercase tracking-wide text-texte-secondaire">
            {t("admin.messagerie.conversationsRecentes")}
          </p>
          <ul className="max-h-48 divide-y divide-gris-bordure overflow-y-auto text-sm">
            {conversations.slice(0, 12).map((c) => (
              <li key={c.id} className="px-4 py-2">
                <p className="font-medium text-texte-principal">
                  {c.sujet || c.type}
                  <span className="ml-2 text-[10px] font-normal text-texte-secondaire">
                    {c.type} · {c.participants} part. · {c.messages} msg
                  </span>
                </p>
                {c.dernierMessage ? (
                  <p className="truncate text-xs text-texte-secondaire">
                    {c.dernierMessage}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-bleu-medical" />
          </div>
        }
      >
        <InterfaceMessagerie
          utilisateurId={utilisateurId}
          prenom={utilisateur.prenom}
          nom={utilisateur.nom}
          estAdmin={estAdmin}
        />
      </Suspense>
    </MiseEnPageAdmin>
  );
}
