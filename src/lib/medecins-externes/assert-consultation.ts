import "server-only";
import { prisma } from "@/lib/prisma";
import { assertDossierDuMedecinExterne } from "@/lib/medecins-externes/assurer-fiche";

export async function assertConsultationDuMedecinExterne(
  consultationId: string,
  medecinExterneId: string
) {
  const c = await prisma.consultation.findUnique({
    where: { id: consultationId },
    select: { id: true, dossierId: true, medecinId: true },
  });
  if (!c) throw new Error("CONSULTATION_INTROUVABLE");
  await assertDossierDuMedecinExterne(c.dossierId, medecinExterneId);
  return c;
}
