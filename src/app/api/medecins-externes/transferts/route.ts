import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiMedecinsExternes } from "@/lib/auth/garde-api-medecins-externes";
import { exigerMedecinExterneId } from "@/lib/medecins-externes/assurer-fiche";
import { listerPatientsTransferesMedecinExterne } from "@/lib/medecins-externes/lister-patients-reception-like";
import { reorienterPatientDepuisMedecinsExternes } from "@/lib/medecins-externes/reorienter-patient";
import { finaliserTransfertMedecinsExternes } from "@/lib/medecins-externes/gestion-transfert";
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

    const corpsReorientation = body as {
      dossierId?: string;
      orientations?: string[];
      orientation?: string;
    };
    const orientationsDirectes = [
      ...new Set(
        (corpsReorientation.orientations?.filter(Boolean) ??
          (corpsReorientation.orientation?.trim()
            ? [corpsReorientation.orientation.trim()]
            : [])) as string[]
      ),
    ];
    const dossierIdDirect = corpsReorientation.dossierId?.trim() || "";

    if (
      dossierIdDirect &&
      orientationsDirectes.length > 0 &&
      !(body as { transfertManuel?: boolean }).transfertManuel
    ) {
      const resultat = await reorienterPatientDepuisMedecinsExternes(
        session.utilisateur.id,
        medecinExterneId,
        dossierIdDirect,
        orientationsDirectes
      );
      const finalise = await finaliserTransfertMedecinsExternes(
        session.utilisateur.id,
        medecinExterneId,
        resultat
      );
      return NextResponse.json(finalise);
    }

    if (
      body &&
      typeof body === "object" &&
      (body as { transfertManuel?: boolean }).transfertManuel
    ) {
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
          const finalise = await finaliserTransfertMedecinsExternes(
            session.utilisateur.id,
            medecinExterneId,
            cree
          );
          return NextResponse.json(finalise);
        }
      }

      const resultat = await reorienterPatientDepuisMedecinsExternes(
        session.utilisateur.id,
        medecinExterneId,
        dossierId,
        orientations
      );

      const finalise = await finaliserTransfertMedecinsExternes(
        session.utilisateur.id,
        medecinExterneId,
        resultat
      );
      return NextResponse.json(finalise);
    }

    const donnees = parserDonneesTransfert(body);
    const erreur = validerDonneesTransfert(donnees);

    if (erreur) {
      return NextResponse.json({ message: erreur }, { status: 400 });
    }

    const resultat = await transfererPatientAccueil(
      session.utilisateur.id,
      donnees as DonneesTransfertAccueil,
      opts
    );

    const finalise = await finaliserTransfertMedecinsExternes(
      session.utilisateur.id,
      medecinExterneId,
      resultat
    );
    return NextResponse.json(finalise);
  } catch (error) {
    console.error("[POST /api/medecins-externes/transferts]", error);
    const message =
      error instanceof Error ? error.message : "Transfert impossible.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
