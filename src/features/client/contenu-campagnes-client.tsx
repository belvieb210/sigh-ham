"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ImagePlus, Loader2, Megaphone, Plus, Trash2 } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import { CLASSE_CHAMP_RECEPTION, CLASSE_LABEL_RECEPTION } from "@/constants/reception";
import {
  MiseEnPageClient,
  type UtilisateurClient,
} from "@/features/client/mise-en-page-client";
import { televerserFichierClient } from "@/features/client/televerser-fichier-client";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";

interface CampagneItem {
  id: string;
  slug: string;
  titre: string;
  extrait: string;
  description: string;
  periode: string;
  dateDebut: string;
  dateFin: string;
  categorie: string;
  typePublication: string;
  publie: boolean;
  misEnAvant: boolean;
  imageUrl: string | null;
  lieu: string | null;
  couleurFond: string;
  couleurIllustration: string;
  couleurAccent: string;
  icone: string;
}

const FORM_VIDE: Omit<CampagneItem, "id"> = {
  slug: "",
  titre: "",
  extrait: "",
  description: "",
  periode: "",
  dateDebut: new Date().toISOString().slice(0, 10),
  dateFin: new Date().toISOString().slice(0, 10),
  categorie: "",
  typePublication: "campagne",
  publie: false,
  misEnAvant: false,
  imageUrl: null,
  lieu: "",
  couleurFond: "#E8F4FC",
  couleurIllustration: "#0B6E99",
  couleurAccent: "#0B6E99",
  icone: "coeur",
};

