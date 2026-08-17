import type { CodeSalle } from "@/generated/prisma/client";

/** Salles cliniques pouvant s'échanger des patients (hors ADMIN / MESSAGERIE). */
export const SALLES_CLINIQUES: CodeSalle[] = [
  "RECEPTION",
  "INFIRMIERS",
  "MEDECINS",
  "CAISSE",
  "LABORATOIRE",
  "PHARMACIE",
  "HOSPITALISATION",
  "EGLISE",
  "MEDECINS_EXTERNES",
];

export const META_ORIENTATION_SALLE: Record<
  CodeSalle,
  { label: string; description: string; couleur: string }
> = {
  RECEPTION: {
    label: "Réception",
    description: "Retour à l'accueil",
    couleur: "border-slate-300 bg-slate-50 text-slate-700",
  },
  INFIRMIERS: {
    label: "Infirmiers",
    description: "Prise de signes vitaux / soins",
    couleur: "border-violet-300 bg-violet-50 text-violet-700",
  },
  MEDECINS: {
    label: "Médecins",
    description: "Consultation médicale",
    couleur: "border-blue-300 bg-blue-50 text-blue-700",
  },
  CAISSE: {
    label: "Caisse",
    description: "Facturation et paiement",
    couleur: "border-rose-200 bg-rose-50 text-rose-700",
  },
  LABORATOIRE: {
    label: "Laboratoire",
    description: "Analyses et prélèvements",
    couleur: "border-cyan-200 bg-cyan-50 text-cyan-800",
  },
  PHARMACIE: {
    label: "Pharmacie",
    description: "Délivrance des médicaments",
    couleur: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  HOSPITALISATION: {
    label: "Hospitalisation",
    description: "Admission / lits",
    couleur: "border-indigo-200 bg-indigo-50 text-indigo-800",
  },
  EGLISE: {
    label: "Église",
    description: "Examens prénuptiaux",
    couleur: "border-amber-200 bg-amber-50 text-amber-800",
  },
  MEDECINS_EXTERNES: {
    label: "Médecins externes",
    description: "Orientation externe",
    couleur: "border-orange-200 bg-orange-50 text-orange-800",
  },
  ADMIN: {
    label: "Administration",
    description: "Administration",
    couleur: "border-slate-300 bg-slate-50 text-slate-700",
  },
  CLIENT: {
    label: "Service Client",
    description: "CMS site public",
    couleur: "border-sky-300 bg-sky-50 text-sky-800",
  },
  MESSAGERIE: {
    label: "Messagerie",
    description: "Messagerie",
    couleur: "border-slate-300 bg-slate-50 text-slate-700",
  },
};

/**
 * Destinations autorisées par salle d'origine.
 * Salles absentes (RECEPTION, CAISSE, LABORATOIRE) : toutes les autres salles cliniques.
 */
export const ORIENTATIONS_DESTINATION_PAR_SALLE: Partial<
  Record<CodeSalle, readonly CodeSalle[]>
> = {
  INFIRMIERS: ["MEDECINS"],
  MEDECINS: ["CAISSE"],
  MEDECINS_EXTERNES: ["CAISSE"],
  EGLISE: ["CAISSE"],
  PHARMACIE: ["CAISSE"],
};

/** Destinations autorisées depuis une salle (restriction métier ou toutes sauf origine). */
export function orientationsAutoriseesDepuis(origine: CodeSalle): CodeSalle[] {
  const limitees = ORIENTATIONS_DESTINATION_PAR_SALLE[origine];
  if (limitees) return [...limitees];
  return SALLES_CLINIQUES.filter((c) => c !== origine);
}

/** @deprecated Préférer orientationsAutoriseesDepuis — conservé pour compatibilité interne. */
export function orientationsSauf(origine: CodeSalle): CodeSalle[] {
  return orientationsAutoriseesDepuis(origine);
}

export function filtrerOrientationsAutorisees(
  origine: CodeSalle,
  orientations: string[]
): CodeSalle[] {
  const autorisees = new Set<string>(orientationsAutoriseesDepuis(origine));
  return [
    ...new Set(
      orientations
        .map((o) => o.trim())
        .filter((o): o is CodeSalle => autorisees.has(o))
    ),
  ];
}

/** Valeur par défaut du panneau orientation rapide selon la salle d'origine. */
export function orientationDefautPourSalle(origine: CodeSalle): CodeSalle {
  const autorisees = orientationsAutoriseesDepuis(origine);
  if (origine === "CAISSE" && autorisees.includes("LABORATOIRE")) {
    return "LABORATOIRE";
  }
  if (origine === "INFIRMIERS" && autorisees.includes("MEDECINS")) {
    return "MEDECINS";
  }
  if (autorisees.includes("CAISSE")) return "CAISSE";
  return autorisees[0] ?? origine;
}

/** Orientations UI à partir des données patient, filtrées selon la salle d'origine. */
export function orientationsInitialesDepuisPatient(
  origine: CodeSalle,
  brutes?: string[] | null,
  codeUnique?: string | null
): CodeSalle[] {
  const candidats =
    brutes && brutes.length > 0
      ? brutes
      : codeUnique && codeUnique !== origine
        ? [codeUnique]
        : [];
  const filtrees = filtrerOrientationsAutorisees(origine, candidats);
  return filtrees;
}

export function metaOrientationsSauf(origine: CodeSalle) {
  return orientationsSauf(origine).map((value) => ({
    value,
    labelKey: value,
    descriptionKey: value,
    label: META_ORIENTATION_SALLE[value].label,
    description: META_ORIENTATION_SALLE[value].description,
    couleur: META_ORIENTATION_SALLE[value].couleur,
  }));
}

export function estOrientationCliniqueValide(
  origine: CodeSalle,
  destination: string
): destination is CodeSalle {
  return orientationsAutoriseesDepuis(origine).includes(destination as CodeSalle);
}
