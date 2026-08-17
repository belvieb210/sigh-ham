import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiMedecinsExternes } from "@/lib/auth/garde-api-medecins-externes";
import {
  assertDossierDuMedecinExterne,
  exigerMedecinExterneId,
} from "@/lib/medecins-externes/assurer-fiche";
import { calculerAge } from "@/features/caisse/utils-format";
import {
  parserFormDataEnregistrement,
  validerDonneesEnregistrement,
} from "@/lib/reception/enregistrer-patient";
import { mettreAJourPatient } from "@/lib/reception/mettre-a-jour-patient";
import { obtenirPatientPourFormulaire } from "@/lib/reception/obtenir-patient-formulaire";
import { validerPhotoPatient } from "@/lib/reception/photo-patient";
import { supprimerPatientDefinitivement } from "@/lib/reception/supprimer-patient";
import { prisma } from "@/lib/prisma";
import type { DonneesEnregistrementPatient } from "@/lib/reception/types";

interface ParamsRoute {
  params: Promise<{ dossierId: string }>;
}

function estNumeroPatient(valeur: string): boolean {
  return /^PAT/i.test(valeur) || valeur.includes("-20");
}

async function assertAppartenanceNumero(
  numeroPatient: string,
  medecinExterneId: string
) {
  const patient = await prisma.patient.findUnique({
    where: { numeroPatient },
    select: { medecinExterneId: true },
  });
  if (!patient) {
    return { ok: false as const, status: 404 as const, message: "Patient introuvable." };
  }
  if (patient.medecinExterneId !== medecinExterneId) {
    return {
      ok: false as const,
      status: 403 as const,
      message: "Accès refusé à ce patient.",
    };
  }
  return { ok: true as const };
}

/** GET : numéro patient (formulaire) OU dossierId (fiche médicale). */
export async function GET(_request: NextRequest, { params }: ParamsRoute) {
  const session = await obtenirSessionApiMedecinsExternes();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const medecinExterneId = exigerMedecinExterneId(
      session.utilisateur.medecinExterneId
    );
    const { dossierId: id } = await params;
    const decode = decodeURIComponent(id);

    if (estNumeroPatient(decode)) {
      const check = await assertAppartenanceNumero(decode, medecinExterneId);
      if (!check.ok) {
        return NextResponse.json(
          { message: check.message },
          { status: check.status }
        );
      }
      const patient = await obtenirPatientPourFormulaire(decode);
      if (!patient) {
        return NextResponse.json({ message: "Patient introuvable." }, { status: 404 });
      }
      return NextResponse.json(patient);
    }

    await assertDossierDuMedecinExterne(decode, medecinExterneId);
    const dossier = await prisma.dossierPatient.findUnique({
      where: { id: decode },
      include: {
        patient: true,
        constantesVitales: { orderBy: { mesureLe: "desc" }, take: 1 },
      },
    });
    if (!dossier) {
      return NextResponse.json({ erreur: "Introuvable." }, { status: 404 });
    }
    const c = dossier.constantesVitales[0];
    return NextResponse.json({
      patient: {
        dossierId: dossier.id,
        numeroDossier: dossier.numeroDossier,
        nomComplet: `${dossier.patient.prenom} ${dossier.patient.nom}`.trim(),
        numeroPatient: dossier.patient.numeroPatient,
        age: calculerAge(
          dossier.patient.dateNaissance
            ? dossier.patient.dateNaissance.toISOString()
            : null
        ),
        sexe: dossier.patient.sexe,
        telephone: dossier.patient.telephone,
        constantes: c
          ? {
              temperature: c.temperature != null ? Number(c.temperature) : null,
              tensionSystolique: c.tensionSystolique,
              tensionDiastolique: c.tensionDiastolique,
              frequenceCardiaque: c.frequenceCardiaque,
              saturationO2:
                c.saturationO2 != null ? Number(c.saturationO2) : null,
            }
          : null,
      },
    });
  } catch (e) {
    const code = e instanceof Error ? e.message : "";
    if (code === "DOSSIER_NON_AUTORISE") {
      return NextResponse.json({ erreur: "Accès refusé." }, { status: 403 });
    }
    console.error("[GET /api/medecins-externes/patients/[id]]", e);
    return NextResponse.json({ message: "Erreur." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: ParamsRoute) {
  const session = await obtenirSessionApiMedecinsExternes();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const medecinExterneId = exigerMedecinExterneId(
      session.utilisateur.medecinExterneId
    );
    const { dossierId: id } = await params;
    const decode = decodeURIComponent(id);
    const check = await assertAppartenanceNumero(decode, medecinExterneId);
    if (!check.ok) {
      return NextResponse.json({ message: check.message }, { status: check.status });
    }

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

    return NextResponse.json({
      message: "Patient mis à jour avec succès.",
      ...resultat,
    });
  } catch (error) {
    console.error("[PUT /api/medecins-externes/patients/[id]]", error);
    const message =
      error instanceof Error ? error.message : "Erreur lors de la modification.";
    const status = message === "Patient introuvable." ? 404 : 500;
    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE(_request: NextRequest, { params }: ParamsRoute) {
  const session = await obtenirSessionApiMedecinsExternes();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const medecinExterneId = exigerMedecinExterneId(
      session.utilisateur.medecinExterneId
    );
    const { dossierId: id } = await params;
    const decode = decodeURIComponent(id);
    const check = await assertAppartenanceNumero(decode, medecinExterneId);
    if (!check.ok) {
      return NextResponse.json({ message: check.message }, { status: check.status });
    }

    await supprimerPatientDefinitivement(decode);
    return NextResponse.json({
      message: "Patient supprimé définitivement.",
      numeroPatient: decode,
    });
  } catch (error) {
    console.error("[DELETE /api/medecins-externes/patients/[id]]", error);
    const message =
      error instanceof Error ? error.message : "Erreur lors de la suppression.";
    const status = message === "Patient introuvable." ? 404 : 500;
    return NextResponse.json({ message }, { status });
  }
}
