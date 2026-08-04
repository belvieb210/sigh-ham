/** Orientations UI — module laboratoire (toutes salles sauf LABORATOIRE) */

export const ORIENTATIONS_DESTINATION_LABO = [
  {
    id: "RECEPTION",
    codeSalle: "RECEPTION",
    icone: "Building2",
    couleur: "border-slate-300 bg-slate-50 text-slate-900",
  },
  {
    id: "INFIRMIERS",
    codeSalle: "INFIRMIERS",
    icone: "Stethoscope",
    couleur: "border-sky-300 bg-sky-50 text-sky-900",
  },
  {
    id: "MEDECIN",
    codeSalle: "MEDECINS",
    icone: "UserRound",
    couleur: "border-violet-300 bg-violet-50 text-violet-900",
  },
  {
    id: "CAISSE",
    codeSalle: "CAISSE",
    icone: "Wallet",
    couleur: "border-amber-300 bg-amber-50 text-amber-900",
  },
  {
    id: "PHARMACIE",
    codeSalle: "PHARMACIE",
    icone: "Pill",
    couleur: "border-emerald-300 bg-emerald-50 text-emerald-900",
  },
  {
    id: "HOSPITALISATION",
    codeSalle: "HOSPITALISATION",
    icone: "BedDouble",
    couleur: "border-indigo-300 bg-indigo-50 text-indigo-900",
  },
  {
    id: "MEDECIN_EXTERNE",
    codeSalle: "MEDECINS_EXTERNES",
    icone: "BriefcaseMedical",
    couleur: "border-indigo-300 bg-indigo-50 text-indigo-900",
  },
  {
    id: "EGLISE",
    codeSalle: "EGLISE",
    icone: "Church",
    couleur: "border-amber-300 bg-amber-50 text-amber-900",
  },
] as const;

export const ORIENTATIONS_STATUT_ANALYSE = [
  {
    id: "RECUS",
    icone: "Inbox",
    couleur: "border-sky-300 bg-sky-50 text-sky-900",
  },
  {
    id: "EN_COURS",
    icone: "FlaskConical",
    couleur: "border-amber-300 bg-amber-50 text-amber-900",
  },
  {
    id: "VERIFIES",
    icone: "ClipboardCheck",
    couleur: "border-teal-300 bg-teal-50 text-teal-900",
  },
  {
    id: "REJETES",
    icone: "XCircle",
    couleur: "border-rose-300 bg-rose-50 text-rose-900",
  },
  {
    id: "DR_APPROUVE",
    icone: "ShieldCheck",
    couleur: "border-emerald-300 bg-emerald-50 text-emerald-900",
  },
] as const;

export type IdOrientationDestinationLabo =
  (typeof ORIENTATIONS_DESTINATION_LABO)[number]["id"];
export type IdOrientationStatutAnalyse =
  (typeof ORIENTATIONS_STATUT_ANALYSE)[number]["id"];

/** Routes des pages de suivi par statut d'analyse */
export const CHEMINS_STATUT_ANALYSE_LABO: Record<
  IdOrientationStatutAnalyse,
  string
> = {
  RECUS: "/sigh/laboratoire/recus",
  EN_COURS: "/sigh/laboratoire/examens-en-cours",
  VERIFIES: "/sigh/laboratoire/verifies",
  REJETES: "/sigh/laboratoire/rejetes",
  DR_APPROUVE: "/sigh/laboratoire/dr-approuve",
};

/** Marqueur persisté dans ExamenLaboratoire.notes */
export const MARQUEUR_ORIENTATION_ANALYSE = "laboOrientation=";

export function lireOrientationAnalyseDepuisNotes(
  notes: string | null | undefined
): IdOrientationStatutAnalyse | null {
  if (!notes) return null;
  const m = notes.match(/laboOrientation=([A-Z_]+)/);
  if (!m) return null;
  const id = m[1] as IdOrientationStatutAnalyse;
  return ORIENTATIONS_STATUT_ANALYSE.some((o) => o.id === id) ? id : null;
}

export function ecrireOrientationAnalyseDansNotes(
  notes: string | null | undefined,
  orientation: IdOrientationStatutAnalyse
): string {
  const nettoye = (notes ?? "")
    .replace(/\s*laboOrientation=[A-Z_]+\s*/g, " ")
    .trim();
  return nettoye
    ? `${nettoye} laboOrientation=${orientation}`
    : `laboOrientation=${orientation}`;
}

/** Code salle → id d'orientation UI du panneau labo */
export function idOrientationDepuisCodeSalle(
  code: string | null | undefined
): IdOrientationDestinationLabo | null {
  if (!code) return null;
  const trouve = ORIENTATIONS_DESTINATION_LABO.find((o) => o.codeSalle === code);
  return trouve?.id ?? null;
}
