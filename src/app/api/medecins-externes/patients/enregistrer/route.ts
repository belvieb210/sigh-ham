import { NextResponse } from "next/server";
import { obtenirSessionApiMedecinsExternes } from "@/lib/auth/garde-api-medecins-externes";
import { enregistrerPatientMedecinExterne } from "@/lib/medecins-externes/enregistrer-patient";
import { exigerMedecinExterneId } from "@/lib/medecins-externes/assurer-fiche";
import {
  parserDonneesEnregistrement,
  parserFormDataEnregistrement,
} from "@/lib/reception/enregistrer-patient";
import type { DonneesEnregistrementPatient } from "@/lib/reception/types";
import { reorienterPatientDepuisMedecinsExternes } from "@/lib/medecins-externes/reorienter-patient";

export async function POST(request: Request) {
  const session = await obtenirSessionApiMedecinsExternes();
  if (!session) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });

  try {
    const medecinExterneId = exigerMedecinExterneId(
      session.utilisateur.medecinExterneId
    );
    const contentType = request.headers.get("content-type") ?? "";
    let donnees: Partial<DonneesEnregistrementPatient>;
    let photo: File | null = null;
    let orientations: string[] = ["CAISSE"];

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const parsed = parserFormDataEnregistrement(form);
      donnees = parsed.donnees;
      photo = parsed.photo;
      const raw = form.get("orientations");
      if (typeof raw === "string" && raw.trim()) {
        try {
          const arr = JSON.parse(raw) as string[];
          if (Array.isArray(arr) && arr.length) orientations = arr;
        } catch {
          /* ignore */
        }
      }
    } else {
      const body = (await request.json()) as Record<string, unknown>;
      donnees = parserDonneesEnregistrement(body);
      if (Array.isArray(body.orientations) && body.orientations.length) {
        orientations = body.orientations.map(String);
      }
    }

    const resultat = await enregistrerPatientMedecinExterne(
      session.utilisateur.id,
      medecinExterneId,
      donnees as DonneesEnregistrementPatient,
      photo
    );

    let transfert = null;
    if (orientations.length > 0) {
      try {
        transfert = await reorienterPatientDepuisMedecinsExternes(
          session.utilisateur.id,
          medecinExterneId,
          resultat.dossierId,
          orientations
        );
      } catch (e) {
        console.warn("[medecins-externes] orientation post-enregistrement", e);
      }
    }

    return NextResponse.json(
      {
        message: "Patient enregistré.",
        ...resultat,
        transfert,
      },
      { status: 201 }
    );
  } catch (e) {
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Erreur." },
      { status: 400 }
    );
  }
}
