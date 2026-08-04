import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiEglise } from "@/lib/auth/garde-api-eglise";
import {
  parserFormDataEnregistrement,
  validerDonneesEnregistrement,
} from "@/lib/reception/enregistrer-patient";
import { mettreAJourPatient } from "@/lib/reception/mettre-a-jour-patient";
import { obtenirPatientPourFormulaire } from "@/lib/reception/obtenir-patient-formulaire";
import { validerPhotoPatient } from "@/lib/reception/photo-patient";
import { supprimerPatientDefinitivement } from "@/lib/reception/supprimer-patient";
import { assurerDossierPrenuptial } from "@/lib/eglise/pack-prenuptial";
import type { DonneesEnregistrementPatient } from "@/lib/reception/types";

interface ParamsRoute {
  params: Promise<{ numeroPatient: string }>;
}

export async function GET(_request: NextRequest, { params }: ParamsRoute) {
  const session = await obtenirSessionApiEglise();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const { numeroPatient } = await params;
    const decode = decodeURIComponent(numeroPatient);
    const patient = await obtenirPatientPourFormulaire(decode);
    if (!patient) {
      return NextResponse.json({ message: "Patient introuvable." }, { status: 404 });
    }
    return NextResponse.json(patient);
  } catch (error) {
    console.error("[GET /api/eglise/patients/[numero]]", error);
    return NextResponse.json(
      { message: "Impossible de charger le patient." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: ParamsRoute) {
  const session = await obtenirSessionApiEglise();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const { numeroPatient } = await params;
    const decode = decodeURIComponent(numeroPatient);
    const formData = await request.formData();
    const parse = parserFormDataEnregistrement(formData);
    if (parse.photo) {
      const erreurPhoto = validerPhotoPatient(parse.photo);
      if (erreurPhoto) {
        return NextResponse.json({ message: erreurPhoto }, { status: 400 });
      }
    }
    const erreur = validerDonneesEnregistrement(parse.donnees);
    if (erreur) {
      return NextResponse.json({ message: erreur }, { status: 400 });
    }

    const resultat = await mettreAJourPatient(
      decode,
      session.utilisateur.id,
      parse.donnees as DonneesEnregistrementPatient,
      parse.photo
    );

    if (resultat.dossierId) {
      await assurerDossierPrenuptial(resultat.dossierId, session.utilisateur.id, {
        paroisse: String(formData.get("paroisse") ?? "").trim() || undefined,
        dateMariage: String(formData.get("dateMariage") ?? "").trim() || undefined,
        conjointNom: String(formData.get("conjointNom") ?? "").trim() || undefined,
      });
    }

    return NextResponse.json({
      message: "Patient mis à jour avec succès.",
      ...resultat,
    });
  } catch (error) {
    console.error("[PUT /api/eglise/patients/[numero]]", error);
    const message =
      error instanceof Error ? error.message : "Erreur lors de la modification.";
    return NextResponse.json(
      { message },
      { status: message === "Patient introuvable." ? 404 : 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: ParamsRoute) {
  const session = await obtenirSessionApiEglise();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const { numeroPatient } = await params;
    const decode = decodeURIComponent(numeroPatient);
    await supprimerPatientDefinitivement(decode);
    return NextResponse.json({
      message: "Patient supprimé définitivement.",
      numeroPatient: decode,
    });
  } catch (error) {
    console.error("[DELETE /api/eglise/patients/[numero]]", error);
    const message =
      error instanceof Error ? error.message : "Erreur lors de la suppression.";
    return NextResponse.json(
      { message },
      { status: message === "Patient introuvable." ? 404 : 500 }
    );
  }
}
