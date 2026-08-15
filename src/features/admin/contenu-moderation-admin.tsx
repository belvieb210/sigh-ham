"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  Ban,
  Loader2,
  MessageSquare,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  Users,
} from "lucide-react";
import {
  MiseEnPageAdmin,
  type UtilisateurAdmin,
} from "@/features/admin/mise-en-page-admin";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import { Bouton } from "@/components/ui/bouton";
import { cn } from "@/lib/utils";

type StatsMod = {
  conversationsTotal: number;
  conversationsBloquees: number;
  groupesSupprimes: number;
  messagesSupprimes: number;
  messagesSignales: number;
  messagesBloques: number;
  fichiersSignales: number;
  fichiersSupprimes: number;
  utilisateursMessagerieBloquee: number;
};

type ConvMod = {
  id: string;
  type: string;
  sujet: string | null;
  bloquee: boolean;
  supprimee: boolean;
  nbMessages: number;
  nbParticipants: number;
  dernierMessage: string | null;
  createur: string | null;
};

type MsgMod = {
  id: string;
  conversationId: string;
  contenu: string;
  supprime: boolean;
  bloque: boolean;
  signale: boolean;
  signaleRaison: string | null;
  avertissementEnvoye: boolean;
  envoyeLe: string;
  expediteur: { id: string; nomComplet: string; identifiant: string };
};

type FichierMod = {
  id: string;
  nom: string;
  mimeType: string;
  url: string;
  signalee: boolean;
  supprimee: boolean;
  estImage: boolean;
  expediteur: string | null;
};

type Onglet = "signales" | "supprimes" | "groupes" | "fichiers" | "conversations";

