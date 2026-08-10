import "server-only";
import { calculerAge } from "@/features/caisse/utils-format";
import { prisma } from "@/lib/prisma";
import { listerPatientsFileAttenteSalle } from "@/lib/transferts/visibilite-salle";
import type {
  ConstanteVitaleResume,
  DetailPatientInfirmiers,
  HistoriqueConstanteInfirmiers,
  PatientFileInfirmiers,
  StatsInfirmiersJour,
} from "@/lib/infirmiers/types";

const COULEURS_ORIENTATION: Record<string, string> = {
  Infirmiers: "bg-violet-100 text-violet-700",
  Réception: "bg-slate-100 text-slate-700",
  Caisse: "bg-rose-100 text-rose-700",
  Laboratoire: "bg-cyan-100 text-cyan-800",
  Pharmacie: "bg-emerald-100 text-emerald-800",
  Hospitalisation: "bg-indigo-100 text-indigo-800",
  Église: "bg-amber-100 text-amber-800",
  "Médecin externe": "bg-orange-100 text-orange-800",
  Médecin: "bg-blue-100 text-blue-700",
};

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

function raccourcirOrientation(nom: string): string {
  if (nom.startsWith("Médecin")) {
    return nom.includes("externe") ? "Médecin externe" : "Médecin";
  }
  if (nom.startsWith("Infirmier")) return "Infirmiers";
  if (nom.startsWith("Pharmacie")) return "Pharmacie";
  if (nom.startsWith("Caisse")) return "Caisse";
  if (nom.startsWith("Laboratoire")) return "Laboratoire";
  if (nom.startsWith("Hospitalisation")) return "Hospitalisation";
  if (nom.startsWith("Église") || nom.startsWith("Eglise")) return "Église";
  if (nom.startsWith("Réception") || nom.startsWith("Reception")) return "Réception";
  return nom;
}

export function decimalOuNull(
  valeur: { toNumber?: () => number } | number | string | null | undefined
): number | null {
  if (valeur == null) return null;
  if (typeof valeur === "number") return valeur;
  if (typeof valeur === "string") {
    const n = Number.parseFloat(valeur);
    return Number.isFinite(n) ? n : null;
  }
  if (typeof valeur.toNumber === "function") return valeur.toNumber();
  return null;
}

export function mapperConstante(c: {
  id: string;
  temperature: unknown;
  tensionSystolique: number | null;
  tensionDiastolique: number | null;
  frequenceCardiaque: number | null;
  frequenceRespiratoire: number | null;
  poidsKg: unknown;
  tailleCm: unknown;
  saturationO2: number | null;
  glycemie: unknown;
  observations: string | null;
  mesureLe: Date;
  formulaireClinique?: unknown;
  infirmier?: { prenom: string; nom: string } | null;
}): ConstanteVitaleResume {
  return {
    id: c.id,
    temperature: decimalOuNull(c.temperature as never),
    tensionSystolique: c.tensionSystolique,
    tensionDiastolique: c.tensionDiastolique,
    frequenceCardiaque: c.frequenceCardiaque,
    frequenceRespiratoire: c.frequenceRespiratoire,
    poidsKg: decimalOuNull(c.poidsKg as never),
    tailleCm: decimalOuNull(c.tailleCm as never),
    saturationO2: c.saturationO2,
    glycemie: decimalOuNull(c.glycemie as never),
    observations: c.observations,
    mesureLe: c.mesureLe.toISOString(),
    formulaireClinique: (c.formulaireClinique ?? null) as ConstanteVitaleResume["formulaireClinique"],
    infirmier: c.infirmier
      ? `${c.infirmier.prenom} ${c.infirmier.nom}`.trim()
      : undefined,
  };
}

