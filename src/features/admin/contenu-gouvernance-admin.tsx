"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, ImagePlus, Loader2, Save, Shield, Trash2 } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import { ImageVitrine } from "@/components/ui/image-vitrine";
import { CLASSE_CHAMP_RECEPTION, CLASSE_LABEL_RECEPTION } from "@/constants/reception";
import {
  MiseEnPageAdmin,
  type UtilisateurAdmin,
} from "@/features/admin/mise-en-page-admin";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import { cn } from "@/lib/utils";

type SalleOption = {
  id: string;
  code: string;
  nom: string;
  ordre?: number;
};

type EntreeGouvernance = {
  id: string;
  prenom: string;
  nom: string;
  specialite: string;
  bio: string | null;
  photoUrl: string | null;
  horaires: string | null;
  telephone: string | null;
  email: string | null;
  salleId: string | null;
  categorie: string;
  masquerContactsPublic: boolean;
  badgeValeur1: string | null;
  badgeLibelle1: string | null;
  badgeValeur2: string | null;
  badgeLibelle2: string | null;
  badgeValeur3: string | null;
  badgeLibelle3: string | null;
  ordre: number;
  actif: boolean;
  salle: SalleOption | null;
};

type FormGouvernance = {
  id?: string;
  prenom: string;
  nom: string;
  specialite: string;
  bio: string;
  photoUrl: string;
  horaires: string;
  telephone: string;
  email: string;
  salleId: string;
  categorie: string;
  masquerContactsPublic: boolean;
  badgeValeur1: string;
  badgeLibelle1: string;
  badgeValeur2: string;
  badgeLibelle2: string;
  badgeValeur3: string;
  badgeLibelle3: string;
  ordre: number;
  actif: boolean;
};

const CATEGORIES = [
  { value: "RESPONSABLE_LABO", label: "Responsable" },
  { value: "MEDECIN", label: "Médecins" },
  { value: "PERSONNEL", label: "Personnel" },
  { value: "MEDECIN_EXTERNE", label: "Médecins externes" },
  { value: "SERVICE_EGLISE", label: "Service Église" },
] as const;

const BADGES = [
  { valeur: "badgeValeur1", libelle: "badgeLibelle1", index: 1 },
  { valeur: "badgeValeur2", libelle: "badgeLibelle2", index: 2 },
  { valeur: "badgeValeur3", libelle: "badgeLibelle3", index: 3 },
] as const;

function formVide(): FormGouvernance {
  return {
    prenom: "",
    nom: "",
    specialite: "",
    bio: "",
    photoUrl: "",
    horaires: "",
    telephone: "",
    email: "",
    salleId: "",
    categorie: "MEDECIN",
    masquerContactsPublic: false,
    badgeValeur1: "",
    badgeLibelle1: "",
    badgeValeur2: "",
    badgeLibelle2: "",
    badgeValeur3: "",
    badgeLibelle3: "",
    ordre: 0,
    actif: true,
  };
}

function versFormulaire(entree: EntreeGouvernance): FormGouvernance {
  return {
    id: entree.id,
    prenom: entree.prenom,
    nom: entree.nom,
    specialite: entree.specialite,
    bio: entree.bio ?? "",
    photoUrl: entree.photoUrl ?? "",
    horaires: entree.horaires ?? "",
    telephone: entree.telephone ?? "",
    email: entree.email ?? "",
    salleId: entree.salleId ?? "",
    categorie: entree.categorie,
    masquerContactsPublic: entree.masquerContactsPublic,
    badgeValeur1: entree.badgeValeur1 ?? "",
    badgeLibelle1: entree.badgeLibelle1 ?? "",
    badgeValeur2: entree.badgeValeur2 ?? "",
    badgeLibelle2: entree.badgeLibelle2 ?? "",
    badgeValeur3: entree.badgeValeur3 ?? "",
    badgeLibelle3: entree.badgeLibelle3 ?? "",
    ordre: entree.ordre,
    actif: entree.actif,
  };
}

