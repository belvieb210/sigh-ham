import type { CampagnePublique, CampagneImage } from "@/generated/prisma/client";
import type {
  CampagnePublication,
  CategorieCampagne,
  IdIconeCampagne,
  TypePublication,
} from "@/types/campagnes";

function formatDateIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

type CampagneAvecImages = CampagnePublique & {
  images?: CampagneImage[];
};

function estImageCms(url: string | null | undefined): boolean {
  if (!url) return false;
  const u = url.trim();
  // Exclure les anciennes photos statiques du dossier public/images
  if (u.startsWith("/images/")) return false;
  return Boolean(u);
}

export function campagneDbVersPublication(
  row: CampagneAvecImages
): CampagnePublication {
  const images = (row.images ?? [])
    .slice()
    .sort((a, b) => a.ordre - b.ordre)
    .map((i) => ({ url: i.url, legende: i.legende ?? undefined }))
    .filter((i) => estImageCms(i.url));
  const imageUrlLegacy = estImageCms(row.imageUrl) ? row.imageUrl! : undefined;

  // Uniquement photos CMS (/uploads, MinIO…) — pas de /images/ statiques
  const galerie =
    images.length > 0
      ? images
      : imageUrlLegacy
        ? [{ url: imageUrlLegacy }]
        : [];

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
    imageUrl: galerie[0]?.url,
    images: galerie,
    lieu: row.lieu ?? undefined,
    datePublication: row.datePublication
      ? formatDateIso(row.datePublication)
      : formatDateIso(row.createdAt),
  };
}

export async function synchroniserImagesCampagne(
  prisma: {
    campagneImage: {
      deleteMany: (args: { where: { campagneId: string } }) => Promise<unknown>;
      createMany: (args: {
        data: { id?: string; campagneId: string; url: string; ordre: number; legende?: string | null }[];
      }) => Promise<unknown>;
    };
  },
  campagneId: string,
  images: { url: string; legende?: string }[]
) {
  await prisma.campagneImage.deleteMany({ where: { campagneId } });
  if (images.length === 0) return;
  await prisma.campagneImage.createMany({
    data: images.map((img, ordre) => ({
      campagneId,
      url: img.url,
      ordre,
      legende: img.legende ?? null,
    })),
  });
}
