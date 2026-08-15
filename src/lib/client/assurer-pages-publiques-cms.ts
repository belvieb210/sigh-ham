import "server-only";

import { prisma } from "@/lib/prisma";
import { CONTENU_RENDEZ_VOUS } from "@/constants/rendez-vous";
import { CONTENU_SERVICES_LABORATOIRE } from "@/constants/services-laboratoire";

const PAGES_CMS_A_ASSURER = [
  {
    cle: "rendez-vous",
    titre: "Rendez-vous",
    contenu: {
      hero: { imagesFond: [] as { url: string; alt?: string }[] },
      cta: CONTENU_RENDEZ_VOUS.cta,
    },
  },
  {
    cle: "services-laboratoire",
    titre: "Examens laboratoire",
    contenu: {
      hero: { imagesFond: [] as { url: string; alt?: string }[] },
      cta: CONTENU_SERVICES_LABORATOIRE.cta,
    },
  },
] as const;

/** Crée les pages CMS manquantes sans écraser le contenu existant. */
export async function assurerPagesPubliquesCms() {
  for (const page of PAGES_CMS_A_ASSURER) {
    await prisma.pagePublique.upsert({
      where: { cle: page.cle },
      create: {
        cle: page.cle,
        titre: page.titre,
        contenu: page.contenu,
        publie: true,
      },
      update: {},
    });
  }
}
