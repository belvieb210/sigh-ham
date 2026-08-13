import { normaliserCleTypeExamen } from "@/lib/laboratoire/pdf-resultats/aliases-types-examen";
import type { DonneesExamenResultatPdf } from "@/lib/laboratoire/pdf-resultats/types";

function sansAccent(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const MOTS_CLES: { pattern: RegExp; type: string }[] = [
  { pattern: /hemogramme|nfs|num[\s-]?formule|nfl/i, type: "hemogramme" },
  { pattern: /ionogramme/i, type: "ionogramme" },
  { pattern: /groupage|groupe\s*sanguin/i, type: "groupageSanguin" },
  { pattern: /selles\s*routine/i, type: "sellesRoutines" },
  { pattern: /urines\s*routine/i, type: "urinesRoutines" },
  { pattern: /sediment/i, type: "sedimentUrinaire" },
  { pattern: /salmonella/i, type: "salmonella" },
  { pattern: /widal/i, type: "widal" },
  { pattern: /serologie|seriologie/i, type: "serologie" },
  { pattern: /malaria.*goutte|goutte.*epaisse|malaria_ge|malaria_tdr/i, type: "malariaTDR" },
  { pattern: /malaria|paludisme|plasmodium/i, type: "malaria" },
  { pattern: /spermogramme/i, type: "spermogramme" },
  { pattern: /microfilaire|filaire/i, type: "microfilaire" },
  { pattern: /goutte\s*fraiche/i, type: "goutteFraiche" },
  { pattern: /electrophorese|electrophore|hemoglobine.*variante/i, type: "electrophorese" },
  { pattern: /ziehl|nelsen|\bzn\b/i, type: "ziehlNelsen" },
  { pattern: /rivalta/i, type: "rivalta" },
  { pattern: /binces.?jones/i, type: "proteineBincesJones" },
  { pattern: /trypanosom/i, type: "trypanosomiase" },
  { pattern: /sang\s*occulte/i, type: "sangOcculte" },
  { pattern: /histopatho/i, type: "histopathologie" },
  { pattern: /charge\s*viral/i, type: "chargeViral" },
  { pattern: /torch/i, type: "bilansTorch" },
  { pattern: /hemoculture/i, type: "hemoculture" },
  { pattern: /coproculture/i, type: "coproculture" },
  { pattern: /microbiologie/i, type: "microbiologie" },
  { pattern: /coagulation|cephaline|tca/i, type: "coagulation" },
];

export function detecterTypeExamenPdf(
  examen: Pick<
    DonneesExamenResultatPdf,
    "typeCode" | "typeFormulaire" | "libelle"
  >
): string {
  const candidats = [
    examen.typeFormulaire,
    examen.typeCode,
    examen.libelle,
  ].filter(Boolean) as string[];

  for (const brut of candidats) {
    const normalise = normaliserCleTypeExamen(brut);
    if (normalise !== "generic" && normalise !== brut.replace(/_/g, "")) {
      return normalise;
    }
    if (brut && normaliserCleTypeExamen(brut) !== "generic") {
      return normaliserCleTypeExamen(brut);
    }
  }

  for (const brut of candidats) {
    const texte = sansAccent(brut);
    for (const { pattern, type } of MOTS_CLES) {
      if (pattern.test(texte) || pattern.test(brut)) return type;
    }
  }

  if (examen.typeFormulaire) {
    return normaliserCleTypeExamen(examen.typeFormulaire);
  }
  if (examen.typeCode) {
    return normaliserCleTypeExamen(examen.typeCode);
  }

  return "generic";
}
