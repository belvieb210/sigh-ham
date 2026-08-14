/** Types de widget de saisie pour un paramètre de laboratoire. */
export type TypeSaisieParametre =
  | "texte"
  | "date"
  | "flag_valeur"
  | "select"
  | "select_autres"
  | "resultat_valeur"
  | "description";

export type ConfigSaisieParametre = {
  typeSaisie: TypeSaisieParametre;
  options?: string[];
  /** Libellé du champ secondaire (resultat_valeur). */
  libelleSecondaire?: string;
  /** Placeholder du champ secondaire. */
  placeholderSecondaire?: string;
};

/** Flags B / N / E — Bas, Normal, Élevé. */
export const OPTIONS_FLAG_BNE = [
  { value: "B", label: "B" },
  { value: "N", label: "N" },
  { value: "E", label: "E" },
] as const;

export type ValeurFlagBne = (typeof OPTIONS_FLAG_BNE)[number]["value"];

/** Option « Autres » — affiche un champ texte de précision. */
export const OPTION_AUTRES = "Autres";

export function avecOptionAutres(options: string[]): string[] {
  const sans = options.filter((o) => o !== OPTION_AUTRES);
  return [...sans, OPTION_AUTRES];
}

export function estValeurAutres(valeur: string | null | undefined): boolean {
  return valeur?.trim().toLowerCase() === OPTION_AUTRES.toLowerCase();
}

export function normaliserConfigSaisie(
  raw: unknown
): ConfigSaisieParametre | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const typeSaisie = o.typeSaisie;
  if (typeof typeSaisie !== "string") return null;

  const typesValides: TypeSaisieParametre[] = [
    "texte",
    "date",
    "flag_valeur",
    "select",
    "select_autres",
    "resultat_valeur",
    "description",
  ];
  if (!typesValides.includes(typeSaisie as TypeSaisieParametre)) return null;

  const config: ConfigSaisieParametre = {
    typeSaisie: typeSaisie as TypeSaisieParametre,
  };

  if (Array.isArray(o.options)) {
    config.options = o.options.filter((x): x is string => typeof x === "string");
  }
  if (typeof o.libelleSecondaire === "string") {
    config.libelleSecondaire = o.libelleSecondaire;
  }
  if (typeof o.placeholderSecondaire === "string") {
    config.placeholderSecondaire = o.placeholderSecondaire;
  }

  if (
    config.typeSaisie === "select" ||
    config.typeSaisie === "select_autres"
  ) {
    config.options = avecOptionAutres(config.options ?? []);
  }

  return config;
}
