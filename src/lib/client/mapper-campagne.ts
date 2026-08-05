import type { CampagnePublique } from "@/generated/prisma/client";
import type {
  CampagnePublication,
  CategorieCampagne,
  IdIconeCampagne,
  TypePublication,
} from "@/types/campagnes";

function formatDateIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function campagneDbVersPublication(
  row: CampagnePublique
): CampagnePublication {
  return {
    id: row.id,
    slug: row.slug,
    titre: row.titre,
    extrait: row.extrait,
    description: row.description,
    periode: row.periode,
    dateDebut: formatDateIso(row.dateDebut),
    dateFin: formatDateIso(row.dateFin),
    href: `/campagnes/${row.slug}`,
    categorie: row.categorie as CategorieCampagne,
    typePublication: row.typePublication as TypePublication,
    publie: row.publie,
    misEnAvant: row.misEnAvant,
    couleurFond: row.couleurFond,
    couleurIllustration: row.couleurIllustration,
    couleurAccent: row.couleurAccent,
    icone: row.icone as IdIconeCampagne,
    imageUrl: row.imageUrl ?? undefined,
    lieu: row.lieu ?? undefined,
    datePublication: row.datePublication
      ? formatDateIso(row.datePublication)
      : formatDateIso(row.createdAt),
  };
}
