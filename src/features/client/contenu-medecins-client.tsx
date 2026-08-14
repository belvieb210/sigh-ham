"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ImagePlus, Loader2, Plus, Stethoscope, Trash2 } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import { ImageVitrine } from "@/components/ui/image-vitrine";
import { CLASSE_CHAMP_RECEPTION, CLASSE_LABEL_RECEPTION } from "@/constants/reception";
import {
  MiseEnPageClient,
  type UtilisateurClient,
} from "@/features/client/mise-en-page-client";
import { televerserFichierClient } from "@/features/client/televerser-fichier-client";
import {
  GestionComptesEgliseClient,
  GestionComptesMedecinsExternesClient,
} from "@/features/client/gestion-comptes-partenaires-client";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import { useDemanderConfirmation } from "@/components/ui/fournisseur-modale-confirmation";
import { cn } from "@/lib/utils";

const ONGLETS_VITRINE = [
  {
    value: "MEDECIN",
    labelKey: "client.medecins.ongletEquipe" as const,
  },
  {
    value: "RESPONSABLE_LABO",
    labelKey: "client.medecins.ongletResponsable" as const,
  },
  {
    value: "PERSONNEL",
    labelKey: "client.medecins.ongletPersonnel" as const,
  },
] as const;

const SECTIONS = [
  { value: "vitrine", labelKey: "client.medecins.sectionVitrine" as const },
  { value: "externes", labelKey: "client.medecins.sectionExternes" as const },
  { value: "eglise", labelKey: "client.medecins.sectionEglise" as const },
] as const;

interface MedecinVitrine {
  id: string;
  nom: string;
  prenom: string;
  specialite: string;
  bio: string | null;
  photoUrl: string | null;
  horaires: string | null;
  telephone: string | null;
  email: string | null;
  categorie: string;
  ordre: number;
  actif: boolean;
}

type FormMedecin = Omit<MedecinVitrine, "id"> & { id?: string };

function formVide(categorie: string): FormMedecin {
  return {
    nom: "",
    prenom: "",
    specialite: "",
    bio: "",
    photoUrl: null,
    horaires: "",
    telephone: "",
    email: "",
    categorie,
    ordre: 0,
    actif: true,
  };
}

