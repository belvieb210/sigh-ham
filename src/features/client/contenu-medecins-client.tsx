"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Plus, Stethoscope, Trash2 } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import { CLASSE_CHAMP_RECEPTION, CLASSE_LABEL_RECEPTION } from "@/constants/reception";
import {
  MiseEnPageClient,
  type UtilisateurClient,
} from "@/features/client/mise-en-page-client";
import { televerserFichierClient } from "@/features/client/televerser-fichier-client";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";

interface MedecinVitrine {
  id: string;
  nom: string;
  prenom: string;
  specialite: string;
  bio: string | null;
  photoUrl: string | null;
  horaires: string | null;
  ordre: number;
  actif: boolean;
}

const FORM_VIDE: Omit<MedecinVitrine, "id"> = {
  nom: "",
  prenom: "",
  specialite: "",
  bio: "",
  photoUrl: null,
  horaires: "",
  ordre: 0,
  actif: true,
};

export function ContenuMedecinsClient({
  utilisateur,
}: {
  utilisateur: UtilisateurClient;
}) {
  const { t } = useTranslation();
  const [liste, setListe] = useState<MedecinVitrine[]>([]);
  const [form, setForm] = useState<Omit<MedecinVitrine, "id"> & { id?: string }>(FORM_VIDE);
  const [modeForm, setModeForm] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

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

  const majChamp = <K extends keyof typeof form>(
    cle: K,
    valeur: (typeof form)[K]
  ) => setForm((prev) => ({ ...prev, [cle]: valeur }));

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
    if (!window.confirm(t("client.medecins.confirmerSuppression"))) return;
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
    } finally {
      setEnCours(false);
    }
  };

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
            {t("client.medecins.nouveau")}
          </Bouton>
        </div>

        {modeForm ? (
          <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
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
              <div className="sm:col-span-2">
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("client.medecins.photo")}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      void televerserFichierClient(f, "medecins")
                        .then((url) => majChamp("photoUrl", url))
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
                {form.photoUrl ? (
                  <p className="mt-1 truncate text-xs text-texte-secondaire">
                    {form.photoUrl}
                  </p>
                ) : null}
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

        <div className="grid gap-3 sm:grid-cols-2">
          {liste.map((m) => (
            <div
              key={m.id}
              className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm"
            >
              <p className="font-semibold text-texte-principal">
                Dr {m.prenom} {m.nom}
              </p>
              <p className="text-sm text-texte-secondaire">{m.specialite}</p>
              <div className="mt-3 flex gap-2">
                <Bouton
                  variante="contour"
                  taille="petit"
                  onClick={() => {
                    setForm({
                      ...m,
                      bio: m.bio ?? "",
                      horaires: m.horaires ?? "",
                    });
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
