import type { DonneesFormulairePatient } from "@/lib/reception/types";
import { TYPES_PATIENT } from "@/constants/reception";

export interface DonneesResumePatient {
  initiales: string;
  nomComplet: string;
  numeroPatient: string | null;
  numeroVisite: string | null;
  dossierId: string | null;
  typeVisite: string;
  libelleTypeVisite: string;
  age: string;
  telephone: string;
  adresse: string;
  assurance: string;
  photoUrl: string | null;
  vide: boolean;
}

export const RESUME_PATIENT_VIDE: DonneesResumePatient = {
  initiales: "—",
  nomComplet: "Aucun patient sélectionné",
  numeroPatient: null,
  numeroVisite: null,
  dossierId: null,
  typeVisite: "nouveau",
  libelleTypeVisite: "—",
  age: "—",
  telephone: "—",
  adresse: "—",
  assurance: "—",
  photoUrl: null,
  vide: true,
};

function libelleTypeVisite(typeVisite: string): string {
  return TYPES_PATIENT.find((t) => t.value === typeVisite)?.label ?? "Patient";
}

function calculerAgeAffiche(dateNaissance: string): string {
  if (!dateNaissance) return "—";
  const naissance = new Date(dateNaissance);
  if (Number.isNaN(naissance.getTime())) return "—";

  const aujourdhui = new Date();
  let age = aujourdhui.getFullYear() - naissance.getFullYear();
  const mois = aujourdhui.getMonth() - naissance.getMonth();
  if (mois < 0 || (mois === 0 && aujourdhui.getDate() < naissance.getDate())) {
    age -= 1;
  }
  return age >= 0 ? String(age) : "—";
}

function initialesPatient(prenom: string, nom: string): string {
  const initialePrenom = prenom.trim().charAt(0);
  const initialeNom = nom.trim().charAt(0);
  const initiales = `${initialePrenom}${initialeNom}`.toUpperCase();
  return initiales || "—";
}

function formaterAdresse(parts: {
  adresse?: string;
  commune?: string;
  ville?: string;
}): string {
  const segments = [parts.adresse?.trim(), parts.commune?.trim(), parts.ville?.trim()].filter(
    Boolean
  );
  return segments.length > 0 ? segments.join(", ") : "—";
}

export function construireResumeDepuisFormulaire(input: {
  nom?: string;
  prenom?: string;
  typeVisite?: string;
  dateNaissance?: string;
  telephone?: string;
  adresse?: string;
  commune?: string;
  ville?: string;
  assurance?: string;
  numeroPatient?: string | null;
  numeroVisite?: string | null;
  dossierId?: string | null;
  photoUrl?: string | null;
}): DonneesResumePatient {
  const nom = input.nom?.trim() ?? "";
  const prenom = input.prenom?.trim() ?? "";
  const nomComplet = [nom, prenom].filter(Boolean).join(" ").trim();

  if (!nomComplet && !input.numeroPatient) {
    return RESUME_PATIENT_VIDE;
  }

  return {
    initiales: initialesPatient(prenom, nom),
    nomComplet: nomComplet || "Patient sans nom",
    numeroPatient: input.numeroPatient ?? null,
    numeroVisite: input.numeroVisite ?? null,
    dossierId: input.dossierId ?? null,
    typeVisite: input.typeVisite ?? "nouveau",
    libelleTypeVisite: libelleTypeVisite(input.typeVisite ?? "nouveau"),
    age: calculerAgeAffiche(input.dateNaissance ?? ""),
    telephone: input.telephone?.trim() || "—",
    adresse: formaterAdresse(input),
    assurance: input.assurance?.trim() || "—",
    photoUrl: input.photoUrl ?? null,
    vide: false,
  };
}

export function construireResumeDepuisDonneesFormulaire(
  donnees: DonneesFormulairePatient
): DonneesResumePatient {
  return construireResumeDepuisFormulaire({
    nom: donnees.nom,
    prenom: donnees.prenom,
    typeVisite: donnees.typeVisite,
    dateNaissance: donnees.dateNaissance,
    telephone: donnees.telephone,
    adresse: donnees.adresse,
    commune: donnees.commune,
    ville: donnees.ville,
    assurance: donnees.assurance,
    numeroPatient: donnees.numeroPatient,
    numeroVisite: donnees.numeroVisite ?? null,
    dossierId: donnees.dossierId ?? null,
    photoUrl: donnees.photoUrl,
  });
}

export function couleurBadgeTypeVisite(typeVisite: string): string {
  switch (typeVisite) {
    case "urgence":
      return "bg-red-100 text-red-700";
    case "rdv":
      return "bg-emerald-100 text-emerald-700";
    case "ancien":
      return "bg-slate-100 text-slate-700";
    case "nouveau":
    default:
      return "bg-blue-100 text-blue-700";
  }
}
