"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Loader2, Megaphone, Plus, Trash2 } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import { ImageVitrine } from "@/components/ui/image-vitrine";
import { CLASSE_CHAMP_RECEPTION, CLASSE_LABEL_RECEPTION } from "@/constants/reception";
import { versHexPourInputCouleur } from "@/lib/client/couleurs-campagne";
import {
  MiseEnPageClient,
  type UtilisateurClient,
} from "@/features/client/mise-en-page-client";
import {
  ZoneImagesVitrine,
  type ImageVitrineItem,
} from "@/features/client/zone-images-vitrine";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import { useDemanderConfirmation } from "@/components/ui/fournisseur-modale-confirmation";

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
  images?: ImageVitrineItem[];
  lieu: string | null;
  couleurFond: string;
  couleurIllustration: string;
  couleurAccent: string;
  icone: string;
}

type FormCampagne = Omit<CampagneItem, "id"> & { id?: string };

const FORM_VIDE: FormCampagne = {
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
  images: [],
  lieu: "",
  couleurFond: "#E8F4FC",
  couleurIllustration: "#0B6E99",
  couleurAccent: "#0B6E99",
  icone: "coeur",
};

function imagesDepuisItem(c: CampagneItem): ImageVitrineItem[] {
  if (c.images?.length) return c.images;
  if (c.imageUrl) return [{ url: c.imageUrl }];
  return [];
}

export function ContenuCampagnesClient({
  utilisateur,
}: {
  utilisateur: UtilisateurClient;
}) {
  const { t } = useTranslation();
  const demanderConfirmation = useDemanderConfirmation();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [liste, setListe] = useState<CampagneItem[]>([]);
  const [form, setForm] = useState<FormCampagne>(FORM_VIDE);
  const [modeForm, setModeForm] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

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
        images: imagesDepuisItem(item),
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
      const images = form.images ?? [];
      const res = await fetch(url, {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          images,
          imageUrl: images[0]?.url ?? null,
        }),
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

  const supprimer = (id: string) => {
    demanderConfirmation({
      titre: t("client.common.supprimer"),
      description: t("client.campagnes.confirmerSuppression"),
      libelleConfirmer: t("client.common.supprimer"),
      libelleAnnuler: t("client.common.annuler"),
      onConfirmer: async () => {
        setEnCours(true);
        try {
          const res = await fetch(`/api/client/campagnes/${id}`, { method: "DELETE" });
          const data = (await res.json()) as { message?: string };
          if (!res.ok) throw new Error(data.message ?? t("client.common.erreur"));
          charger();
          if (form.id === id) fermerForm();
        } catch (e: unknown) {
          setErreur(e instanceof Error ? e.message : t("client.common.erreur"));
          throw e;
        } finally {
          setEnCours(false);
        }
      },
    });
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
                  value={versHexPourInputCouleur(form.couleurFond, "#E8F4FC")}
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
                  value={versHexPourInputCouleur(
                    form.couleurIllustration,
                    "#0B6E99"
                  )}
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
                  value={versHexPourInputCouleur(form.couleurAccent, "#0B6E99")}
                  onChange={(e) => majChamp("couleurAccent", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <ZoneImagesVitrine
                  label={t("client.campagnes.image")}
                  dossier="campagnes"
                  images={form.images ?? []}
                  onChange={(images) =>
                    setForm((prev) => ({
                      ...prev,
                      images,
                      imageUrl: images[0]?.url ?? null,
                    }))
                  }
                  onErreur={setErreur}
                />
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
                  {imagesDepuisItem(c)[0]?.url ? (
                    <ImageVitrine
                      src={imagesDepuisItem(c)[0].url}
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
                      images: imagesDepuisItem(c),
                    });
                    setModeForm(true);
                  }}
                >
                  {t("client.common.modifier")}
                </Bouton>
                <Bouton
                  variante="danger"
                  taille="petit"
                  onClick={() => supprimer(c.id)}
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
