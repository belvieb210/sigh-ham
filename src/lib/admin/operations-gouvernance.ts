import "server-only";
import type {
  Prisma,
  TypeAudit,
  TypeOperationGouvernancePatient,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function enregistrerOperationGouvernance(params: {
  acteurId: string;
  type: TypeOperationGouvernancePatient;
  typeAudit: TypeAudit;
  patientId: string;
  numeroPatient: string;
  dossierId?: string | null;
  numeroDossier?: string | null;
  action: string;
  snapshot?: Record<string, unknown> | null;
  tx?: Prisma.TransactionClient;
}) {
  const db = params.tx ?? prisma;
  const journal = await db.journalAudit.create({
    data: {
      utilisateurId: params.acteurId,
      type: params.typeAudit,
      module: "ADMIN",
      entite: "OperationGouvernancePatient",
      entiteId: params.patientId,
      action: params.action,
      details: (params.snapshot ?? undefined) as
        | Prisma.InputJsonValue
        | undefined,
    },
  });

  await db.operationGouvernancePatient.create({
    data: {
      type: params.type,
      patientId: params.patientId,
      numeroPatient: params.numeroPatient,
      dossierId: params.dossierId ?? null,
      numeroDossier: params.numeroDossier ?? null,
      utilisateurId: params.acteurId,
      journalAuditId: journal.id,
      action: params.action,
      snapshot: (params.snapshot ?? undefined) as
        | Prisma.InputJsonValue
        | undefined,
    },
  });

  return journal.id;
}
