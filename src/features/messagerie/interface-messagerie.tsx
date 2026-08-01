"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  Loader2,
  Megaphone,
  Search,
  Users,
  X,
} from "lucide-react";
import type { ConversationResume, ContactMessagerie, MessageConversation } from "@/lib/messagerie/types";
import type { PrioriteMessage } from "@/generated/prisma/enums";
import { PanneauDetailsConversation } from "@/features/messagerie/composants/panneau-details-conversation";
import { ModaleGestionGroupe } from "@/features/messagerie/composants/modale-gestion-groupe";
import { ModaleTransfertMessage } from "@/features/messagerie/composants/modale-transfert-message";
import {
  PanneauFilMessages,
} from "@/features/messagerie/composants/panneau-fil-messages";
import {
  PanneauListeConversations,
  type OngletListeMessagerie,
} from "@/features/messagerie/composants/panneau-liste-conversations";
import { usePresenceMessagerie } from "@/features/messagerie/hooks/use-presence-messagerie";
import {
  traduireContactSalle,
  traduireConversation,
} from "@/features/messagerie/traduire-conversation";
import { traduireErreurApiMessagerie } from "@/features/messagerie/traduire-erreur-api";
import {
  construireConversationBrouillon,
  type BrouillonDirect,
} from "@/features/messagerie/utilitaires-messagerie";
import { filtreMessagesSupprimeExpires } from "@/lib/messagerie/message-supprime";
import { useLangueActive } from "@/hooks/use-langue-active";
import { useSocketSigh } from "@/hooks/use-socket-sigh";
import { cn } from "@/lib/utils";

interface PropsInterfaceMessagerie {
  utilisateurId: string;
  prenom: string;
  nom: string;
  /** Admin / super-admin — affiche la diffusion institutionnelle */
  estAdmin?: boolean;
}

type FluxGroupe =
  | null
  | { type: "creer" }
  | {
      type: "creer_depuis_direct";
      participantIds: string[];
      participantsVerrouilles: string[];
    }
  | { type: "ajouter"; conversationId: string; membresIds: string[] };