function libelleStatut(opts: {
  hasConstantes: boolean;
  statutTransfert: string | null;
  enRecuperation: boolean;
}): { statut: string; statutCouleur: string } {
  if (opts.enRecuperation && opts.statutTransfert === "REFUSE") {
    return { statut: "Rejeté", statutCouleur: "bg-red-100 text-red-700" };
  }
  if (opts.statutTransfert === "EN_ATTENTE") {
    return { statut: "À confirmer", statutCouleur: "bg-orange-100 text-orange-800" };
  }
  if (opts.hasConstantes) {
    return { statut: "Constantes prises", statutCouleur: "bg-emerald-100 text-emerald-800" };
  }
  return { statut: "En attente", statutCouleur: "bg-amber-100 text-amber-800" };
}

function debutJourLocal(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export async function listerPatientsInfirmiers(): Promise<PatientFileInfirmiers[]> {
  const files = await listerPatientsFileAttenteSalle("INFIRMIERS");
  const dossierIds = files.map((f) => f.passage.dossier.id);
  const debut = debutJourLocal();

  const [constantesAujourdhui, transfertsSortants] = await Promise.all([
    dossierIds.length === 0
      ? Promise.resolve([])
      : prisma.constantesVitales.findMany({
          where: { dossierId: { in: dossierIds }, mesureLe: { gte: debut } },
          select: { dossierId: true },
        }),
    dossierIds.length === 0
      ? Promise.resolve([])
      : prisma.transfert.findMany({
          where: {
            dossierId: { in: dossierIds },
            salleOrigine: { code: "INFIRMIERS" },
            OR: [
              { statut: "EN_ATTENTE" },
              {
                statut: "REFUSE",
                recuperation: { statut: "EN_RECUPERATION" },
              },
            ],
          },
          include: {
            salleDestination: { select: { code: true, nom: true } },
            recuperation: { select: { statut: true } },
          },
          orderBy: { emisLe: "desc" },
        }),
  ]);

  const dossiersAvecConstantes = new Set(constantesAujourdhui.map((c) => c.dossierId));

  const sortantParDossier = new Map<string, (typeof transfertsSortants)[number][]>();
  for (const t of transfertsSortants) {
    const liste = sortantParDossier.get(t.dossierId) ?? [];
    liste.push(t);
    sortantParDossier.set(t.dossierId, liste);
  }

  return files.map((file) => {
    const dossier = file.passage.dossier;
    const patient = dossier.patient;
    const transfert = file.passage.transferts[0];
    const sortants = sortantParDossier.get(dossier.id) ?? [];
    const sortant = sortants[0];
    const enRecuperation = sortants.some(
      (s) => s.recuperation?.statut === "EN_RECUPERATION"
    );
    const hasConstantesAujourdhui = dossiersAvecConstantes.has(dossier.id);
    const orientation = sortants.length
      ? sortants.map((s) => raccourcirOrientation(s.salleDestination.nom)).join(", ")
      : "Infirmiers";
    const premiereOrientation = sortant
      ? raccourcirOrientation(sortant.salleDestination.nom)
      : "Infirmiers";
    const { statut, statutCouleur } = libelleStatut({
      hasConstantes: hasConstantesAujourdhui,
      statutTransfert: sortant?.statut ?? null,
      enRecuperation,
    });

    return {
      cleListe: file.id,
      dossierId: dossier.id,
      passageId: file.passageId,
      numeroPatient: patient.numeroPatient,
      numeroDossier: dossier.numeroDossier,
      nomComplet: `${patient.prenom} ${patient.nom}`.trim(),
      prenom: patient.prenom,
      nom: patient.nom,
      telephone: patient.telephone ?? "—",
      age: calculerAge(patient.dateNaissance?.toISOString() ?? null),
      sexe: patient.sexe ?? null,
      motif: transfert?.motif ?? file.passage.motif ?? "—",
      provenance:
        transfert?.salleOrigine?.nom?.trim() ||
        transfert?.salleOrigine?.code ||
        "—",
      orientation,
      orientationCouleur:
        COULEURS_ORIENTATION[premiereOrientation] ?? "bg-slate-100 text-slate-600",
      codeSalleDestination: sortant?.salleDestination.code ?? "INFIRMIERS",
      codesSalleDestination: sortants.map((s) => s.salleDestination.code),
      statut,
      statutCouleur,
      heure: formaterHeure(file.arriveLe.toISOString()),
      arriveeLe: file.arriveLe.toISOString(),
      transfertId: transfert?.id ?? null,
      transfertSortantId: sortant?.id ?? null,
      statutTransfertSortant: sortant?.statut ?? null,
      enRecuperation,
      numeroOrdre: file.numeroOrdre,
      hasConstantesAujourdhui,
    };
  });
}

export async function obtenirDetailPatientInfirmiers(
  dossierId: string
): Promise<DetailPatientInfirmiers | null> {
  const patients = await listerPatientsInfirmiers();
  let base = patients.find((p) => p.dossierId === dossierId) ?? null;

  if (!base) {
    const dossier = await prisma.dossierPatient.findUnique({
      where: { id: dossierId },
      include: { patient: true },
    });
    if (!dossier) return null;
    const patient = dossier.patient;
    const debut = debutJourLocal();
    const nb = await prisma.constantesVitales.count({
      where: { dossierId, mesureLe: { gte: debut } },
    });
    base = {
      cleListe: `hors-file-${dossier.id}`,
      dossierId: dossier.id,
      passageId: "",
      numeroPatient: patient.numeroPatient,
      numeroDossier: dossier.numeroDossier,
      nomComplet: `${patient.prenom} ${patient.nom}`.trim(),
      prenom: patient.prenom,
      nom: patient.nom,
      telephone: patient.telephone ?? "—",
      age: calculerAge(patient.dateNaissance?.toISOString() ?? null),
      sexe: patient.sexe ?? null,
      motif: "—",
      provenance: "—",
      orientation: "Infirmiers",
      orientationCouleur: "bg-violet-100 text-violet-700",
      codeSalleDestination: "INFIRMIERS",
      statut: nb > 0 ? "Constantes prises" : "Hors file",
      statutCouleur:
        nb > 0 ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600",
      heure: "—",
      arriveeLe: new Date().toISOString(),
      transfertId: null,
      transfertSortantId: null,
      statutTransfertSortant: null,
      enRecuperation: false,
      numeroOrdre: 0,
      hasConstantesAujourdhui: nb > 0,
    };
  }

  const constantes = await prisma.constantesVitales.findMany({
    where: { dossierId },
    include: { infirmier: { select: { prenom: true, nom: true } } },
    orderBy: { mesureLe: "desc" },
    take: 30,
  });

  const constantesVitales = constantes.map(mapperConstante);

  return {
    ...base,
    constantesVitales,
    derniereConstante: constantesVitales[0] ?? null,
  };
}

export async function obtenirStatsInfirmiers(): Promise<StatsInfirmiersJour> {
  const debut = debutJourLocal();
  const patients = await listerPatientsInfirmiers();

  const [constantesAujourdhui, transfertsSortantsAujourdhui] = await Promise.all([
    prisma.constantesVitales.count({ where: { mesureLe: { gte: debut } } }),
    prisma.transfert.count({
      where: {
        salleOrigine: { code: "INFIRMIERS" },
        emisLe: { gte: debut },
      },
    }),
  ]);

  return {
    patientsEnFile: patients.length,
    constantesAujourdhui,
    transfertsSortantsAujourdhui,
    arriveesFileIso: patients.map((p) => p.arriveeLe),
    dateReference: new Date().toISOString(),
  };
}

export async function listerHistoriqueConstantes(
  limit = 50
): Promise<HistoriqueConstanteInfirmiers[]> {
  const rows = await prisma.constantesVitales.findMany({
    take: limit,
    orderBy: { mesureLe: "desc" },
    include: {
      infirmier: { select: { prenom: true, nom: true } },
      dossier: {
        include: { patient: { select: { prenom: true, nom: true, numeroPatient: true } } },
      },
    },
  });

  return rows.map((r) => ({
    ...mapperConstante(r),
    dossierId: r.dossierId,
    numeroDossier: r.dossier.numeroDossier,
    numeroPatient: r.dossier.patient.numeroPatient,
    nomComplet: `${r.dossier.patient.prenom} ${r.dossier.patient.nom}`.trim(),
  }));
}
