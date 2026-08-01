"use client";

import { ArrowLeft, Loader2, Search, SquarePen } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import type { ContactMessagerie, ConversationResume } from "@/lib/messagerie/types";
import { AvatarMessagerie } from "@/features/messagerie/composants/avatar-messagerie";
import {
  formaterHeureListe,
  formaterNomCourtExpediteur,
} from "@/features/messagerie/utilitaires-messagerie";
import { traduireContactSalle } from "@/features/messagerie/traduire-conversation";
import { traduireContenuMessage } from "@/features/messagerie/traduire-contenu-message";
import { traduireRoleHospitalier } from "@/features/messagerie/traduire-role";
import { cn } from "@/lib/utils";

export type OngletListeMessagerie = "conversations" | "groupes";

interface PropsPanneauListeConversations {
  conversations: ConversationResume[];
  conversationActiveId: string | null;
  chargementListe: boolean;
  onglet: OngletListeMessagerie;
  onOngletChange: (onglet: OngletListeMessagerie) => void;
  estEnLigne?: (id: string) => boolean;
  libelleConv: (conv: ConversationResume) => { libelle: string; sousTitre: string | null };
  onOuvrir: (conv: ConversationResume) => void;
  onAfficherPersonnel: () => void;
  afficherPersonnel: boolean;
  onRetourConversations: () => void;
  contacts: ContactMessagerie[];
  chargementContacts: boolean;
  recherchePersonnel: string;
  onRecherchePersonnelChange: (valeur: string) => void;
  onSelectionnerPersonnel: (contactId: string) => void;
  contactEnCours: string | null;
  locale: string;
  visible: boolean;
  utilisateurId: string;
}

function filtrerParOnglet(
  conversations: ConversationResume[],
  onglet: OngletListeMessagerie
): ConversationResume[] {
  if (onglet === "groupes") {
    return conversations.filter((c) => c.type === "GROUPE");
  }
  return conversations.filter((c) => c.type !== "GROUPE");
}

function sousTitreLigneListe(
  conv: ConversationResume,
  libelle: string,
  utilisateurId: string,
  t: TFunction
): string {
  const autre = conv.participants.find((p) => p.id !== utilisateurId);

  if (conv.type === "DIRECT" && autre) {
    return traduireRoleHospitalier(autre.role, t);
  }

  if (conv.dernierMessage?.expediteurNom) {
    return formaterNomCourtExpediteur(conv.dernierMessage.expediteurNom);
  }

  return autre ? traduireRoleHospitalier(autre.role, t) : libelle;
}

