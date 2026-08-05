import "server-only";
import type { CodeSalle, TypeAudit } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function enregistrerAudit(params: {
  utilisateurId?: string | null;
  type: TypeAudit;
  module?: CodeSalle | null;
  entite: string;
  entiteId?: string | null;
  action: string;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
}) {
  try {
    await prisma.journalAudit.create({
      data: {
        utilisateurId: params.utilisateurId ?? null,
        type: params.type,
        module: params.module ?? "ADMIN",
        entite: params.entite,
        entiteId: params.entiteId ?? null,
        action: params.action,
        details: (params.details ?? undefined) as
          | import("@/generated/prisma/client").Prisma.InputJsonValue
          | undefined,
        ipAddress: params.ipAddress ?? null,
      },
    });
  } catch (err) {
    console.error("[enregistrerAudit]", err);
  }
}