export function ContenuMedecinsClient({
  utilisateur,
}: {
  utilisateur: UtilisateurClient;
}) {
  const { t } = useTranslation();
  const demanderConfirmation = useDemanderConfirmation();
  const [section, setSection] = useState<(typeof SECTIONS)[number]["value"]>("vitrine");
  const [onglet, setOnglet] = useState<string>("MEDECIN");
  const [liste, setListe] = useState<MedecinVitrine[]>([]);
  const [form, setForm] = useState<FormMedecin>(formVide("MEDECIN"));
  const [modeForm, setModeForm] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [uploadEnCours, setUploadEnCours] = useState(false);

  const charger = useCallback(() => {
    fetch("/api/client/medecins-vitrine")
      .then(async (res) => {
        const data = (await res.json()) as {
          medecins?: MedecinVitrine[];
          message?: string;
        };
        if (!res.ok) throw new Error(data.message ?? t("client.common.erreur"));
        setListe(data.medecins ?? []);
      })
      .catch((e: unknown) =>
        setErreur(e instanceof Error ? e.message : t("client.common.erreur"))
      );
  }, [t]);

  useEffect(() => {
    charger();
  }, [charger]);

  const filtrés = useMemo(
    () => liste.filter((m) => (m.categorie || "MEDECIN") === onglet),
    [liste, onglet]
  );

  const majChamp = <K extends keyof FormMedecin>(
    cle: K,
    valeur: FormMedecin[K]
  ) => setForm((prev) => ({ ...prev, [cle]: valeur }));

  const ouvrirNouveau = () => {
    setForm(formVide(onglet));
    setModeForm(true);
    setErreur(null);
  };

  const enregistrer = async () => {
    setEnCours(true);
    setErreur(null);
    try {
      const url = form.id
        ? `/api/client/medecins-vitrine/${form.id}`
        : "/api/client/medecins-vitrine";
      const res = await fetch(url, {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          categorie: onglet,
          bio: form.bio || null,
          horaires: form.horaires || null,
          telephone: form.telephone || null,
          email: form.email || null,
        }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? t("client.common.erreur"));
      setModeForm(false);
      setForm(formVide(onglet));
      charger();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("client.common.erreur"));
    } finally {
      setEnCours(false);
    }
  };

  const supprimer = (id: string) => {
    demanderConfirmation({
      titre: t("client.common.supprimer"),
      description: t("client.medecins.confirmerSuppression"),
      libelleConfirmer: t("client.common.supprimer"),
      libelleAnnuler: t("client.common.annuler"),
      onConfirmer: async () => {
        setEnCours(true);
        try {
          const res = await fetch(`/api/client/medecins-vitrine/${id}`, {
            method: "DELETE",
          });
          const data = (await res.json()) as { message?: string };
          if (!res.ok) throw new Error(data.message ?? t("client.common.erreur"));
          charger();
        } catch (e: unknown) {
          setErreur(e instanceof Error ? e.message : t("client.common.erreur"));
          throw e;
        } finally {
          setEnCours(false);
        }
      },
    });
  };

  const uploadPhoto = async (fichier: File) => {
    setUploadEnCours(true);
    try {
      const url = await televerserFichierClient(fichier, "medecins");
      majChamp("photoUrl", url);
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("client.common.erreur"));
    } finally {
      setUploadEnCours(false);
    }
  };

  const titreForm =
    onglet === "RESPONSABLE_LABO"
      ? "Responsable / Direction"
      : onglet === "PERSONNEL"
        ? "Personnel"
        : "Médecin / agent";

  return (
    <MiseEnPageClient
      utilisateur={utilisateur}
      titre={t("client.medecins.titre")}
      sousTitre={t("client.layout.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1100px] space-y-4">
        <EnTetePageReception
          icone={Stethoscope}
          titre={t("client.medecins.titre")}
          description={t("client.medecins.description")}
          fil={[
            { label: t("client.common.salle"), href: "/sigh/client" },
            { label: t("client.medecins.fil") },
          ]}
        />

        {erreur ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erreur}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2 rounded-xl border border-gris-bordure bg-white p-2 shadow-sm">
          {SECTIONS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => {
                setSection(s.value);
                setModeForm(false);
              }}
              className={cn(
                "rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:text-sm",
                section === s.value
                  ? "bg-[#2d2a6e] text-white"
                  : "text-texte-secondaire hover:bg-gris-tres-clair hover:text-texte-principal"
              )}
            >
              {t(s.labelKey)}
            </button>
          ))}
        </div>

        {section === "vitrine" ? (
          <>
        <div className="flex flex-wrap gap-2 rounded-xl border border-gris-bordure bg-white p-2 shadow-sm">
          {ONGLETS_VITRINE.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                setOnglet(o.value);
                setModeForm(false);
              }}
              className={cn(
                "rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:text-sm",
                onglet === o.value
                  ? "bg-bleu-medical text-white"
                  : "text-texte-secondaire hover:bg-gris-tres-clair hover:text-texte-principal"
              )}
            >
              {t(o.labelKey)}
            </button>
          ))}
        </div>

        <div className="flex justify-end">
          <Bouton variante="primaire" taille="petit" onClick={ouvrirNouveau}>
            <Plus className="h-4 w-4" />
            {t("client.medecins.nouveau")}
          </Bouton>
        </div>

        {modeForm ? (
          <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-[#2d2a6e]">
              {form.id ? `Modifier — ${titreForm}` : `Nouveau — ${titreForm}`}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.medecins.prenom")}
                </label>
                <input
                  className={CLASSE_CHAMP_RECEPTION}
                  value={form.prenom}
                  onChange={(e) => majChamp("prenom", e.target.value)}
                />
              </div>
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.medecins.nom")}
                </label>
                <input
                  className={CLASSE_CHAMP_RECEPTION}
                  value={form.nom}
                  onChange={(e) => majChamp("nom", e.target.value)}
                />
              </div>
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.medecins.specialite")}
                </label>
                <input
                  className={CLASSE_CHAMP_RECEPTION}
                  value={form.specialite}
                  onChange={(e) => majChamp("specialite", e.target.value)}
                />
              </div>
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.medecins.ordre")}
                </label>
                <input
                  type="number"
                  className={CLASSE_CHAMP_RECEPTION}
                  value={form.ordre}
                  onChange={(e) => majChamp("ordre", Number(e.target.value))}
                />
              </div>
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.medecins.telephone")}
                </label>
                <input
                  className={CLASSE_CHAMP_RECEPTION}
                  value={form.telephone ?? ""}
                  onChange={(e) => majChamp("telephone", e.target.value)}
                />
              </div>
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.medecins.email")}
                </label>
                <input
                  type="email"
                  className={CLASSE_CHAMP_RECEPTION}
                  value={form.email ?? ""}
                  onChange={(e) => majChamp("email", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.medecins.horaires")}
                </label>
                <input
                  className={CLASSE_CHAMP_RECEPTION}
                  value={form.horaires ?? ""}
                  onChange={(e) => majChamp("horaires", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.medecins.bio")}
                </label>
                <textarea
                  className={CLASSE_CHAMP_RECEPTION}
                  rows={3}
                  value={form.bio ?? ""}
                  onChange={(e) => majChamp("bio", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.medecins.photo")}
                </label>
                <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="relative flex h-36 w-36 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-gris-bordure bg-gris-tres-clair">
                    {form.photoUrl ? (
                      <ImageVitrine
                        src={form.photoUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="px-2 text-center text-xs text-texte-secondaire">
                        Photo
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
                      {t("client.medecins.choisirPhoto")}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="sr-only"
                        disabled={uploadEnCours}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = "";
                          if (f) void uploadPhoto(f);
                        }}
                      />
                    </label>
                    {form.photoUrl ? (
                      <Bouton
                        type="button"
                        variante="contour"
                        taille="petit"
                        onClick={() => majChamp("photoUrl", null)}
                      >
                        {t("client.medecins.retirerPhoto")}
                      </Bouton>
                    ) : null}
                  </div>
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.actif}
                    onChange={(e) => majChamp("actif", e.target.checked)}
                  />
                  {t("client.medecins.actif")}
                </label>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Bouton
                variante="primaire"
                taille="petit"
                onClick={enregistrer}
                disabled={enCours}
              >
                {enCours ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {t("client.common.enregistrer")}
              </Bouton>
              <Bouton
                variante="contour"
                taille="petit"
                onClick={() => setModeForm(false)}
              >
                {t("client.common.annuler")}
              </Bouton>
            </div>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          {filtrés.map((m) => (
            <div
              key={m.id}
              className="flex gap-3 rounded-xl border border-gris-bordure bg-white p-4 shadow-sm"
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gris-tres-clair">
                {m.photoUrl ? (
                  <ImageVitrine
                    src={m.photoUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-texte-principal">
                  {m.prenom} {m.nom}
                </p>
                <p className="text-sm text-texte-secondaire">{m.specialite}</p>
                <div className="mt-2 flex gap-2">
                  <Bouton
                    variante="contour"
                    taille="petit"
                    onClick={() => {
                      setForm({
                        ...m,
                        bio: m.bio ?? "",
                        horaires: m.horaires ?? "",
                        telephone: m.telephone ?? "",
                        email: m.email ?? "",
                        categorie: m.categorie || onglet,
                      });
                      setModeForm(true);
                    }}
                  >
                    {t("client.common.modifier")}
                  </Bouton>
                  <Bouton
                    variante="danger"
                    taille="petit"
                    onClick={() => supprimer(m.id)}
                    disabled={enCours}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Bouton>
                </div>
              </div>
            </div>
          ))}
          {filtrés.length === 0 ? (
            <p className="text-sm text-texte-secondaire sm:col-span-2">
              {t("client.medecins.vide")}
            </p>
          ) : null}
        </div>
          </>
        ) : section === "externes" ? (
          <GestionComptesMedecinsExternesClient />
        ) : (
          <GestionComptesEgliseClient />
        )}
      </div>
    </MiseEnPageClient>
  );
}
