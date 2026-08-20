"use client";

import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Check,
  FileText,
  Loader2,
  Pencil,
  Pin,
  Shield,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import type { ConversationResume, MessageConversation } from "@/lib/messagerie/types";
import { AvatarMessagerie } from "@/features/messagerie/composants/avatar-messagerie";
import { traduireRoleHospitalier } from "@/features/messagerie/traduire-role";
import { MenuActionsMembre } from "@/features/messagerie/composants/menu-actions-membre";
import {
  estImageMime,
  extraireMediasMessages,
  formaterTailleFichier,
} from "@/features/messagerie/utilitaires-messagerie";
import { cn } from "@/lib/utils";

interface PropsPanneauDetailsConversation {
  conversation: ConversationResume;
  messages: MessageConversation[];
  utilisateurId: string;
  libelleActif: { libelle: string; sousTitre: string | null };
  estEnLigne: (id: string) => boolean;
  onEpingle?: () => void;
  onAjouterMembre?: () => void;
  onCreerGroupeDepuisConversation?: () => void;
  onRetirerMembre?: (participantId: string) => void | Promise<void>;
  onPromouvoirAdmin?: (participantId: string) => void | Promise<void>;
  onRetirerAdmin?: (participantId: string) => void | Promise<void>;
  onRenommerGroupe?: (sujet: string) => void | Promise<void>;
  onModifierPhotoGroupe?: (file: File) => void | Promise<void>;
  onRetirerPhotoGroupe?: () => void | Promise<void>;
  onFermer?: () => void;
  modeDrawer?: boolean;
  onActionBientot?: () => void;
}

