"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Images } from "lucide-react";
import { ImageVitrine } from "@/components/ui/image-vitrine";

type MediaGaleriePublic = {
  id: string;
  url: string;
  legende?: string;
  album: string;
};

export function SectionGalerieAPropos() {
  const { data: medias = [] } = useQuery({
    queryKey: ["public", "galerie"],
    queryFn: async () => {
      const res = await fetch("/api/public/galerie");
      if (!res.ok) return [];
      const json = (await res.json()) as { medias?: MediaGaleriePublic[] };
      return json.medias ?? [];
    },
    staleTime: 60_000,
  });

  if (medias.length === 0) return null;

  return (
    <section
      id="galerie-laboratoire"
      className="section-galerie-a-propos bg-white py-12 sm:py-16 lg:py-20"
      aria-labelledby="titre-galerie-a-propos"
    >
      <div className="conteneur-principal">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-bleu-medical">
            <Images className="h-3.5 w-3.5" aria-hidden />
            Galerie
          </p>
          <h2
            id="titre-galerie-a-propos"
            className="mt-3 text-2xl font-extrabold text-[#2d2a6e] sm:text-3xl"
          >
            Notre laboratoire en images
          </h2>
          <p className="mt-3 text-sm text-texte-secondaire sm:text-base">
            Découvrez nos locaux, équipements et l&apos;ambiance de HAM LABORATOIRE à
            Kinshasa.
          </p>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {medias.map((media, index) => (
            <motion.li
              key={media.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
              className="group overflow-hidden rounded-2xl border border-gris-bordure bg-gris-tres-clair shadow-sm"
            >
              <div className="relative aspect-[4/3]">
                <ImageVitrine
                  src={media.url}
                  alt={media.legende || "Photo HAM Laboratoire"}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>
              {media.legende ? (
                <p className="border-t border-gris-bordure px-3 py-2 text-xs text-texte-secondaire">
                  {media.legende}
                </p>
              ) : null}
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
