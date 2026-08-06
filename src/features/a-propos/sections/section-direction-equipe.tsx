"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Mail, Phone, User } from "lucide-react";
import { ImageVitrine } from "@/components/ui/image-vitrine";
import { useContenuAPropos } from "@/hooks/use-contenu-page";
import { EnTeteSection } from "@/components/ui/en-tete-section";
import { cn } from "@/lib/utils";

const LIBELLES_CATEGORIE: Record<string, string> = {
  MEDECIN: "Médecins",
  PERSONNEL: "Personnel",
  RESPONSABLE_LABO: "Direction",
  MEDECIN_EXTERNE: "Médecins externes",
  SERVICE_EGLISE: "Service Église",
};

function obtenirInitiales(nom: string) {
  return nom
    .split(" ")
    .filter(Boolean)
    .map((partie) => partie[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
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

/** Carrousel des agents d'un même service / catégorie */
function CarrouselAgentsService({
  titreService,
  membres,
}: {
  titreService: string;
  membres: Membre[];
}) {
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
    }, 4800);
    return () => clearInterval(id);
  }, [membres.length, suivant]);

  useEffect(() => {
    setIndex(0);
  }, [titreService, membres.length]);

  if (membres.length === 0) return null;
  const membre = membres[index] ?? membres[0];

  return (
    <article
      className="overflow-hidden rounded-2xl border border-gris-bordure bg-white shadow-sm"
      onMouseEnter={() => {
        pause.current = true;
      }}
      onMouseLeave={() => {
        pause.current = false;
      }}
    >
      <div className="flex items-center justify-between border-b border-gris-bordure bg-gris-tres-clair px-4 py-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-bleu-medical">
            Service
          </p>
          <h3 className="text-sm font-extrabold text-[#2d2a6e] sm:text-base">
            {titreService}
          </h3>
        </div>
        <span className="rounded-full bg-bleu-medical/10 px-2.5 py-0.5 text-[11px] font-semibold text-bleu-medical">
          {membres.length} agent{membres.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={membre.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid sm:grid-cols-[160px_1fr]"
          >
            <div className="relative aspect-[4/5] bg-gradient-to-br from-[#eef0f8] to-white sm:aspect-auto sm:min-h-[200px]">
              <ImageVitrine
                src={membre.photoUrl}
                alt={membre.nom}
                fill
                className="object-contain object-center p-3"
                sizes="160px"
              />
            </div>
            <div className="flex flex-col justify-center p-5 sm:p-6">
              <h4 className="text-lg font-extrabold text-texte-principal">
                {membre.nom}
              </h4>
              <p className="mt-0.5 text-sm text-bleu-medical">{membre.fonction}</p>
              {membre.bio ? (
                <p className="mt-3 text-sm leading-relaxed text-texte-secondaire line-clamp-3">
                  {membre.bio}
                </p>
              ) : null}
              <div className="mt-3 space-y-1 text-xs text-texte-secondaire">
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
                {membre.horaires ? <p>{membre.horaires}</p> : null}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {membres.length > 1 ? (
          <>
            <div className="absolute right-3 top-3 flex gap-1.5">
              <button
                type="button"
                aria-label="Agent précédent"
                onClick={precedent}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gris-bordure bg-white text-texte-principal shadow-sm hover:bg-gris-tres-clair"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Agent suivant"
                onClick={suivant}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gris-bordure bg-white text-texte-principal shadow-sm hover:bg-gris-tres-clair"
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
                    i === index ? "w-5 bg-bleu-medical" : "w-1.5 bg-gris-bordure"
                  )}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="h-3" />
        )}
      </div>
    </article>
  );
}

export function SectionDirectionEquipe() {
  const { direction, equipe } = useContenuAPropos();
  const { responsable } = direction;
  const membres = equipe.membres as Membre[];

  const groupes = useMemo(() => {
    const map = new Map<string, Membre[]>();
    for (const m of membres) {
      const cle = m.categorie || "MEDECIN";
      const liste = map.get(cle) ?? [];
      liste.push(m);
      map.set(cle, liste);
    }
    const ordre = ["MEDECIN", "MEDECIN_EXTERNE", "PERSONNEL"];
    return [...map.entries()].sort(([a], [b]) => {
      const ia = ordre.indexOf(a);
      const ib = ordre.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
  }, [membres]);

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

          <div className="mt-8 grid gap-5 lg:mt-10 lg:grid-cols-2 lg:gap-6">
            {groupes.map(([categorie, agents]) => (
              <CarrouselAgentsService
                key={categorie}
                titreService={LIBELLES_CATEGORIE[categorie] ?? categorie}
                membres={agents}
              />
            ))}
            {groupes.length === 0 ? (
              <p className="text-sm text-texte-secondaire">
                Aucun membre d&apos;équipe publié pour le moment.
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
