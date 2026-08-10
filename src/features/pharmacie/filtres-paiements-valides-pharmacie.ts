import type { PaiementValidePharmacie } from "@/lib/pharmacie/lister-paiements-valides-pharmacie";

export interface FiltresPaiementsValidesPharmacie {
  dateDu: string;
  dateAu: string;
  nom: string;
  prenom: string;
  numeroPatient: string;
  numeroVente: string;
  telephone: string;
  sexe: "" | "MASCULIN" | "FEMININ";
  type: "" | "DIRECTE" | "ORDONNANCE";
  statut: "" | "PAYEE" | "DELIVREE";
}

export const FILTRES_PAIEMENTS_VALIDES_VIDES: FiltresPaiementsValidesPharmacie = {
  dateDu: "",
  dateAu: "",
  nom: "",
  prenom: "",
  numeroPatient: "",
  numeroVente: "",
  telephone: "",
  sexe: "",
  type: "",
  statut: "",
};

export function compterFiltresPaiementsValides(
  filtres: FiltresPaiementsValidesPharmacie
): number {
  let n = 0;
  if (filtres.dateDu) n += 1;
  if (filtres.dateAu) n += 1;
  if (filtres.nom.trim()) n += 1;
  if (filtres.prenom.trim()) n += 1;
  if (filtres.numeroPatient.trim()) n += 1;
  if (filtres.numeroVente.trim()) n += 1;
  if (filtres.telephone.trim()) n += 1;
  if (filtres.sexe) n += 1;
  if (filtres.type) n += 1;
  if (filtres.statut) n += 1;
  return n;
}

function correspondDate(iso: string | null, du: string, au: string) {
  if (!du && !au) return true;
  if (!iso) return false;
  const d = iso.slice(0, 10);
  if (du && d < du) return false;
  if (au && d > au) return false;
  return true;
}

export function paiementValideCorrespondFiltres(
  p: PaiementValidePharmacie,
  filtres: FiltresPaiementsValidesPharmacie
): boolean {
  if (!correspondDate(p.payeeLe, filtres.dateDu, filtres.dateAu)) return false;
  if (
    filtres.nom.trim() &&
    !p.nom.toLowerCase().includes(filtres.nom.trim().toLowerCase())
  ) {
    return false;
  }
  if (
    filtres.prenom.trim() &&
    !p.prenom.toLowerCase().includes(filtres.prenom.trim().toLowerCase())
  ) {
    return false;
  }
  if (
    filtres.numeroPatient.trim() &&
    !p.numeroPatient.toLowerCase().includes(filtres.numeroPatient.trim().toLowerCase())
  ) {
    return false;
  }
  if (
    filtres.numeroVente.trim() &&
    !p.numero.toLowerCase().includes(filtres.numeroVente.trim().toLowerCase())
  ) {
    return false;
  }
  if (
    filtres.telephone.trim() &&
    !p.telephone.replace(/\s/g, "").includes(filtres.telephone.replace(/\s/g, ""))
  ) {
    return false;
  }
  if (filtres.sexe && p.sexe !== filtres.sexe) return false;
  if (filtres.type && p.type !== filtres.type) return false;
  if (filtres.statut && p.statut !== filtres.statut) return false;
  return true;
}
