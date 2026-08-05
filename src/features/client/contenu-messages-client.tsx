"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Loader2, Mail } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import {
  MiseEnPageClient,
  type UtilisateurClient,
} from "@/features/client/mise-en-page-client";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";

interface MessageContact {
  id: string;
  nom: string;
  email: string;
  telephone: string | null;
  sujet: string;
  message: string;
  lu: boolean;
  createdAt: string;
}

export function ContenuMessagesClient({
  utilisateur,
}: {
  utilisateur: UtilisateurClient;
}) {
  const { t } = useTranslation();
  const [liste, setListe] = useState<MessageContact[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState<string | null>(null);

  const charger = useCallback(() => {
    fetch("/api/client/messages-contact")
      .then(async (res) => {
        const data = (await res.json()) as {
          messages?: MessageContact[];
          message?: string;
        };
        if (!res.ok) throw new Error(data.message ?? t("client.common.erreur"));
        setListe(data.messages ?? []);
      })
      .catch((e: unknown) =>
        setErreur(e instanceof Error ? e.message : t("client.common.erreur"))
      );
  }, [t]);

  useEffect(() => {
    charger();
  }, [charger]);

  const marquerLu = async (id: string) => {
    setEnCours(id);
    try {
      const res = await fetch(`/api/client/messages-contact/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lu: true }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? t("client.common.erreur"));
      charger();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("client.common.erreur"));
    } finally {
      setEnCours(null);
    }
  };

  return (
    <MiseEnPageClient
      utilisateur={utilisateur}
      titre={t("client.messages.titre")}
      sousTitre={t("client.layout.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1100px] space-y-4">
        <EnTetePageReception
          icone={Mail}
          titre={t("client.messages.titre")}
          description={t("client.messages.description")}
          fil={[
            { label: t("client.common.salle"), href: "/sigh/client" },
            { label: t("client.messages.fil") },
          ]}
        />

        {erreur ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erreur}
          </p>
        ) : null}

        <div className="space-y-2">
          {liste.map((m) => (
            <article
              key={m.id}
              className={`rounded-xl border bg-white p-4 shadow-sm ${
                m.lu ? "border-gris-bordure" : "border-bleu-medical/40 bg-bleu-medical-clair/20"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-texte-principal">{m.sujet}</p>
                  <p className="text-sm text-texte-secondaire">
                    {m.nom} · {m.email}
                    {m.telephone ? ` · ${m.telephone}` : ""}
                  </p>
                  <p className="mt-1 text-[11px] text-texte-secondaire">
                    {new Date(m.createdAt).toLocaleString()}
                  </p>
                </div>
                {!m.lu ? (
                  <Bouton
                    variante="contour"
                    taille="petit"
                    onClick={() => void marquerLu(m.id)}
                    disabled={enCours === m.id}
                  >
                    {enCours === m.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    {t("client.messages.marquerLu")}
                  </Bouton>
                ) : (
                  <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                    {t("client.messages.lu")}
                  </span>
                )}
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-texte-principal">
                {m.message}
              </p>
            </article>
          ))}
          {liste.length === 0 ? (
            <p className="text-sm text-texte-secondaire">
              {t("client.messages.vide")}
            </p>
          ) : null}
        </div>
      </div>
    </MiseEnPageClient>
  );
}
