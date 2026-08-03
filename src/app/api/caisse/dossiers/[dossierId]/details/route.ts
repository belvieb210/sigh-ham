import { NextResponse } from "next/server";
import { obtenirSessionApiCaisse } from "@/lib/auth/garde-api-caisse";
import { prisma } from "@/lib/prisma";

function decimalVersNombre(valeur: { toNumber?: () => number } | number | string): number {
  if (typeof valeur === "number") return valeur;
  if (typeof valeur === "string") return Number.parseFloat(valeur) || 0;
  if (valeur && typeof valeur.toNumber === "function") return valeur.toNumber();
  return Number(valeur) || 0;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ dossierId: string }> }
) {
  const session = await obtenirSessionApiCaisse();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const { dossierId } = await context.params;
    const dossier = await prisma.dossierPatient.findUnique({
      where: { id: dossierId },
      include: {
        patient: { select: { prenom: true, nom: true, numeroPatient: true } },
        examensLaboratoire: {
          where: { statut: { not: "ANNULE" } },
          include: { typeExamen: true },
          orderBy: { createdAt: "asc" },
        },
        enregistrementsReception: {
          orderBy: { enregistreLe: "desc" },
          take: 1,
          select: { medecinResponsable: true },
        },
      },
    });

    if (!dossier) {
      return NextResponse.json({ message: "Dossier introuvable." }, { status: 404 });
    }

    const examens = dossier.examensLaboratoire.map((e) => ({
      id: e.id,
      libelle: e.typeExamen.libelle,
      categorie: e.typeExamen.categorie,
      prix: decimalVersNombre(e.typeExamen.prix),
    }));

    return NextResponse.json({
      dossierId: dossier.id,
      numeroPatient: dossier.patient.numeroPatient,
      nomComplet: `${dossier.patient.prenom} ${dossier.patient.nom}`,
      medecinResponsable:
        dossier.enregistrementsReception[0]?.medecinResponsable?.trim() || null,
      examens,
    });
  } catch (e) {
    console.error("[GET /api/caisse/dossiers/[dossierId]/details]", e);
    return NextResponse.json(
      { message: "Impossible de charger les détails du dossier." },
      { status: 500 }
    );
  }
}
