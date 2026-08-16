import "server-only";
import { calculerAge } from "@/features/caisse/utils-format";
import { prisma } from "@/lib/prisma";
import { listerPatientsFileAttenteSalle } from "@/lib/transferts/visibilite-salle";
import type {
  ConstanteVitaleResume,
  DetailPatientInfirmiers,
  HistoriqueCompletDossierInfirmiers,
  HistoriqueConstanteInfirmiers,
  PatientFileInfirmiers,
  PatientHistoriqueInfirmiers,
  StatsInfirmiersJour,
  ApercuDashboardInfirmiers,
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

const STATUTS_TRANSFERT_CONFIRME = ["ACCEPTE", "EN_TRAITEMENT", "TERMINE"] as const;

/** Patients en file sans vitals du jour (consultation à établir). */
export async function listerPatientsConsultationInfirmiers(): Promise<
  PatientFileInfirmiers[]
> {
  const all = await listerPatientsInfirmiers();
  return all.filter((p) => !p.hasConstantesAujourdhui);
}

function dedupliquerParDossierInfirmiers(
  patients: PatientFileInfirmiers[]
): PatientFileInfirmiers[] {
  const parDossier = new Map<string, PatientFileInfirmiers>();
  for (const p of patients) {
    const existant = parDossier.get(p.dossierId);
    if (!existant) {
      parDossier.set(p.dossierId, p);
      continue;
    }
    const garder =
      new Date(p.arriveeLe).getTime() >= new Date(existant.arriveeLe).getTime()
        ? p
        : existant;
    parDossier.set(p.dossierId, garder);
  }
  return [...parDossier.values()].sort(
    (a, b) => new Date(b.arriveeLe).getTime() - new Date(a.arriveeLe).getTime()
  );
}

async function construirePatientHorsFileInfirmiers(
  dossierId: string,
  mesureLe?: Date
): Promise<PatientFileInfirmiers | null> {
  const dossier = await prisma.dossierPatient.findUnique({
    where: { id: dossierId },
    include: {
      patient: true,
      passages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          transferts: {
            where: {
              salleOrigine: { code: "INFIRMIERS" },
              statut: { in: [...STATUTS_TRANSFERT_CONFIRME] },
            },
            orderBy: { emisLe: "desc" },
            take: 1,
            include: { salleDestination: { select: { code: true, nom: true } } },
          },
        },
      },
    },
  });
  if (!dossier) return null;

  const patient = dossier.patient;
  const passage = dossier.passages[0];
  const transfertSortant = passage?.transferts[0] ?? null;
  const orientation = transfertSortant
    ? raccourcirOrientation(transfertSortant.salleDestination.nom)
    : "Infirmiers";
  const arriveeIso = mesureLe?.toISOString() ?? new Date().toISOString();

  return {
    cleListe: `fiche-${dossier.id}`,
    dossierId: dossier.id,
    passageId: passage?.id ?? "",
    numeroPatient: patient.numeroPatient,
    numeroDossier: dossier.numeroDossier,
    nomComplet: `${patient.prenom} ${patient.nom}`.trim(),
    prenom: patient.prenom,
    nom: patient.nom,
    telephone: patient.telephone ?? "—",
    age: calculerAge(patient.dateNaissance?.toISOString() ?? null),
    sexe: patient.sexe ?? null,
    motif: passage?.motif ?? "Consultation enregistrée",
    provenance: "Infirmiers",
    orientation,
    orientationCouleur:
      COULEURS_ORIENTATION[orientation] ?? "bg-violet-100 text-violet-700",
    codeSalleDestination: transfertSortant?.salleDestination.code ?? "INFIRMIERS",
    statut: "Constantes prises",
    statutCouleur: "bg-emerald-100 text-emerald-800",
    heure: formaterHeure(arriveeIso),
    arriveeLe: arriveeIso,
    transfertId: null,
    transfertSortantId: transfertSortant?.id ?? null,
    statutTransfertSortant: transfertSortant?.statut ?? null,
    enRecuperation: false,
    numeroOrdre: 0,
    hasConstantesAujourdhui: true,
  };
}

/** Patients avec consultation enregistrée aujourd'hui (restent visibles après transfert). */
export async function listerPatientsFicheTraitementInfirmiers(): Promise<
  PatientFileInfirmiers[]
