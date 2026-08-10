import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiMedecinsExternes } from "@/lib/auth/garde-api-medecins-externes";
import { exigerMedecinExterneId } from "@/lib/medecins-externes/assurer-fiche";
import { listerPatientsTransferesMedecinExterne } from "@/lib/medecins-externes/lister-patients-reception-like";
import { reorienterPatientDepuisMedecinsExternes } from "@/lib/medecins-externes/reorienter-patient";
import { filtrerOrientationsMedecinsExternes } from "@/constants/medecins-externes";
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

const OPTIONS_ME = (medecinExterneId: string) =>
  ({
    salleOrigine: "MEDECINS_EXTERNES" as const,
    medecinExterneId,
  });

function extraireOrientations(body: unknown): string[] {
  if (!body || typeof body !== "object") return ["CAISSE"];
  const b = body as {
    orientations?: string[];
    orientation?: string;
  };
  const brutes = [
    ...new Set(
      (b.orientations?.filter(Boolean) ??
        (b.orientation?.trim() ? [b.orientation.trim()] : [])) as string[]
    ),
  ];
  return filtrerOrientationsMedecinsExternes(brutes);
}

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiMedecinsExternes();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    await nettoyerFilesAttenteNonConfirmees();
    const medecinExterneId = exigerMedecinExterneId(
      session.utilisateur.medecinExterneId
    );
    const limiteParam = request.nextUrl.searchParams.get("limite");
    const limite = limiteParam ? parseInt(limiteParam, 10) : undefined;
    const resultat = await listerPatientsTransferesMedecinExterne(
      medecinExterneId,
      limite && limite > 0 ? limite : undefined
    );
    return NextResponse.json(resultat);
  } catch (error) {
    console.error("[GET /api/medecins-externes/transferts]", error);
    return NextResponse.json(
      { message: "Impossible de charger les patients transférés." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await obtenirSessionApiMedecinsExternes();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const medecinExterneId = exigerMedecinExterneId(
      session.utilisateur.medecinExterneId
    );
    const opts = OPTIONS_ME(medecinExterneId);
    const body = await request.json();

    const corpsReorientation = body as { dossierId?: string };
    const orientationsDirectes = extraireOrientations(body);
    const dossierIdDirect = corpsReorientation.dossierId?.trim() || "";

    if (
      dossierIdDirect &&
      orientationsDirectes.length > 0 &&
      !(body as { transfertManuel?: boolean }).transfertManuel &&
      !(body as { transfertWizard?: boolean }).transfertWizard
    ) {
      const resultat = await reorienterPatientDepuisMedecinsExternes(
        session.utilisateur.id,
        medecinExterneId,
        dossierIdDirect,
        orientationsDirectes
      );
      return NextResponse.json({
        message: `Transfert vers ${resultat.salleDestination}. Confirmez via le menu ⋮.`,
        ...resultat,
      });
    }

    if (
      body &&
      typeof body === "object" &&
      (body as { transfertManuel?: boolean }).transfertManuel
    ) {
      const corps = body as {
        numeroPatient?: string;
        dossierId?: string;
      };
      const orientations = extraireOrientations(body);

      let dossierId = corps.dossierId?.trim() || "";

      if (!dossierId) {
        const donnees = parserDonneesTransfertManuel({
          ...body,
          orientation: orientations[0],
        });
        const erreur = validerDonneesTransfertManuel(donnees);
        if (erreur) {
          return NextResponse.json({ message: erreur }, { status: 400 });
        }

        const cree = await transfererPatientManuel(
          session.utilisateur.id,
          {
            numeroPatient: donnees.numeroPatient!,
            dossierId: donnees.dossierId,
            orientation: orientations[0]!,
          },
          opts
        );
        dossierId = cree.dossierId;

        if (orientations.length === 1) {
          return NextResponse.json({
            message: cree.transfertMisAJour
              ? `Destination mise à jour vers ${cree.salleDestination}. Confirmez via le menu ⋮.`
              : `Transfert vers ${cree.salleDestination}. Confirmez via le menu ⋮.`,
            ...cree,
          });
        }
      }

      const resultat = await reorienterPatientDepuisMedecinsExternes(
        session.utilisateur.id,
        medecinExterneId,
        dossierId,
        orientations
      );

      return NextResponse.json({
        message: `Transfert vers ${resultat.salleDestination}. Confirmez via le menu ⋮.`,
        ...resultat,
      });
    }

    const orientationsWizard = extraireOrientations(body);
    const donnees = {
      ...parserDonneesTransfert(body),
      orientation: orientationsWizard[0],
    };
    const erreur = validerDonneesTransfert(donnees);

    if (erreur) {
      return NextResponse.json({ message: erreur }, { status: 400 });
    }

    const resultat = await transfererPatientAccueil(
      session.utilisateur.id,
      donnees as DonneesTransfertAccueil,
      opts
    );

    return NextResponse.json({
      message: `Patient orienté vers ${resultat.salleDestination}. Confirmez le transfert via le menu ⋮.`,
      ...resultat,
    });
  } catch (error) {
    console.error("[POST /api/medecins-externes/transferts]", error);
    const message =
      error instanceof Error ? error.message : "Transfert impossible.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
