import {
  obtenirConfigCalcul,
  resoudreCleCalculAutomatique,
} from "@/lib/laboratoire/calculs-automatiques/regles-par-formulaire";
import type {
  MetaCalculsFormulaire,
  ParametreCalculEntree,
  ResultatCalculsAutomatiques,
  SommeCalculMeta,
  StatutSommeCalcul,
} from "@/lib/laboratoire/calculs-automatiques/types";
import {
  formaterValeurCalculee,
  normaliserNomParametre,
  parseValeurNumerique,
} from "@/lib/laboratoire/calculs-automatiques/utilitaires-numeriques";

function evaluerStatutSomme(
  total: number,
  cible: number,
  hasValues: boolean
): StatutSommeCalcul {
  if (!hasValues) return "vide";
  if (total > cible) return "depasse";
  if (total < cible) return "incomplet";
  return "ok";
}

export function appliquerCalculsAutomatiques<T extends ParametreCalculEntree>(
  formulaire: string | null | undefined,
  parametres: T[]
): ResultatCalculsAutomatiques<T> {
  const config = obtenirConfigCalcul(formulaire, parametres);
  if (!config) {
    return { parametres, meta: null, champsCalcules: new Set() };
  }

  const index = new Map<string, T>();
  const valeursParNom = new Map<string, string>();
  for (const p of parametres) {
    const cle = normaliserNomParametre(p.nom);
    index.set(cle, p);
    valeursParNom.set(cle, p.valeur);
  }

  const lireNumerique = (nom: string): number | null => {
    const cle = normaliserNomParametre(nom);
    return parseValeurNumerique(valeursParNom.get(cle));
  };

  for (const regle of config.derives) {
    const cleCible = normaliserNomParametre(regle.cible);
    if (!index.has(cleCible)) continue;
    const resultat = regle.calcul(lireNumerique);
    if (resultat === null) {
      valeursParNom.set(cleCible, "");
    } else {
      valeursParNom.set(
        cleCible,
        formaterValeurCalculee(resultat, regle.format ?? "defaut")
      );
    }
  }

  const parametresMisAJour = parametres.map((p) => {
    const cle = normaliserNomParametre(p.nom);
    const nouvelleValeur = valeursParNom.get(cle);
    return nouvelleValeur !== undefined ? { ...p, valeur: nouvelleValeur } : p;
  });

  const sommes: SommeCalculMeta[] = [];
  let bloqueVerification = false;

  for (const somme of config.sommes ?? []) {
    const cible = somme.cible ?? 100;
    let total = 0;
    let hasValues = false;

    for (const source of somme.sources) {
      const v = lireNumerique(source);
      if (v !== null && v > 0) hasValues = true;
      total += v ?? 0;
    }

    const statut = evaluerStatutSomme(total, cible, hasValues);
    if (statut === "depasse" && somme.bloquerSiDepasse) {
      bloqueVerification = true;
    }

    sommes.push({
      id: somme.id,
      label: somme.label,
      total,
      cible,
      statut,
    });
  }

  const meta: MetaCalculsFormulaire | null =
    sommes.length > 0 ? { sommes, bloqueVerification } : null;

  return {
    parametres: parametresMisAJour,
    meta,
    champsCalcules: new Set(
      config.champsCalcules.map((n) => normaliserNomParametre(n))
    ),
  };
}

export function validerCalculsPourVerification(
  formulaire: string | null | undefined,
  parametres: Pick<ParametreCalculEntree, "nom" | "valeur">[]
): string | null {
  const resultat = appliquerCalculsAutomatiques(formulaire, parametres);
  if (!resultat.meta?.bloqueVerification) return null;

  const sommeBloquee = resultat.meta.sommes.find((s) => s.statut === "depasse");
  if (!sommeBloquee) return null;

  return `${sommeBloquee.label} : total ${sommeBloquee.total.toFixed(1)} % dépasse ${sommeBloquee.cible} %. Corrigez les valeurs avant de vérifier.`;
}

export function aCalculsAutomatiques(
  formulaire: string | null | undefined,
  parametres: { nom: string }[]
): boolean {
  return resoudreCleCalculAutomatique(formulaire, parametres) !== null;
}
