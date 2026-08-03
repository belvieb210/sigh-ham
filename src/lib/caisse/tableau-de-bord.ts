import "server-only";
import type { StatutFacture } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { listerPatientsEnAttenteCaisse } from "@/lib/caisse/lister-patients-caisse";
import type {
  FactureAccueilResume,
  PatientAttenteAccueil,
  PointEvolutionEncaissement,
  StatutFactureAffiche,
  TableauDeBordAccueilCaisse,
} from "@/lib/caisse/types";

function decimalVersNombre(valeur: { toNumber?: () => number } | number | string): number {
  if (typeof valeur === "number") return valeur;
  if (typeof valeur === "string") return Number.parseFloat(valeur) || 0;
  if (valeur && typeof valeur.toNumber === "function") return valeur.toNumber();
  return Number(valeur) || 0;
}

function debutJournee(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function finJournee(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function variationPct(actuel: number, precedent: number): number | null {
  if (precedent === 0) return actuel > 0 ? 100 : null;
  return Math.round(((actuel - precedent) / precedent) * 100);
}

function statutAffiche(statut: StatutFacture): StatutFactureAffiche {
  if (statut === "PAYEE") return "PAYEE";
  if (statut === "PARTIELLEMENT_PAYEE") return "PARTIELLE";
  return "IMPAYEE";
}

function formaterTempsAttente(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${m}`;
}

function resumeExamens(libelles: string[], max = 3): string {
  const propres = libelles.map((l) => l.trim()).filter(Boolean);
  if (propres.length === 0) return "—";
  if (propres.length <= max) return propres.join(", ");
  return `${propres.slice(0, max).join(", ")}…`;
}

function serviceDepuisCategories(categories: string[]): string {
  const uniques = [...new Set(categories.map((c) => c.trim()).filter(Boolean))];
  if (uniques.length === 0) return "Laboratoire";
  return uniques[0]!;
}

function labelJourCourt(date: Date, locale = "fr-FR"): string {
  return date.toLocaleDateString(locale, { day: "2-digit", month: "short" });
}

async function agregatsJour(debut: Date, fin: Date) {
  const [factures, paiements] = await Promise.all([
    prisma.facture.findMany({
      where: { createdAt: { gte: debut, lte: fin }, statut: { not: "ANNULEE" } },
      select: { montantTotal: true },
    }),
    prisma.paiement.findMany({
      where: { payeLe: { gte: debut, lte: fin } },
      select: { montant: true },
    }),
  ]);

  const montantFactures = factures.reduce((acc, f) => acc + decimalVersNombre(f.montantTotal), 0);
  const montantPaiements = paiements.reduce((acc, p) => acc + decimalVersNombre(p.montant), 0);

  return {
    facturesCount: factures.length,
    facturesMontant: montantFactures,
    paiementsCount: paiements.length,
    paiementsMontant: montantPaiements,
  };
}

export async function obtenirTableauDeBordAccueilCaisse(): Promise<TableauDeBordAccueilCaisse> {
  const maintenant = new Date();
  const debutAuj = debutJournee(maintenant);
  const finAuj = finJournee(maintenant);
  const debutHierSeul = new Date(debutAuj);
  debutHierSeul.setDate(debutHierSeul.getDate() - 1);
  const finHierSeul = finJournee(debutHierSeul);

  const debutSerie = new Date(debutAuj);
  debutSerie.setDate(debutSerie.getDate() - 6);

  const [
    agregatsAuj,
    agregatsHier,
    patientsFile,
    facturesImpayeesRows,
    dernieresFacturesRows,
    paiementsSerie,
    dernierPaiement,
  ] = await Promise.all([
    agregatsJour(debutAuj, finAuj),
    agregatsJour(debutHierSeul, finHierSeul),
    listerPatientsEnAttenteCaisse(),
    prisma.facture.findMany({
      where: { statut: { in: ["EMISE", "PARTIELLEMENT_PAYEE", "BROUILLON"] } },
      select: { montantTotal: true, montantPaye: true },
    }),
    prisma.facture.findMany({
      where: { statut: { not: "ANNULEE" } },
      include: {
        lignes: { select: { libelle: true }, take: 6 },
        dossier: {
          include: {
            patient: { select: { prenom: true, nom: true } },
            examensLaboratoire: {
              where: { statut: { not: "ANNULE" } },
              include: { typeExamen: { select: { libelle: true } } },
              take: 6,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.paiement.findMany({
      where: { payeLe: { gte: debutSerie, lte: finAuj } },
      select: { montant: true, payeLe: true },
    }),
    prisma.paiement.findFirst({
      orderBy: { payeLe: "desc" },
      select: { id: true },
    }),
  ]);

  const montantImpaye = facturesImpayeesRows.reduce((acc, f) => {
    const reste = Math.max(0, decimalVersNombre(f.montantTotal) - decimalVersNombre(f.montantPaye));
    return acc + reste;
  }, 0);

  const dernieresFactures: FactureAccueilResume[] = dernieresFacturesRows.map((f) => {
    const libellesLignes = f.lignes.map((l) => l.libelle);
    const libellesExamens = f.dossier.examensLaboratoire.map((e) => e.typeExamen.libelle);
    const examens = resumeExamens(libellesLignes.length > 0 ? libellesLignes : libellesExamens);

    return {
      id: f.id,
      dossierId: f.dossierId,
      numeroFacture: f.numeroFacture,
      patient: `${f.dossier.patient.prenom} ${f.dossier.patient.nom}`,
      examens,
      montantTotal: decimalVersNombre(f.montantTotal),
      devise: f.devise,
      statut: f.statut,
      statutAffiche: statutAffiche(f.statut),
    };
  });

  const patientsAttente: PatientAttenteAccueil[] = patientsFile.slice(0, 6).map((p) => {
    const minutes = Math.max(0, Math.floor((maintenant.getTime() - new Date(p.arriveeLe).getTime()) / 60000));
    return {
      dossierId: p.dossierId,
      patient: `${p.prenom} ${p.nom}`,
      service: "Laboratoire",
      examensDemandes: p.nombreExamens > 0 ? `${p.nombreExamens} examen(s)` : "—",
      minutesAttente: minutes,
      tempsAttenteLabel: formaterTempsAttente(minutes),
    };
  });

  // Enrichir service / examens depuis la file détaillée si disponible
  const dossiersIds = patientsAttente.map((p) => p.dossierId);
  if (dossiersIds.length > 0) {
    const dossiers = await prisma.dossierPatient.findMany({
      where: { id: { in: dossiersIds } },
      select: {
        id: true,
        examensLaboratoire: {
          where: { statut: { not: "ANNULE" } },
          include: { typeExamen: { select: { libelle: true, categorie: true } } },
        },
      },
    });
    const map = new Map(dossiers.map((d) => [d.id, d]));
    for (const patient of patientsAttente) {
      const d = map.get(patient.dossierId);
      if (!d) continue;
      patient.service = serviceDepuisCategories(d.examensLaboratoire.map((e) => e.typeExamen.categorie));
      patient.examensDemandes = resumeExamens(d.examensLaboratoire.map((e) => e.typeExamen.libelle));
    }
  }

  const montantsParJour = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const d = new Date(debutSerie);
    d.setDate(debutSerie.getDate() + i);
    const cle = d.toISOString().slice(0, 10);
    montantsParJour.set(cle, 0);
  }
  for (const p of paiementsSerie) {
    const cle = p.payeLe.toISOString().slice(0, 10);
    if (!montantsParJour.has(cle)) continue;
    montantsParJour.set(cle, (montantsParJour.get(cle) ?? 0) + decimalVersNombre(p.montant));
  }

  const evolutionEncaissements: PointEvolutionEncaissement[] = [...montantsParJour.entries()].map(
    ([date, montant]) => ({
      date,
      label: labelJourCourt(new Date(`${date}T12:00:00`)),
      montant,
    })
  );

  return {
    dateReference: maintenant.toISOString(),
    patientsEnAttente: patientsFile.length,
    facturesDuJour: agregatsAuj.facturesCount,
    encaissementsDuJour: agregatsAuj.paiementsCount,
    montantEncaisseDuJour: agregatsAuj.paiementsMontant,
    kpis: {
      facturesDuJour: {
        count: agregatsAuj.facturesCount,
        montantTotal: agregatsAuj.facturesMontant,
        variationPct: variationPct(agregatsAuj.facturesCount, agregatsHier.facturesCount),
      },
      paiementsDuJour: {
        count: agregatsAuj.paiementsCount,
        montantTotal: agregatsAuj.paiementsMontant,
        variationPct: variationPct(agregatsAuj.paiementsCount, agregatsHier.paiementsCount),
      },
      montantEncaisse: {
        montant: agregatsAuj.paiementsMontant,
        variationPct: variationPct(agregatsAuj.paiementsMontant, agregatsHier.paiementsMontant),
      },
      patientsEnAttente: { count: patientsFile.length },
      facturesImpayees: {
        count: facturesImpayeesRows.length,
        montantTotal: montantImpaye,
      },
    },
    dernieresFactures,
    evolutionEncaissements,
    patientsAttente,
    dernierPaiementId: dernierPaiement?.id ?? null,
  };
}