export function ContenuGouvernanceAdmin({
  utilisateur,
}: {
  utilisateur: UtilisateurAdmin;
}) {
  const [entrees, setEntrees] = useState<EntreeGouvernance[]>([]);
  const [salles, setSalles] = useState<SalleOption[]>([]);
  const [filtre, setFiltre] = useState<string>("TOUS");
  const [form, setForm] = useState<FormGouvernance>(formVide());
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);
  const [enCours, setEnCours] = useState(false);
  const [uploadEnCours, setUploadEnCours] = useState(false);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const res = await fetch("/api/admin/gouvernance");
      const data = (await res.json()) as {
        entrees?: EntreeGouvernance[];
        salles?: SalleOption[];
        message?: string;
      };
      if (!res.ok) throw new Error(data.message ?? "Chargement impossible.");
      setEntrees(data.entrees ?? []);
      setSalles(data.salles ?? []);
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : "Chargement impossible.");
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    void charger();
  }, [charger]);

  const listeFiltree = useMemo(() => {
    if (filtre === "TOUS") return entrees;
    return entrees.filter((entree) => entree.categorie === filtre);
  }, [entrees, filtre]);

  const maj = <K extends keyof FormGouvernance>(cle: K, valeur: FormGouvernance[K]) =>
    setForm((prev) => ({ ...prev, [cle]: valeur }));

  const nouvelleEntree = () => {
    setForm(formVide());
    setErreur(null);
    setMessage(null);
  };

  const televerserPhoto = async (fichier: File) => {
    setUploadEnCours(true);
    setErreur(null);
    try {
      const fd = new FormData();
      fd.append("photo", fichier);
      const res = await fetch("/api/admin/gouvernance/upload", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json()) as { photoUrl?: string; message?: string };
      if (!res.ok || !data.photoUrl) {
        throw new Error(data.message ?? "Upload impossible.");
      }
      maj("photoUrl", data.photoUrl);
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : "Upload impossible.");
    } finally {
      setUploadEnCours(false);
    }
  };

  const enregistrer = async () => {
    setEnCours(true);
    setErreur(null);
    setMessage(null);
    try {
      const res = await fetch(
        form.id ? `/api/admin/gouvernance/${form.id}` : "/api/admin/gouvernance",
        {
          method: form.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            bio: form.bio || null,
            photoUrl: form.photoUrl || null,
            horaires: form.horaires || null,
            telephone: form.telephone || null,
            email: form.email || null,
            salleId: form.salleId || null,
            badgeValeur1: form.badgeValeur1 || null,
            badgeLibelle1: form.badgeLibelle1 || null,
            badgeValeur2: form.badgeValeur2 || null,
            badgeLibelle2: form.badgeLibelle2 || null,
            badgeValeur3: form.badgeValeur3 || null,
            badgeLibelle3: form.badgeLibelle3 || null,
          }),
        }
      );
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? "Enregistrement impossible.");
      setMessage(form.id ? "Entrée mise à jour." : "Entrée ajoutée.");
      setForm(formVide());
      await charger();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : "Enregistrement impossible.");
    } finally {
      setEnCours(false);
    }
  };

  const supprimer = async (id: string) => {
    if (!window.confirm("Supprimer cette entrée de gouvernance ?")) return;
    setEnCours(true);
    setErreur(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/gouvernance/${id}`, { method: "DELETE" });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? "Suppression impossible.");
      if (form.id === id) setForm(formVide());
      setMessage("Entrée supprimée.");
      await charger();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : "Suppression impossible.");
    } finally {
      setEnCours(false);
    }
  };

  const salleLabel = (entree: EntreeGouvernance) =>
    entree.salle?.nom ??
    CATEGORIES.find((item) => item.value === entree.categorie)?.label ??
    entree.categorie;

  const estResponsable = form.categorie === "RESPONSABLE_LABO";

  return (
    <MiseEnPageAdmin
      utilisateur={utilisateur}
      titre="Gouvernance"
      sousTitre="Pilotez le responsable et les agents visibles sur la page À propos."
    >
      <div className="mx-auto w-full max-w-[1240px]">
        <EnTetePageReception
          icone={Shield}
          titre="Gouvernance"
          description="Gérez le responsable du centre et les agents affichés publiquement par salle ou service."
          fil={[
            { label: "Admin", href: "/sigh/admin" },
            { label: "Gouvernance" },
          ]}
        />

        <div className="mt-4 flex flex-wrap gap-2 rounded-xl border border-gris-bordure bg-white p-2 shadow-sm">
          <button
            type="button"
            onClick={() => setFiltre("TOUS")}
            className={cn(
              "rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:text-sm",
              filtre === "TOUS"
                ? "bg-[#2d2a6e] text-white"
                : "text-texte-secondaire hover:bg-gris-tres-clair"
            )}
          >
            Tous
          </button>
          {CATEGORIES.map((categorie) => (
            <button
              key={categorie.value}
              type="button"
              onClick={() => setFiltre(categorie.value)}
              className={cn(
                "rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:text-sm",
                filtre === categorie.value
                  ? "bg-bleu-medical text-white"
                  : "text-texte-secondaire hover:bg-gris-tres-clair"
              )}
            >
              {categorie.label}
            </button>
          ))}
        </div>

        {message ? (
          <p className="mt-3 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
            {message}
          </p>
        ) : null}
        {erreur ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {erreur}
          </p>
        ) : null}

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border border-gris-bordure bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gris-bordure px-4 py-3">
              <div>
                <h2 className="text-sm font-bold text-[#2d2a6e]">
                  Entrées publiées
                </h2>
                <p className="text-xs text-texte-secondaire">
                  Responsable unique, médecins, personnel, externes et service Église.
                </p>
              </div>
              <Bouton taille="petit" onClick={nouvelleEntree}>
                Nouvelle entrée
              </Bouton>
            </div>

            <div className="p-4">
              {chargement ? (
                <p className="flex items-center gap-2 text-sm text-texte-secondaire">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Chargement...
                </p>
              ) : listeFiltree.length === 0 ? (
                <p className="text-sm text-texte-secondaire">
                  Aucune entrée pour ce filtre.
                </p>
              ) : (
                <div className="space-y-3">
                  {listeFiltree.map((entree) => (
                    <div
                      key={entree.id}
                      className="flex gap-3 rounded-xl border border-gris-bordure p-3"
                    >
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gris-tres-clair">
                        {entree.photoUrl ? (
                          <ImageVitrine
                            src={entree.photoUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Building2 className="h-6 w-6 text-texte-secondaire" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-texte-principal">
                              {entree.prenom} {entree.nom}
                            </p>
                            <p className="text-sm text-bleu-medical">{entree.specialite}</p>
                            <p className="text-xs text-texte-secondaire">
                              {salleLabel(entree)}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                              entree.actif
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-700"
                            )}
                          >
                            {entree.actif ? "Actif" : "Inactif"}
                          </span>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Bouton
                            variante="contour"
                            taille="petit"
                            onClick={() => {
                              setForm(versFormulaire(entree));
                              setMessage(null);
                              setErreur(null);
                            }}
                          >
                            Modifier
                          </Bouton>
                          <Bouton
                            variante="danger"
                            taille="petit"
                            onClick={() => void supprimer(entree.id)}
                            disabled={enCours}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Bouton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-gris-bordure bg-white shadow-sm">
            <div className="border-b border-gris-bordure px-4 py-3">
              <h2 className="text-sm font-bold text-[#2d2a6e]">
                {form.id ? "Modifier l’entrée" : "Nouvelle entrée"}
              </h2>
              <p className="text-xs text-texte-secondaire">
                Associez chaque agent à sa salle pour l’affichage public par service.
              </p>
            </div>

            <div className="space-y-4 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={CLASSE_LABEL_RECEPTION}>Prénom</label>
                  <input
                    className={CLASSE_CHAMP_RECEPTION}
                    value={form.prenom}
                    onChange={(e) => maj("prenom", e.target.value)}
                  />
                </div>
                <div>
                  <label className={CLASSE_LABEL_RECEPTION}>Nom</label>
                  <input
                    className={CLASSE_CHAMP_RECEPTION}
                    value={form.nom}
                    onChange={(e) => maj("nom", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={CLASSE_LABEL_RECEPTION}>Fonction / spécialité</label>
                  <input
                    className={CLASSE_CHAMP_RECEPTION}
                    value={form.specialite}
                    onChange={(e) => maj("specialite", e.target.value)}
                  />
                </div>
                <div>
                  <label className={CLASSE_LABEL_RECEPTION}>Catégorie</label>
                  <select
                    className={CLASSE_CHAMP_RECEPTION}
                    value={form.categorie}
                    onChange={(e) => maj("categorie", e.target.value)}
                  >
                    {CATEGORIES.map((categorie) => (
                      <option key={categorie.value} value={categorie.value}>
                        {categorie.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={CLASSE_LABEL_RECEPTION}>Salle / service</label>
                  <select
                    className={CLASSE_CHAMP_RECEPTION}
                    value={form.salleId}
                    onChange={(e) => maj("salleId", e.target.value)}
                  >
                    <option value="">Choisir une salle</option>
                    {salles.map((salle) => (
                      <option key={salle.id} value={salle.id}>
                        {salle.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={CLASSE_LABEL_RECEPTION}>Ordre</label>
                  <input
                    type="number"
                    className={CLASSE_CHAMP_RECEPTION}
                    value={form.ordre}
                    onChange={(e) => maj("ordre", Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={CLASSE_LABEL_RECEPTION}>Téléphone</label>
                  <input
                    className={CLASSE_CHAMP_RECEPTION}
                    value={form.telephone}
                    onChange={(e) => maj("telephone", e.target.value)}
                  />
                </div>
                <div>
                  <label className={CLASSE_LABEL_RECEPTION}>E-mail</label>
                  <input
                    type="email"
                    className={CLASSE_CHAMP_RECEPTION}
                    value={form.email}
                    onChange={(e) => maj("email", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className={CLASSE_LABEL_RECEPTION}>Horaires / texte court</label>
                <input
                  className={CLASSE_CHAMP_RECEPTION}
                  value={form.horaires}
                  onChange={(e) => maj("horaires", e.target.value)}
                />
              </div>

              <div>
                <label className={CLASSE_LABEL_RECEPTION}>Biographie</label>
                <textarea
                  className={CLASSE_CHAMP_RECEPTION}
                  rows={4}
                  value={form.bio}
                  onChange={(e) => maj("bio", e.target.value)}
                />
              </div>

              <div>
                <label className={CLASSE_LABEL_RECEPTION}>Photo</label>
                <div className="mt-1 flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-xl border border-dashed border-gris-bordure bg-gris-tres-clair">
                    {form.photoUrl ? (
                      <ImageVitrine
                        src={form.photoUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="px-2 text-center text-xs text-texte-secondaire">
                        Aucune photo
                      </span>
                    )}
                    {uploadEnCours ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                        <Loader2 className="h-6 w-6 animate-spin text-bleu-medical" />
                      </div>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-bleu-medical px-3 py-2 text-sm font-semibold text-white hover:bg-bleu-medical-fonce">
                      <ImagePlus className="h-4 w-4" />
                      Choisir une photo
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        disabled={uploadEnCours}
                        onChange={(e) => {
                          const fichier = e.target.files?.[0];
                          e.target.value = "";
                          if (fichier) void televerserPhoto(fichier);
                        }}
                      />
                    </label>
                    {form.photoUrl ? (
                      <Bouton
                        type="button"
                        variante="contour"
                        taille="petit"
                        onClick={() => maj("photoUrl", "")}
                      >
                        Retirer la photo
                      </Bouton>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-gris-bordure bg-gris-tres-clair/70 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#2d2a6e]">
                      Badges du responsable
                    </h3>
                    <p className="text-xs text-texte-secondaire">
                      Utilises dans la carte &quot;Notre direction&quot;.
                    </p>
                  </div>
                  {estResponsable ? (
                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-800">
                      Responsable
                    </span>
                  ) : null}
                </div>

                {BADGES.map((badge) => (
                  <div key={badge.index} className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className={CLASSE_LABEL_RECEPTION}>Valeur {badge.index}</label>
                      <input
                        className={CLASSE_CHAMP_RECEPTION}
                        value={form[badge.valeur]}
                        onChange={(e) => maj(badge.valeur, e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={CLASSE_LABEL_RECEPTION}>Libellé {badge.index}</label>
                      <input
                        className={CLASSE_CHAMP_RECEPTION}
                        value={form[badge.libelle]}
                        onChange={(e) => maj(badge.libelle, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.actif}
                    onChange={(e) => maj("actif", e.target.checked)}
                  />
                  Visible
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.masquerContactsPublic}
                    onChange={(e) => maj("masquerContactsPublic", e.target.checked)}
                  />
                  Masquer téléphone et e-mail sur le site
                </label>
              </div>

              <div className="flex flex-wrap justify-end gap-2 border-t border-gris-bordure pt-3">
                <Bouton
                  type="button"
                  variante="contour"
                  onClick={nouvelleEntree}
                  disabled={enCours}
                >
                  Réinitialiser
                </Bouton>
                <Bouton type="button" onClick={() => void enregistrer()} disabled={enCours}>
                  {enCours ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Enregistrer
                </Bouton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MiseEnPageAdmin>
  );
}
