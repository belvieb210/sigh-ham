/** Orientations UI — module laboratoire */

export const ORIENTATIONS_DESTINATION_LABO = [
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
    id: "MEDECIN_EXTERNE",
    codeSalle: "MEDECINS_EXTERNES",
    icone: "BriefcaseMedical",
    couleur: "border-indigo-300 bg-indigo-50 text-indigo-900",
  },
  {
    id: "PHARMACIE",
    codeSalle: "PHARMACIE",
    icone: "Pill",
    couleur: "border-emerald-300 bg-emerald-50 text-emerald-900",
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

/** Code salle → id d'orientation UI du panneau labo */
export function idOrientationDepuisCodeSalle(
  code: string | null | undefined
): IdOrientationDestinationLabo | null {
  if (!code) return null;
  const trouve = ORIENTATIONS_DESTINATION_LABO.find((o) => o.codeSalle === code);
  return trouve?.id ?? null;
}
