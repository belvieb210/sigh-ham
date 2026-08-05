import "server-only";
import { prisma } from "@/lib/prisma";

export type PeriodeStats = "jour" | "7j" | "30j";

function debutPeriode(periode: PeriodeStats): Date {
  const d = new Date();
  if (periode === "jour") {
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const jours = periode === "7j" ? 7 : 30;
  d.setDate(d.getDate() - jours);
  return d;
}

export async function obtenirStatistiquesPeriode(periode: PeriodeStats = "jour") {
  const depuis = debutPeriode(periode);

  const [
    connexions,
    patientsCrees,
    factures,
    examensPrescrits,
    examensTermines,
    messages,
    utilisateursCrees,
    audits,
  ] = await Promise.all([
    prisma.journalAudit.count({
      where: { type: "CONNEXION", createdAt: { gte: depuis } },
    }),
    prisma.patient.count({ where: { createdAt: { gte: depuis } } }),
    prisma.facture.count({ where: { createdAt: { gte: depuis } } }),
    prisma.examenLaboratoire.count({
      where: { createdAt: { gte: depuis } },
    }),
    prisma.examenLaboratoire.count({
      where: { statut: "TERMINE", resultatLe: { gte: depuis } },
    }),
    prisma.message.count({ where: { envoyeLe: { gte: depuis } } }),
    prisma.utilisateur.count({ where: { createdAt: { gte: depuis } } }),
    prisma.journalAudit.count({ where: { createdAt: { gte: depuis } } }),
  ]);

  return {
    periode,
    depuis: depuis.toISOString(),
    jusqua: new Date().toISOString(),
    indicateurs: {
      connexions,
      patientsCrees,
      factures,
      examensPrescrits,
      examensTermines,
      messages,
      utilisateursCrees,
      audits,
    },
  };
}

export function statsVersCsv(
  data: Awaited<ReturnType<typeof obtenirStatistiquesPeriode>>
): string {
  const lignes = [
    ["indicateur", "valeur"].join(";"),
    ...Object.entries(data.indicateurs).map(([k, v]) => `${k};${v}`),
  ];
  return lignes.join("\n");
}
