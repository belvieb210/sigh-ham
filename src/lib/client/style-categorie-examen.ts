import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Bug,
  Dna,
  Droplet,
  FlaskConical,
  HeartPulse,
  Microscope,
  Scan,
  Shield,
  Syringe,
  TestTube,
} from "lucide-react";

export type StyleCategorieExamen = {
  icone: LucideIcon;
  couleurIcone: string;
  fondIcone: string;
};

const STYLES_PAR_CATEGORIE: Record<string, StyleCategorieExamen> = {
  Hématologie: {
    icone: Droplet,
    couleurIcone: "text-red-600",
    fondIcone: "bg-red-50",
  },
  Biochimie: {
    icone: FlaskConical,
    couleurIcone: "text-violet-600",
    fondIcone: "bg-violet-50",
  },
  Immunologie: {
    icone: Shield,
    couleurIcone: "text-indigo-600",
    fondIcone: "bg-indigo-50",
  },
  Microbiologie: {
    icone: Bug,
    couleurIcone: "text-emerald-600",
    fondIcone: "bg-emerald-50",
  },
  Parasitologie: {
    icone: Microscope,
    couleurIcone: "text-amber-600",
    fondIcone: "bg-amber-50",
  },
  Hormonologie: {
    icone: Activity,
    couleurIcone: "text-pink-600",
    fondIcone: "bg-pink-50",
  },
  Sérologie: {
    icone: Syringe,
    couleurIcone: "text-orange-600",
    fondIcone: "bg-orange-50",
  },
  "Imagerie médicale": {
    icone: Scan,
    couleurIcone: "text-cyan-600",
    fondIcone: "bg-cyan-50",
  },
  Hémostase: {
    icone: HeartPulse,
    couleurIcone: "text-rose-600",
    fondIcone: "bg-rose-50",
  },
  Virologie: {
    icone: Dna,
    couleurIcone: "text-blue-600",
    fondIcone: "bg-blue-50",
  },
  Bilans: {
    icone: TestTube,
    couleurIcone: "text-bleu-medical",
    fondIcone: "bg-bleu-medical-clair",
  },
};

const STYLE_DEFAUT: StyleCategorieExamen = {
  icone: FlaskConical,
  couleurIcone: "text-bleu-medical",
  fondIcone: "bg-bleu-medical-clair",
};

export function styleCategorieExamen(categorie: string): StyleCategorieExamen {
  return STYLES_PAR_CATEGORIE[categorie] ?? STYLE_DEFAUT;
}