export function ContenuCampagnesClient({
  utilisateur,
}: {
  utilisateur: UtilisateurClient;
}) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [liste, setListe] = useState<CampagneItem[]>([]);
  const [form, setForm] = useState<Omit<CampagneItem, "id"> & { id?: string }>(
    FORM_VIDE
  );
  const [modeForm, setModeForm] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [uploadEnCours, setUploadEnCours] = useState(false);

  const charger = useCallback(() => {
    fetch("/api/client/campagnes")
      .then(async (res) => {
        const data = (await res.json()) as {
          campagnes?: CampagneItem[];
          message?: string;
        };
        if (!res.ok) throw new Error(data.message ?? t("client.common.erreur"));
        setListe(data.campagnes ?? []);
      })
      .catch((e: unknown) =>
        setErreur(e instanceof Error ? e.message : t("client.common.erreur"))
      );
  }, [t]);

  useEffect(() => {
    charger();
  }, [charger]);

  useEffect(() => {
    if (!editId || liste.length === 0) return;
    const item = liste.find((c) => c.id === editId);
    if (item) {
      setForm({
        ...item,
        dateDebut: item.dateDebut.slice(0, 10),
        dateFin: item.dateFin.slice(0, 10),
        lieu: item.lieu ?? "",
      });
      setModeForm(true);
    }
  }, [editId, liste]);

  const ouvrirNouveau = () => {
    setForm(FORM_VIDE);
    setModeForm(true);
    setErreur(null);
  };

  const fermerForm = () => {
    setModeForm(false);
    setForm(FORM_VIDE);
  };

  const majChamp = <K extends keyof typeof form>(
    cle: K,
    valeur: (typeof form)[K]
  ) => {
    setForm((prev) => ({ ...prev, [cle]: valeur }));
  };

  const enregistrer = async () => {
    setEnCours(true);
    setErreur(null);
    try {
      const url = form.id
        ? `/api/client/campagnes/${form.id}`
        : "/api/client/campagnes";
      const res = await fetch(url, {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? t("client.common.erreur"));
      fermerForm();
      charger();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("client.common.erreur"));
    } finally {
      setEnCours(false);
    }
  };

  const supprimer = async (id: string) => {
    if (!window.confirm(t("client.campagnes.confirmerSuppression"))) return;
    setEnCours(true);
    try {
      const res = await fetch(`/api/client/campagnes/${id}`, { method: "DELETE" });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? t("client.common.erreur"));
      charger();
      if (form.id === id) fermerForm();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("client.common.erreur"));
    } finally {
      setEnCours(false);
    }
  };

  const uploadImage = async (fichier: File) => {
    setUploadEnCours(true);
    try {
      const url = await televerserFichierClient(fichier, "campagnes");
      majChamp("imageUrl", url);
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("client.common.erreur"));
    } finally {
      setUploadEnCours(false);
    }
  };

  return (
    <MiseEnPageClient
      utilisateur={utilisateur}
      titre={t("client.campagnes.titre")}
      sousTitre={t("client.layout.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1100px] space-y-4">
        <EnTetePageReception
          icone={Megaphone}
          titre={t("client.campagnes.titre")}
          description={t("client.campagnes.description")}
          fil={[
            { label: t("client.common.salle"), href: "/sigh/client" },
            { label: t("client.campagnes.fil") },
          ]}
        />

        {erreur ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erreur}
          </p>
        ) : null}

        <div className="flex justify-end">
          <Bouton variante="primaire" taille="petit" onClick={ouvrirNouveau}>
            <Plus className="h-4 w-4" />
            {t("client.campagnes.nouveau")}
          </Bouton>
        </div>

        {modeForm ? (
          <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-texte-principal">
              {form.id
                ? t("client.campagnes.modifier")
                : t("client.campagnes.creer")}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.campagnes.slug")}
                </label>
                <input
                  className={CLASSE_CHAMP_RECEPTION}
                  value={form.slug}
                  onChange={(e) => majChamp("slug", e.target.value)}
                />
              </div>
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.campagnes.titreChamp")}
                </label>
                <input
                  className={CLASSE_CHAMP_RECEPTION}
                  value={form.titre}
                  onChange={(e) => majChamp("titre", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.campagnes.extrait")}
                </label>
                <textarea
                  className={CLASSE_CHAMP_RECEPTION}
                  rows={2}
                  value={form.extrait}
                  onChange={(e) => majChamp("extrait", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.campagnes.descriptionChamp")}
                </label>
                <textarea
                  className={CLASSE_CHAMP_RECEPTION}
                  rows={4}
                  value={form.description}
                  onChange={(e) => majChamp("description", e.target.value)}
                />
              </div>
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.campagnes.periode")}
                </label>
                <input
                  className={CLASSE_CHAMP_RECEPTION}
                  value={form.periode}
                  onChange={(e) => majChamp("periode", e.target.value)}
                />
              </div>
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.campagnes.categorie")}
                </label>
                <input
                  className={CLASSE_CHAMP_RECEPTION}
                  value={form.categorie}
                  onChange={(e) => majChamp("categorie", e.target.value)}
                />
              </div>
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.campagnes.dateDebut")}
                </label>
                <input
                  type="date"
                  className={CLASSE_CHAMP_RECEPTION}
                  value={form.dateDebut}
                  onChange={(e) => majChamp("dateDebut", e.target.value)}
                />
              </div>
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.campagnes.dateFin")}
                </label>
                <input
                  type="date"
                  className={CLASSE_CHAMP_RECEPTION}
                  value={form.dateFin}
                  onChange={(e) => majChamp("dateFin", e.target.value)}
                />
              </div>
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.campagnes.typePublication")}
                </label>
                <select
                  className={CLASSE_CHAMP_RECEPTION}
                  value={form.typePublication}
                  onChange={(e) => majChamp("typePublication", e.target.value)}
                >
                  <option value="campagne">{t("client.campagnes.typeCampagne")}</option>
                  <option value="publicite">{t("client.campagnes.typePublicite")}</option>
                  <option value="evenement">{t("client.campagnes.typeEvenement")}</option>
                </select>
              </div>
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.campagnes.lieu")}
                </label>
                <input
                  className={CLASSE_CHAMP_RECEPTION}
                  value={form.lieu ?? ""}
                  onChange={(e) => majChamp("lieu", e.target.value)}
                />
              </div>
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.campagnes.icone")}
                </label>
                <input
                  className={CLASSE_CHAMP_RECEPTION}
                  value={form.icone}
                  onChange={(e) => majChamp("icone", e.target.value)}
                />
              </div>
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.campagnes.couleurFond")}
                </label>
                <input
                  type="color"
                  className="h-10 w-full rounded-lg border border-gris-bordure"
                  value={form.couleurFond}
                  onChange={(e) => majChamp("couleurFond", e.target.value)}
                />
              </div>
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.campagnes.couleurIllustration")}
                </label>
                <input
                  type="color"
                  className="h-10 w-full rounded-lg border border-gris-bordure"
                  value={form.couleurIllustration}
                  onChange={(e) => majChamp("couleurIllustration", e.target.value)}
                />
              </div>
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.campagnes.couleurAccent")}
                </label>
                <input
                  type="color"
                  className="h-10 w-full rounded-lg border border-gris-bordure"
                  value={form.couleurAccent}
                  onChange={(e) => majChamp("couleurAccent", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.campagnes.image")}
                </label>
                <p className="mb-2 text-xs text-texte-secondaire">
                  {t("client.campagnes.imageAide")}
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="relative flex h-36 w-full max-w-[220px] items-center justify-center overflow-hidden rounded-xl border border-dashed border-gris-bordure bg-gris-tres-clair">
                    {form.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={form.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="px-3 text-center text-xs text-texte-secondaire">
                        {t("client.campagnes.imageVide")}
                      </span>
                    )}
                    {uploadEnCours ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                        <Loader2 className="h-6 w-6 animate-spin text-bleu-medical" />
                      </div>
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-bleu-medical px-3 py-2 text-sm font-semibold text-white hover:bg-bleu-medical-fonce">
                        <ImagePlus className="h-4 w-4" />
                        {form.imageUrl
                          ? t("client.campagnes.remplacerImage")
                          : t("client.campagnes.choisirImage")}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          className="sr-only"
                          disabled={uploadEnCours}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            e.target.value = "";
                            if (f) void uploadImage(f);
                          }}
                        />
                      </label>
                      {form.imageUrl ? (
                        <Bouton
                          type="button"
                          variante="contour"
                          taille="petit"
                          disabled={uploadEnCours}
                          onClick={() => majChamp("imageUrl", null)}
                        >
                          {t("client.campagnes.supprimerImage")}
                        </Bouton>
                      ) : null}
                    </div>
                    <input
                      className={CLASSE_CHAMP_RECEPTION}
                      value={form.imageUrl ?? ""}
                      onChange={(e) =>
                        majChamp(
                          "imageUrl",
                          e.target.value.trim() ? e.target.value.trim() : null
                        )
                      }
                      placeholder={t("client.campagnes.imageUrlPlaceholder")}
                    />
                    <p className="text-[11px] text-texte-secondaire">
                      {t("client.campagnes.imageFormats")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 sm:col-span-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.publie}
                    onChange={(e) => majChamp("publie", e.target.checked)}
                  />
                  {t("client.campagnes.publie")}
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.misEnAvant}
                    onChange={(e) => majChamp("misEnAvant", e.target.checked)}
                  />
                  {t("client.campagnes.misEnAvant")}
                </label>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Bouton variante="primaire" taille="petit" onClick={enregistrer} disabled={enCours}>
                {enCours ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {t("client.common.enregistrer")}
              </Bouton>
              <Bouton variante="contour" taille="petit" onClick={fermerForm}>
                {t("client.common.annuler")}
              </Bouton>
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          {liste.map((c) => (
            <div
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gris-bordure bg-white p-4 shadow-sm"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-gris-bordure bg-gris-tres-clair">
                  {c.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-texte-secondaire">
                      {t("client.campagnes.sansImage")}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-texte-principal">{c.titre}</p>
                  <p className="text-xs text-texte-secondaire">
                    {c.slug} · {c.typePublication}
                    {c.publie
                      ? ` · ${t("client.campagnes.publie")}`
                      : ` · ${t("client.campagnes.brouillon")}`}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Bouton
                  variante="contour"
                  taille="petit"
                  onClick={() => {
                    setForm({
                      ...c,
                      dateDebut: c.dateDebut.slice(0, 10),
                      dateFin: c.dateFin.slice(0, 10),
                      lieu: c.lieu ?? "",
                    });
                    setModeForm(true);
                  }}
                >
                  {t("client.common.modifier")}
                </Bouton>
                <Bouton
                  variante="danger"
                  taille="petit"
                  onClick={() => void supprimer(c.id)}
                  disabled={enCours}
                >
                  <Trash2 className="h-4 w-4" />
                </Bouton>
              </div>
            </div>
          ))}
          {liste.length === 0 ? (
            <p className="text-sm text-texte-secondaire">
              {t("client.campagnes.vide")}
            </p>
          ) : null}
        </div>
      </div>
    </MiseEnPageClient>
  );
}
