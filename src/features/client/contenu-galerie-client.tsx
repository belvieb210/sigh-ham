"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Images, Loader2, Trash2 } from "lucide-react";
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
import { useDemanderConfirmation } from "@/components/ui/fournisseur-modale-confirmation";

interface MediaGalerie {
  id: string;
  url: string;
  type: string;
  legende: string | null;
  album: string;
  ordre: number;
  actif: boolean;
}

export function ContenuGalerieClient({
  utilisateur,
}: {
  utilisateur: UtilisateurClient;
}) {
  const { t } = useTranslation();
  const demanderConfirmation = useDemanderConfirmation();
  const [liste, setListe] = useState<MediaGalerie[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [uploadKey, setUploadKey] = useState(0);
  const [editionId, setEditionId] = useState<string | null>(null);
  const [legendeEdit, setLegendeEdit] = useState("");

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

  const ajouterPhotos = async (images: ImageVitrineItem[]) => {
    if (images.length === 0) return;
    setEnCours(true);
    setErreur(null);
    try {
      let ordreBase = liste.length;
      for (const img of images) {
        const res = await fetch("/api/client/galerie", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: img.url,
            legende: img.legende ?? "",
            album: "general",
            ordre: ordreBase,
            actif: true,
          }),
        });
        const data = (await res.json()) as { message?: string };
        if (!res.ok) throw new Error(data.message ?? t("client.common.erreur"));
        ordreBase += 1;
      }
      setUploadKey((k) => k + 1);
      charger();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("client.common.erreur"));
    } finally {
      setEnCours(false);
    }
  };

  const enregistrerLegende = async (id: string) => {
    setEnCours(true);
    setErreur(null);
    try {
      const res = await fetch(`/api/client/galerie/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ legende: legendeEdit }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? t("client.common.erreur"));
      setEditionId(null);
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
      description: t("client.galerie.confirmerSuppression"),
      libelleConfirmer: t("client.common.supprimer"),
      libelleAnnuler: t("client.common.annuler"),
      onConfirmer: async () => {
        setEnCours(true);
        try {
          const res = await fetch(`/api/client/galerie/${id}`, { method: "DELETE" });
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

        <p className="rounded-lg border border-bleu-medical/20 bg-bleu-medical-clair/50 px-4 py-3 text-sm text-texte-principal">
          {t("client.galerie.aideAffichage")}
        </p>

        {erreur ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erreur}
          </p>
        ) : null}

        <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
          <ZoneImagesVitrine
            key={uploadKey}
            label={t("client.galerie.ajouterPhotos")}
            dossier="galerie"
            images={[]}
            max={24}
            onChange={(images) => {
              void ajouterPhotos(images);
            }}
            onErreur={setErreur}
          />
          {enCours ? (
            <p className="mt-2 flex items-center gap-2 text-xs text-texte-secondaire">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {t("client.galerie.enregistrement")}
            </p>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {liste.map((m) => (
            <div
              key={m.id}
              className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm"
            >
              <div className="relative aspect-[4/3] bg-gris-tres-clair">
                <ImageVitrine
                  src={m.url}
                  alt={m.legende ?? ""}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-2 p-3">
                {editionId === m.id ? (
                  <>
                    <label className={CLASSE_LABEL_RECEPTION}>
                      {t("client.galerie.legende")}
                    </label>
                    <input
                      className={CLASSE_CHAMP_RECEPTION}
                      value={legendeEdit}
                      onChange={(e) => setLegendeEdit(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Bouton
                        variante="primaire"
                        taille="petit"
                        onClick={() => void enregistrerLegende(m.id)}
                        disabled={enCours}
                      >
                        {t("client.common.enregistrer")}
                      </Bouton>
                      <Bouton
                        variante="contour"
                        taille="petit"
                        onClick={() => setEditionId(null)}
                      >
                        {t("client.common.annuler")}
                      </Bouton>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="truncate text-sm font-medium text-texte-principal">
                      {m.legende || t("client.galerie.sansLegende")}
                    </p>
                    <div className="flex gap-2">
                      <Bouton
                        variante="contour"
                        taille="petit"
                        onClick={() => {
                          setEditionId(m.id);
                          setLegendeEdit(m.legende ?? "");
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
                  </>
                )}
              </div>
            </div>
          ))}
          {liste.length === 0 ? (
            <p className="col-span-full rounded-xl border border-dashed border-gris-bordure px-4 py-10 text-center text-sm text-texte-secondaire">
              {t("client.galerie.vide")}
            </p>
          ) : null}
        </div>
      </div>
    </MiseEnPageClient>
  );
}
