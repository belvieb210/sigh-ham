import "server-only";
import { calculerAge } from "@/features/caisse/utils-format";
import { listerPatientsPharmacie } from "@/lib/pharmacie/lister-patients-pharmacie";
import { numeroIdentitePersonne } from "@/lib/pharmacie/client-walk-in";
import { prisma } from "@/lib/prisma";

export interface ClientVentePharmacie {
  dossierId: string;
  numeroDossier: string;
  numeroPatient: string;
  prenom: string;
  nom: string;
  nomComplet: string;
  telephone: string;
  age: number | null;
  sexe: string | null;
  adresse: string | null;
  provenance: string;
  heure: string;
  arriveeLe: string;
  source: "FILE" | "CLIENT" | "ORDONNANCE";
  nbMedicaments: number;
  montantEstime: number;
}

function formaterHeure(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function decimal(v: { toNumber?: () => number } | number | string) {
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number.parseFloat(v) || 0;
  if (v && typeof v.toNumber === "function") return v.toNumber();
  return Number(v) || 0;
}

export async function listerClientsVentePharmacie(): Promise<ClientVentePharmacie[]> {
  const debut = new Date();
  debut.setHours(0, 0, 0, 0);

  const [file, clientsJour, ordonnances] = await Promise.all([
    listerPatientsPharmacie(),
    prisma.dossierPatient.findMany({
      where: {
        numeroDossier: { startsWith: "PH-" },
        createdAt: { gte: debut },
        motifOuverture: "Vente pharmacie",
      },
      include: {
        patient: true,
        ventesPharmacie: {
          where: { statut: { in: ["BROUILLON", "TRANSMISE", "PAYEE", "DELIVREE"] } },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.ordonnance.findMany({
      where: {
        statut: { in: ["EN_ATTENTE", "PARTIELLEMENT_DELIVREE"] },
        lignes: { some: {} },
      },
      include: {
        dossier: { include: { patient: true } },
        lignes: { include: { medicament: true } },
      },
      orderBy: { prescritLe: "desc" },
      take: 30,
    }),
  ]);

  const map = new Map<string, ClientVentePharmacie>();

  for (const p of file) {
    map.set(p.dossierId, {
      dossierId: p.dossierId,
      numeroDossier: p.numeroDossier,
      numeroPatient: p.numeroPatient,
      prenom: p.prenom,
      nom: p.nom,
      nomComplet: p.nomComplet,
      telephone: p.telephone,
      age: p.age,
      sexe: p.sexe,
      adresse: null,
      provenance: p.provenance || "File pharmacie",
      heure: p.heure,
      arriveeLe: p.arriveeLe,
      source: "FILE",
      nbMedicaments: 0,
      montantEstime: 0,
    });
  }

  for (const o of ordonnances) {
    const patient = o.dossier.patient;
    const montant = o.lignes.reduce(
      (s, l) => s + decimal(l.medicament.prixUnitaire) * l.quantite,
      0
    );
    const existant = map.get(o.dossierId);
    if (existant) {
      existant.nbMedicaments = o.lignes.length;
      existant.montantEstime = montant;
      existant.source = "ORDONNANCE";
      continue;
    }
    map.set(o.dossierId, {
      dossierId: o.dossierId,
      numeroDossier: o.dossier.numeroDossier,
      numeroPatient: numeroIdentitePersonne(o.dossier.numeroDossier, patient.numeroPatient),
      prenom: patient.prenom,
      nom: patient.nom,
      nomComplet: `${patient.prenom} ${patient.nom}`.trim(),
      telephone: patient.telephone ?? "—",
      age: calculerAge(patient.dateNaissance?.toISOString() ?? null),
      sexe: patient.sexe,
      adresse: patient.adresse,
      provenance: "Ordonnance médicale",
      heure: formaterHeure(o.prescritLe.toISOString()),
      arriveeLe: o.prescritLe.toISOString(),
      source: "ORDONNANCE",
      nbMedicaments: o.lignes.length,
      montantEstime: montant,
    });
  }

  for (const d of clientsJour) {
    if (d.ventesPharmacie.length > 0) continue;
    if (map.has(d.id)) continue;
    const patient = d.patient;
    map.set(d.id, {
      dossierId: d.id,
      numeroDossier: d.numeroDossier,
      numeroPatient: numeroIdentitePersonne(d.numeroDossier, patient.numeroPatient),
      prenom: patient.prenom,
      nom: patient.nom,
      nomComplet: `${patient.prenom} ${patient.nom}`.trim(),
      telephone: patient.telephone ?? "—",
      age: calculerAge(patient.dateNaissance?.toISOString() ?? null),
      sexe: patient.sexe,
      adresse: patient.adresse,
      provenance: "Client enregistré",
      heure: formaterHeure(d.createdAt.toISOString()),
      arriveeLe: d.createdAt.toISOString(),
      source: "CLIENT",
      nbMedicaments: 0,
      montantEstime: 0,
    });
  }

  return [...map.values()].sort(
    (a, b) => new Date(b.arriveeLe).getTime() - new Date(a.arriveeLe).getTime()
  );
}
