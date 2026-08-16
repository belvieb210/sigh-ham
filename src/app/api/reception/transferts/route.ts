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
      const orientations = [
        ...new Set(
          (corps.orientations?.filter(Boolean) ??
            (corps.orientation?.trim() ? [corps.orientation.trim()] : [])) as string[]
        ),
      ];

      if (orientations.length === 0) {
        const donnees = parserDonneesTransfertManuel(body);
        const erreur = validerDonneesTransfertManuel(donnees);
        if (erreur) {
          return NextResponse.json({ message: erreur }, { status: 400 });
        }
        orientations.push(donnees.orientation!);
      }

      let dossierId = corps.dossierId?.trim() || "";
      const numeroPatient = corps.numeroPatient?.trim() || "";

      const appliquerReorientation = async (idDossier: string) => {
        const { reorienterPatientDepuisReception } = await import(
          "@/lib/reception/reorienter-patient-reception"
        );
        return reorienterPatientDepuisReception(
          session.utilisateur.id,
          idDossier,
          orientations
        );
      };

      if (dossierId) {
        try {
          const resultat = await appliquerReorientation(dossierId);
          return NextResponse.json({
            message: `Transfert(s) vers ${resultat.salleDestination}. Confirmez via le menu ⋮.`,
            ...resultat,
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Transfert impossible.";
          if (
            !message.includes("Patient introuvable pour orientation") ||
            !numeroPatient
          ) {
            throw error;
          }
        }
        dossierId = "";
      }

      if (!numeroPatient) {
        const donnees = parserDonneesTransfertManuel(body);
        const erreur = validerDonneesTransfertManuel(donnees);
        if (erreur) {
          return NextResponse.json({ message: erreur }, { status: 400 });
        }
      }

      const donneesManuel = parserDonneesTransfertManuel({
        ...body,
        orientation: orientations[0],
        numeroPatient: numeroPatient || undefined,
        dossierId: dossierId || undefined,
      });
      const erreurManuel = validerDonneesTransfertManuel(donneesManuel);
      if (erreurManuel) {
        return NextResponse.json({ message: erreurManuel }, { status: 400 });
      }

      const cree = await transfererPatientManuel(session.utilisateur.id, {
        numeroPatient: donneesManuel.numeroPatient!,
        dossierId: donneesManuel.dossierId,
        orientation: orientations[0]!,
      });
      dossierId = cree.dossierId;

      if (orientations.length === 1 && !cree.transfertMisAJour) {
        return NextResponse.json({
          message: `Transfert manuel effectué vers ${cree.salleDestination}. Confirmez-le dans la liste des transferts.`,
          ...cree,
        });
      }

      if (orientations.length === 1 && cree.transfertMisAJour) {
        return NextResponse.json({
          message: `Destination du transfert mise à jour vers ${cree.salleDestination}. Confirmez-le dans la liste des transferts.`,
          ...cree,
        });
      }

      const resultat = await appliquerReorientation(dossierId);
      return NextResponse.json({
        message: `Transfert(s) vers ${resultat.salleDestination}. Confirmez via le menu ⋮.`,
        ...resultat,
        numeroPatient: cree.numeroPatient,
        dossierId,
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
