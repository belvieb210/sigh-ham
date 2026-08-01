"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { useContenuAPropos } from "@/hooks/use-contenu-page";
import { EnTeteSection } from "@/components/ui/en-tete-section";
import { cn } from "@/lib/utils";

function obtenirInitiales(nom: string) {
  return nom
    .split(" ")
    .filter(Boolean)
    .map((partie) => partie[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function CarteMembreEquipe({
  nom,
  fonction,
  photoUrl,
  variante = "equipe",
}: {
  nom: string;
  fonction: string;
  photoUrl: string;
  variante?: "directeur" | "equipe";
}) {
  const estDirecteur = variante === "directeur";

  return (
    <div
      className={cn(
        "carte-membre-equipe group overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg",
        estDirecteur
          ? "border-bleu-medical/20"
          : "border-gris-bordure hover:border-bleu-medical/25"
      )}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden bg-gradient-to-br from-[#eef0f8] to-white",
          estDirecteur ? "aspect-[4/5] max-h-[320px]" : "aspect-[4/3]"
        )}
      >
        <Image
          src={photoUrl}
          alt={`Photo de ${nom}`}
          fill
          className="object-contain object-center p-4 transition-transform duration-500 group-hover:scale-105"
          sizes={estDirecteur ? "280px" : "220px"}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <div className={cn("px-4 py-4", estDirecteur && "sm:px-5 sm:py-5")}>
        {!estDirecteur && (
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-bleu-medical-clair text-bleu-medical">
            <User className="h-4 w-4" />
          </div>
        )}
        <h3
          className={cn(
            "font-bold text-texte-principal",
            estDirecteur ? "text-lg sm:text-xl" : "text-sm"
          )}
        >
          {nom}
        </h3>
        <p className="mt-0.5 text-xs text-bleu-medical sm:text-sm">{fonction}</p>
      </div>
    </div>
  );
}

export function SectionDirectionEquipe() {
  const { direction, equipe } = useContenuAPropos();
  const { responsable } = direction;

  return (
    <>
      {/* Direction — spotlight */}
      <section
        className="section-direction bg-gris-tres-clair py-12 sm:py-16 lg:py-20"
        aria-labelledby="titre-direction"
      >
        <div className="conteneur-principal">
          <EnTeteSection
            idTitre="titre-direction"
            titre={direction.titre}
            sousTitre={direction.sousTitre}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 overflow-hidden rounded-3xl border border-gris-bordure bg-white shadow-xl lg:mt-10"
          >
            <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
              <div className="relative bg-gradient-to-br from-[#eef0f8] to-white p-6 sm:p-8 lg:p-10">
                <div className="mx-auto max-w-[240px]">
                  <CarteMembreEquipe
                    nom={responsable.nom}
                    fonction={responsable.fonction}
                    photoUrl={responsable.photoUrl}
                    variante="directeur"
                  />
                </div>
                <div className="mt-6 flex justify-center">
                  <span className="rounded-full bg-[#7a1f4e] px-4 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                    Directeur général
                  </span>
                </div>
              </div>

              <div className="flex flex-col justify-center border-t border-gris-bordure bg-gradient-to-br from-[#2d2a6e] to-[#0f172a] p-7 text-white sm:p-10 lg:border-l lg:border-t-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#7dd3fc]">
                  Leadership
                </p>
                <h3 className="mt-2 text-2xl font-extrabold sm:text-3xl">
                  {responsable.nom}
                </h3>
                <p className="mt-1 text-sm text-white/60">{responsable.fonction}</p>

                <blockquote className="mt-6 border-l-2 border-[#7dd3fc] pl-5">
                  <p className="text-sm leading-relaxed text-white/80 sm:text-base">
                    {responsable.biographie}
                  </p>
                </blockquote>

                <div className="mt-8 grid grid-cols-3 gap-3">
                  {[
                    { val: obtenirInitiales(responsable.nom), lbl: "Direction" },
                    { val: "ISO", lbl: "Qualité" },
                    { val: "RDC", lbl: "Kinshasa" },
                  ].map(({ val, lbl }) => (
                    <div
                      key={lbl}
                      className="rounded-xl border border-white/10 bg-white/5 p-3 text-center"
                    >
                      <p className="text-sm font-extrabold text-[#7dd3fc]">{val}</p>
                      <p className="mt-0.5 text-[10px] text-white/50">{lbl}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Équipe — grille */}
      <section
        className="section-equipe bg-white py-12 sm:py-16 lg:py-20"
        aria-labelledby="titre-equipe"
      >
        <div className="conteneur-principal">
          <EnTeteSection
            idTitre="titre-equipe"
            titre={equipe.titre}
            sousTitre={equipe.sousTitre}
          />

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:mt-10 lg:grid-cols-4 lg:gap-6">
            {equipe.membres.map((membre, index) => (
              <motion.div
                key={membre.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <CarteMembreEquipe
                  nom={membre.nom}
                  fonction={membre.fonction}
                  photoUrl={membre.photoUrl}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
