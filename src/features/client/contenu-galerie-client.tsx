"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Images, Loader2, Plus, Trash2 } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import { CLASSE_CHAMP_RECEPTION, CLASSE_LABEL_RECEPTION } from "@/constants/reception";
import {
  MiseEnPageClient,
  type UtilisateurClient,
} from "@/features/client/mise-en-page-client";
import { televerserFichierClient } from "@/features/client/televerser-fichier-client";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";

interface MediaGalerie {
  id: string;
  url: string;
  type: string;
  legende: string | null;
  album: string;
  ordre: number;
  actif: boolean;
}

const FORM_VIDE: Omit<MediaGalerie, "id"> = {
  url: "",
  type: "image",
  legende: "",
  album: "general",
  ordre: 0,
  actif: true,
};

export function ContenuGalerieClient({
  utilisateur,
}: {
  utilisateur: UtilisateurClient;
}) {
  const { t } = useTranslation();
  const [liste, setListe] = useState<MediaGalerie[]>([]);
  const [form, setForm] = useState<Omit<MediaGalerie, "id"> & { id?: string }>(FORM_VIDE);
  const [modeForm, setModeForm] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [uploadEnCours, setUploadEnCours] = useState(false);

  const charger = useCallback(() => {
    fetch("/api/client/galerie")
      .then(async (res) => {
        const data = (await res.json()) as {
          medias?: MediaGalerie[];
          message?: string;
        };
        if (!res.ok) throw new Error(data.message ?? t("client.common.erreur"));
        setListe(data.medias ?? []);
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
      const url = form.id ? `/api/client/galerie/${form.id}` : "/api/client/galerie";
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
    if (!window.confirm(t("client.galerie.confirmerSuppression"))) return;
    setEnCours(true);
    try {
      const res = await fetch(`/api/client/galerie/${id}`, { method: "DELETE" });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? t("client.common.erreur"));
      charger();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("client.common.erreur"));
    } finally {
      setEnCours(false);
    }
  };

  const uploadImage = async (fichier: File) => {
    setUploadEnCours(true);
    try {
      const url = await televerserFichierClient(fichier, "galerie");
      majChamp("url", url);
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("client.common.erreur"));
    } finally {
      setUploadEnCours(false);
    }
  };

  return (
    <MiseEnPageClient
      utilisateur={utilisateur}
      titre={t("client.galerie.titre")}
      sousTitre={t("client.layout.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1100px] space-y-4">
        <EnTetePageReception
          icone={Images}
          titre={t("client.galerie.titre")}
          description={t("client.galerie.description")}
          fil={[
            { label: t("client.common.salle"), href: "/sigh/client" },
            { label: t("client.galerie.fil") },
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
            {t("client.galerie.nouveau")}
          </Bouton>
        </div>

        {modeForm ? (
          <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.galerie.fichier")}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadEnCours}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void uploadImage(f);
                    }}
                  />
                  {uploadEnCours ? (
                    <Loader2 className="h-4 w-4 animate-spin text-bleu-medical" />
                  ) : null}
                </div>
                <input
                  className={`${CLASSE_CHAMP_RECEPTION} mt-2`}
                  value={form.url}
                  onChange={(e) => majChamp("url", e.target.value)}
                  placeholder="URL"
                />
              </div>
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.galerie.legende")}
                </label>
                <input
                  className={CLASSE_CHAMP_RECEPTION}
                  value={form.legende ?? ""}
                  onChange={(e) => majChamp("legende", e.target.value)}
                />
              </div>
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.galerie.album")}
                </label>
                <input
                  className={CLASSE_CHAMP_RECEPTION}
                  value={form.album}
                  onChange={(e) => majChamp("album", e.target.value)}
                />
              </div>
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.galerie.ordre")}
                </label>
                <input
                  type="number"
                  className={CLASSE_CHAMP_RECEPTION}
                  value={form.ordre}
                  onChange={(e) => majChamp("ordre", Number(e.target.value))}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.actif}
                    onChange={(e) => majChamp("actif", e.target.checked)}
                  />
                  {t("client.galerie.actif")}
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

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {liste.map((m) => (
            <div
              key={m.id}
              className="rounded-xl border border-gris-bordure bg-white p-3 shadow-sm"
            >
              {m.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.url}
                  alt={m.legende ?? ""}
                  className="mb-2 h-36 w-full rounded-lg object-cover"
                />
              ) : null}
              <p className="truncate text-sm font-medium text-texte-principal">
                {m.legende || m.album}
              </p>
              <div className="mt-2 flex gap-2">
                <Bouton
                  variante="contour"
                  taille="petit"
                  onClick={() => {
                    setForm({ ...m, legende: m.legende ?? "" });
                    setModeForm(true);
                  }}
                >
                  {t("client.common.modifier")}
                </Bouton>
                <Bouton
                  variante="danger"
                  taille="petit"
                  onClick={() => void supprimer(m.id)}
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