export function InterfaceMessagerie({ utilisateurId, prenom, nom, estAdmin = false }: PropsInterfaceMessagerie) {
  const { t } = useTranslation();
  const langue = useLangueActive();
  const searchParams = useSearchParams();

  const [conversations, setConversations] = useState<ConversationResume[]>([]);
  const [conversationActive, setConversationActive] = useState<ConversationResume | null>(null);
  const [messages, setMessages] = useState<MessageConversation[]>([]);
  const [recherche, setRecherche] = useState("");
  const [ongletListe, setOngletListe] = useState<OngletListeMessagerie>("conversations");
  const [drawerDetails, setDrawerDetails] = useState(false);
  const [toastBientot, setToastBientot] = useState(false);
  const [texteMessage, setTexteMessage] = useState("");
  const [priorite, setPriorite] = useState<PrioriteMessage>("NORMALE");
  const [chargementListe, setChargementListe] = useState(true);
  const [chargementMessages, setChargementMessages] = useState(false);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [contacts, setContacts] = useState<ContactMessagerie[]>([]);
  const [chargementContacts, setChargementContacts] = useState(false);
  const [afficherPersonnel, setAfficherPersonnel] = useState(false);
  const [recherchePersonnel, setRecherchePersonnel] = useState("");
  const [contactEnCours, setContactEnCours] = useState<string | null>(null);
  const [vueMobileFil, setVueMobileFil] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [messageReponse, setMessageReponse] = useState<MessageConversation | null>(null);
  const [fichiersLocaux, setFichiersLocaux] = useState<File[]>([]);
  const [fluxGroupe, setFluxGroupe] = useState<FluxGroupe>(null);
  const [modaleDiffusion, setModaleDiffusion] = useState(false);
  const [sujetDiffusion, setSujetDiffusion] = useState("");
  const [contenuDiffusion, setContenuDiffusion] = useState("");
  const [modaleRecherche, setModaleRecherche] = useState(false);
  const [rechercheAvanceeQ, setRechercheAvanceeQ] = useState("");
  const [dateDebutRecherche, setDateDebutRecherche] = useState("");
  const [dateFinRecherche, setDateFinRecherche] = useState("");
  const [resultatsRecherche, setResultatsRecherche] = useState<
    Array<{
      id: string;
      contenu: string;
      envoyeLe: string;
      expediteur: { prenom: string; nom: string };
      conversation: { id: string; sujet: string | null; type: string };
    }>
  >([]);
  const [rechercheEnCours, setRechercheEnCours] = useState(false);
  const [messageAModifier, setMessageAModifier] = useState<MessageConversation | null>(null);
  const [texteModification, setTexteModification] = useState("");
  const [messageATransferer, setMessageATransferer] = useState<MessageConversation | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [brouillonDirect, setBrouillonDirect] = useState<BrouillonDirect | null>(null);
  const [horlogeSuppression, setHorlogeSuppression] = useState(0);

  const marquerMessageSupprime = useCallback((messageId: string) => {
    const maintenant = new Date().toISOString();
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? {
              ...m,
              supprime: true,
              contenu: "",
              piecesJointes: [],
              reactions: [],
              supprimeLe: maintenant,
            }
          : m
      )
    );
  }, []);

  const { rejoindreConversation, quitterConversation } = useSocketSigh({
    onNouveauMessage: (p) => {
      const payload = p as { conversationId?: string };
      if (payload.conversationId && payload.conversationId === conversationActive?.id) {
        void chargerMessages(payload.conversationId, true);
      }
      void chargerConversations();
    },
    onMessageSupprime: (p) => {
      const payload = p as { conversationId?: string; messageId?: string };
      if (
        payload.conversationId &&
        payload.conversationId === conversationActive?.id &&
        payload.messageId
      ) {
        marquerMessageSupprime(payload.messageId);
      }
      void chargerConversations();
    },
  });

  const filRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const chargerConversations = useCallback(async () => {
    try {
      const params = new URLSearchParams({ filtre: "tous" });
      if (recherche.trim()) params.set("q", recherche.trim());
      const res = await fetch(`/api/messagerie/conversations?${params}`);
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { conversations: ConversationResume[] };
      setConversations(data.conversations);
      setConversationActive((prev) => {
        if (!prev) return prev;
        return data.conversations.find((c) => c.id === prev.id) ?? prev;
      });
    } catch {
      setErreur(t("reception.messagerie.erreurListe"));
    } finally {
      setChargementListe(false);
    }
  }, [recherche, t]);

  const chargerMessages = useCallback(
    async (conversationId: string, silencieux = false) => {
      if (!silencieux) setChargementMessages(true);
      try {
        const res = await fetch(`/api/messagerie/conversations/${conversationId}/messages`);
        if (!res.ok) throw new Error();
        const data = (await res.json()) as { messages: MessageConversation[] };
        setMessages(data.messages);
        await fetch(`/api/messagerie/conversations/${conversationId}/lu`, { method: "PATCH" });
      } catch {
        if (!silencieux) setErreur(t("reception.messagerie.erreurMessages"));
      } finally {
        if (!silencieux) setChargementMessages(false);
      }
    },
    [t]
  );

  useEffect(() => {
    void chargerConversations();
  }, [chargerConversations]);

  useEffect(() => {
    const conversationId = searchParams.get("conversation");
    if (!conversationId || conversationActive?.id === conversationId) return;
    const conv = conversations.find((c) => c.id === conversationId);
    if (conv) void ouvrirConversation(conv);
  }, [searchParams, conversations, conversationActive?.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      void chargerConversations();
      if (conversationActive) {
        void chargerMessages(conversationActive.id, true);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [chargerConversations, chargerMessages, conversationActive]);

  useEffect(() => {
    if (filRef.current) {
      filRef.current.scrollTop = filRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!messages.some((m) => m.supprime)) return;
    const interval = setInterval(() => setHorlogeSuppression(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, [messages]);

  const messagesVisibles = useMemo(
    () => filtreMessagesSupprimeExpires(messages),
    [messages, horlogeSuppression]
  );

  const ouvrirConversation = async (conv: ConversationResume) => {
    setBrouillonDirect(null);
    if (conversationActive) quitterConversation(conversationActive.id);
    setConversationActive(conv);
    setVueMobileFil(true);
    setErreur(null);
    rejoindreConversation(conv.id);
    await chargerMessages(conv.id);
  };

  const envoyerMessage = async () => {
    const aContenu = Boolean(texteMessage.trim()) || fichiersLocaux.length > 0;
    if ((!conversationActive && !brouillonDirect) || !aContenu || envoiEnCours) return;
    setEnvoiEnCours(true);
    try {
      if (brouillonDirect) {
        const form = new FormData();
        form.set("participantId", brouillonDirect.contact.id);
        form.set("contenu", texteMessage.trim());
        form.set("priorite", priorite);
        if (brouillonDirect.conversationId) {
          form.set("conversationId", brouillonDirect.conversationId);
        }
        fichiersLocaux.forEach((f) => form.append("fichiers", f));

        const res = await fetch("/api/messagerie/conversations/direct/envoyer", {
          method: "POST",
          body: form,
        });
        if (!res.ok) throw new Error();
        const data = (await res.json()) as {
          conversationId: string;
          conversation: ConversationResume | null;
          message: MessageConversation;
        };

        let conv = data.conversation;
        if (!conv) {
          const resList = await fetch("/api/messagerie/conversations?filtre=tous");
          if (resList.ok) {
            const d2 = (await resList.json()) as { conversations: ConversationResume[] };
            conv = d2.conversations.find((c) => c.id === data.conversationId) ?? null;
          }
        }

        setBrouillonDirect(null);
        setTexteMessage("");
        setPriorite("NORMALE");
        setMessageReponse(null);
        setFichiersLocaux([]);

        if (conversationActive) quitterConversation(conversationActive.id);
        if (conv) {
          setConversationActive(conv);
          rejoindreConversation(conv.id);
        }
        setMessages([data.message]);
        void chargerConversations();
        return;
      }

      if (!conversationActive) return;
      const form = new FormData();
      form.set("contenu", texteMessage.trim());
      form.set("priorite", priorite);
      if (messageReponse) form.set("messageParentId", messageReponse.id);
      fichiersLocaux.forEach((f) => form.append("fichiers", f));

      const res = await fetch(
        `/api/messagerie/conversations/${conversationActive.id}/messages`,
        { method: "POST", body: form }
      );
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { message: MessageConversation };
      setMessages((prev) => [...prev, data.message]);
      setTexteMessage("");
      setPriorite("NORMALE");
      setMessageReponse(null);
      setFichiersLocaux([]);
      void chargerConversations();
    } catch {
      setErreur(t("reception.messagerie.erreurEnvoi"));
    } finally {
      setEnvoiEnCours(false);
      textareaRef.current?.focus();
    }
  };

  const reagir = async (messageId: string, emoji: string) => {
    await fetch(
      `/api/messagerie/conversations/${conversationActive?.id}/messages/${messageId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reaction", emoji }),
      }
    );
    if (conversationActive) void chargerMessages(conversationActive.id, true);
  };

  const afficherToast = (texte: string) => {
    setToastMessage(texte);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const copierMessage = async (msg: MessageConversation) => {
    try {
      await navigator.clipboard.writeText(msg.contenu);
      afficherToast(t("reception.messagerie.actionsMessage.copieSucces"));
    } catch {
      setErreur(t("reception.messagerie.erreurEnvoi"));
    }
  };

  const epingleMessage = async (messageId: string) => {
    if (!conversationActive) return;
    await fetch(
      `/api/messagerie/conversations/${conversationActive.id}/messages/${messageId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "epingle" }),
      }
    );
    void chargerMessages(conversationActive.id, true);
  };

  const supprimerMessageAction = async (messageId: string, portee: "moi" | "tous") => {
    if (!conversationActive) return;
    try {
      const res = await fetch(
        `/api/messagerie/conversations/${conversationActive.id}/messages/${messageId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ portee }),
        }
      );
      if (!res.ok) throw new Error();
      if (portee === "moi") {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      } else {
        marquerMessageSupprime(messageId);
      }
      void chargerConversations();
    } catch {
      setErreur(t("reception.messagerie.erreurEnvoi"));
    }
  };

  const ouvrirModification = (msg: MessageConversation) => {
    setMessageAModifier(msg);
    setTexteModification(msg.contenu);
  };

  const confirmerModification = async () => {
    if (!conversationActive || !messageAModifier || !texteModification.trim()) return;
    try {
      const res = await fetch(
        `/api/messagerie/conversations/${conversationActive.id}/messages/${messageAModifier.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "modifier", contenu: texteModification.trim() }),
        }
      );
      if (!res.ok) throw new Error();
      setMessageAModifier(null);
      setTexteModification("");
      void chargerMessages(conversationActive.id, true);
      afficherToast(t("reception.messagerie.actionsMessage.modifierSucces"));
    } catch {
      setErreur(t("reception.messagerie.erreurEnvoi"));
    }
  };

  const transfererMessageVers = async (conversationIds: string[]) => {
    if (!conversationActive || !messageATransferer || conversationIds.length === 0) return;
    let reussis = 0;
    try {
      for (const conversationCibleId of conversationIds) {
        const res = await fetch(
          `/api/messagerie/conversations/${conversationActive.id}/messages/${messageATransferer.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "transferer", conversationCibleId }),
          }
        );
        if (!res.ok) throw new Error();
        reussis += 1;
      }
      setMessageATransferer(null);
      afficherToast(
        t("reception.messagerie.actionsMessage.transfererSucces", { count: reussis })
      );
    } catch {
      if (reussis > 0) {
        afficherToast(
          t("reception.messagerie.actionsMessage.transfererSuccesPartiel", {
            count: reussis,
            total: conversationIds.length,
          })
        );
        setMessageATransferer(null);
      } else {
        setErreur(t("reception.messagerie.erreurEnvoi"));
      }
    }
  };

  const epingleConversation = async () => {
    if (!conversationActive) return;
    const epingle = !conversationActive.epinglePerso;
    setConversationActive((prev) => (prev ? { ...prev, epinglePerso: epingle } : prev));
    try {
      const res = await fetch(`/api/messagerie/conversations/${conversationActive.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: epingle ? "epingle" : "desepingle" }),
      });
      if (!res.ok) throw new Error();
      void chargerConversations();
    } catch {
      setConversationActive((prev) =>
        prev ? { ...prev, epinglePerso: !epingle } : prev
      );
      setErreur(t("reception.messagerie.erreurEnvoi"));
    }
  };

  const creerGroupe = async (
    sujet: string,
    participantIds: string[],
    photo?: File | null
  ) => {
    const nom = sujet.trim();
    if (!nom || participantIds.length < 1) return;
    try {
      let res: Response;
      if (photo) {
        const form = new FormData();
        form.append("type", "GROUPE");
        form.append("sujet", nom);
        form.append("participantIds", JSON.stringify(participantIds));
        form.append("categorieGroupe", "INTER_SERVICES");
        form.append("photo", photo);
        res = await fetch("/api/messagerie/conversations", { method: "POST", body: form });
      } else {
        res = await fetch("/api/messagerie/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "GROUPE",
            sujet: nom,
            participantIds,
            categorieGroupe: "INTER_SERVICES",
          }),
        });
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { message?: string };
        afficherToast(traduireErreurApiMessagerie(data.message, t) ?? t("reception.messagerie.erreurCreation"));
        throw new Error("creer_groupe_echoue");
      }
      const data = (await res.json()) as { id: string };
      await chargerConversations();
      const resList = await fetch("/api/messagerie/conversations?filtre=tous");
      const conv = resList.ok
        ? ((await resList.json()) as { conversations: ConversationResume[] }).conversations.find(
            (c) => c.id === data.id
          )
        : null;
      if (conv) await ouvrirConversation(conv);
      afficherToast(t("reception.messagerie.groupe.modal.creer"));
    } catch (err) {
      if (err instanceof Error && err.message === "creer_groupe_echoue") return;
      setErreur(t("reception.messagerie.erreurCreation"));
      throw err;
    }
  };

  const ajouterMembresGroupe = async (participantIds: string[]) => {
    if (fluxGroupe?.type !== "ajouter") return;
    try {
      const res = await fetch(
        `/api/messagerie/conversations/${fluxGroupe.conversationId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "ajouter_membres", participantIds }),
        }
      );
      if (!res.ok) throw new Error();
      await rafraichirConversationActive();
      afficherToast(t("reception.messagerie.groupe.modal.ajouterMembresSucces"));
    } catch {
      setErreur(t("reception.messagerie.erreurCreation"));
      throw new Error();
    }
  };

  const rafraichirConversationActive = async () => {
    await chargerConversations();
    if (!conversationActive) return;
    const resList = await fetch("/api/messagerie/conversations?filtre=tous");
    if (resList.ok) {
      const data = (await resList.json()) as { conversations: ConversationResume[] };
      const maj = data.conversations.find((c) => c.id === conversationActive.id);
      if (maj) setConversationActive(maj);
    }
  };

  const actionMembreGroupe = async (
    action: "retirer_membre" | "promouvoir_admin" | "retirer_admin",
    participantId: string
  ) => {
    if (!conversationActive || conversationActive.type !== "GROUPE") return;
    try {
      const res = await fetch(
        `/api/messagerie/conversations/${conversationActive.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, participantId }),
        }
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { message?: string };
        afficherToast(traduireErreurApiMessagerie(data.message, t) ?? t("reception.messagerie.groupe.membre.erreur"));
        return;
      }
      await rafraichirConversationActive();
      const cleToast =
        action === "retirer_membre"
          ? "reception.messagerie.groupe.membre.retireSucces"
          : action === "promouvoir_admin"
            ? "reception.messagerie.groupe.membre.promuSucces"
            : "reception.messagerie.groupe.membre.adminRetireSucces";
      afficherToast(t(cleToast));
    } catch {
      afficherToast(t("reception.messagerie.groupe.membre.erreur"));
    }
  };

  const renommerGroupe = async (sujet: string) => {
    if (!conversationActive || conversationActive.type !== "GROUPE") return;
    const nom = sujet.trim();
    if (!nom) return;
    try {
      const res = await fetch(
        `/api/messagerie/conversations/${conversationActive.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "renommer_groupe", sujet: nom }),
        }
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { message?: string };
        afficherToast(traduireErreurApiMessagerie(data.message, t) ?? t("reception.messagerie.groupe.profil.erreur"));
        return;
      }
      await rafraichirConversationActive();
      afficherToast(t("reception.messagerie.groupe.profil.renommerSucces"));
    } catch {
      afficherToast(t("reception.messagerie.groupe.profil.erreur"));
    }
  };

  const modifierPhotoGroupe = async (file: File) => {
    if (!conversationActive || conversationActive.type !== "GROUPE") return;
    try {
      const form = new FormData();
      form.append("action", "photo_groupe");
      form.append("photo", file);
      const res = await fetch(
        `/api/messagerie/conversations/${conversationActive.id}`,
        { method: "PATCH", body: form }
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { message?: string };
        afficherToast(traduireErreurApiMessagerie(data.message, t) ?? t("reception.messagerie.groupe.profil.erreur"));
        return;
      }
      await rafraichirConversationActive();
      afficherToast(t("reception.messagerie.groupe.profil.photoSucces"));
    } catch {
      afficherToast(t("reception.messagerie.groupe.profil.erreur"));
    }
  };

  const retirerPhotoGroupe = async () => {
    if (!conversationActive || conversationActive.type !== "GROUPE") return;
    try {
      const res = await fetch(
        `/api/messagerie/conversations/${conversationActive.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "retirer_photo_groupe" }),
        }
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { message?: string };
        afficherToast(traduireErreurApiMessagerie(data.message, t) ?? t("reception.messagerie.groupe.profil.erreur"));
        return;
      }
      await rafraichirConversationActive();
      afficherToast(t("reception.messagerie.groupe.profil.photoRetireSucces"));
    } catch {
      afficherToast(t("reception.messagerie.groupe.profil.erreur"));
    }
  };

  const ouvrirModaleCreerGroupe = () => {
    setFluxGroupe({ type: "creer" });
    void chargerContacts();
  };

  const ouvrirModaleCreerGroupeDepuisDirect = () => {
    if (!conversationActive || conversationActive.type !== "DIRECT") return;
    const autres = conversationActive.participants
      .filter((p) => p.id !== utilisateurId)
      .map((p) => p.id);
    setFluxGroupe({
      type: "creer_depuis_direct",
      participantIds: autres,
      participantsVerrouilles: autres,
    });
    void chargerContacts();
  };

  const ouvrirModaleAjouterMembres = () => {
    if (!conversationActive || conversationActive.type !== "GROUPE") return;
    setFluxGroupe({
      type: "ajouter",
      conversationId: conversationActive.id,
      membresIds: conversationActive.participants.map((p) => p.id),
    });
    void chargerContacts();
  };

  const chargerContacts = useCallback(async (q?: string) => {
    try {
      setChargementContacts(true);
      const params = new URLSearchParams();
      if (q?.trim()) params.set("q", q.trim());
      const qs = params.toString();
      const res = await fetch(`/api/messagerie/contacts${qs ? `?${qs}` : ""}`);
      if (res.ok) {
        const data = (await res.json()) as { contacts: ContactMessagerie[] };
        setContacts(data.contacts);
      }
    } catch {
      /* silencieux */
    } finally {
      setChargementContacts(false);
    }
  }, []);

  useEffect(() => {
    if (!afficherPersonnel) return;
    const timer = setTimeout(() => {
      void chargerContacts(recherchePersonnel);
    }, 300);
    return () => clearTimeout(timer);
  }, [afficherPersonnel, recherchePersonnel, chargerContacts]);

  const ouvrirListePersonnel = async () => {
    setAfficherPersonnel(true);
    setRecherchePersonnel("");
    setVueMobileFil(false);
    await chargerContacts();
  };

  const fermerListePersonnel = () => {
    setAfficherPersonnel(false);
    setRecherchePersonnel("");
  };

  const demarrerConversationDirecte = async (contactId: string) => {
    const contact = contacts.find((c) => c.id === contactId);
    if (!contact) return;

    setErreur(null);
    setAfficherPersonnel(false);
    setRecherchePersonnel("");
    setOngletListe("conversations");

    const existanteListe = conversations.find(
      (c) => c.type === "DIRECT" && c.participants.some((p) => p.id === contactId)
    );
    if (existanteListe) {
      await ouvrirConversation(existanteListe);
      return;
    }

    setContactEnCours(contactId);
    try {
      const res = await fetch(
        `/api/messagerie/conversations/direct?participantId=${encodeURIComponent(contactId)}`
      );
      if (res.ok) {
        const data = (await res.json()) as { conversation: ConversationResume | null };
        if (data.conversation?.dernierMessage) {
          await ouvrirConversation(data.conversation);
          return;
        }
        if (conversationActive) quitterConversation(conversationActive.id);
        setConversationActive(null);
        setMessages([]);
        setBrouillonDirect({
          contact,
          conversationId: data.conversation?.id,
        });
        setVueMobileFil(true);
        return;
      }
    } catch {
      /* brouillon local */
    } finally {
      setContactEnCours(null);
    }

    if (conversationActive) quitterConversation(conversationActive.id);
    setConversationActive(null);
    setMessages([]);
    setBrouillonDirect({ contact });
    setVueMobileFil(true);
  };

  const envoyerDiffusion = async () => {
    if (!contenuDiffusion.trim()) return;
    setEnvoiEnCours(true);
    try {
      const res = await fetch("/api/messagerie/diffusion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sujet: sujetDiffusion.trim() || undefined,
          contenu: contenuDiffusion.trim(),
        }),
      });
      if (res.status === 403) {
        setErreur(t("reception.messagerie.diffusion.nonAutorise"));
        return;
      }
      if (!res.ok) throw new Error();
      setModaleDiffusion(false);
      setSujetDiffusion("");
      setContenuDiffusion("");
      await chargerConversations();
      const data = (await res.json()) as { id: string };
      const res2 = await fetch("/api/messagerie/conversations");
      const d2 = (await res2.json()) as { conversations: ConversationResume[] };
      const conv = d2.conversations.find((c) => c.id === data.id);
      if (conv) await ouvrirConversation(conv);
    } catch {
      setErreur(t("reception.messagerie.diffusion.erreur"));
    } finally {
      setEnvoiEnCours(false);
    }
  };

  const lancerRechercheAvancee = async () => {
    if (!rechercheAvanceeQ.trim() && !dateDebutRecherche && !dateFinRecherche) return;
    setRechercheEnCours(true);
    try {
      const params = new URLSearchParams();
      if (rechercheAvanceeQ.trim()) params.set("q", rechercheAvanceeQ.trim());
      if (dateDebutRecherche) params.set("dateDebut", dateDebutRecherche);
      if (dateFinRecherche) params.set("dateFin", dateFinRecherche);
      const res = await fetch(`/api/messagerie/recherche?${params}`);
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { messages: typeof resultatsRecherche };
      setResultatsRecherche(data.messages);
    } catch {
      setResultatsRecherche([]);
    } finally {
      setRechercheEnCours(false);
    }
  };

  const ouvrirConversationDepuisRecherche = async (conversationId: string) => {
    setModaleRecherche(false);
    await chargerConversations();
    const conv = conversations.find((c) => c.id === conversationId);
    if (conv) {
      await ouvrirConversation(conv);
      return;
    }
    const res = await fetch("/api/messagerie/conversations");
    const d = (await res.json()) as { conversations: ConversationResume[] };
    const trouvee = d.conversations.find((c) => c.id === conversationId);
    if (trouvee) await ouvrirConversation(trouvee);
  };

  const totalNonLus = conversations.reduce((s, c) => s + c.nonLus, 0);

  const libelleConv = (conv: ConversationResume) =>
    traduireConversation(conv, utilisateurId, t);

  useEffect(() => {
    void fetch("/api/messagerie/presence", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: "EN_LIGNE" }),
    }).catch(() => undefined);
  }, []);

  const idsPresence = useMemo(() => {
    const ids = new Set<string>();
    for (const c of conversations) {
      c.participants.forEach((p) => ids.add(p.id));
    }
    if (afficherPersonnel) {
      contacts.forEach((c) => ids.add(c.id));
    }
    if (brouillonDirect) {
      ids.add(brouillonDirect.contact.id);
    }
    return Array.from(ids);
  }, [conversations, afficherPersonnel, contacts, brouillonDirect]);

  const { estEnLigne } = usePresenceMessagerie(idsPresence);

  const afficherBientot = () => {
    setToastBientot(true);
    setTimeout(() => setToastBientot(false), 2500);
  };

  const conversationAffichee = useMemo(() => {
    if (conversationActive) return conversationActive;
    if (brouillonDirect) {
      return construireConversationBrouillon(brouillonDirect, utilisateurId, { prenom, nom });
    }
    return null;
  }, [conversationActive, brouillonDirect, utilisateurId, prenom, nom]);

  const libelleActif = conversationAffichee ? libelleConv(conversationAffichee) : null;

  return (
    <div className="flex h-[calc(100dvh-8.5rem)] min-h-[480px] flex-col overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm lg:h-[calc(100dvh-7rem)]">
      <div className="flex shrink-0 items-center justify-between border-b border-gris-bordure bg-gradient-to-r from-bleu-medical-clair to-white px-4 py-3">
        <div>
          <h2 className="text-base font-bold text-texte-principal">
            {t("reception.messagerie.titreInterface")}
          </h2>
          <p className="text-xs text-texte-secondaire">
            {t("reception.messagerie.sousTitreInterface", {
              nom: `${prenom} ${nom}`,
              nonLus: totalNonLus,
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setModaleRecherche(true)}
            className="inline-flex items-center gap-1 rounded-lg border border-gris-bordure px-3 py-2 text-sm font-semibold hover:bg-gris-tres-clair"
            title={t("reception.messagerie.rechercheAvancee.titre")}
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">{t("reception.messagerie.rechercheAvancee.titre")}</span>
          </button>
          {estAdmin && (
            <button
              type="button"
              onClick={() => setModaleDiffusion(true)}
              className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100"
            >
              <Megaphone className="h-4 w-4" />
              <span className="hidden sm:inline">{t("reception.messagerie.diffusion.titre")}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => ouvrirModaleCreerGroupe()}
            className="inline-flex items-center gap-1 rounded-lg border border-gris-bordure px-3 py-2 text-sm font-semibold hover:bg-gris-tres-clair"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">{t("reception.messagerie.groupe.bouton")}</span>
          </button>
        </div>
      </div>

      {erreur && (
        <div className="flex shrink-0 items-center gap-2 border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {erreur}
          <button type="button" onClick={() => setErreur(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {toastBientot && (
        <div className="pointer-events-none absolute left-1/2 top-24 z-50 -translate-x-1/2 rounded-lg bg-slate-800 px-4 py-2 text-xs text-white shadow-lg">
          {t("reception.messagerie.pro.bientot")}
        </div>
      )}

      {toastMessage && (
        <div className="pointer-events-none absolute left-1/2 top-24 z-50 -translate-x-1/2 rounded-lg bg-emerald-700 px-4 py-2 text-xs text-white shadow-lg">
          {toastMessage}
        </div>
      )}

      <div className="relative flex min-h-0 flex-1">
        <PanneauListeConversations
          conversations={conversations}
          conversationActiveId={conversationActive?.id ?? null}
          chargementListe={chargementListe}
          onglet={ongletListe}
          onOngletChange={setOngletListe}
          estEnLigne={estEnLigne}
          libelleConv={libelleConv}
          onOuvrir={(conv) => void ouvrirConversation(conv)}
          onAfficherPersonnel={() => void ouvrirListePersonnel()}
          afficherPersonnel={afficherPersonnel}
          onRetourConversations={fermerListePersonnel}
          contacts={contacts}
          chargementContacts={chargementContacts}
          recherchePersonnel={recherchePersonnel}
          onRecherchePersonnelChange={setRecherchePersonnel}
          onSelectionnerPersonnel={(id) => void demarrerConversationDirecte(id)}
          contactEnCours={contactEnCours}
          locale={langue}
          utilisateurId={utilisateurId}
          visible={afficherPersonnel || !(vueMobileFil && !!conversationAffichee)}
        />

        <PanneauFilMessages
          conversation={conversationAffichee}
          messages={messagesVisibles}
          chargementMessages={chargementMessages && !brouillonDirect}
          locale={langue}
          libelleActif={libelleActif}
          nbEnLigne={
            conversationAffichee
              ? conversationAffichee.participants.filter((p) => estEnLigne(p.id)).length
              : 0
          }
          texteMessage={texteMessage}
          onTexteChange={setTexteMessage}
          priorite={priorite}
          onPrioriteChange={setPriorite}
          fichiersLocaux={fichiersLocaux}
          onFichiersChange={setFichiersLocaux}
          messageReponse={messageReponse}
          onAnnulerReponse={() => setMessageReponse(null)}
          envoiEnCours={envoiEnCours}
          onEnvoyer={() => void envoyerMessage()}
          onReagir={(id, emoji) => void reagir(id, emoji)}
          onRepondre={setMessageReponse}
          onCopier={(msg) => void copierMessage(msg)}
          onTransférer={setMessageATransferer}
          onEpingleMessage={(id) => void epingleMessage(id)}
          onModifier={ouvrirModification}
          onSupprimerMessage={(id, portee) => void supprimerMessageAction(id, portee)}
          onEpingle={() => void epingleConversation()}
          peutEpingle={!!conversationActive}
          onRetourListe={() => {
            setVueMobileFil(false);
            setBrouillonDirect(null);
          }}
          onOuvrirDetails={() => setDrawerDetails(true)}
          vueMobileFil={vueMobileFil}
          filRef={filRef}
          textareaRef={textareaRef}
        />

        {conversationActive && libelleActif && (
          <PanneauDetailsConversation
            conversation={conversationActive}
            messages={messages}
            utilisateurId={utilisateurId}
            libelleActif={libelleActif}
            estEnLigne={estEnLigne}
            onEpingle={() => void epingleConversation()}
            onAjouterMembre={() => ouvrirModaleAjouterMembres()}
            onCreerGroupeDepuisConversation={() => ouvrirModaleCreerGroupeDepuisDirect()}
            onRetirerMembre={(id) => void actionMembreGroupe("retirer_membre", id)}
            onPromouvoirAdmin={(id) => void actionMembreGroupe("promouvoir_admin", id)}
            onRetirerAdmin={(id) => void actionMembreGroupe("retirer_admin", id)}
            onRenommerGroupe={(sujet) => void renommerGroupe(sujet)}
            onModifierPhotoGroupe={(file) => void modifierPhotoGroupe(file)}
            onRetirerPhotoGroupe={() => void retirerPhotoGroupe()}
            onActionBientot={afficherBientot}
          />
        )}

        {conversationActive && libelleActif && drawerDetails && (
          <PanneauDetailsConversation
            conversation={conversationActive}
            messages={messages}
            utilisateurId={utilisateurId}
            libelleActif={libelleActif}
            estEnLigne={estEnLigne}
            onEpingle={() => void epingleConversation()}
            onAjouterMembre={() => ouvrirModaleAjouterMembres()}
            onCreerGroupeDepuisConversation={() => ouvrirModaleCreerGroupeDepuisDirect()}
            onRetirerMembre={(id) => void actionMembreGroupe("retirer_membre", id)}
            onPromouvoirAdmin={(id) => void actionMembreGroupe("promouvoir_admin", id)}
            onRetirerAdmin={(id) => void actionMembreGroupe("retirer_admin", id)}
            onRenommerGroupe={(sujet) => void renommerGroupe(sujet)}
            onModifierPhotoGroupe={(file) => void modifierPhotoGroupe(file)}
            onRetirerPhotoGroupe={() => void retirerPhotoGroupe()}
            onFermer={() => setDrawerDetails(false)}
            modeDrawer
            onActionBientot={afficherBientot}
          />
        )}
      </div>

      {messageAModifier && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gris-bordure px-4 py-3">
              <h3 className="font-semibold">
                {t("reception.messagerie.actionsMessage.modifierTitre")}
              </h3>
              <button type="button" onClick={() => setMessageAModifier(null)}>
                <X className="h-5 w-5 text-texte-secondaire" />
              </button>
            </div>
            <div className="p-4">
              <textarea
                value={texteModification}
                onChange={(e) => setTexteModification(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gris-bordure px-3 py-2 text-sm focus:border-bleu-medical focus:outline-none"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-gris-bordure px-4 py-3">
              <button
                type="button"
                onClick={() => setMessageAModifier(null)}
                className="rounded-lg px-4 py-2 text-sm text-texte-secondaire hover:bg-gris-tres-clair"
              >
                {t("reception.messagerie.annuler")}
              </button>
              <button
                type="button"
                disabled={!texteModification.trim()}
                onClick={() => void confirmerModification()}
                className="rounded-lg bg-bleu-medical px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                {t("reception.messagerie.envoyer")}
              </button>
            </div>
          </div>
        </div>
      )}

      <ModaleTransfertMessage
        ouverte={messageATransferer !== null}
        message={messageATransferer}
        conversations={conversations}
        conversationSourceId={conversationActive?.id ?? null}
        utilisateurId={utilisateurId}
        estEnLigne={estEnLigne}
        onFermer={() => setMessageATransferer(null)}
        onTransferer={transfererMessageVers}
      />

      <ModaleGestionGroupe
        ouverte={fluxGroupe !== null}
        mode={fluxGroupe?.type === "ajouter" ? "ajouter" : "creer"}
        contacts={contacts}
        chargementContacts={chargementContacts}
        membresExistants={
          fluxGroupe?.type === "ajouter" ? fluxGroupe.membresIds : undefined
        }
        selectionInitiale={
          fluxGroupe?.type === "creer_depuis_direct"
            ? fluxGroupe.participantIds
            : undefined
        }
        participantsVerrouilles={
          fluxGroupe?.type === "creer_depuis_direct"
            ? fluxGroupe.participantsVerrouilles
            : undefined
        }
        estEnLigne={estEnLigne}
        onFermer={() => setFluxGroupe(null)}
        onCreer={creerGroupe}
        onAjouterMembres={ajouterMembresGroupe}
      />

      {modaleRecherche && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gris-bordure px-4 py-3">
              <h3 className="font-semibold">{t("reception.messagerie.rechercheAvancee.titre")}</h3>
              <button type="button" onClick={() => setModaleRecherche(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 overflow-y-auto p-4">
              <input
                value={rechercheAvanceeQ}
                onChange={(e) => setRechercheAvanceeQ(e.target.value)}
                placeholder={t("reception.messagerie.rechercheAvancee.placeholder")}
                className="w-full rounded-lg border border-gris-bordure px-3 py-2 text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-texte-secondaire">
                    {t("reception.messagerie.rechercheAvancee.dateDebut")}
                  </label>
                  <input
                    type="date"
                    value={dateDebutRecherche}
                    onChange={(e) => setDateDebutRecherche(e.target.value)}
                    className="w-full rounded-lg border border-gris-bordure px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-texte-secondaire">
                    {t("reception.messagerie.rechercheAvancee.dateFin")}
                  </label>
                  <input
                    type="date"
                    value={dateFinRecherche}
                    onChange={(e) => setDateFinRecherche(e.target.value)}
                    className="w-full rounded-lg border border-gris-bordure px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <button
                type="button"
                disabled={rechercheEnCours}
                onClick={() => void lancerRechercheAvancee()}
                className="w-full rounded-lg bg-bleu-medical py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {rechercheEnCours ? (
                  <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                ) : (
                  t("reception.messagerie.rechercheAvancee.lancer")
                )}
              </button>
              {resultatsRecherche.length === 0 && !rechercheEnCours && rechercheAvanceeQ && (
                <p className="text-center text-sm text-texte-secondaire">
                  {t("reception.messagerie.rechercheAvancee.aucunResultat")}
                </p>
              )}
              <ul className="max-h-64 space-y-2 overflow-y-auto">
                {resultatsRecherche.map((m) => (
                  <li key={m.id} className="rounded-lg border border-gris-bordure p-3">
                    <p className="text-xs font-semibold text-texte-principal">
                      {m.expediteur.prenom} {m.expediteur.nom}
                      <span className="ml-2 font-normal text-texte-secondaire">
                        {new Date(m.envoyeLe).toLocaleString()}
                      </span>
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-texte-secondaire">{m.contenu}</p>
                    <button
                      type="button"
                      onClick={() => void ouvrirConversationDepuisRecherche(m.conversation.id)}
                      className="mt-2 text-xs font-semibold text-bleu-medical hover:underline"
                    >
                      {t("reception.messagerie.rechercheAvancee.ouvrirConversation")}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {modaleDiffusion && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gris-bordure px-4 py-3">
              <h3 className="font-semibold">{t("reception.messagerie.diffusion.titre")}</h3>
              <button type="button" onClick={() => setModaleDiffusion(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 p-4">
              <input
                value={sujetDiffusion}
                onChange={(e) => setSujetDiffusion(e.target.value)}
                placeholder={t("reception.messagerie.diffusion.sujet")}
                className="w-full rounded-lg border border-gris-bordure px-3 py-2 text-sm"
              />
              <textarea
                value={contenuDiffusion}
                onChange={(e) => setContenuDiffusion(e.target.value)}
                rows={5}
                placeholder={t("reception.messagerie.diffusion.contenu")}
                className="w-full rounded-lg border border-gris-bordure px-3 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-gris-bordure px-4 py-3">
              <button
                type="button"
                onClick={() => setModaleDiffusion(false)}
                className="rounded-lg px-4 py-2 text-sm text-texte-secondaire"
              >
                {t("reception.messagerie.annuler")}
              </button>
              <button
                type="button"
                disabled={!contenuDiffusion.trim() || envoiEnCours}
                onClick={() => void envoyerDiffusion()}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                {t("reception.messagerie.diffusion.envoyer")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
