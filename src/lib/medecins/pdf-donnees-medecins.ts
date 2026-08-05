import type { DonneesCrConsultation } from "@/features/medecins/consultation-pdf";
import type { DifferenceHistorique } from "@/features/medecins/historique-dossier-pdf";
import type { DonneesOrdonnancePdf } from "@/features/medecins/ordonnance-pdf";
import type {
  ConsultationDetailMedecins,
  OrdonnanceMedecins,
} from "@/lib/medecins/types";

export function consultationVersDonneesPdf(
  c: ConsultationDetailMedecins
): DonneesCrConsultation {
  const sv = c.formulaireClinique?.signesVitaux;
  return {
    hopital: "HAM LABORATOIRE",
    medecin: c.medecin,
    patient: c.patient.nomComplet,
    numeroDossier: c.patient.numeroDossier,
    telephone: c.patient.telephone,
    age: c.patient.age,
    sexe: c.patient.sexe,
    motif: c.motif,
    anamnese: c.anamnese,
    examenClinique: c.examenClinique,
    conclusion: c.conclusion,
    diagnostics: c.diagnostics.map((d) => ({
      libelle: d.libelle,
      codeCim: d.codeCim,
      principal: d.principal,
    })),
    actes: c.actes.map((a) => ({
      libelle: a.libelle,
      typeActe: a.typeActe,
      quantite: a.quantite,
    })),
    signesVitaux: sv
      ? {
          temperature: sv.temperature,
          tensionSystolique: sv.tensionSystolique,
          tensionDiastolique: sv.tensionDiastolique,
          frequenceCardiaque: sv.frequenceCardiaque,
          poidsKg: sv.poidsKg,
          tailleCm: sv.tailleCm,
          saturationO2: sv.saturationO2,
        }
      : null,
    debutLe: c.debutLe,
    finLe: c.finLe,
  };
}

export function ordonnanceVersDonneesPdf(
  o: OrdonnanceMedecins,
  extras?: {
    telephone?: string | null;
    age?: number | null;
    sexe?: string | null;
    detailsPrescription?: Record<string, unknown> | null;
  }
): DonneesOrdonnancePdf {
  const details = extras?.detailsPrescription ?? null;
  const imagerie =
    details && typeof details.imagerie === "object" && details.imagerie
      ? (details.imagerie as DonneesOrdonnancePdf["imagerie"])
      : null;

  return {
    medecin: o.medecin,
    patient: o.patient,
    numeroDossier: o.numeroDossier,
    telephone: extras?.telephone ?? null,
    age: extras?.age ?? null,
    sexe: extras?.sexe ?? null,
    prescritLe: o.prescritLe,
    notes: o.notes,
    lignes: o.lignes.map((l) => ({
      medicament: l.medicament.nom,
      dosage: l.medicament.dosage,
      quantite: l.quantite,
      posologie: l.posologie,
      dureeJours: l.dureeJours,
    })),
    imagerie,
  };
}

function normaliser(v: string | null | undefined): string {
  return (v ?? "").trim().replace(/\s+/g, " ");
}

function comparerChamp(
  differences: DifferenceHistorique[],
  domaine: string,
  champ: string,
  avant: string,
  apres: string
) {
  const a = normaliser(avant);
  const b = normaliser(apres);
  if (a === b) return;
  if (!a && b) {
    differences.push({ domaine, champ, avant: "", apres: b, type: "ajoute" });
  } else if (a && !b) {
    differences.push({ domaine, champ, avant: a, apres: "", type: "retire" });
  } else {
    differences.push({ domaine, champ, avant: a, apres: b, type: "modifie" });
  }
}