export function PanneauDetailsConversation({
  conversation,
  messages,
  utilisateurId,
  libelleActif,
  estEnLigne,
  onEpingle,
  onAjouterMembre,
  onCreerGroupeDepuisConversation,
  onRetirerMembre,
  onPromouvoirAdmin,
  onRetirerAdmin,
  onRenommerGroupe,
  onModifierPhotoGroupe,
  onRetirerPhotoGroupe,
  onFermer,
  modeDrawer = false,
  onActionBientot,
}: PropsPanneauDetailsConversation) {
  const { t } = useTranslation();
  const [editionNom, setEditionNom] = useState(false);
  const [nomBrouillon, setNomBrouillon] = useState("");
  const [sauvegardeNom, setSauvegardeNom] = useState(false);
  const [photoEnCours, setPhotoEnCours] = useState(false);
  const inputPhotoRef = useRef<HTMLInputElement>(null);

  const medias = extraireMediasMessages(messages).slice(0, 6);
  const enLigne = conversation.participants.filter((p) => estEnLigne(p.id));
  const horsLigne = conversation.participants.filter((p) => !estEnLigne(p.id));
  const estGroupe = conversation.type === "GROUPE";
  const moi = conversation.participants.find((p) => p.id === utilisateurId);
  const estAdminGroupe = moi?.roleGroupe === "ADMIN";
  const nbAdmins = conversation.participants.filter((p) => p.roleGroupe === "ADMIN").length;
  const gestionMembres = Boolean(
    estGroupe && estAdminGroupe && onRetirerMembre && onPromouvoirAdmin && onRetirerAdmin
  );
  const gestionProfilGroupe = estGroupe && estAdminGroupe;
  const nomAffiche =
    conversation.sujet?.trim() || libelleActif.libelle;

  useEffect(() => {
    setEditionNom(false);
    setNomBrouillon(conversation.sujet?.trim() ?? libelleActif.libelle);
  }, [conversation.id, conversation.sujet, libelleActif.libelle]);

  const demarrerRenommage = () => {
    setNomBrouillon(conversation.sujet?.trim() ?? libelleActif.libelle);
    setEditionNom(true);
  };

  const annulerRenommage = () => {
    setNomBrouillon(conversation.sujet?.trim() ?? libelleActif.libelle);
    setEditionNom(false);
  };

  const enregistrerRenommage = async () => {
    const nom = nomBrouillon.trim();
    if (!nom || !onRenommerGroupe || sauvegardeNom) return;
    setSauvegardeNom(true);
    try {
      await onRenommerGroupe(nom);
      setEditionNom(false);
    } finally {
      setSauvegardeNom(false);
    }
  };

  const choisirPhoto = async (fichier: File | null) => {
    if (!fichier || !onModifierPhotoGroupe || photoEnCours) return;
    const mime =
      fichier.type ||
      ({ jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif", webp: "image/webp" }[
        fichier.name.split(".").pop()?.toLowerCase() ?? ""
      ] ?? "");
    if (!mime.startsWith("image/") || fichier.size > 5 * 1024 * 1024) return;
    setPhotoEnCours(true);
    try {
      await onModifierPhotoGroupe(fichier);
    } finally {
      setPhotoEnCours(false);
      if (inputPhotoRef.current) inputPhotoRef.current.value = "";
    }
  };

  const actions = [
    ...(onEpingle
      ? [
          {
            icone: Pin,
            label: conversation.epinglePerso
              ? t("reception.messagerie.desepingle")
              : t("reception.messagerie.epingle"),
            action: onEpingle,
            actif: conversation.epinglePerso,
          },
        ]
      : []),
    ...(conversation.type === "GROUPE" && estAdminGroupe && onAjouterMembre
      ? [
          {
            icone: UserPlus,
            label: t("reception.messagerie.pro.ajouterMembre"),
            action: onAjouterMembre,
            actif: false,
          },
        ]
      : []),
    ...(conversation.type === "DIRECT" && onCreerGroupeDepuisConversation
      ? [
          {
            icone: Users,
            label: t("reception.messagerie.groupe.modal.creerDepuisConversation"),
            action: onCreerGroupeDepuisConversation,
            actif: false,
          },
        ]
      : []),
    ...(gestionProfilGroupe && onRenommerGroupe
      ? [
          {
            icone: Pencil,
            label: t("reception.messagerie.groupe.profil.renommer"),
            action: demarrerRenommage,
            actif: editionNom,
          },
        ]
      : []),
  ];

  const contenu = (
    <>
      <div className="relative border-b border-gris-bordure p-4 text-center">
        {modeDrawer && onFermer && (
          <button
            type="button"
            onClick={onFermer}
            className="absolute right-3 top-3 rounded-lg p-1 text-texte-secondaire hover:bg-gris-tres-clair"
            aria-label={t("reception.messagerie.annuler")}
          >
            <X className="h-5 w-5" />
          </button>
        )}
        <div className="mx-auto w-fit">
          {gestionProfilGroupe && onModifierPhotoGroupe ? (
            <>
              <input
                ref={inputPhotoRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={(e) => void choisirPhoto(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                onClick={() => inputPhotoRef.current?.click()}
                disabled={photoEnCours}
                className="group relative rounded-full focus:outline-none focus:ring-2 focus:ring-bleu-medical/40"
                aria-label={
                  conversation.photoUrl
                    ? t("reception.messagerie.groupe.modal.photoModifier")
                    : t("reception.messagerie.groupe.modal.photoAjouter")
                }
              >
                <AvatarMessagerie
                  type={conversation.type}
                  libelle={libelleActif.libelle}
                  imageUrl={conversation.photoUrl}
                  taille="lg"
                />
                <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-bleu-medical text-white shadow-md ring-2 ring-white">
                  {photoEnCours ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Camera className="h-3.5 w-3.5" />
                  )}
                </span>
              </button>
              {conversation.photoUrl && onRetirerPhotoGroupe && (
                <button
                  type="button"
                  onClick={() => void onRetirerPhotoGroupe()}
                  disabled={photoEnCours}
                  className="mt-1.5 block w-full text-center text-[10px] font-medium text-red-600 hover:underline disabled:opacity-50"
                >
                  {t("reception.messagerie.groupe.modal.photoRetirer")}
                </button>
              )}
            </>
          ) : (
            <AvatarMessagerie
              type={conversation.type}
              libelle={libelleActif.libelle}
              imageUrl={conversation.photoUrl}
              taille="lg"
            />
          )}
        </div>

        {editionNom ? (
          <div className="mt-3 px-2">
            <input
              value={nomBrouillon}
              onChange={(e) => setNomBrouillon(e.target.value)}
              maxLength={120}
              className="w-full rounded-xl border border-gris-bordure px-3 py-2 text-center text-sm font-semibold focus:border-bleu-medical focus:outline-none focus:ring-2 focus:ring-bleu-medical/15"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") void enregistrerRenommage();
                if (e.key === "Escape") annulerRenommage();
              }}
            />
            {!nomBrouillon.trim() && (
              <p className="mt-1 text-[10px] text-red-600">
                {t("reception.messagerie.groupe.modal.nomGroupeRequis")}
              </p>
            )}
            <div className="mt-2 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => void enregistrerRenommage()}
                disabled={!nomBrouillon.trim() || sauvegardeNom}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-bleu-medical text-white disabled:opacity-40"
                aria-label={t("reception.messagerie.groupe.profil.enregistrer")}
              >
                {sauvegardeNom ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={annulerRenommage}
                disabled={sauvegardeNom}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-texte-secondaire hover:bg-slate-200"
                aria-label={t("reception.messagerie.annuler")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <h3 className="mt-3 font-semibold text-texte-principal">{nomAffiche}</h3>
        )}
        <p className="text-xs text-texte-secondaire">
          {libelleActif.sousTitre ??
            t("reception.messagerie.pro.resumeGroupe", {
              count: conversation.participants.length,
            })}
        </p>
        {actions.length > 0 && (
          <div className="mt-4 flex justify-center gap-3">
            {actions.map(({ icone: Icone, label, action, actif }) => (
              <button
                key={label}
                type="button"
                onClick={action}
                className="flex flex-col items-center gap-1"
                title={label}
                aria-label={label}
                aria-pressed={actif}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full transition",
                    actif
                      ? "bg-amber-100 text-amber-600"
                      : "bg-bleu-medical-clair text-bleu-medical hover:bg-bleu-medical hover:text-white"
                  )}
                >
                  <Icone className={cn("h-4 w-4", actif && "fill-current")} />
                </span>
                <span className="max-w-[5rem] text-center text-[10px] leading-tight text-texte-secondaire line-clamp-2">
                  {label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {enLigne.length > 0 && (
          <section className="mb-4">
            <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              {t("reception.messagerie.pro.enLigne")} — {enLigne.length}
            </h4>
            <ul className="space-y-2">
              {enLigne.map((p) => (
                <MembreItem
                  key={p.id}
                  participant={p}
                  utilisateurId={utilisateurId}
                  enLigne
                  estEnLigne={estEnLigne}
                  gestionMembres={gestionMembres}
                  nbAdmins={nbAdmins}
                  onRetirerMembre={onRetirerMembre}
                  onPromouvoirAdmin={onPromouvoirAdmin}
                  onRetirerAdmin={onRetirerAdmin}
                  t={t}
                />
              ))}
            </ul>
          </section>
        )}

        {horsLigne.length > 0 && (
          <section className="mb-4">
            <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-texte-secondaire">
              {t("reception.messagerie.pro.horsLigne")} — {horsLigne.length}
            </h4>
            <ul className="space-y-2">
              {horsLigne.map((p) => (
                <MembreItem
                  key={p.id}
                  participant={p}
                  utilisateurId={utilisateurId}
                  enLigne={false}
                  estEnLigne={estEnLigne}
                  gestionMembres={gestionMembres}
                  nbAdmins={nbAdmins}
                  onRetirerMembre={onRetirerMembre}
                  onPromouvoirAdmin={onPromouvoirAdmin}
                  onRetirerAdmin={onRetirerAdmin}
                  t={t}
                />
              ))}
            </ul>
          </section>
        )}

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-texte-secondaire">
              {t("reception.messagerie.pro.medias")}
            </h4>
            {medias.length > 0 && (
              <button type="button" className="text-[10px] font-semibold text-bleu-medical">
                {t("reception.messagerie.pro.voirTout")}
              </button>
            )}
          </div>
          {medias.length === 0 ? (
            <p className="text-xs text-texte-secondaire">
              {t("reception.messagerie.pro.aucunMedia")}
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              {medias.map((m) =>
                estImageMime(m.mimeType) ? (
                  <a
                    key={m.id}
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-square overflow-hidden rounded-lg border border-gris-bordure bg-white"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.url} alt={m.nom} className="h-full w-full object-cover" />
                  </a>
                ) : (
                  <a
                    key={m.id}
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex aspect-square flex-col items-center justify-center rounded-lg border border-gris-bordure bg-white p-1 text-center"
                  >
                    <FileText className="h-5 w-5 text-red-500" />
                    <span className="mt-1 line-clamp-2 text-[9px] text-texte-secondaire">
                      {formaterTailleFichier(m.taille)}
                    </span>
                  </a>
                )
              )}
            </div>
          )}
        </section>
      </div>

      <div className="border-t border-gris-bordure p-4">
        <p className="text-[10px] leading-relaxed text-texte-secondaire">
          {t("reception.messagerie.confidentialite")}
        </p>
      </div>
    </>
  );

  if (modeDrawer) {
    return (
      <div className="fixed inset-0 z-40 lg:hidden">
        <button
          type="button"
          className="absolute inset-0 bg-black/40"
          onClick={onFermer}
          aria-label={t("reception.messagerie.annuler")}
        />
        <aside className="absolute bottom-[calc(4.25rem+env(safe-area-inset-bottom))] right-0 top-0 flex w-[min(300px,92vw)] flex-col overflow-hidden bg-white shadow-xl">
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            {contenu}
          </div>
        </aside>
      </div>
    );
  }

  return (
    <aside className="relative hidden w-[300px] shrink-0 border-l border-gris-bordure bg-white lg:flex lg:flex-col">
      {contenu}
    </aside>
  );
}

function MembreItem({
  participant: p,
  utilisateurId,
  enLigne,
  estEnLigne,
  gestionMembres,
  nbAdmins,
  onRetirerMembre,
  onPromouvoirAdmin,
  onRetirerAdmin,
  t,
}: {
  participant: ConversationResume["participants"][0];
  utilisateurId: string;
  enLigne: boolean;
  estEnLigne: (id: string) => boolean;
  gestionMembres?: boolean;
  nbAdmins: number;
  onRetirerMembre?: (participantId: string) => void | Promise<void>;
  onPromouvoirAdmin?: (participantId: string) => void | Promise<void>;
  onRetirerAdmin?: (participantId: string) => void | Promise<void>;
  t: TFunction;
}) {
  const estMoi = p.id === utilisateurId;
  const afficherMenu = gestionMembres && !estMoi;

  return (
    <li className="group flex items-center gap-2">
      <AvatarMessagerie
        prenom={p.prenom}
        nom={p.nom}
        taille="sm"
        enLigne={estEnLigne(p.id)}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {p.prenom} {p.nom}
          {estMoi && (
            <span className="ml-1 text-[10px] text-texte-secondaire">
              ({t("reception.messagerie.vous")})
            </span>
          )}
          {p.roleGroupe === "ADMIN" && (
            <span className="ml-1.5 inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-700">
              <Shield className="h-2.5 w-2.5" aria-hidden />
              {t("reception.messagerie.groupe.membre.badgeAdmin")}
            </span>
          )}
        </p>
        <p className={cn("truncate text-[11px]", enLigne ? "text-emerald-600" : "text-texte-secondaire")}>
          {traduireRoleHospitalier(p.role, t)}
        </p>
      </div>
      {afficherMenu && onRetirerMembre && onPromouvoirAdmin && onRetirerAdmin && (
        <MenuActionsMembre
          participant={p}
          nbAdmins={nbAdmins}
          onRetirer={() => onRetirerMembre(p.id)}
          onPromouvoirAdmin={() => onPromouvoirAdmin(p.id)}
          onRetirerAdmin={() => onRetirerAdmin(p.id)}
        />
      )}
    </li>
  );
}