> {
  const debut = debutJourLocal();
  const enFile = await listerPatientsInfirmiers();
  const enFileAvecConstantes = enFile.filter((p) => p.hasConstantesAujourdhui);
  const idsEnFile = new Set(enFile.map((p) => p.dossierId));

  const constantesAujourdhui = await prisma.constantesVitales.findMany({
    where: { mesureLe: { gte: debut } },
    select: { dossierId: true, mesureLe: true },
    orderBy: { mesureLe: "desc" },
  });

  const derniereMesureParDossier = new Map<string, Date>();
  for (const c of constantesAujourdhui) {
    if (!derniereMesureParDossier.has(c.dossierId)) {
      derniereMesureParDossier.set(c.dossierId, c.mesureLe);
    }
  }

  const horsFileIds = [...derniereMesureParDossier.keys()].filter(
    (id) => !idsEnFile.has(id)
  );

  const horsFile = (
    await Promise.all(
      horsFileIds.map((id) =>
        construirePatientHorsFileInfirmiers(id, derniereMesureParDossier.get(id))
      )
    )
  ).filter((p): p is PatientFileInfirmiers => p != null);

  return dedupliquerParDossierInfirmiers([...enFileAvecConstantes, ...horsFile]);
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

  const patients = files.map((file) => {
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

  return patients.sort(
    (a, b) => new Date(b.arriveeLe).getTime() - new Date(a.arriveeLe).getTime()
  );
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
  const [patients, patientsConsultation, fichesActives] = await Promise.all([
    listerPatientsInfirmiers(),
    listerPatientsConsultationInfirmiers(),
    prisma.ficheTraitement.count({ where: { statut: "EN_COURS" } }),
  ]);

  const [constantesAujourdhui, transfertsSortantsAujourdhui] = await Promise.all([
    prisma.constantesVitales.count({ where: { mesureLe: { gte: debut } } }),
    prisma.transfert.count({
      where: {
        salleOrigine: { code: "INFIRMIERS" },
        emisLe: { gte: debut },
        statut: { in: [...STATUTS_TRANSFERT_CONFIRME] },
      },
    }),
  ]);

  return {
    patientsEnFile: patients.length,
    constantesAujourdhui,
    transfertsSortantsAujourdhui,
    fichesTraitementActives: fichesActives,
    patientsConsultationEnAttente: patientsConsultation.length,
    arriveesFileIso: patients.map((p) => p.arriveeLe),
    dateReference: new Date().toISOString(),
  };
}

export async function obtenirApercuDashboardInfirmiers(): Promise<ApercuDashboardInfirmiers> {
  const debut = debutJourLocal();
  const [stats, file] = await Promise.all([
    obtenirStatsInfirmiers(),
    listerPatientsConsultationInfirmiers(),
  ]);

  const cible = file.find((p) => p.hasConstantesAujourdhui) ?? file[0] ?? null;
  const patientEnCours = cible
    ? await obtenirDetailPatientInfirmiers(cible.dossierId)
    : null;

  const [constantes, transferts, fiches] = await Promise.all([
    prisma.constantesVitales.findMany({
      where: { mesureLe: { gte: debut } },
      include: {
        dossier: { include: { patient: true } },
        infirmier: { select: { prenom: true, nom: true } },
      },
      orderBy: { mesureLe: "desc" },
      take: 8,
    }),
    prisma.transfert.findMany({
      where: {
        salleOrigine: { code: "INFIRMIERS" },
        emisLe: { gte: debut },
      },
      include: { dossier: { include: { patient: true } } },
      orderBy: { emisLe: "desc" },
      take: 8,
    }),
    prisma.ficheTraitement.findMany({
      where: { createdAt: { gte: debut } },
      include: { dossier: { include: { patient: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  type Act = import("@/lib/infirmiers/types").ActiviteRecenteInfirmiers;
  const activites: Act[] = [
    ...constantes.map((c) => ({
      id: `cv-${c.id}`,
      type: "CONSTANTES" as const,
      libelle: "Constantes enregistrées",
      patient: `${c.dossier.patient.prenom} ${c.dossier.patient.nom}`.trim(),
      heure: formaterHeure(c.mesureLe.toISOString()),
      iso: c.mesureLe.toISOString(),
    })),
    ...transferts.map((t) => ({
      id: `tr-${t.id}`,
      type: "TRANSFERT" as const,
      libelle: `Transfert ${t.statut === "EN_ATTENTE" ? "émis" : "confirmé"}`,
      patient: `${t.dossier.patient.prenom} ${t.dossier.patient.nom}`.trim(),
      heure: formaterHeure(t.emisLe.toISOString()),
      iso: t.emisLe.toISOString(),
    })),
    ...fiches.map((f) => ({
      id: `ft-${f.id}`,
      type: "FICHE_TRAITEMENT" as const,
      libelle: "Fiche de traitement",
      patient: `${f.dossier.patient.prenom} ${f.dossier.patient.nom}`.trim(),
      heure: formaterHeure(f.createdAt.toISOString()),
      iso: f.createdAt.toISOString(),
    })),
  ]
    .sort((a, b) => b.iso.localeCompare(a.iso))
    .slice(0, 10);

  return {
    stats,
    file: file.slice(0, 8),
    patientEnCours,
    activites,
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

/** Patients ayant au moins une consultation infirmière enregistrée. */
export async function listerPatientsHistoriqueInfirmiers(): Promise<
  PatientHistoriqueInfirmiers[]
> {
  const rows = await prisma.constantesVitales.findMany({
    orderBy: { mesureLe: "desc" },
    include: {
      infirmier: { select: { prenom: true, nom: true } },
      dossier: {
        include: {
          patient: {
            select: {
              prenom: true,
              nom: true,
              numeroPatient: true,
              telephone: true,
              dateNaissance: true,
              sexe: true,
            },
          },
        },
      },
    },
  });

  const parDossier = new Map<
    string,
    {
      patient: (typeof rows)[0]["dossier"]["patient"];
      numeroDossier: string;
      constantes: ConstanteVitaleResume[];
    }
  >();

  for (const r of rows) {
    const existant = parDossier.get(r.dossierId);
    const constante = mapperConstante(r);
    if (existant) {
      existant.constantes.push(constante);
    } else {
      parDossier.set(r.dossierId, {
        patient: r.dossier.patient,
        numeroDossier: r.dossier.numeroDossier,
        constantes: [constante],
      });
    }
  }

  return [...parDossier.entries()]
    .map(([dossierId, data]) => {
    const p = data.patient;
    const derniere = data.constantes[0] ?? null;
    return {
      dossierId,
      numeroDossier: data.numeroDossier,
      numeroPatient: p.numeroPatient,
      nomComplet: `${p.prenom} ${p.nom}`.trim(),
      prenom: p.prenom,
      nom: p.nom,
      telephone: p.telephone ?? "—",
      age: calculerAge(p.dateNaissance?.toISOString() ?? null),
      sexe: p.sexe ?? null,
      derniereMesureLe: derniere?.mesureLe ?? new Date().toISOString(),
      nbConsultations: data.constantes.length,
      derniereConstante: derniere,
    };
  })
    .sort(
      (a, b) =>
        new Date(b.derniereMesureLe).getTime() -
        new Date(a.derniereMesureLe).getTime()
    );
}

export async function obtenirHistoriqueCompletDossierInfirmiers(
  dossierId: string
): Promise<HistoriqueCompletDossierInfirmiers | null> {
  const dossier = await prisma.dossierPatient.findUnique({
    where: { id: dossierId },
    include: { patient: true },
  });
  if (!dossier) return null;

  const [constantes, nbFiches] = await Promise.all([
    prisma.constantesVitales.findMany({
      where: { dossierId },
      include: { infirmier: { select: { prenom: true, nom: true } } },
      orderBy: { mesureLe: "desc" },
    }),
    prisma.ficheTraitement.count({ where: { dossierId } }),
  ]);

  const patient = dossier.patient;
  return {
    dossierId,
    numeroDossier: dossier.numeroDossier,
    numeroPatient: patient.numeroPatient,
    nomComplet: `${patient.prenom} ${patient.nom}`.trim(),
    prenom: patient.prenom,
    nom: patient.nom,
    telephone: patient.telephone ?? "—",
    age: calculerAge(patient.dateNaissance?.toISOString() ?? null),
    sexe: patient.sexe ?? null,
    constantes: constantes.map(mapperConstante),
    nbFichesTraitement: nbFiches,
  };
}
