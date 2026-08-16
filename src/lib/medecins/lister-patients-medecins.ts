import "server-only";
import { calculerAge } from "@/features/caisse/utils-format";
import { prisma } from "@/lib/prisma";
import { listerPatientsFileAttenteSalle } from "@/lib/transferts/visibilite-salle";
import type {
  ConstanteVitaleResume,
  ConsultationResume,
  DetailPatientMedecins,
  PatientFileMedecins,
  StatsMedecinsJour,
} from "@/lib/medecins/types";

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

function decimalOuNull(
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

function libelleStatut(opts: {
  consultationOuverte: boolean;
  statutTransfert: string | null;
  enRecuperation: boolean;
}): { statut: string; statutCouleur: string } {
  if (opts.enRecuperation && opts.statutTransfert === "REFUSE") {
    return { statut: "Rejeté", statutCouleur: "bg-red-100 text-red-700" };
  }
  if (opts.statutTransfert === "EN_ATTENTE") {
    return { statut: "À confirmer", statutCouleur: "bg-orange-100 text-orange-800" };
  }
  if (opts.consultationOuverte) {
    return { statut: "En consultation", statutCouleur: "bg-blue-100 text-blue-700" };
  }
  return { statut: "En attente", statutCouleur: "bg-amber-100 text-amber-800" };
}

function debutJourLocal(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function dedupliquerParDossierMedecins(
  patients: PatientFileMedecins[]
): PatientFileMedecins[] {
  const parDossier = new Map<string, PatientFileMedecins>();
  for (const p of patients) {
    const existant = parDossier.get(p.dossierId);
    if (!existant) {
      parDossier.set(p.dossierId, p);
      continue;
    }
    const score = (x: PatientFileMedecins) => {
      let s = new Date(x.arriveeLe).getTime();
      if (x.provenance.toLowerCase().includes("infirmier")) s += 1_000;
      if (x.consultationOuverteId) s += 10_000;
      return s;
    };
    parDossier.set(p.dossierId, score(p) >= score(existant) ? p : existant);
  }
  return [...parDossier.values()].sort(
    (a, b) => new Date(b.arriveeLe).getTime() - new Date(a.arriveeLe).getTime()
  );
}

export async function listerPatientsMedecins(): Promise<PatientFileMedecins[]> {
  const files = await listerPatientsFileAttenteSalle("MEDECINS");
  const dossierIds = files.map((f) => f.passage.dossier.id);

  const [consultationsOuvertes, transfertsSortants] = await Promise.all([
    dossierIds.length === 0
      ? Promise.resolve([])
      : prisma.consultation.findMany({
          where: { dossierId: { in: dossierIds }, finLe: null },
          select: { id: true, dossierId: true },
          orderBy: { debutLe: "desc" },
        }),
    dossierIds.length === 0
      ? Promise.resolve([])
      : prisma.transfert.findMany({
          where: {
            dossierId: { in: dossierIds },
            salleOrigine: { code: "MEDECINS" },
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

  const consultationParDossier = new Map<string, string>();
  for (const c of consultationsOuvertes) {
    if (!consultationParDossier.has(c.dossierId)) {
      consultationParDossier.set(c.dossierId, c.id);
    }
  }

  const sortantParDossier = new Map<string, (typeof transfertsSortants)[number][]>();
  for (const t of transfertsSortants) {
    const liste = sortantParDossier.get(t.dossierId) ?? [];
    liste.push(t);
    sortantParDossier.set(t.dossierId, liste);
  }

  const patients = files.map((file) => {
    const dossier = file.passage.dossier;
    const patient = dossier.patient;
    const transfert = file.passage.transferts[0];
    const sortants = sortantParDossier.get(dossier.id) ?? [];
    const sortant = sortants[0];
    const enRecuperation = sortants.some(
      (s) => s.recuperation?.statut === "EN_RECUPERATION"
    );
    const consultationOuverteId = consultationParDossier.get(dossier.id) ?? null;
    const orientation = sortants.length
      ? sortants.map((s) => raccourcirOrientation(s.salleDestination.nom)).join(", ")
      : "Médecin";
    const premiereOrientation = sortant
      ? raccourcirOrientation(sortant.salleDestination.nom)
      : "Médecin";
    const { statut, statutCouleur } = libelleStatut({
      consultationOuverte: Boolean(consultationOuverteId),
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
      codeSalleDestination: sortant?.salleDestination.code ?? "MEDECINS",
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
      consultationOuverteId,
    };
  });

  return dedupliquerParDossierMedecins(patients);
}

export async function obtenirDetailPatientMedecins(
  dossierId: string
): Promise<DetailPatientMedecins | null> {
  const patients = await listerPatientsMedecins();
  let base = patients.find((p) => p.dossierId === dossierId) ?? null;

  if (!base) {
    const dossier = await prisma.dossierPatient.findUnique({
      where: { id: dossierId },
      include: { patient: true },
    });
    if (!dossier) return null;

    const ouverte = await prisma.consultation.findFirst({
      where: { dossierId, finLe: null },
      select: { id: true },
      orderBy: { debutLe: "desc" },
    });

    const patient = dossier.patient;
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
      orientation: "Médecin",
      orientationCouleur: "bg-blue-100 text-blue-700",
      codeSalleDestination: "MEDECINS",
      statut: ouverte ? "En consultation" : "Hors file",
      statutCouleur: ouverte
        ? "bg-blue-100 text-blue-700"
        : "bg-slate-100 text-slate-600",
      heure: "—",
      arriveeLe: new Date().toISOString(),
      transfertId: null,
      transfertSortantId: null,
      statutTransfertSortant: null,
      enRecuperation: false,
      numeroOrdre: 0,
      consultationOuverteId: ouverte?.id ?? null,
    };
  }

  const [constantes, consultations] = await Promise.all([
    prisma.constantesVitales.findFirst({
      where: { dossierId },
      orderBy: { mesureLe: "desc" },
    }),
    prisma.consultation.findMany({
      where: { dossierId },
      include: { medecin: { select: { prenom: true, nom: true } } },
      orderBy: { debutLe: "desc" },
      take: 20,
    }),
  ]);

  const constantesVitales: ConstanteVitaleResume | null = constantes
    ? {
        id: constantes.id,
        temperature: decimalOuNull(constantes.temperature),
        tensionSystolique: constantes.tensionSystolique,
        tensionDiastolique: constantes.tensionDiastolique,
        frequenceCardiaque: constantes.frequenceCardiaque,
        frequenceRespiratoire: constantes.frequenceRespiratoire,
        poidsKg: decimalOuNull(constantes.poidsKg),
        tailleCm: decimalOuNull(constantes.tailleCm),
        saturationO2: constantes.saturationO2,
        glycemie: decimalOuNull(constantes.glycemie),
        observations: constantes.observations,
        mesureLe: constantes.mesureLe.toISOString(),
        formulaireClinique:
          constantes.formulaireClinique as ConstanteVitaleResume["formulaireClinique"],
      }
    : null;

  const consultationsResume: ConsultationResume[] = consultations.map((c) => ({
    id: c.id,
    motif: c.motif,
    debutLe: c.debutLe.toISOString(),
    finLe: c.finLe?.toISOString() ?? null,
    medecin: `${c.medecin.prenom} ${c.medecin.nom}`.trim(),
  }));

  return {
    ...base,
    constantesVitales,
    consultations: consultationsResume,
  };
}

export async function obtenirStatsMedecins(): Promise<StatsMedecinsJour> {
  const debut = debutJourLocal();
  const patients = await listerPatientsMedecins();

  const [
    consultationsAujourdhui,
    ordonnancesAujourdhui,
    examensAujourdhui,
    patientsTransferesCaisse,
    admissionsActives,
  ] = await Promise.all([
    prisma.consultation.count({
      where: { debutLe: { gte: debut } },
    }),
    prisma.ordonnance.count({
      where: { prescritLe: { gte: debut } },
    }),
    prisma.examenLaboratoire.count({
      where: { createdAt: { gte: debut } },
    }),
    prisma.transfert.count({
      where: {
        salleOrigine: { code: "MEDECINS" },
        salleDestination: { code: "CAISSE" },
        OR: [
          { statut: "EN_ATTENTE" },
          {
            statut: { in: ["ACCEPTE", "EN_TRAITEMENT", "TERMINE"] },
            emisLe: { gte: debut },
          },
        ],
      },
    }),
    prisma.admission.count({
      where: {
        sortiLe: null,
        statut: { in: ["ADMIS", "EN_SOINS"] },
      },
    }),
  ]);

  return {
    patientsEnFile: patients.length,
    consultationsAujourdhui,
    ordonnancesAujourdhui,
    examensAujourdhui,
    patientsTransferesCaisse,
    admissionsActives,
    arriveesFileIso: patients.map((p) => p.arriveeLe),
    dateReference: new Date().toISOString(),
  };
}

export async function obtenirApercuDashboardMedecins(): Promise<
  import("@/lib/medecins/types").ApercuDashboardMedecins
> {
  const debut = debutJourLocal();
  const [stats, file] = await Promise.all([
    obtenirStatsMedecins(),
    listerPatientsMedecins(),
  ]);

  const enConsultation = file.find((p) => p.consultationOuverteId);
  const cible = enConsultation ?? file[0] ?? null;
  const consultationEnCours = cible
    ? await obtenirDetailPatientMedecins(cible.dossierId)
    : null;

  let diagnosticsEnCours: import("@/lib/medecins/types").DiagnosticConsultationMedecins[] =
    [];
  const consultationOuverteId =
    cible?.consultationOuverteId ??
    consultationEnCours?.consultationOuverteId ??
    null;
  if (consultationOuverteId) {
    const diags = await prisma.diagnostic.findMany({
      where: { consultationId: consultationOuverteId },
      orderBy: [{ principal: "desc" }, { libelle: "asc" }],
    });
    diagnosticsEnCours = diags.map((d) => ({
      id: d.id,
      codeCim: d.codeCim,
      libelle: d.libelle,
      principal: d.principal,
    }));
  }

  const [ordonnances, examens, transferts] = await Promise.all([
    prisma.ordonnance.findMany({
      where: { prescritLe: { gte: debut } },
      include: {
        dossier: { include: { patient: true } },
      },
      orderBy: { prescritLe: "desc" },
      take: 8,
    }),
    prisma.examenLaboratoire.findMany({
      where: { createdAt: { gte: debut } },
      include: {
        dossier: { include: { patient: true } },
        typeExamen: { select: { libelle: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.transfert.findMany({
      where: {
        salleOrigine: { code: "MEDECINS" },
        salleDestination: { code: "CAISSE" },
        emisLe: { gte: debut },
      },
      include: {
        dossier: { include: { patient: true } },
      },
      orderBy: { emisLe: "desc" },
      take: 8,
    }),
  ]);

  type Act = import("@/lib/medecins/types").ActiviteRecenteMedecins;
  const activites: Act[] = [
    ...ordonnances.map((o) => ({
      id: `ord-${o.id}`,
      type: "ORDONNANCE" as const,
      libelle: "Ordonnance émise",
      patient: `${o.dossier.patient.prenom} ${o.dossier.patient.nom}`.trim(),
      heure: formaterHeure(o.prescritLe.toISOString()),
      iso: o.prescritLe.toISOString(),
    })),
    ...examens.map((e) => ({
      id: `ex-${e.id}`,
      type: "EXAMEN" as const,
      libelle: `Examen demandé — ${e.typeExamen.libelle}`,
      patient: `${e.dossier.patient.prenom} ${e.dossier.patient.nom}`.trim(),
      heure: formaterHeure(e.createdAt.toISOString()),
      iso: e.createdAt.toISOString(),
    })),
    ...transferts.map((t) => ({
      id: `tr-${t.id}`,
      type: "TRANSFERT_CAISSE" as const,
      libelle: "Transmis à la caisse",
      patient: `${t.dossier.patient.prenom} ${t.dossier.patient.nom}`.trim(),
      heure: formaterHeure(t.emisLe.toISOString()),
      iso: t.emisLe.toISOString(),
    })),
  ]
    .sort((a, b) => b.iso.localeCompare(a.iso))
    .slice(0, 10);

  return {
    stats,
    file: file.slice(0, 8),
    consultationEnCours,
    diagnosticsEnCours,
    activites,
  };
}
