import "server-only";
import { prisma } from "@/lib/prisma";

/** Vérifie que le dossier appartient au périmètre service Église (prénuptial). */
export async function assertDossierEglise(dossierId: string) {
  const dossier = await prisma.dossierPatient.findFirst({
    where: {
      id: dossierId,
      OR: [
        { examensPrenuptiaux: { some: {} } },
        {
          transferts: {
            some: { salleOrigine: { code: "EGLISE" } },
          },
        },
      ],
    },
  });
  if (!dossier) throw new Error("DOSSIER_NON_AUTORISE");
  return dossier;
}
