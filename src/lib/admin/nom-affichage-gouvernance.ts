/** Nom public sans le suffixe technique « Administrateur » des comptes admin. */
export function nomAffichageGouvernance(prenom: string, nom: string): string {
  const p = prenom.trim();
  const n = nom.trim();
  if (!n || n.toLowerCase() === "administrateur") return p;
  return `${p} ${n}`.trim();
}
