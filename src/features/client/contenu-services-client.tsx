"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LayoutTemplate, Loader2, Plus, Trash2 } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import { CLASSE_CHAMP_RECEPTION, CLASSE_LABEL_RECEPTION } from "@/constants/reception";
import {
  MiseEnPageClient,
  type UtilisateurClient,
} from "@/features/client/mise-en-page-client";
import { televerserFichierClient } from "@/features/client/televerser-fichier-client";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";

interface ServiceVitrine {
  id: string;
  slug: string;
  titre: string;
  description: string;
  imageUrl: string | null;
  categorie: string;
  pointsJson: unknown;
  badge: string | null;
  href: string | null;
  icone: string;
  ordre: number;
  actif: boolean;
}

const FORM_VIDE: Omit<ServiceVitrine, "id"> = {
  slug: "",
  titre: "",
  description: "",
  imageUrl: null,
  categorie: "diagnostic",
  pointsJson: [],
  badge: "",
  href: "",
  icone: "laboratoire",
  ordre: 0,
  actif: true,
};

export function ContenuServicesClient({
  utilisateur,
}: {
  utilisateur: UtilisateurClient;
}) {
  const { t } = useTranslation();
  const [liste, setListe] = useState<ServiceVitrine[]>([]);
  const [form, setForm] = useState<Omit<ServiceVitrine, "id"> & { id?: string }>(FORM_VIDE);
  const [pointsTexte, setPointsTexte] = useState("[]");
  const [modeForm, setModeForm] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  const charger = useCallback(() => {
    fetch("/api/client/services-vitrine")
      .then(async (res) => {
        const data = (await res.json()) as {
          services?: ServiceVitrine[];
          message?: string;
        };
        if (!res.ok) throw new Error(data.message ?? t("client.common.erreur"));
        setListe(data.services ?? []);
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
      let pointsJson: unknown = [];
      try {
        pointsJson = JSON.parse(pointsTexte);
      } catch {
        throw new Error(t("client.services.jsonInvalide"));
      }
      const payload = { ...form, pointsJson };
      const url = form.id
        ? `/api/client/services-vitrine/${form.id}`
        : "/api/client/services-vitrine";
      const res = await fetch(url, {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? t("client.common.erreur"));
      setModeForm(false);
      setForm(FORM_VIDE);
      setPointsTexte("[]");
      charger();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("client.common.erreur"));
    } finally {
      setEnCours(false);
    }
  };

  const supprimer = async (id: string) => {
    if (!window.confirm(t("client.services.confirmerSuppression"))) return;
    setEnCours(true);
    try {
      const res = await fetch(`/api/client/services-vitrine/${id}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? t("client.common.erreur"));
      charger();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("client.common.erreur"));
    } finally {
      setEnCours(false);
    }
  };

  const ouvrirEdition = (s: ServiceVitrine) => {
    setForm({
      ...s,
      badge: s.badge ?? "",
      href: s.href ?? "",
    });
    setPointsTexte(JSON.stringify(s.pointsJson ?? [], null, 2));
    setModeForm(true);
  };

  return (
    <MiseEnPageClient
      utilisateur={utilisateur}
      titre={t("client.services.titre")}
      sousTitre={t("client.layout.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1100px] space-y-4">
        <EnTetePageReception
          icone={LayoutTemplate}
          titre={t("client.services.titre")}
          description={t("client.services.description")}
          fil={[
            { label: t("client.common.salle"), href: "/sigh/client" },
            { label: t("client.services.fil") },
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
              setPointsTexte("[]");
              setModeForm(true);
            }}
          >
            <Plus className="h-4 w-4" />
            {t("client.services.nouveau")}
          </Bouton>
        </div>

        {modeForm ? (
          <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.services.slug")}
                </label>
                <input
                  className={CLASSE_CHAMP_RECEPTION}
                  value={form.slug}
                  onChange={(e) => majChamp("slug", e.target.value)}
                />
              </div>
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.services.titreChamp")}
                </label>
                <input
                  className={CLASSE_CHAMP_RECEPTION}
                  value={form.titre}
                  onChange={(e) => majChamp("titre", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.services.descriptionChamp")}
                </label>
                <textarea
                  className={CLASSE_CHAMP_RECEPTION}
                  rows={3}
                  value={form.description}
                  onChange={(e) => majChamp("description", e.target.value)}
                />
              </div>
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.services.categorie")}
                </label>
                <input
                  className={CLASSE_CHAMP_RECEPTION}
                  value={form.categorie}
                  onChange={(e) => majChamp("categorie", e.target.value)}
                />
              </div>
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.services.icone")}
                </label>
                <input
                  className={CLASSE_CHAMP_RECEPTION}
                  value={form.icone}
                  onChange={(e) => majChamp("icone", e.target.value)}
                />
              </div>
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.services.badge")}
                </label>
                <input
                  className={CLASSE_CHAMP_RECEPTION}
                  value={form.badge ?? ""}
                  onChange={(e) => majChamp("badge", e.target.value)}
                />
              </div>
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.services.href")}
                </label>
                <input
                  className={CLASSE_CHAMP_RECEPTION}
                  value={form.href ?? ""}
                  onChange={(e) => majChamp("href", e.target.value)}
                />
              </div>
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.services.ordre")}
                </label>
                <input
                  type="number"
                  className={CLASSE_CHAMP_RECEPTION}
                  value={form.ordre}
                  onChange={(e) => majChamp("ordre", Number(e.target.value))}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.services.image")}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      void televerserFichierClient(f)
                        .then((url) => majChamp("imageUrl", url))
                        .catch((err: unknown) =>
                          setErreur(
                            err instanceof Error
                              ? err.message
                              : t("client.common.erreur")
                          )
                        );
                    }
                  }}
                />
                {form.imageUrl ? (
                  <p className="mt-1 truncate text-xs text-texte-secondaire">
                    {form.imageUrl}
                  </p>
                ) : null}
              </div>
              <div className="sm:col-span-2">
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.services.pointsJson")}
                </label>
                <textarea
                  className={`${CLASSE_CHAMP_RECEPTION} font-mono text-xs`}
                  rows={4}
                  value={pointsTexte}
                  onChange={(e) => setPointsTexte(e.target.value)}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.actif}
                    onChange={(e) => majChamp("actif", e.target.checked)}
                  />
                  {t("client.services.actif")}
                </label>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Bouton variante="primaire" taille="petit" onClick={enregistrer} disabled={enCours}>
                {enCours ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {t("client.common.enregistrer")}
              </Bouton>
              <Bouton variante="contour" taille="petit" onClick={() => setModeForm(false)}>
                {t("client.common.annuler")}
              </Bouton>
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          {liste.map((s) => (
            <div
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gris-bordure bg-white p-4 shadow-sm"
            >
              <div>
                <p className="font-semibold text-texte-principal">{s.titre}</p>
                <p className="text-xs text-texte-secondaire">
                  {s.slug} · {s.categorie}
                </p>
              </div>
              <div className="flex gap-2">
                <Bouton variante="contour" taille="petit" onClick={() => ouvrirEdition(s)}>
                  {t("client.common.modifier")}
                </Bouton>
                <Bouton
                  variante="danger"
                  taille="petit"
                  onClick={() => void supprimer(s.id)}
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
