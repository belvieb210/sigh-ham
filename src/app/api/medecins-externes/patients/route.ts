import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiMedecinsExternes } from "@/lib/auth/garde-api-medecins-externes";
import { exigerMedecinExterneId } from "@/lib/medecins-externes/assurer-fiche";
import { enregistrerPatientMedecinExterne } from "@/lib/medecins-externes/enregistrer-patient";
import {
  listerPatientsEnregistresMedecinExterne,
  listerPatientsRecentsMedecinExterne,
} from "@/lib/medecins-externes/lister-patients-reception-like";
import {
  parserDonneesEnregistrement,
  parserFormDataEnregistrement,
  validerDonneesEnregistrement,
} from "@/lib/reception/enregistrer-patient";
import { validerPhotoPatient } from "@/lib/reception/photo-patient";
import { rechercherPatientsReception } from "@/lib/reception/rechercher-patients-reception";
import type { DonneesEnregistrementPatient } from "@/lib/reception/types";

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiMedecinsExternes();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const medecinExterneId = exigerMedecinExterneId(
      session.utilisateur.medecinExterneId
    );
    const q = request.nextUrl.searchParams.get("q");
    const limiteParam = request.nextUrl.searchParams.get("limite");
    const limite = limiteParam ? parseInt(limiteParam, 10) : undefined;

    if (q !== null) {
      const patients = await rechercherPatientsReception(
        q,
        limite && limite > 0 ? limite : 8,
        { medecinExterneId, salleEnregistrement: "MEDECINS_EXTERNES" }
      );
      return NextResponse.json({ patients });
    }

    if (limite && limite > 0) {
      const patients = await listerPatientsRecentsMedecinExterne(
        medecinExterneId,
        limite
      );
      return NextResponse.json({ patients });
    }

    const resultat = await listerPatientsEnregistresMedecinExterne(
      medecinExterneId
    );
    return NextResponse.json(resultat);
  } catch (error) {
    console.error("[GET /api/medecins-externes/patients]", error);
    return NextResponse.json(
      { message: "Impossible de charger les patients." },
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
    const typeContenu = request.headers.get("content-type") ?? "";
    let donnees: Partial<DonneesEnregistrementPatient>;
    let photo: File | null = null;

    if (typeContenu.includes("multipart/form-data")) {
      const formData = await request.formData();
      const parse = parserFormDataEnregistrement(formData);
      donnees = parse.donnees;
      photo = parse.photo;
      if (photo) {
        const erreurPhoto = validerPhotoPatient(photo);
        if (erreurPhoto) {
          return NextResponse.json({ message: erreurPhoto }, { status: 400 });
        }
      }
    } else {
      const body = await request.json();
      donnees = parserDonneesEnregistrement(body);
    }

    const erreur = validerDonneesEnregistrement(donnees);
    if (erreur) {
      return NextResponse.json({ message: erreur }, { status: 400 });
    }

    const resultat = await enregistrerPatientMedecinExterne(
      session.utilisateur.id,
      medecinExterneId,
      donnees as DonneesEnregistrementPatient,
      photo
    );

    return NextResponse.json(
      { message: "Patient enregistré avec succès.", ...resultat },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/medecins-externes/patients]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Impossible d'enregistrer le patient.",
      },
      { status: 400 }
    );
  }
}
