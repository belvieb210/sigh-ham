/** Orientations UI — module laboratoire (sélection locale ; actions métier plus tard) */

export const ORIENTATIONS_DESTINATION_LABO = [
  {
    id: "INFIRMIERS",
    icone: "Stethoscope",
    couleur:
      "border-sky-300 bg-sky-50 text-sky-900",
  },
  {
    id: "MEDECIN",
    icone: "UserRound",
    couleur: "border-violet-300 bg-violet-50 text-violet-900",
  },
  {
    id: "CAISSE",
    icone: "Wallet",
    couleur: "border-amber-300 bg-amber-50 text-amber-900",
  },
  {
    id: "MEDECIN_EXTERNE",
    icone: "BriefcaseMedical",
    couleur: "border-indigo-300 bg-indigo-50 text-indigo-900",
  },
  {
    id: "PHARMACIE",
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
