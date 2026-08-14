export type StatutSommeCalcul = "vide" | "incomplet" | "ok" | "depasse";

export type SommeCalculMeta = {
  id: string;
  label: string;
  total: number;
  cible: number;
  statut: StatutSommeCalcul;
};

export type MetaCalculsFormulaire = {
  sommes: SommeCalculMeta[];
  bloqueVerification: boolean;
};

export type ParametreCalculEntree = {
  nom: string;
  valeur: string;
  nonRequis?: boolean;
};

export type ResultatCalculsAutomatiques<
  T extends ParametreCalculEntree = ParametreCalculEntree,
> = {
  parametres: T[];
  meta: MetaCalculsFormulaire | null;
  champsCalcules: Set<string>;
};

export type FormatValeurCalculee =
  | "defaut"
  | "entier"
  | "pourcentage"
  | "numeration";

export type RegleDerive = {
  cible: string;
  calcul: (lire: (nom: string) => number | null) => number | null;
  format?: FormatValeurCalculee;
};

export type RegleSomme = {
  id: string;
  label: string;
  sources: string[];
  cible?: number;
  bloquerSiDepasse?: boolean;
};

export type ConfigCalculFormulaire = {
  derives: RegleDerive[];
  sommes?: RegleSomme[];
  champsCalcules: string[];
};
