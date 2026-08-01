"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Globe,
  ShieldCheck,
  Award,
  FlaskConical,
} from "lucide-react";
import { useContenuAPropos } from "@/hooks/use-contenu-page";
import { INFORMATIONS_HOPITAL } from "@/constants/navigation";

const ICONES_CERTIFICATIONS = {
  iso: Award,
  "bonnes-pratiques": FlaskConical,
  fiabilite: ShieldCheck,
} as const;

function LigneEcg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 24"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M0 12h30l8-8 8 16 8-16 8 8h30"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconeBandeau({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#1a4d7c] sm:h-11 sm:w-11">
      {children}
    </div>
  );
}

export function SectionCertificationsBandeau() {
  const { certifications, bandeau } = useContenuAPropos();

  return (
    <>
      <section
        className="section-certifications relative overflow-hidden bg-[#0f172a] py-12 sm:py-16 lg:py-20"
        aria-labelledby="titre-certifications"
      >
        <div
          className="pointer-events-none absolute -right-40 top-0 h-80 w-80 rounded-full bg-vert-sante/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="conteneur-principal relative">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7dd3fc]">
              Qualité & conformité
            </p>
            <h2
              id="titre-certifications"
              className="mt-3 text-2xl font-extrabold text-white sm:text-3xl"
            >
              {certifications.titre}
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3 lg:mt-14 lg:gap-6">
            {certifications.items.map((item, index) => {
              const Icone =
                ICONES_CERTIFICATIONS[
                  item.id as keyof typeof ICONES_CERTIFICATIONS
                ] ?? ShieldCheck;

              return (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-vert-sante/30 hover:bg-white/8"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-vert-sante/15 text-vert-sante transition-colors group-hover:bg-vert-sante/25">
                    <Icone className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-white">{item.titre}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/65">
                    {item.description}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-bandeau-a-propos" aria-label="Coordonnées HAM Laboratoire">
        <div className="bg-gradient-to-br from-[#1a4d7c] to-[#0f172a] py-10 text-white lg:py-12">
          <div className="conteneur-principal">
            <div className="grid items-start gap-8 lg:grid-cols-[1fr_1fr_1fr_auto] lg:gap-6">
              <div className="flex gap-4 lg:border-r lg:border-white/20 lg:pr-6">
                <IconeBandeau>
                  <MapPin className="h-5 w-5" strokeWidth={2} />
                </IconeBandeau>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
                    Adresse
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white/90">
                    {INFORMATIONS_HOPITAL.adresse}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 lg:border-r lg:border-white/20 lg:pr-6">
                <IconeBandeau>
                  <Phone className="h-5 w-5" strokeWidth={2} />
                </IconeBandeau>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
                    Téléphone
                  </p>
                  <ul className="mt-2 space-y-1">
                    {bandeau.telephones.map((tel) => (
                      <li key={tel}>
                        <a
                          href={`tel:${tel.replace(/\s/g, "")}`}
                          className="text-sm text-white/90 transition-colors hover:text-white hover:underline"
                        >
                          {tel}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex gap-4">
                <IconeBandeau>
                  <Globe className="h-5 w-5" strokeWidth={2} />
                </IconeBandeau>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
                    Site web
                  </p>
                  <Link
                    href={bandeau.siteWeb}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm break-all text-white/90 hover:text-white hover:underline"
                  >
                    {bandeau.siteWeb}
                  </Link>
                </div>
              </div>

              <div className="hidden shrink-0 lg:block">
                <div className="overflow-hidden rounded-xl border border-white/20 bg-white p-2 shadow-lg">
                  <Image
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=88x88&data=${encodeURIComponent(bandeau.siteWeb)}`}
                    alt="QR code — hamlabor.org"
                    width={88}
                    height={88}
                    className="h-[88px] w-[88px]"
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-[#7a1f4e] py-4 text-white sm:py-5">
          <LigneEcg className="absolute left-3 top-1/2 hidden h-5 w-20 -translate-y-1/2 opacity-40 sm:block lg:left-8 lg:h-6 lg:w-28" />
          <LigneEcg className="absolute right-3 top-1/2 hidden h-5 w-20 -translate-y-1/2 opacity-40 sm:block lg:right-8 lg:h-6 lg:w-28" />

          <div className="conteneur-principal flex items-center justify-center gap-3 px-2 sm:gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white sm:h-9 sm:w-9">
              <span className="text-base font-bold leading-none sm:text-lg">+</span>
            </div>
            <p className="text-center text-[10px] font-bold italic uppercase leading-snug tracking-wide sm:text-xs lg:text-sm">
              {bandeau.slogan}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