export function PanneauListeConversations({
  conversations,
  conversationActiveId,
  chargementListe,
  onglet,
  onOngletChange,
  estEnLigne,
  libelleConv,
  onOuvrir,
  onAfficherPersonnel,
  afficherPersonnel,
  onRetourConversations,
  contacts,
  chargementContacts,
  recherchePersonnel,
  onRecherchePersonnelChange,
  onSelectionnerPersonnel,
  contactEnCours,
  locale,
  visible,
  utilisateurId,
}: PropsPanneauListeConversations) {
  const { t } = useTranslation();
  const liste = filtrerParOnglet(conversations, onglet);

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-r border-gris-bordure bg-white",
        "w-full md:w-[300px]",
        visible ? "flex" : "hidden md:flex"
      )}
    >
      {afficherPersonnel ? (
        <>
          <div className="flex shrink-0 items-center gap-2 border-b border-gris-bordure px-2 py-2">
            <button
              type="button"
              onClick={onRetourConversations}
              className="rounded-lg p-2 text-texte-secondaire hover:bg-gris-tres-clair"
              aria-label={t("reception.messagerie.pro.retourConversations")}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h3 className="flex-1 text-sm font-bold text-texte-principal">
              {t("reception.messagerie.pro.personnel")}
            </h3>
          </div>
          <div className="border-b border-gris-bordure px-3 py-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-texte-secondaire"
                aria-hidden
              />
              <input
                type="search"
                value={recherchePersonnel}
                onChange={(e) => onRecherchePersonnelChange(e.target.value)}
                placeholder={t("reception.messagerie.pro.rechercherPersonnel")}
                className="w-full rounded-lg border border-gris-bordure bg-gris-tres-clair py-2 pl-9 pr-3 text-sm focus:border-bleu-medical focus:outline-none focus:ring-2 focus:ring-bleu-medical/15"
                autoFocus
              />
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {chargementContacts ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-bleu-medical" />
              </div>
            ) : contacts.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-texte-secondaire">
                {t("reception.messagerie.aucunContact")}
              </p>
            ) : (
              <ul role="list">
                {contacts.map((c) => {
                  const nomComplet = `${c.prenom} ${c.nom}`;
                  const salle =
                    traduireContactSalle(c.salleCode, c.salleNom, t) ?? c.salleNom;
                  const enChargement = contactEnCours === c.id;

                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        disabled={!!contactEnCours}
                        onClick={() => onSelectionnerPersonnel(c.id)}
                        className={cn(
                          "flex w-full items-start gap-3 px-4 py-3.5 text-left transition",
                          "border-b border-gris-bordure/40 hover:bg-slate-50",
                          enChargement && "bg-bleu-medical-clair/45"
                        )}
                      >
                        <AvatarMessagerie
                          prenom={c.prenom}
                          nom={c.nom}
                          taille="liste"
                          enLigne={estEnLigne?.(c.id)}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-semibold leading-tight text-texte-principal">
                            {nomComplet}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-texte-secondaire">
                            {traduireRoleHospitalier(c.role, t)}
                          </p>
                          {salle && (
                            <p className="mt-1 truncate text-xs text-texte-secondaire/80">{salle}</p>
                          )}
                        </div>
                        {enChargement && (
                          <Loader2 className="mt-1 h-4 w-4 shrink-0 animate-spin text-bleu-medical" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex shrink-0 items-stretch border-b border-gris-bordure px-1">
            <div
              className="flex min-w-0 flex-1"
              role="tablist"
              aria-label={t("reception.messagerie.pro.onglets.conversations")}
            >
              {(["conversations", "groupes"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={onglet === key}
                  onClick={() => onOngletChange(key)}
                  className={cn(
                    "flex-1 border-b-2 px-2 py-3.5 text-sm font-semibold transition",
                    onglet === key
                      ? "border-bleu-medical text-bleu-medical"
                      : "border-transparent text-texte-secondaire hover:text-texte-principal"
                  )}
                >
                  {t(`reception.messagerie.pro.onglets.${key}`)}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onAfficherPersonnel}
              className="flex shrink-0 items-center justify-center px-3 text-texte-secondaire transition hover:bg-gris-tres-clair hover:text-bleu-medical"
              aria-label={t("reception.messagerie.nouveauMessage")}
              title={t("reception.messagerie.nouveauMessage")}
            >
              <SquarePen className="h-[18px] w-[18px] stroke-[1.75]" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {chargementListe ? (
              <div className="space-y-0" aria-busy="true">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex animate-pulse gap-3 border-b border-gris-bordure/50 px-4 py-3.5"
                  >
                    <div className="h-11 w-11 rounded-full bg-slate-200" />
                    <div className="flex-1 space-y-2 py-0.5">
                      <div className="h-3.5 w-2/3 rounded bg-slate-200" />
                      <div className="h-2.5 w-1/3 rounded bg-slate-100" />
                      <div className="h-2.5 w-full rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : liste.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-texte-secondaire">
                {t("reception.messagerie.aucuneConversation")}
              </p>
            ) : (
              <ul role="list">
                {liste.map((conv) => {
                  const { libelle } = libelleConv(conv);
                  const participantDirect =
                    conv.type === "DIRECT"
                      ? conv.participants.find((p) => p.id !== utilisateurId) ??
                        conv.participants[0]
                      : null;
                  const actif = conversationActiveId === conv.id;
                  const nonLu = conv.nonLus > 0;
                  const ligne2 = sousTitreLigneListe(conv, libelle, utilisateurId, t);

                  return (
                    <li key={conv.id}>
                      <button
                        type="button"
                        onClick={() => onOuvrir(conv)}
                        className={cn(
                          "flex w-full items-start gap-3 px-4 py-3.5 text-left transition",
                          "border-b border-gris-bordure/40 hover:bg-slate-50",
                          (nonLu || actif) && "bg-bleu-medical-clair/45 hover:bg-bleu-medical-clair/55"
                        )}
                      >
                        <AvatarMessagerie
                          type={conv.type}
                          prenom={participantDirect?.prenom}
                          nom={participantDirect?.nom}
                          libelle={libelle}
                          imageUrl={conv.photoUrl}
                          taille="liste"
                          enLigne={
                            participantDirect && estEnLigne
                              ? estEnLigne(participantDirect.id)
                              : conv.type !== "DIRECT" && estEnLigne
                                ? conv.participants.some(
                                    (p) => p.id !== utilisateurId && estEnLigne(p.id)
                                  )
                                : undefined
                          }
                        />

                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "truncate text-[13px] leading-tight text-texte-principal",
                              nonLu ? "font-bold" : "font-semibold"
                            )}
                          >
                            {libelle}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-texte-secondaire">{ligne2}</p>
                          {conv.dernierMessage && (
                            <p
                              className={cn(
                                "mt-1 truncate text-xs leading-snug",
                                nonLu
                                  ? "font-medium text-texte-principal/80"
                                  : "text-texte-secondaire"
                              )}
                            >
                              {conv.dernierMessage.supprime
                                ? t("reception.messagerie.messageSupprime")
                                : traduireContenuMessage(conv.dernierMessage.contenu, t)}
                            </p>
                          )}
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-1.5 pt-0.5">
                          {conv.dernierMessage && (
                            <span className="text-[11px] tabular-nums text-texte-secondaire">
                              {formaterHeureListe(conv.dernierMessage.envoyeLe, locale, t)}
                            </span>
                          )}
                          {nonLu && (
                            <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-bleu-medical px-1 text-[10px] font-bold leading-none text-white">
                              {conv.nonLus > 99 ? "99+" : conv.nonLus}
                            </span>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </aside>
  );
}
