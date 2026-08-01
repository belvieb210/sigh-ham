"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Calendar,
  FileText,
  ArrowRight,
} from "lucide-react";
import { INFORMATIONS_HOPITAL } from "@/constants/navigation";
import { useContenuContact } from "@/hooks/use-contenu-page";
import { cn } from "@/lib/utils";

function CarteInfo({
  icone: Icone,
  titre,
  children,
  className,
  variante = "standard",
}: {
  icone: React.ComponentType<{ className?: string }>;
  titre: string;
  children: React.ReactNode;
  className?: string;
  variante?: "standard" | "large";
}) {
  return (
    <div
      className={cn(
        "group flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:border-[#7dd3fc]/30 hover:bg-white/8 sm:p-6",
        variante === "large" && "sm:flex-col sm:gap-5",
        className
      )}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#7dd3fc]/15 text-[#7dd3fc] transition-colors group-hover:bg-[#7dd3fc]/25">
        <Icone className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-white">{titre}</h3>
        <div className="mt-2 text-sm leading-relaxed text-white/70">{children}</div>
      </div>
    </div>
  );
}

export function SectionCoordonneesContact() {
  const { coordonnees, horaires } = useContenuContact();

  const liensRapides = [
    {
      icone: Calendar,
      titre: coordonnees.rdv,
      description: coordonnees.rdvDesc,
      href: "/rendez-vous",
      externe: false,
      accent: "from-bleu-medical/20 to-bleu-medical-clair",
    },
    {
      icone: FileText,
      titre: coordonnees.resultats,
      description: coordonnees.resultatsDesc,
      href: "/resultats",
      externe: false,
      accent: "from-violet-500/15 to-violet-50",
    },
    {
      icone: Globe,
      titre: coordonnees.site,
      description: "hamlabor.org",
      href: INFORMATIONS_HOPITAL.siteWeb,
      externe: true,
      accent: "from-[#7a1f4e]/15 to-[#fdf2f8]",
    },
  ] as const;

  return (
    <section
      id="coordonnees-contact"
      className="section-coordonnees relative overflow-hidden bg-[#0f172a] py-12 sm:py-16 lg:py-20"
      aria-labelledby="titre-coordonnees"
    >
      <div
        className="pointer-events-none absolute -left-32 top-0 h-64 w-64 rounded-full bg-bleu-medical/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="conteneur-principal relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7dd3fc]">
            {coordonnees.surtitre}
          </p>
          <h2
            id="titre-coordonnees"
            className="mt-3 text-2xl font-extrabold text-white sm:text-3xl"
          >
            {coordonnees.titre}
          </h2>
          <p className="mt-3 text-sm text-white/60 sm:text-base">
            {coordonnees.sousTitre}
          </p>
        </div>

        {/* Accès rapides */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3 lg:mt-12">
          {liensRapides.map((lien, index) => {
            const Icone = lien.icone;
            const contenu = (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className={cn(
                  "group flex h-full items-center gap-4 rounded-2xl border border-white/10 bg-gradient-to-br p-5 transition-all hover:-translate-y-0.5 hover:border-white/20 hover:shadow-lg",
                  lien.accent
                )}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/90 text-bleu-medical shadow-sm">
                  <Icone className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-[#2d2a6e]">{lien.titre}</p>
                  <p className="text-xs text-texte-secondaire">{lien.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-bleu-medical opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
              </motion.div>
            );

            return lien.externe ? (
              <a
                key={lien.titre}
                href={lien.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {contenu}
              </a>
            ) : (
              <Link key={lien.titre} href={lien.href}>
                {contenu}
              </Link>
            );
          })}
        </div>

        {/* Grille coordonnées */}
        <div className="mt-8 grid gap-5 lg:mt-10 lg:grid-cols-2 lg:gap-6">
          <CarteInfo icone={MapPin} titre={coordonnees.adresse} variante="large">
            <p>{INFORMATIONS_HOPITAL.adresse}</p>
          </CarteInfo>

          <CarteInfo icone={Phone} titre={coordonnees.telephones}>
            <ul className="space-y-3">
              <li>
                <span className="text-xs text-white/50">{coordonnees.accueil}</span>
                <a
                  href={`tel:${INFORMATIONS_HOPITAL.telephone.replace(/\s/g, "")}`}
                  className="mt-0.5 block font-semibold text-[#7dd3fc] transition-colors hover:text-white hover:underline"
                >
                  {INFORMATIONS_HOPITAL.telephone}
                </a>
              </li>
              <li>
                <span className="text-xs text-white/50">{coordonnees.responsable}</span>
                <a
                  href={`tel:${INFORMATIONS_HOPITAL.telephoneSecondaire.replace(/\s/g, "")}`}
                  className="mt-0.5 block font-semibold text-[#7dd3fc] transition-colors hover:text-white hover:underline"
                >
                  {INFORMATIONS_HOPITAL.telephoneSecondaire}
                </a>
              </li>
            </ul>
          </CarteInfo>

          <CarteInfo icone={Mail} titre={coordonnees.email}>
            <a
              href={`mailto:${INFORMATIONS_HOPITAL.email}`}
              className="font-semibold text-[#7dd3fc] transition-colors hover:text-white hover:underline"
            >
              {INFORMATIONS_HOPITAL.email}
            </a>
          </CarteInfo>

          <CarteInfo icone={Clock} titre={horaires.titre}>
            <ul className="space-y-2">
              {horaires.jours.map((item) => (
                <li
                  key={item.jour}
                  className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4"
                >
                  <span>{item.jour}</span>
                  <span className="font-semibold text-white">{item.heures}</span>
                </li>
              ))}
            </ul>
          </CarteInfo>
        </div>
      </div>
    </section>
  );
}
