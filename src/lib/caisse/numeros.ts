import "server-only";
import type { Prisma } from "@/generated/prisma/client";

type ClientTransaction = Prisma.TransactionClient;

export async function genererNumeroFacture(tx: ClientTransaction): Promise<string> {
  const maintenant = new Date();
  const yyyy = maintenant.getFullYear();
  const mm = String(maintenant.getMonth() + 1).padStart(2, "0");
  const dd = String(maintenant.getDate()).padStart(2, "0");
  const prefixe = `FAC-${yyyy}${mm}${dd}-`;

  const derniere = await tx.facture.findFirst({
    where: { numeroFacture: { startsWith: prefixe } },
    orderBy: { numeroFacture: "desc" },
    select: { numeroFacture: true },
  });

  let sequence = 1;
  if (derniere?.numeroFacture) {
    const partie = derniere.numeroFacture.slice(prefixe.length);
    const n = Number.parseInt(partie, 10);
    if (!Number.isNaN(n)) sequence = n + 1;
  }

  return `${prefixe}${String(sequence).padStart(4, "0")}`;
}
