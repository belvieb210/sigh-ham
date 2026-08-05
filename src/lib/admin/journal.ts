import "server-only";
import type { TypeAudit, CodeSalle } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function listerJournalAudit(options?: {
  q?: string;
  type?: TypeAudit;
  module?: CodeSalle;
  utilisateurId?: string;
  limite?: number;
  offset?: number;
  depuis?: Date;
  jusqua?: Date;
}) {
  const limite = Math.min(options?.limite ?? 80, 500);
  const offset = options?.offset ?? 0;
  const q = options?.q?.trim();

  const where = {
    ...(options?.type ? { type: options.type } : {}),
    ...(options?.module ? { module: options.module } : {}),
    ...(options?.utilisateurId
      ? { utilisateurId: options.utilisateurId }
      : {}),
    ...(options?.depuis || options?.jusqua
      ? {
          createdAt: {
            ...(options.depuis ? { gte: options.depuis } : {}),
            ...(options.jusqua ? { lte: options.jusqua } : {}),
          },
        }
      : {}),
    ...(q
      ? {
          OR: [
            { action: { contains: q, mode: "insensitive" as const } },
            { entite: { contains: q, mode: "insensitive" as const } },
            {
              utilisateur: {
                OR: [
                  { prenom: { contains: q, mode: "insensitive" as const } },
                  { nom: { contains: q, mode: "insensitive" as const } },
                  {
                    identifiant: { contains: q, mode: "insensitive" as const },
                  },
                ],
              },
            },
          ],
        }
      : {}),
  };

  const [entrees, total] = await Promise.all([
    prisma.journalAudit.findMany({
      where,
      include: {
        utilisateur: {
          select: { id: true, prenom: true, nom: true, identifiant: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limite,
      skip: offset,
    }),
    prisma.journalAudit.count({ where }),
  ]);

  return { entrees, total, limite, offset };
}

export function journalVersCsv(
  entrees: Awaited<ReturnType<typeof listerJournalAudit>>["entrees"]
): string {
  const header = ["date", "acteur", "type", "module", "entite", "action"].join(
    ";"
  );
  const lignes = entrees.map((e) =>
    [
      e.createdAt.toISOString(),
      e.utilisateur ? e.utilisateur.identifiant : "",
      e.type,
      e.module ?? "",
      e.entite,
      `"${e.action.replace(/"/g, '""')}"`,
    ].join(";")
  );
  return [header, ...lignes].join("\n");
}
