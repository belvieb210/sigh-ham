"use client";

import { motion } from "framer-motion";
import { Target, Eye, Award, Heart, Quote } from "lucide-react";
import { CarrouselImagesVitrine } from "@/components/ui/carrousel-images-vitrine";
import { ImageVitrine } from "@/components/ui/image-vitrine";
import { EnTeteSection } from "@/components/ui/en-tete-section";
import { useContenuAPropos } from "@/hooks/use-contenu-page";

const CARTE_ICONES_VALEURS = {
  fiabilite: Award,
  accessibilite: Heart,
  excellence: Target,
  humanite: Eye,
} as const;

export function SectionMissionVision() {
  const { mission, vision, valeurs, histoire } = useContenuAPropos();

  return (
    <>
      {/* Mission — split premium */}
      <section
        className="section-mission bg-white py-12 sm:py-16 lg:py-20"
        aria-labelledby="titre-mission"
      >
        <div className="conteneur-principal">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl ring-1 ring-gris-bordure">
                {(() => {
                  const imagesMission =
                    "images" in mission &&
                    Array.isArray(mission.images) &&
                    mission.images.length > 0
                      ? (mission.images as { url: string; alt?: string }[])
                      : "imageUrl" in mission && mission.imageUrl
                        ? [{ url: String(mission.imageUrl) }]
                        : [];
                  if (imagesMission.length > 1) {
                    return (
                      <CarrouselImagesVitrine
                        images={imagesMission}
                        className="absolute inset-0"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                    );
                  }
                  if (imagesMission[0]?.url) {
                    return (
                      <ImageVitrine
                        src={imagesMission[0].url}
                        alt="Laboratoire HAM"
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                    );
                  }
                  return (
                    <div className="absolute inset-0 bg-gradient-to-br from-bleu-medical-clair to-white" />
                  );
                })()}
                <div className="absolute inset-0 bg-gradient-to-t from-[#2d2a6e]/60 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-white/20 bg-black/40 p-4 backdrop-blur-md">
                  <Quote className="h-5 w-5 text-[#7dd3fc]" />
                  <p className="mt-2 text-sm font-medium italic text-white/90">
                    La fiabilité accessible à tous — notre engagement quotidien.
                  </p>
                </div>
              </div>
              <div
                className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-3xl bg-[#7a1f4e]/10"
                aria-hidden="true"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7a1f4e]">
                Notre raison d&apos;être
              </p>
              <h2
                id="titre-mission"
                className="mt-3 text-2xl font-extrabold text-[#2d2a6e] sm:text-3xl"
              >
                {mission.titre}
              </h2>
              <p className="mt-5 text-base leading-relaxed text-texte-secondaire sm:text-lg sm:leading-8">
                {mission.texte}
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-vert-sante/30 bg-vert-sante/10 px-4 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-vert-sante opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-vert-sante" />
                </span>
                <span className="text-xs font-semibold text-vert-sante">
                  Engagés pour la santé publique
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Histoire + Vision */}
      <section className="section-histoire bg-gris-tres-clair py-12 sm:py-16 lg:py-20">
        <div className="conteneur-principal">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl border border-gris-bordure bg-white p-7 shadow-sm sm:p-8"
            >
              <EnTeteSection idTitre="titre-histoire" titre={histoire.titre} />
              <div className="mt-5 space-y-4 text-sm leading-relaxed text-texte-secondaire sm:text-base">
                {histoire.paragraphes.map((paragraphe, index) => (
                  <p key={index}>{paragraphe}</p>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2d2a6e] to-[#1a4d7c] p-7 text-white shadow-xl sm:p-8"
            >
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#7dd3fc]/10 blur-2xl"
                aria-hidden="true"
              />
              <Eye className="h-8 w-8 text-[#7dd3fc]" />
              <h2 className="mt-4 text-xl font-extrabold sm:text-2xl">{vision.titre}</h2>
              <p className="mt-4 leading-relaxed text-white/80">{vision.texte}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Valeurs — bandeau sombre */}
      <section
        className="section-valeurs relative overflow-hidden bg-[#0f172a] py-12 sm:py-16 lg:py-20"
        aria-labelledby="titre-valeurs"
      >
        <div
          className="pointer-events-none absolute -left-32 top-0 h-64 w-64 rounded-full bg-[#7a1f4e]/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="conteneur-principal relative">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7dd3fc]">
              ADN institutionnel
            </p>
            <h2
              id="titre-valeurs"
              className="mt-3 text-2xl font-extrabold text-white sm:text-3xl"
            >
              Nos valeurs
            </h2>
            <p className="mt-3 text-sm text-white/60 sm:text-base">
              Les principes qui guident notre action au quotidien
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4 lg:gap-6">
            {valeurs.map((valeur, index) => {
              const Icone =
                CARTE_ICONES_VALEURS[
                  valeur.id as keyof typeof CARTE_ICONES_VALEURS
                ] ?? Award;
              return (
                <motion.article
                  key={valeur.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-[#7dd3fc]/30 hover:bg-white/8"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#7dd3fc]/15 text-[#7dd3fc] transition-colors group-hover:bg-[#7dd3fc]/25">
                    <Icone className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-white">{valeur.titre}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/65">
                    {valeur.description}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
