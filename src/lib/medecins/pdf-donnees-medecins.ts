import type {
  BrandingPdfLabo,
} from "@/features/medecins/en-tete-pdf-labo";
import type {
  DonneesCrConsultation,
  SignesVitauxPdf,
} from "@/features/medecins/consultation-pdf";
import type { DifferenceHistorique } from "@/features/medecins/historique-dossier-pdf";
import type { DonneesOrdonnancePdf } from "@/features/medecins/ordonnance-pdf";
import type {
  ConstanteVitaleResume,
  ConsultationDetailMedecins,
  FormulaireCliniqueMedecins,
  OrdonnanceMedecins,
} from "@/lib/medecins/types";

function fusionnerSignesVitaux(
  sv?: FormulaireCliniqueMedecins["signesVitaux"] | null,
  constantes?: ConstanteVitaleResume | null
): SignesVitauxPdf | null {
  const hasSv =
    sv &&
    Object.values(sv).some((v) => v !== null && v !== undefined);
  if (hasSv && sv) {
    return {
      temperature: sv.temperature ?? constantes?.temperature ?? null,
      tensionSystolique:
        sv.tensionSystolique ?? constantes?.tensionSystolique ?? null,
      tensionDiastolique:
        sv.tensionDiastolique ?? constantes?.tensionDiastolique ?? null,
      frequenceCardiaque:
        sv.frequenceCardiaque ?? constantes?.frequenceCardiaque ?? null,
      frequenceRespiratoire: constantes?.frequenceRespiratoire ?? null,
      poidsKg: sv.poidsKg ?? constantes?.poidsKg ?? null,
      tailleCm: sv.tailleCm ?? constantes?.tailleCm ?? null,
      saturationO2: sv.saturationO2 ?? constantes?.saturationO2 ?? null,
      glycemie: constantes?.glycemie ?? null,
    };
  }
  if (!constantes) return null;
  return {
    temperature: constantes.temperature,
    tensionSystolique: constantes.tensionSystolique,
    tensionDiastolique: constantes.tensionDiastolique,
    frequenceCardiaque: constantes.frequenceCardiaque,
    frequenceRespiratoire: constantes.frequenceRespiratoire,
    poidsKg: constantes.poidsKg,
    tailleCm: constantes.tailleCm,
    saturationO2: constantes.saturationO2,
    glycemie: constantes.glycemie,
  };
}

export function consultationVersDonneesPdf(
  c: ConsultationDetailMedecins,
  extras?: {
    constantesVitales?: ConstanteVitaleResume | null;
    branding?: BrandingPdfLabo | null;
  }
): DonneesCrConsultation {
  const sv = fusionnerSignesVitaux(
    c.formulaireClinique?.signesVitaux,
    extras?.constantesVitales
  );
  return {
    hopital: extras?.branding?.nom ?? "HAM LABORATOIRE",
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
    signesVitaux: sv,
    debutLe: c.debutLe,
    finLe: c.finLe,
    branding: extras?.branding ?? null,
  };
}

export function ordonnanceVersDonneesPdf(
  o: OrdonnanceMedecins,
  extras?: {
    telephone?: string | null;
    age?: number | null;
    sexe?: string | null;
    detailsPrescription?: Record<string, unknown> | null;
    constantesVitales?: ConstanteVitaleResume | null;
    signesVitauxConsultation?: FormulaireCliniqueMedecins["signesVitaux"] | null;
    branding?: BrandingPdfLabo | null;
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
    signesVitaux: fusionnerSignesVitaux(
      extras?.signesVitauxConsultation,
      extras?.constantesVitales
    ),
    branding: extras?.branding ?? null,
  };
}

function normaliser(v: string | null | undefined): string {
  return (v ?? "").trim().replace(/\s+/g, " ");
}

function comparerChamp(
  differences: DifferenceHistorique[],
  domaine: string,
  champ: string,
  avant: string | null | undefined,
  apres: string | null | undefined
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

/** Compare deux consultations (ordre chronologique A→B). */
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
  comparerChamp(diffs, "Consultation", "Médecin", avant.medecin, apres.medecin);

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
    "Fréquence cardiaque",
    svA?.frequenceCardiaque != null ? String(svA.frequenceCardiaque) : "",
    svB?.frequenceCardiaque != null ? String(svB.frequenceCardiaque) : ""
  );
  comparerChamp(
    diffs,
    "Signes vitaux",
    "Fréquence respiratoire",
    svA?.frequenceRespiratoire != null ? String(svA.frequenceRespiratoire) : "",
    svB?.frequenceRespiratoire != null ? String(svB.frequenceRespiratoire) : ""
  );
  comparerChamp(
    diffs,
    "Signes vitaux",
    "Poids",
    svA?.poidsKg != null ? String(svA.poidsKg) : "",
    svB?.poidsKg != null ? String(svB.poidsKg) : ""
  );
  comparerChamp(
    diffs,
    "Signes vitaux",
    "Taille",
    svA?.tailleCm != null ? String(svA.tailleCm) : "",
    svB?.tailleCm != null ? String(svB.tailleCm) : ""
  );
  comparerChamp(
    diffs,
    "Signes vitaux",
    "SpO₂",
    svA?.saturationO2 != null ? String(svA.saturationO2) : "",
    svB?.saturationO2 != null ? String(svB.saturationO2) : ""
  );
  comparerChamp(
    diffs,
    "Signes vitaux",
    "Glycémie",
    svA?.glycemie != null ? String(svA.glycemie) : "",
    svB?.glycemie != null ? String(svB.glycemie) : ""
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

  comparerChamp(diffs, "Ordonnance", "Médecin", avant.medecin, apres.medecin);
  comparerChamp(diffs, "Ordonnance", "Notes", avant.notes, apres.notes);

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
        apres: `×${ligne.quantite}${ligne.dosage ? ` (${ligne.dosage})` : ""}${ligne.posologie ? ` — ${ligne.posologie}` : ""}${ligne.dureeJours != null ? ` · ${ligne.dureeJours} j` : ""}`,
        type: "ajoute",
      });
    } else {
      const old = setA.get(cle)!;
      comparerChamp(
        diffs,
        "Ordonnance",
        ligne.medicament,
        `×${old.quantite}${old.dosage ? ` (${old.dosage})` : ""}${old.posologie ? ` — ${old.posologie}` : ""}${old.dureeJours != null ? ` · ${old.dureeJours} j` : ""}`,
        `×${ligne.quantite}${ligne.dosage ? ` (${ligne.dosage})` : ""}${ligne.posologie ? ` — ${ligne.posologie}` : ""}${ligne.dureeJours != null ? ` · ${ligne.dureeJours} j` : ""}`
      );
    }
  }
  for (const [cle, ligne] of setA) {
    if (!setB.has(cle)) {
      diffs.push({
        domaine: "Ordonnance",
        champ: ligne.medicament,
        avant: `×${ligne.quantite}${ligne.dosage ? ` (${ligne.dosage})` : ""}`,
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
