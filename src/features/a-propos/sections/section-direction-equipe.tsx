"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Mail, Phone, User } from "lucide-react";
import { ImageVitrine } from "@/components/ui/image-vitrine";
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
        <ImageVitrine
          src={photoUrl}
          alt={`Photo de ${nom}`}
          fill
          className="object-contain object-center p-4 transition-transform duration-500 group-hover:scale-105"
          sizes={estDirecteur ? "280px" : "220px"}
        />
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

type Membre = {
  id: string;
  nom: string;
  fonction: string;
  photoUrl: string;
  bio?: string;
  telephone?: string;
  email?: string;
  horaires?: string;
  categorie?: string;
};

function CarrouselEquipe({ membres }: { membres: Membre[] }) {
  const [index, setIndex] = useState(0);
  const pause = useRef(false);

  const suivant = useCallback(() => {
    if (membres.length < 2) return;
    setIndex((i) => (i + 1) % membres.length);
  }, [membres.length]);

  const precedent = useCallback(() => {
    if (membres.length < 2) return;
    setIndex((i) => (i - 1 + membres.length) % membres.length);
  }, [membres.length]);

  useEffect(() => {
    if (membres.length < 2) return;
    const id = setInterval(() => {
      if (!pause.current) suivant();
    }, 5000);
    return () => clearInterval(id);
  }, [membres.length, suivant]);

  if (membres.length === 0) return null;

  const membre = membres[index] ?? membres[0];

  return (
    <div
      className="relative mx-auto mt-8 max-w-3xl overflow-hidden rounded-3xl border border-gris-bordure bg-white shadow-xl lg:mt-10"
      onMouseEnter={() => {
        pause.current = true;
      }}
      onMouseLeave={() => {
        pause.current = false;
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={membre.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.35 }}
          className="grid sm:grid-cols-[220px_1fr]"
        >
          <div className="relative aspect-[4/5] bg-gradient-to-br from-[#eef0f8] to-white sm:aspect-auto sm:min-h-[280px]">
            <ImageVitrine
              src={membre.photoUrl}
              alt={membre.nom}
              fill
              className="object-contain object-center p-4"
              sizes="220px"
            />
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-8">
            <p className="text-[10px] font-bold uppercase tracking-wider text-bleu-medical">
              {membre.categorie === "MEDECIN_EXTERNE"
                ? "Médecin externe"
                : membre.categorie === "RESPONSABLE_LABO"
                  ? "Responsable labo"
                  : membre.categorie === "PERSONNEL"
                    ? "Personnel"
                    : "Médecin"}
            </p>
            <h3 className="mt-1 text-xl font-extrabold text-texte-principal sm:text-2xl">
              {membre.nom}
            </h3>
            <p className="mt-1 text-sm text-bleu-medical">{membre.fonction}</p>
            {membre.bio ? (
              <p className="mt-4 text-sm leading-relaxed text-texte-secondaire line-clamp-4">
                {membre.bio}
              </p>
            ) : null}
            <div className="mt-4 space-y-1.5 text-xs text-texte-secondaire">
              {membre.telephone ? (
                <p className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-bleu-medical" />
                  {membre.telephone}
                </p>
              ) : null}
              {membre.email ? (
                <p className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-bleu-medical" />
                  {membre.email}
                </p>
              ) : null}
              {membre.horaires ? (
                <p className="text-texte-secondaire">{membre.horaires}</p>
              ) : null}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {membres.length > 1 ? (
        <>
          <div className="absolute right-3 top-3 flex gap-2">
            <button
              type="button"
              aria-label="Précédent"
              onClick={precedent}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gris-bordure bg-white text-texte-principal shadow-sm hover:bg-gris-tres-clair"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Suivant"
              onClick={suivant}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gris-bordure bg-white text-texte-principal shadow-sm hover:bg-gris-tres-clair"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="flex justify-center gap-1.5 pb-4">
            {membres.map((m, i) => (
              <button
                key={m.id}
                type="button"
                aria-label={m.nom}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-6 bg-bleu-medical" : "w-1.5 bg-gris-bordure"
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function SectionDirectionEquipe() {
  const { direction, equipe } = useContenuAPropos();
  const { responsable } = direction;
  const membres = equipe.membres as Membre[];

  return (
    <>
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

          <CarrouselEquipe membres={membres} />
        </div>
      </section>
    </>
  );
}
