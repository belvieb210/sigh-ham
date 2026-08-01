"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { LogoHam } from "@/components/brand/logo-ham";

interface PropsMiseEnPageAuth {
  badge: string;
  titre: string;
  description: string;
  securise?: string;
  children: React.ReactNode;
  pied?: React.ReactNode;
  lienRetour?: { href: string; label: string };
}

export function MiseEnPageAuth({
  badge,
  titre,
  description,
  securise,
  children,
  pied,
  lienRetour,
}: PropsMiseEnPageAuth) {
  return (
    <div className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden bg-gris-tres-clair px-4 py-12 lg:min-h-[calc(100vh-6rem)]">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#4d2254]/5 via-transparent to-[#2e337a]/8"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-32 top-20 h-64 w-64 rounded-full bg-[#4d2254]/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-16 h-72 w-72 rounded-full bg-[#2e337a]/10 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8 flex flex-col items-center gap-3"
        >
          <LogoHam taille="grand" />
          {securise && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-bleu-medical/20 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-bleu-medical shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5" />
              {securise}
            </span>
          )}
        </motion.div>

        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="rounded-2xl border border-gris-bordure/80 bg-white p-7 shadow-lg sm:p-8"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-bleu-medical">
            {badge}
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#2d2a6e]">
            {titre}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-texte-secondaire">
            {description}
          </p>

          <div className="mt-7">{children}</div>

          {pied && (
            <p className="mt-6 border-t border-gris-bordure pt-5 text-center text-xs leading-relaxed text-texte-secondaire">
              {pied}
            </p>
          )}
        </motion.div>

        {lienRetour && (
          <Link
            href={lienRetour.href}
            className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-bleu-medical transition-colors hover:text-bleu-medical-fonce hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            {lienRetour.label}
          </Link>
        )}
      </div>
    </div>
  );
}
