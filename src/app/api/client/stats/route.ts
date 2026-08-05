import { NextResponse } from "next/server";
import {
  obtenirSessionApiClient,
  reponseNonAutoriseClient,
} from "@/lib/auth/garde-api-client";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await obtenirSessionApiClient();
  if (!session) return reponseNonAutoriseClient();

  try {
    const maintenant = new Date();
    const [
      campagnesPubliees,
      pubsEnCours,
      brouillons,
      diaposHero,
      messagesContactNonLus,
      messagesTotal,
    ] = await Promise.all([
      prisma.campagnePublique.count({ where: { publie: true } }),
      prisma.campagnePublique.count({
        where: {
          publie: true,
          typePublication: "publicite",
          dateDebut: { lte: maintenant },
          dateFin: { gte: maintenant },
        },
      }),
      prisma.campagnePublique.count({ where: { publie: false } }),
      prisma.diapositiveHero.count({ where: { actif: true } }),
      prisma.messageContact.count({ where: { lu: false } }),
      prisma.messageContact.count(),
    ]);

    const campagnesActives = await prisma.campagnePublique.count({
      where: {
        publie: true,
        dateDebut: { lte: maintenant },
        dateFin: { gte: maintenant },
      },
    });

    return NextResponse.json({
      campagnesActives,
      campagnesPubliees,
      pubsEnCours,
      brouillons,
      diaposHero,
      messagesContactNonLus,
      messagesNonLus: messagesContactNonLus,
      messagesTotal,
      genereLe: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[GET /api/client/stats]", error);
    return NextResponse.json(
      { message: "Impossible de charger les statistiques." },
      { status: 500 }
    );
  }
}
