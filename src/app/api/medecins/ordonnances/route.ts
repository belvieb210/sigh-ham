import { NextResponse } from "next/server";
import { obtenirSessionApiMedecins } from "@/lib/auth/garde-api-medecins";
import {
  creerOrdonnance,
  listerOrdonnancesMedecins,
} from "@/lib/medecins/gestion-ordonnance";

export async function GET(req: Request) {
  const session = await obtenirSessionApiMedecins();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const dossierId = searchParams.get("dossierId")?.trim() || undefined;
    const ordonnances = await listerOrdonnancesMedecins({ dossierId });
    return NextResponse.json({ ordonnances });
  } catch (e) {
    console.error("[api/medecins/ordonnances GET]", e);
    return NextResponse.json(
      { erreur: "Impossible de charger les ordonnances." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await obtenirSessionApiMedecins();
  if (!session) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      dossierId?: string;
      notes?: string | null;
      detailsPrescription?: Record<string, unknown> | null;
      orienterVersPharmacie?: boolean;
      orienterVersCaisse?: boolean;
      typeExamenIds?: string[];
      paquetsBilanIds?: string[];
      lignes?: {
        medicamentId: string;
        quantite: number;
        posologie?: string | null;
        dureeJours?: number | null;
      }[];
    };

    if (!body.dossierId?.trim()) {
      return NextResponse.json({ erreur: "dossierId requis." }, { status: 400 });
    }

    const lignes = body.lignes ?? [];
    const typeExamenIds = body.typeExamenIds ?? [];
    const paquetsBilanIds = body.paquetsBilanIds ?? [];
    const aContenu =
      lignes.some((l) => l.medicamentId?.trim()) ||
      typeExamenIds.length > 0 ||
      paquetsBilanIds.length > 0 ||
      Boolean(body.detailsPrescription);

    if (!aContenu) {
      return NextResponse.json(
        { erreur: "Ajoutez au moins un médicament, un examen ou de l'imagerie." },
        { status: 400 }
      );
    }

    let examens = null;
    if (typeExamenIds.length > 0 || paquetsBilanIds.length > 0) {
      const { prescrireExamensMedecins } = await import(
        "@/lib/medecins/prescrire-examens"
      );
      examens = await prescrireExamensMedecins(session.utilisateur.id, {
        dossierId: body.dossierId,
        typeExamenIds,
        paquetsBilanIds,
        notes: body.notes,
      });
    }

    let ordonnance = null;
    let transfertPharmacie = undefined;
    let transfertCaisse: { ok: boolean; message?: string } | undefined;
    if (
      lignes.some((l) => l.medicamentId?.trim()) ||
      body.detailsPrescription
    ) {
      const resultat = await creerOrdonnance(session.utilisateur.id, {
        dossierId: body.dossierId,
        notes: body.notes,
        detailsPrescription: body.detailsPrescription,
        lignes,
        orienterVersPharmacie:
          body.orienterVersCaisse === true ? false : body.orienterVersPharmacie,
      });
      ordonnance = resultat.ordonnance;
      transfertPharmacie = resultat.transfertPharmacie;
    }

    const orienterCaisse =
      body.orienterVersCaisse === true ||
      (body.orienterVersCaisse !== false &&
        (typeExamenIds.length > 0 ||
          paquetsBilanIds.length > 0 ||
          lignes.some((l) => l.medicamentId?.trim())));
    if (orienterCaisse) {
      try {
        const { reorienterPatientDepuisMedecins } = await import(
          "@/lib/medecins/reorienter-patient-medecins"
        );
        await reorienterPatientDepuisMedecins(session.utilisateur.id, body.dossierId, [
          "CAISSE",
        ]);
        transfertCaisse = { ok: true };
      } catch (e) {
        transfertCaisse = {
          ok: false,
          message: e instanceof Error ? e.message : "Orientation caisse impossible.",
        };
      }
    }

    return NextResponse.json(
      { ordonnance, examens, transfertPharmacie, transfertCaisse },
      { status: 201 }
    );
  } catch (e) {
    const code = e instanceof Error ? e.message : "";
    if (code === "DOSSIER_INTROUVABLE") {
      return NextResponse.json({ erreur: "Dossier introuvable." }, { status: 404 });
    }
    if (
      code === "LIGNES_REQUISES" ||
      code === "DOSSIER_ID_REQUIS" ||
      code === "MEDICAMENT_REQUIS" ||
      code === "QUANTITE_INVALIDE" ||
      code === "MEDICAMENT_INVALIDE"
    ) {
      return NextResponse.json(
        { erreur: "Ordonnance invalide : vérifiez les lignes." },
        { status: 400 }
      );
    }
    console.error("[api/medecins/ordonnances POST]", e);
    return NextResponse.json(
      { erreur: "Impossible de créer l'ordonnance." },
      { status: 500 }
    );
  }
}
