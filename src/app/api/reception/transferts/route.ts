import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiReception } from "@/lib/auth/garde-api-reception";
import { listerPatientsTransferes } from "@/lib/reception/lister-patients-transferes";
import { nettoyerFilesAttenteNonConfirmees } from "@/lib/transferts/visibilite-salle";
import {
  parserDonneesTransfert,
  parserDonneesTransfertManuel,
  transfererPatientAccueil,
  transfererPatientManuel,
  validerDonneesTransfert,
  validerDonneesTransfertManuel,
} from "@/lib/reception/transferer-patient-accueil";
import type { DonneesTransfertAccueil } from "@/lib/reception/types";

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiReception();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    await nettoyerFilesAttenteNonConfirmees();

    const limiteParam = request.nextUrl.searchParams.get("limite");
    const limite = limiteParam ? parseInt(limiteParam, 10) : undefined;
    const resultat = await listerPatientsTransferes(
      limite && limite > 0 ? limite : undefined
    );
    return NextResponse.json(resultat);
  } catch (error) {
    console.error("[GET /api/reception/transferts]", error);
    return NextResponse.json(
      { message: "Impossible de charger les patients transférés." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await obtenirSessionApiReception();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (body && typeof body === "object" && (body as { transfertManuel?: boolean }).transfertManuel) {
      const corps = body as {
        numeroPatient?: string;
        dossierId?: string;
        orientation?: string;
        orientations?: string[];
      };
      const orientations =
        corps.orientations?.filter(Boolean) ??
        (corps.orientation?.trim() ? [corps.orientation.trim()] : []);

      if (!corps.dossierId?.trim() || orientations.length === 0) {
        const donnees = parserDonneesTransfertManuel(body);
        const erreur = validerDonneesTransfertManuel(donnees);
        if (erreur) {
          return NextResponse.json({ message: erreur }, { status: 400 });
        }

        const resultat = await transfererPatientManuel(session.utilisateur.id, {
          numeroPatient: donnees.numeroPatient!,
          dossierId: donnees.dossierId,
          orientation: donnees.orientation!,
        });

        return NextResponse.json({
          message: resultat.transfertMisAJour
            ? `Destination du transfert mise à jour vers ${resultat.salleDestination}. Confirmez-le dans la liste des transferts.`
            : `Transfert manuel effectué vers ${resultat.salleDestination}. Confirmez-le dans la liste des transferts.`,
          ...resultat,
        });
      }

      const { reorienterPatientDepuisReception } = await import(
        "@/lib/reception/reorienter-patient-reception"
      );
      const resultat = await reorienterPatientDepuisReception(
        session.utilisateur.id,
        corps.dossierId.trim(),
        orientations
      );

      return NextResponse.json({
        message: `Transfert(s) vers ${resultat.salleDestination}. Confirmez via le menu ⋮.`,
        ...resultat,
      });
    }

    const donnees = parserDonneesTransfert(body);
    const erreur = validerDonneesTransfert(donnees);

    if (erreur) {
      return NextResponse.json({ message: erreur }, { status: 400 });
    }

    const resultat = await transfererPatientAccueil(
      session.utilisateur.id,
      donnees as DonneesTransfertAccueil
    );

    return NextResponse.json({
      message: `Patient transféré vers ${resultat.salleDestination}.`,
      ...resultat,
    });
  } catch (error) {
    console.error("[POST /api/reception/transferts]", error);
    const message =
      error instanceof Error ? error.message : "Transfert impossible.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