/** Compare la consultation la plus ancienne à la plus récente (ordre chronologique). */
export function comparerConsultations(
  consultations: DonneesCrConsultation[]
): DifferenceHistorique[] {
  if (consultations.length < 2) return [];
  const triees = [...consultations].sort(
    (a, b) => new Date(a.debutLe).getTime() - new Date(b.debutLe).getTime()
  );
  const avant = triees[0];
  const apres = triees[triees.length - 1];
  const diffs: DifferenceHistorique[] = [];
  comparerChamp(diffs, "Consultation", "Motif", avant.motif, apres.motif);
  comparerChamp(diffs, "Consultation", "Anamnèse", avant.anamnese, apres.anamnese);
  comparerChamp(
    diffs,
    "Consultation",
    "Examen clinique",
    avant.examenClinique,
    apres.examenClinique
  );
  comparerChamp(
    diffs,
    "Consultation",
    "Conclusion",
    avant.conclusion,
    apres.conclusion
  );
  comparerChamp(
    diffs,
    "Consultation",
    "Diagnostics",
    avant.diagnostics.map((d) => d.libelle).join(", "),
    apres.diagnostics.map((d) => d.libelle).join(", ")
  );

  const svA = avant.signesVitaux;
  const svB = apres.signesVitaux;
  comparerChamp(
    diffs,
    "Signes vitaux",
    "Température",
    svA?.temperature != null ? String(svA.temperature) : "",
    svB?.temperature != null ? String(svB.temperature) : ""
  );
  comparerChamp(
    diffs,
    "Signes vitaux",
    "Tension",
    svA?.tensionSystolique != null && svA?.tensionDiastolique != null
      ? `${svA.tensionSystolique}/${svA.tensionDiastolique}`
      : "",
    svB?.tensionSystolique != null && svB?.tensionDiastolique != null
      ? `${svB.tensionSystolique}/${svB.tensionDiastolique}`
      : ""
  );
  comparerChamp(
    diffs,
    "Signes vitaux",
    "Poids",
    svA?.poidsKg != null ? String(svA.poidsKg) : "",
    svB?.poidsKg != null ? String(svB.poidsKg) : ""
  );
  return diffs;
}

export function comparerOrdonnances(
  ordonnances: DonneesOrdonnancePdf[]
): DifferenceHistorique[] {
  if (ordonnances.length < 2) return [];
  const triees = [...ordonnances].sort(
    (a, b) =>
      new Date(a.prescritLe).getTime() - new Date(b.prescritLe).getTime()
  );
  const avant = triees[0];
  const apres = triees[triees.length - 1];
  const diffs: DifferenceHistorique[] = [];

  const setA = new Map(
    avant.lignes.map((l) => [l.medicament.toLowerCase(), l])
  );
  const setB = new Map(
    apres.lignes.map((l) => [l.medicament.toLowerCase(), l])
  );

  for (const [cle, ligne] of setB) {
    if (!setA.has(cle)) {
      diffs.push({
        domaine: "Ordonnance",
        champ: ligne.medicament,
        avant: "",
        apres: `×${ligne.quantite}${ligne.posologie ? ` — ${ligne.posologie}` : ""}`,
        type: "ajoute",
      });
    } else {
      const old = setA.get(cle)!;
      comparerChamp(
        diffs,
        "Ordonnance",
        ligne.medicament,
        `×${old.quantite}${old.posologie ? ` — ${old.posologie}` : ""}`,
        `×${ligne.quantite}${ligne.posologie ? ` — ${ligne.posologie}` : ""}`
      );
    }
  }
  for (const [cle, ligne] of setA) {
    if (!setB.has(cle)) {
      diffs.push({
        domaine: "Ordonnance",
        champ: ligne.medicament,
        avant: `×${ligne.quantite}`,
        apres: "",
        type: "retire",
      });
    }
  }
  return diffs;
}

export function construireDifferencesHistorique(
  consultations: DonneesCrConsultation[],
  ordonnances: DonneesOrdonnancePdf[]
): DifferenceHistorique[] {
  return [
    ...comparerConsultations(consultations),
    ...comparerOrdonnances(ordonnances),
  ];
}
