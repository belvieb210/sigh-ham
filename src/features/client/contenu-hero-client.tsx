"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import { ImageVitrine } from "@/components/ui/image-vitrine";
import { CLASSE_CHAMP_RECEPTION, CLASSE_LABEL_RECEPTION } from "@/constants/reception";
import {
  MiseEnPageClient,
  type UtilisateurClient,
} from "@/features/client/mise-en-page-client";
import {
  ZoneImagesVitrine,
  type ImageVitrineItem,
} from "@/features/client/zone-images-vitrine";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";

interface DiapoHero {
  id: string;
  url: string;
  alt: string;
  titre: string | null;
  lienHref: string | null;
  ordre: number;
  actif: boolean;
}

const FORM_VIDE: Omit<DiapoHero, "id"> = {
  url: "",
  alt: "",
  titre: "",
  lienHref: "",
  ordre: 0,
  actif: true,
};

export function ContenuHeroClient({
  utilisateur,
}: {
  utilisateur: UtilisateurClient;
}) {
  const { t } = useTranslation();
  const [liste, setListe] = useState<DiapoHero[]>([]);
  const [form, setForm] = useState<Omit<DiapoHero, "id"> & { id?: string }>(FORM_VIDE);
  const [modeForm, setModeForm] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  const charger = useCallback(() => {
    fetch("/api/client/hero")
      .then(async (res) => {
        const data = (await res.json()) as {
          diapos?: DiapoHero[];
          message?: string;
        };
        if (!res.ok) throw new Error(data.message ?? t("client.common.erreur"));
        setListe(data.diapos ?? []);
      })
      .catch((e: unknown) =>
        setErreur(e instanceof Error ? e.message : t("client.common.erreur"))
      );
  }, [t]);

  useEffect(() => {
    charger();
  }, [charger]);

  const majChamp = <K extends keyof typeof form>(
    cle: K,
    valeur: (typeof form)[K]
  ) => setForm((prev) => ({ ...prev, [cle]: valeur }));

  const enregistrer = async () => {
    setEnCours(true);
    setErreur(null);
    try {
      const url = form.id ? `/api/client/hero/${form.id}` : "/api/client/hero";
      const res = await fetch(url, {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? t("client.common.erreur"));
      setModeForm(false);
      setForm(FORM_VIDE);
      charger();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("client.common.erreur"));
    } finally {
      setEnCours(false);
    }
  };

  const supprimer = async (id: string) => {
    if (!window.confirm(t("client.hero.confirmerSuppression"))) return;
    setEnCours(true);
    try {
      const res = await fetch(`/api/client/hero/${id}`, { method: "DELETE" });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? t("client.common.erreur"));
      charger();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("client.common.erreur"));
    } finally {
      setEnCours(false);
    }
  };

  return (
    <MiseEnPageClient
      utilisateur={utilisateur}
      titre={t("client.hero.titre")}
      sousTitre={t("client.layout.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1100px] space-y-4">
        <EnTetePageReception
          icone={ImageIcon}
          titre={t("client.hero.titre")}
          description={t("client.hero.description")}
          fil={[
            { label: t("client.common.salle"), href: "/sigh/client" },
            { label: t("client.hero.fil") },
          ]}
        />

        {erreur ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erreur}
          </p>
        ) : null}

        <div className="flex justify-end">
          <Bouton
            variante="primaire"
            taille="petit"
            onClick={() => {
              setForm(FORM_VIDE);
              setModeForm(true);
            }}
          >
            <Plus className="h-4 w-4" />
            {t("client.hero.nouveau")}
          </Bouton>
        </div>

        {modeForm ? (
          <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <ZoneImagesVitrine
                  label={t("client.hero.image")}
                  dossier="hero"
                  max={1}
                  images={form.url ? [{ url: form.url }] : []}
                  onChange={(images: ImageVitrineItem[]) =>
                    majChamp("url", images[0]?.url ?? "")
                  }
                  onErreur={setErreur}
                />
              </div>
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.hero.alt")}
                </label>
                <input
                  className={CLASSE_CHAMP_RECEPTION}
                  value={form.alt}
                  onChange={(e) => majChamp("alt", e.target.value)}
                />
              </div>
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.hero.titreChamp")}
                </label>
                <input
                  className={CLASSE_CHAMP_RECEPTION}
                  value={form.titre ?? ""}
                  onChange={(e) => majChamp("titre", e.target.value)}
                />
              </div>
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.hero.lien")}
                </label>
                <input
                  className={CLASSE_CHAMP_RECEPTION}
                  value={form.lienHref ?? ""}
                  onChange={(e) => majChamp("lienHref", e.target.value)}
                />
              </div>
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.hero.ordre")}
                </label>
                <input
                  type="number"
                  className={CLASSE_CHAMP_RECEPTION}
                  value={form.ordre}
                  onChange={(e) => majChamp("ordre", Number(e.target.value))}
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.actif}
                    onChange={(e) => majChamp("actif", e.target.checked)}
                  />
                  {t("client.hero.actif")}
                </label>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Bouton variante="primaire" taille="petit" onClick={enregistrer} disabled={enCours}>
                {t("client.common.enregistrer")}
              </Bouton>
              <Bouton variante="contour" taille="petit" onClick={() => setModeForm(false)}>
                {t("client.common.annuler")}
              </Bouton>
            </div>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          {liste.map((d) => (
            <div
              key={d.id}
              className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm"
            >
              {d.url ? (
                <ImageVitrine
                  src={d.url}
                  alt={d.alt}
                  className="mb-3 h-32 w-full rounded-lg object-cover"
                />
              ) : null}
              <p className="font-semibold text-texte-principal">
                {d.titre || d.alt}
              </p>
              <p className="text-xs text-texte-secondaire">
                {t("client.hero.ordre")}: {d.ordre}
                {d.actif ? "" : ` · ${t("client.hero.inactif")}`}
              </p>
              <div className="mt-3 flex gap-2">
                <Bouton
                  variante="contour"
                  taille="petit"
                  onClick={() => {
                    setForm({ ...d, titre: d.titre ?? "", lienHref: d.lienHref ?? "" });
                    setModeForm(true);
                  }}
                >
                  {t("client.common.modifier")}
                </Bouton>
                <Bouton
                  variante="danger"
                  taille="petit"
                  onClick={() => void supprimer(d.id)}
                  disabled={enCours}
                >
                  <Trash2 className="h-4 w-4" />
                </Bouton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MiseEnPageClient>
  );
}
