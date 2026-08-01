"use client";

import {
  ArrowLeft,
  Camera,
  Check,
  Loader2,
  Search,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AvatarMessagerie } from "@/features/messagerie/composants/avatar-messagerie";
import { traduireContactSalle } from "@/features/messagerie/traduire-conversation";
import { traduireRoleHospitalier } from "@/features/messagerie/traduire-role";
import type { ContactMessagerie } from "@/lib/messagerie/types";
import { cn } from "@/lib/utils";

export type ModeModaleGroupe = "creer" | "ajouter";

interface PropsModaleGestionGroupe {
  ouverte: boolean;
  mode: ModeModaleGroupe;
  contacts: ContactMessagerie[];
  chargementContacts: boolean;
  membresExistants?: string[];
  selectionInitiale?: string[];
  participantsVerrouilles?: string[];
  estEnLigne?: (id: string) => boolean;
  onFermer: () => void;
  onCreer: (sujet: string, participantIds: string[], photo?: File | null) => Promise<void>;
  onAjouterMembres: (participantIds: string[]) => Promise<void>;
}

type Etape = "participants" | "details";

const IDS_VIDES: string[] = [];

export function ModaleGestionGroupe({
  ouverte,
  mode,
  contacts,
  chargementContacts,
  membresExistants = IDS_VIDES,
  selectionInitiale = IDS_VIDES,
  participantsVerrouilles = IDS_VIDES,
  estEnLigne,
  onFermer,
  onCreer,
  onAjouterMembres,
}: PropsModaleGestionGroupe) {
  const { t } = useTranslation();
  const [etape, setEtape] = useState<Etape>("participants");
  const [selection, setSelection] = useState<string[]>([]);
  const [recherche, setRecherche] = useState("");
  const [sujet, setSujet] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [photoFichier, setPhotoFichier] = useState<File | null>(null);
  const [photoApercu, setPhotoApercu] = useState<string | null>(null);
  const inputPhotoRef = useRef<HTMLInputElement>(null);

  const membresSet = useMemo(() => new Set(membresExistants), [membresExistants]);
  const verrouSet = useMemo(() => new Set(participantsVerrouilles), [participantsVerrouilles]);

  const libererApercuPhoto = useCallback(() => {
    setPhotoApercu((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setPhotoFichier(null);
    if (inputPhotoRef.current) inputPhotoRef.current.value = "";
  }, []);

  const reinitialiser = useCallback(() => {
    setEtape("participants");
    setSelection([]);
    setRecherche("");
    setSujet("");
    setEnCours(false);
    libererApercuPhoto();
  }, [libererApercuPhoto]);

  useEffect(() => {
    return () => {
      if (photoApercu) URL.revokeObjectURL(photoApercu);
    };
  }, [photoApercu]);

  useEffect(() => {
    if (!ouverte) {
      reinitialiser();
      return;
    }
    setEtape("participants");
    setRecherche("");
    setSujet("");
    setSelection([...selectionInitiale]);
  }, [ouverte, selectionInitiale, reinitialiser]);

  const contactsDisponibles = useMemo(() => {
    const terme = recherche.trim().toLowerCase();
    return contacts.filter((c) => {
      if (membresSet.has(c.id)) return false;
      if (!terme) return true;
      return (
        c.prenom.toLowerCase().includes(terme) ||
        c.nom.toLowerCase().includes(terme) ||
        c.role.toLowerCase().includes(terme) ||
        (c.salleNom?.toLowerCase().includes(terme) ?? false)
      );
    });
  }, [contacts, membresSet, recherche]);

  const contactsSelectionnes = useMemo(
    () => contacts.filter((c) => selection.includes(c.id)),
    [contacts, selection]
  );

  const basculerSelection = (id: string) => {
    if (verrouSet.has(id)) return;
    setSelection((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const retirerSelection = (id: string) => {
    if (verrouSet.has(id)) return;
    setSelection((prev) => prev.filter((x) => x !== id));
  };

  const retirerParticipantDetails = (id: string) => {
    if (verrouSet.has(id)) return;
    setSelection((prev) => {
      const next = prev.filter((x) => x !== id);
      if (next.length === 0) setEtape("participants");
      return next;
    });
  };

  const choisirPhoto = (fichier: File | null) => {
    if (!fichier) return;
    if (!fichier.type.startsWith("image/")) return;
    if (fichier.size > 5 * 1024 * 1024) return;
    setPhotoApercu((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(fichier);
    });
    setPhotoFichier(fichier);
  };

  const fermer = () => {
    if (enCours) return;
    onFermer();
  };

  const confirmerAjout = async () => {
    if (selection.length === 0 || enCours) return;
    setEnCours(true);
    try {
      await onAjouterMembres(selection);
      onFermer();
    } finally {
      setEnCours(false);
    }
  };

  const confirmerCreation = async () => {
    const nom = sujet.trim();
    if (!nom || selection.length === 0 || enCours) return;
    setEnCours(true);
    try {
      await onCreer(nom, selection, photoFichier);
      onFermer();
    } finally {
      setEnCours(false);
    }
  };

  const nomGroupeValide = sujet.trim().length > 0;

  if (!ouverte) return null;

  const titre =
    mode === "creer"
      ? etape === "participants"
        ? t("reception.messagerie.groupe.modal.etapeParticipants")
        : t("reception.messagerie.groupe.modal.etapeDetails")
      : t("reception.messagerie.groupe.modal.ajouterMembresTitre");

  const chargementInitial = chargementContacts && contacts.length === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modale-groupe-titre"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) fermer();
      }}
    >
      <div className="flex h-[min(85dvh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* En-tête — hauteur fixe */}
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-gris-bordure px-3">
          {mode === "creer" && etape === "details" ? (
            <button
              type="button"
              onClick={() => setEtape("participants")}
              disabled={enCours}
              className="rounded-lg p-2 text-texte-secondaire hover:bg-gris-tres-clair"
              aria-label={t("reception.messagerie.groupe.modal.retour")}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : (
            <span className="w-9 shrink-0" aria-hidden />
          )}
          <h2
            id="modale-groupe-titre"
            className="min-w-0 flex-1 truncate text-center text-base font-semibold text-texte-principal"
          >
            {titre}
          </h2>
          <button
            type="button"
            onClick={fermer}
            disabled={enCours}
            className="rounded-lg p-2 text-texte-secondaire hover:bg-gris-tres-clair"
            aria-label={t("reception.messagerie.annuler")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {etape === "participants" ? (
          <>
            {/* Bandeau sélection — hauteur min fixe pour éviter les sauts */}
            <div className="min-h-[88px] shrink-0 border-b border-gris-bordure bg-slate-50/80 px-3 py-2.5">
              {selection.length > 0 ? (
                <>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-texte-secondaire">
                    {t("reception.messagerie.groupe.modal.selectionnes", {
                      count: selection.length,
                    })}
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {contactsSelectionnes.map((c) => {
                      const verrouille = verrouSet.has(c.id);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => retirerSelection(c.id)}
                          disabled={verrouille}
                          className={cn(
                            "group flex shrink-0 flex-col items-center gap-1",
                            verrouille && "cursor-default opacity-90"
                          )}
                          title={`${c.prenom} ${c.nom}`}
                        >
                          <span className="relative">
                            <AvatarMessagerie
                              prenom={c.prenom}
                              nom={c.nom}
                              taille="sm"
                              enLigne={estEnLigne?.(c.id)}
                            />
                            {!verrouille && (
                              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-600 text-white opacity-90 group-hover:bg-red-500">
                                <X className="h-2.5 w-2.5" />
                              </span>
                            )}
                          </span>
                          <span className="max-w-[52px] truncate text-[10px] text-texte-secondaire">
                            {c.prenom}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : null}
            </div>

            {/* Recherche — filtrage local uniquement */}
            <div className="shrink-0 border-b border-gris-bordure px-3 py-2.5">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-texte-secondaire"
                  aria-hidden
                />
                <input
                  type="search"
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  placeholder={t("reception.messagerie.groupe.modal.rechercher")}
                  className="w-full rounded-xl border border-gris-bordure bg-gris-tres-clair py-2.5 pl-10 pr-3 text-sm focus:border-bleu-medical focus:outline-none focus:ring-2 focus:ring-bleu-medical/15"
                  autoFocus
                />
              </div>
            </div>

            {/* Liste — zone scrollable stable */}
            <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {chargementInitial ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                  <Loader2 className="h-7 w-7 animate-spin text-bleu-medical" />
                </div>
              ) : null}
              {!chargementInitial && contactsDisponibles.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
                  <Users className="h-10 w-10 text-slate-300" />
                  <p className="text-sm text-texte-secondaire">
                    {membresExistants.length > 0 && !recherche.trim()
                      ? t("reception.messagerie.groupe.modal.tousDejaMembres")
                      : t("reception.messagerie.aucunContact")}
                  </p>
                </div>
              ) : (
                <ul role="listbox" aria-multiselectable="true">
                  {contactsDisponibles.map((c) => {
                    const selectionne = selection.includes(c.id);
                    const salle =
                      traduireContactSalle(c.salleCode, c.salleNom, t) ?? c.salleNom;
                    return (
                      <li key={c.id} role="option" aria-selected={selectionne}>
                        <button
                          type="button"
                          onClick={() => basculerSelection(c.id)}
                          className={cn(
                            "flex w-full items-center gap-3 border-b border-gris-bordure/40 px-4 py-3 text-left",
                            selectionne ? "bg-bleu-medical-clair/40" : "hover:bg-slate-50"
                          )}
                        >
                          <AvatarMessagerie
                            prenom={c.prenom}
                            nom={c.nom}
                            taille="liste"
                            enLigne={estEnLigne?.(c.id)}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-semibold text-texte-principal">
                              {c.prenom} {c.nom}
                            </p>
                            <p className="truncate text-xs text-texte-secondaire">
                              {traduireRoleHospitalier(c.role, t)}
                            </p>
                            {salle && (
                              <p className="truncate text-[11px] text-texte-secondaire/75">
                                {salle}
                              </p>
                            )}
                          </div>
                          <span
                            className={cn(
                              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                              selectionne
                                ? "border-bleu-medical bg-bleu-medical text-white"
                                : "border-slate-300 bg-white"
                            )}
                          >
                            {selectionne && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Pied — hauteur fixe */}
            <div className="shrink-0 border-t border-gris-bordure bg-white px-4 py-3">
              {mode === "creer" ? (
                <button
                  type="button"
                  disabled={selection.length === 0 || enCours || chargementInitial}
                  onClick={() => setEtape("details")}
                  className="w-full rounded-xl bg-bleu-medical py-3 text-sm font-semibold text-white transition hover:bg-bleu-medical-fonce disabled:opacity-40"
                >
                  {t("reception.messagerie.groupe.modal.suivant")}
                  {selection.length > 0 && (
                    <span className="ml-1 opacity-90">({selection.length})</span>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={selection.length === 0 || enCours || chargementInitial}
                  onClick={() => void confirmerAjout()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-bleu-medical py-3 text-sm font-semibold text-white transition hover:bg-bleu-medical-fonce disabled:opacity-40"
                >
                  {enCours ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  {t("reception.messagerie.groupe.modal.ajouterMembresAction")}
                  {selection.length > 0 && (
                    <span className="opacity-90">({selection.length})</span>
                  )}
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
              <div className="mb-6 flex flex-col items-center text-center">
                <input
                  ref={inputPhotoRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  onChange={(e) => choisirPhoto(e.target.files?.[0] ?? null)}
                />
                <button
                  type="button"
                  onClick={() => inputPhotoRef.current?.click()}
                  className="group relative mb-2 h-20 w-20 overflow-hidden rounded-2xl bg-bleu-medical-clair ring-2 ring-transparent transition hover:ring-bleu-medical/30 focus:outline-none focus:ring-bleu-medical/40"
                  aria-label={
                    photoApercu
                      ? t("reception.messagerie.groupe.modal.photoModifier")
                      : t("reception.messagerie.groupe.modal.photoAjouter")
                  }
                >
                  {photoApercu ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={photoApercu}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center">
                      <Users className="h-9 w-9 text-bleu-medical" />
                    </span>
                  )}
                  <span className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-bleu-medical text-white shadow-md">
                    <Camera className="h-3.5 w-3.5" />
                  </span>
                </button>
                {photoApercu ? (
                  <button
                    type="button"
                    onClick={libererApercuPhoto}
                    className="text-xs font-medium text-red-600 hover:underline"
                  >
                    {t("reception.messagerie.groupe.modal.photoRetirer")}
                  </button>
                ) : (
                  <p className="text-xs text-texte-secondaire">
                    {t("reception.messagerie.groupe.modal.photoOptionnelle")}
                  </p>
                )}
                <p className="mt-2 text-sm text-texte-secondaire">
                  {t("reception.messagerie.groupe.modal.resumeSelection", {
                    count: selection.length,
                  })}
                </p>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-texte-secondaire">
                  {t("reception.messagerie.groupe.modal.nomGroupe")}
                  <span className="ml-0.5 text-red-500" aria-hidden>
                    *
                  </span>
                </span>
                <input
                  value={sujet}
                  onChange={(e) => setSujet(e.target.value)}
                  placeholder={t("reception.messagerie.groupe.modal.placeholder")}
                  className={cn(
                    "w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2",
                    nomGroupeValide
                      ? "border-gris-bordure focus:border-bleu-medical focus:ring-bleu-medical/15"
                      : "border-red-200 focus:border-red-400 focus:ring-red-100"
                  )}
                  autoFocus
                  maxLength={120}
                  required
                />
                {!nomGroupeValide && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {t("reception.messagerie.groupe.modal.nomGroupeRequis")}
                  </p>
                )}
              </label>

              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-texte-secondaire">
                  {t("reception.messagerie.groupe.modal.participantsTitre")}
                </p>
                <ul className="space-y-2">
                  {contactsSelectionnes.map((c) => {
                    const verrouille = verrouSet.has(c.id);
                    return (
                      <li
                        key={c.id}
                        className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2"
                      >
                        <AvatarMessagerie prenom={c.prenom} nom={c.nom} taille="sm" />
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-texte-principal">
                          {c.prenom} {c.nom}
                        </span>
                        {!verrouille && (
                          <button
                            type="button"
                            onClick={() => retirerParticipantDetails(c.id)}
                            className="shrink-0 rounded-lg p-1.5 text-texte-secondaire transition hover:bg-red-50 hover:text-red-600"
                            aria-label={t("reception.messagerie.groupe.modal.deselectionner", {
                              nom: `${c.prenom} ${c.nom}`,
                            })}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            <div className="shrink-0 border-t border-gris-bordure bg-white px-4 py-3">
              <button
                type="button"
                disabled={!nomGroupeValide || selection.length === 0 || enCours}
                onClick={() => void confirmerCreation()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-bleu-medical py-3 text-sm font-semibold text-white transition hover:bg-bleu-medical-fonce disabled:opacity-40"
              >
                {enCours ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Users className="h-4 w-4" />
                )}
                {t("reception.messagerie.groupe.modal.creer")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