export function ContenuModerationAdmin({
  utilisateur,
}: {
  utilisateur: UtilisateurAdmin;
}) {
  const { t } = useTranslation();
  const [stats, setStats] = useState<StatsMod | null>(null);
  const [onglet, setOnglet] = useState<Onglet>("signales");
  const [conversations, setConversations] = useState<ConvMod[]>([]);
  const [messages, setMessages] = useState<MsgMod[]>([]);
  const [fichiers, setFichiers] = useState<FichierMod[]>([]);
  const [chargement, setChargement] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [selectionMsg, setSelectionMsg] = useState<MsgMod | null>(null);
  const [texteAvert, setTexteAvert] = useState("");
  const [enCours, setEnCours] = useState(false);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const [sRes, ...rest] = await Promise.all([
        fetch("/api/admin/moderation?vue=stats"),
        onglet === "conversations"
          ? fetch("/api/admin/moderation?vue=conversations")
          : onglet === "groupes"
            ? fetch("/api/admin/moderation?vue=groupes")
            : onglet === "fichiers"
              ? fetch("/api/admin/moderation?vue=fichiers")
              : fetch(
                  `/api/admin/moderation?vue=messages${
                    onglet === "signales"
                      ? "&signales=true"
                      : onglet === "supprimes"
                        ? "&supprimes=true"
                        : ""
                  }`
                ),
      ]);
      const sData = (await sRes.json()) as { stats?: StatsMod };
      if (sRes.ok) setStats(sData.stats ?? null);

      const data = await rest[0].json();
      if (!rest[0].ok) throw new Error(data.message ?? t("admin.common.erreur"));

      if (onglet === "conversations") setConversations(data.conversations ?? []);
      else if (onglet === "groupes") setConversations(data.groupes ?? []);
      else if (onglet === "fichiers") setFichiers(data.fichiers ?? []);
      else setMessages(data.messages ?? []);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : t("admin.common.erreur"));
    } finally {
      setChargement(false);
    }
  }, [onglet, t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  const action = async (payload: Record<string, string>) => {
    setEnCours(true);
    setMessage(null);
    setErreur(null);
    try {
      const res = await fetch("/api/admin/moderation/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
      setMessage(data.message ?? "OK");
      setSelectionMsg(null);
      setTexteAvert("");
      await charger();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : t("admin.common.erreur"));
    } finally {
      setEnCours(false);
    }
  };

  const onglets: { id: Onglet; label: string; count?: number }[] = [
    { id: "signales", label: t("admin.moderation.ongletSignales"), count: stats?.messagesSignales },
    { id: "supprimes", label: t("admin.moderation.ongletSupprimes"), count: stats?.messagesSupprimes },
    { id: "groupes", label: t("admin.moderation.ongletGroupes"), count: stats?.groupesSupprimes },
    { id: "fichiers", label: t("admin.moderation.ongletFichiers"), count: stats?.fichiersSignales },
    { id: "conversations", label: t("admin.moderation.ongletConversations") },
  ];

  const kpis = stats
    ? [
        { label: t("admin.moderation.kpiSignales"), val: stats.messagesSignales, icone: AlertTriangle },
        { label: t("admin.moderation.kpiBloques"), val: stats.conversationsBloquees, icone: Ban },
        { label: t("admin.moderation.kpiUtilisateurs"), val: stats.utilisateursMessagerieBloquee, icone: Users },
        { label: t("admin.moderation.kpiFichiers"), val: stats.fichiersSignales, icone: ShieldAlert },
      ]
    : [];

  return (
    <MiseEnPageAdmin
      utilisateur={utilisateur}
      titre={t("admin.moderation.titre")}
      sousTitre={t("admin.moderation.description")}
    >
      <div className="mx-auto max-w-7xl space-y-4 pb-8">
        <EnTetePageReception
          icone={ShieldAlert}
          titre={t("admin.moderation.titre")}
          description={t("admin.moderation.description")}
          fil={[
            { label: t("admin.layout.titre"), href: "/sigh/admin" },
            { label: t("admin.moderation.titre") },
          ]}
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => void charger()}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-gris-bordure px-3 text-sm hover:bg-gris-tres-clair"
          >
            <RefreshCw className="h-4 w-4" />
            {t("admin.moderation.actualiser")}
          </button>
        </div>

        {kpis.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((k) => (
              <div
                key={k.label}
                className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 text-texte-secondaire">
                  <k.icone className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-wide">{k.label}</p>
                </div>
                <p className="mt-2 text-2xl font-bold text-texte-principal">{k.val}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-b border-gris-bordure pb-1">
          {onglets.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setOnglet(o.id)}
              className={cn(
                "rounded-t-lg px-4 py-2 text-sm font-medium transition-colors",
                onglet === o.id
                  ? "border border-b-white border-gris-bordure bg-white text-bleu-medical"
                  : "text-texte-secondaire hover:text-texte-principal"
              )}
            >
              {o.label}
              {o.count != null && o.count > 0 ? (
                <span className="ml-1.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                  {o.count}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {message && (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
            {message}
          </p>
        )}
        {erreur && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {erreur}
          </p>
        )}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
            {chargement ? (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-texte-secondaire">
                <Loader2 className="h-5 w-5 animate-spin" />
                {t("admin.common.chargement")}
              </div>
            ) : onglet === "fichiers" ? (
              <ul className="divide-y divide-gris-bordure">
                {fichiers.length === 0 ? (
                  <li className="px-4 py-12 text-center text-sm text-texte-secondaire">
                    {t("admin.moderation.vide")}
                  </li>
                ) : (
                  fichiers.map((f) => (
                    <li key={f.id} className="flex flex-wrap items-start gap-4 px-4 py-3">
                      {f.estImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={f.url}
                          alt={f.nom}
                          className="h-16 w-16 rounded-lg border object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gris-tres-clair text-xs">
                          FILE
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-texte-principal">{f.nom}</p>
                        <p className="text-xs text-texte-secondaire">
                          {f.mimeType} · {f.expediteur ?? "—"}
                        </p>
                        {f.signalee && (
                          <span className="mt-1 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                            {t("admin.moderation.signale")}
                          </span>
                        )}
                      </div>
                    </li>
                  ))
                )}
              </ul>
            ) : onglet === "conversations" || onglet === "groupes" ? (
              <ul className="divide-y divide-gris-bordure">
                {conversations.length === 0 ? (
                  <li className="px-4 py-12 text-center text-sm text-texte-secondaire">
                    {t("admin.moderation.vide")}
                  </li>
                ) : (
                  conversations.map((c) => (
                    <li key={c.id} className="px-4 py-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-texte-principal">
                            {c.sujet || c.type}
                            <span className="ml-2 text-xs font-normal text-texte-secondaire">
                              {c.type} · {c.nbParticipants} part. · {c.nbMessages} msg
                            </span>
                          </p>
                          {c.dernierMessage && (
                            <p className="mt-1 truncate text-xs text-texte-secondaire">
                              {c.dernierMessage}
                            </p>
                          )}
                          <div className="mt-1 flex flex-wrap gap-1">
                            {c.bloquee && (
                              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-800">
                                {t("admin.moderation.bloque")}
                              </span>
                            )}
                            {c.supprimee && (
                              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                                {t("admin.moderation.supprime")}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {c.bloquee ? (
                            <Bouton
                              taille="petit"
                              variante="contour"
                              disabled={enCours}
                              onClick={() =>
                                void action({
                                  action: "debloquer-conversation",
                                  conversationId: c.id,
                                })
                              }
                            >
                              <RotateCcw className="mr-1 h-3 w-3" />
                              {t("admin.moderation.reactiver")}
                            </Bouton>
                          ) : (
                            <Bouton
                              taille="petit"
                              variante="contour"
                              disabled={enCours}
                              onClick={() =>
                                void action({
                                  action: "bloquer-conversation",
                                  conversationId: c.id,
                                  raison: "Modération admin",
                                })
                              }
                            >
                              <Ban className="mr-1 h-3 w-3" />
                              {t("admin.moderation.bloquer")}
                            </Bouton>
                          )}
                          {onglet === "groupes" && (
                            c.supprimee ? (
                              <Bouton
                                taille="petit"
                                disabled={enCours}
                                onClick={() =>
                                  void action({
                                    action: "restaurer-groupe",
                                    conversationId: c.id,
                                  })
                                }
                              >
                                {t("admin.moderation.restaurer")}
                              </Bouton>
                            ) : (
                              <Bouton
                                taille="petit"
                                variante="contour"
                                disabled={enCours}
                                onClick={() =>
                                  void action({
                                    action: "supprimer-groupe",
                                    conversationId: c.id,
                                  })
                                }
                              >
                                {t("admin.moderation.supprimerGroupe")}
                              </Bouton>
                            )
                          )}
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            ) : (
              <ul className="divide-y divide-gris-bordure">
                {messages.length === 0 ? (
                  <li className="px-4 py-12 text-center text-sm text-texte-secondaire">
                    {t("admin.moderation.vide")}
                  </li>
                ) : (
                  messages.map((m) => (
                    <li
                      key={m.id}
                      className={cn(
                        "cursor-pointer px-4 py-3 transition-colors hover:bg-gris-tres-clair/60",
                        selectionMsg?.id === m.id && "bg-bleu-medical-clair/30"
                      )}
                      onClick={() => setSelectionMsg(m)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-texte-principal">
                            {m.expediteur.nomComplet}
                            <span className="ml-2 font-normal text-texte-secondaire">
                              @{m.expediteur.identifiant}
                            </span>
                          </p>
                          <p className="mt-1 text-sm text-texte-principal">{m.contenu}</p>
                          <p className="mt-1 text-[11px] text-texte-secondaire">
                            {new Date(m.envoyeLe).toLocaleString("fr-FR")}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {m.signale && (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                                {t("admin.moderation.signale")}
                              </span>
                            )}
                            {m.bloque && (
                              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-800">
                                {t("admin.moderation.bloque")}
                              </span>
                            )}
                            {m.avertissementEnvoye && (
                              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800">
                                {t("admin.moderation.averti")}
                              </span>
                            )}
                          </div>
                        </div>
                        <MessageSquare className="h-4 w-4 shrink-0 text-texte-secondaire" />
                      </div>
                    </li>
                  ))
                )}
              </ul>
            )}
          </section>

          <aside className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-texte-secondaire">
              {t("admin.moderation.panneauTitre")}
            </h3>
            {!selectionMsg ? (
              <p className="mt-4 text-sm text-texte-secondaire">
                {t("admin.moderation.selectionnerMessage")}
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                <p className="text-sm font-medium">{selectionMsg.expediteur.nomComplet}</p>
                <p className="rounded-lg bg-gris-tres-clair p-3 text-sm">{selectionMsg.contenu}</p>
                <textarea
                  value={texteAvert}
                  onChange={(e) => setTexteAvert(e.target.value)}
                  rows={4}
                  placeholder={t("admin.moderation.placeholderAvertissement")}
                  className="w-full rounded-lg border border-gris-bordure px-3 py-2 text-sm"
                />
                <Bouton
                  className="w-full"
                  disabled={enCours || !texteAvert.trim()}
                  onClick={() =>
                    void action({
                      action: "avertissement",
                      destinataireId: selectionMsg.expediteur.id,
                      messageId: selectionMsg.id,
                      conversationId: selectionMsg.conversationId,
                      contenu: texteAvert,
                    })
                  }
                >
                  {t("admin.moderation.envoyerAvertissement")}
                </Bouton>
                {selectionMsg.bloque ? (
                  <Bouton
                    variante="contour"
                    className="w-full"
                    disabled={enCours}
                    onClick={() =>
                      void action({
                        action: "debloquer-message",
                        messageId: selectionMsg.id,
                      })
                    }
                  >
                    {t("admin.moderation.debloquerMessage")}
                  </Bouton>
                ) : (
                  <Bouton
                    variante="contour"
                    className="w-full"
                    disabled={enCours}
                    onClick={() =>
                      void action({
                        action: "bloquer-message",
                        messageId: selectionMsg.id,
                        raison: "Contenu inapproprié",
                      })
                    }
                  >
                    {t("admin.moderation.bloquerMessage")}
                  </Bouton>
                )}
                <Bouton
                  variante="contour"
                  className="w-full text-red-700"
                  disabled={enCours}
                  onClick={() =>
                    void action({
                      action: "bloquer-messagerie-utilisateur",
                      utilisateurId: selectionMsg.expediteur.id,
                    })
                  }
                >
                  {t("admin.moderation.bloquerMessagerieUser")}
                </Bouton>
              </div>
            )}
          </aside>
        </div>
      </div>
    </MiseEnPageAdmin>
  );
}
