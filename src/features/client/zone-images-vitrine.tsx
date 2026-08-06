"use client";

import { useState } from "react";
import { ImagePlus, Loader2, Trash2, GripVertical } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import { ImageVitrine } from "@/components/ui/image-vitrine";
import { televerserFichierClient } from "@/features/client/televerser-fichier-client";
import { cn } from "@/lib/utils";

export type ImageVitrineItem = {
  url: string;
  legende?: string;
};

type DossierUpload = "campagnes" | "hero" | "galerie" | "services" | "medecins";

interface Props {
  images: ImageVitrineItem[];
  onChange: (images: ImageVitrineItem[]) => void;
  dossier?: DossierUpload;
  max?: number;
  label?: string;
  className?: string;
  onErreur?: (message: string) => void;
}

export function ZoneImagesVitrine({
  images,
  onChange,
  dossier = "campagnes",
  max = 12,
  label = "Images",
  className,
  onErreur,
}: Props) {
  const [enCours, setEnCours] = useState(false);

  const ajouter = async (files: FileList | null) => {
    if (!files?.length) return;
    const restants = max - images.length;
    if (restants <= 0) {
      onErreur?.(`Maximum ${max} images.`);
      return;
    }
    setEnCours(true);
    try {
      const aTraiter = Array.from(files).slice(0, restants);
      const urls: ImageVitrineItem[] = [];
      for (const f of aTraiter) {
        const url = await televerserFichierClient(f, dossier);
        urls.push({ url });
      }
      onChange([...images, ...urls]);
    } catch (e) {
      onErreur?.(e instanceof Error ? e.message : "Erreur upload");
    } finally {
      setEnCours(false);
    }
  };

  const retirer = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const deplacer = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-texte-principal">
          {label}{" "}
          <span className="font-normal text-texte-secondaire">
            ({images.length}/{max})
          </span>
        </p>
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-bleu-medical bg-white px-3 py-1.5 text-xs font-medium text-bleu-medical hover:bg-bleu-medical-clair">
          {enCours ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ImagePlus className="h-3.5 w-3.5" />
          )}
          Ajouter
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            disabled={enCours || images.length >= max}
            onChange={(e) => {
              void ajouter(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gris-bordure bg-gris-tres-clair/50 px-4 py-10 text-center">
          <ImagePlus className="mb-2 h-8 w-8 text-texte-secondaire" />
          <p className="text-sm text-texte-secondaire">
            Aucune image — ajoutez une ou plusieurs photos.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img, i) => (
            <li
              key={`${img.url}-${i}`}
              className="group relative overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm"
            >
              <div className="relative aspect-[4/3] bg-gris-tres-clair">
                <ImageVitrine
                  src={img.url}
                  alt={img.legende || `Image ${i + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex items-center justify-between gap-1 border-t border-gris-bordure px-2 py-1.5">
                <span className="flex items-center gap-1 text-[10px] text-texte-secondaire">
                  <GripVertical className="h-3 w-3" />#{i + 1}
                </span>
                <div className="flex gap-1">
                  <Bouton
                    type="button"
                    variante="contour"
                    taille="petit"
                    className="!px-2 !py-1 text-[10px]"
                    disabled={i === 0}
                    onClick={() => deplacer(i, i - 1)}
                  >
                    ←
                  </Bouton>
                  <Bouton
                    type="button"
                    variante="contour"
                    taille="petit"
                    className="!px-2 !py-1 text-[10px]"
                    disabled={i === images.length - 1}
                    onClick={() => deplacer(i, i + 1)}
                  >
                    →
                  </Bouton>
                  <button
                    type="button"
                    onClick={() => retirer(i)}
                    className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
