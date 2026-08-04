import { NextResponse } from "next/server";
import { obtenirSessionApiMedecinsExternes } from "@/lib/auth/garde-api-medecins-externes";
import {
  assertDossierDuMedecinExterne,
  exigerMedecinExterneId,
} from "@/lib/medecins-externes/assurer-fiche";
import { creerOrdonnance } from "@/lib/medecins/gestion-ordonnance";
import { prisma } from "@/lib/prisma";
import { reorienterPatientDepuisMedecinsExternes } from "@/lib/medecins-externes/reorienter-patient";

export async function GET(req: Request) {
  const session = await obtenirSessionApiMedecinsExternes();
  if (!session) return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });

  try {
    const medecinExterneId = exigerMedecinExterneId(
      session.utilisateur.medecinExterneId
    );
    const { searchParams } = new URL(req.url);
    const dossierId = searchParams.get("dossierId")?.trim();
    if (dossierId) {
      await assertDossierDuMedecinExterne(dossierId, medecinExterneId);
    }

    const rows = await prisma.ordonnance.findMany({
      where: {
        medecinId: session.utilisateur.id,
        ...(dossierId ? { dossierId } : {}),
        dossier: { patient: { medecinExterneId } },
      },
      include: {
        lignes: { include: { medicament: true } },
        dossier: { include: { patient: true } },
        medecin: { select: { prenom: true, nom: true } },
      },
      orderBy: { prescritLe: "desc" },
      take: 50,
    });

    return NextResponse.json({
      ordonnances: rows.map((o) => ({
        id: o.id,
        dossierId: o.dossierId,
        statut: o.statut,
        notes: o.notes,
        prescritLe: o.prescritLe.toISOString(),
        patient: `${o.dossier.patient.prenom} ${o.dossier.patient.nom}`.trim(),
        numeroDossier: o.dossier.numeroDossier,
        lignes: o.lignes.map((l) => ({
          id: l.id,
          quantite: l.quantite,
          posologie: l.posologie,
          dureeJours: l.dureeJours,
          medicament: {
            id: l.medicament.id,
            nom: l.medicament.nom,
            dosage: l.medicament.dosage,
          },
        })),
      })),
    });
  } catch (e) {
    const code = e instanceof Error ? e.message : "";
    if (code === "DOSSIER_NON_AUTORISE") {
      return NextResponse.json({ erreur: "Accès refusé." }, { status: 403 });
    }
    return NextResponse.json({ erreur: "Erreur." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await obtenirSessionApiMedecinsExternes();
  if (!session) return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });

  try {
    const medecinExterneId = exigerMedecinExterneId(
      session.utilisateur.medecinExterneId
    );
    const body = (await req.json()) as {
      dossierId?: string;
      notes?: string | null;
      orienterVersCaisse?: boolean;
      lignes?: {
        medicamentId: string;
        quantite: number;
        posologie?: string | null;
        dureeJours?: number | null;
      }[];
    };

    if (!body.dossierId?.trim() || !Array.isArray(body.lignes)) {
      return NextResponse.json(
        { erreur: "dossierId et lignes requis." },
        { status: 400 }
      );
    }

    await assertDossierDuMedecinExterne(body.dossierId, medecinExterneId);

    const { ordonnance } = await creerOrdonnance(session.utilisateur.id, {
      dossierId: body.dossierId,
      notes: body.notes,
      lignes: body.lignes,
      orienterVersPharmacie: false,
    });

    let transfertCaisse: { ok: boolean; message?: string } | undefined;
    if (body.orienterVersCaisse !== false) {
      try {
        await reorienterPatientDepuisMedecinsExternes(
          session.utilisateur.id,
          medecinExterneId,
          body.dossierId,
          ["CAISSE"]
        );
        transfertCaisse = { ok: true };
      } catch (e) {
        transfertCaisse = {
          ok: false,
          message: e instanceof Error ? e.message : "Orientation caisse impossible.",
        };
      }
    }

    return NextResponse.json({ ordonnance, transfertCaisse }, { status: 201 });
  } catch (e) {
    const code = e instanceof Error ? e.message : "";
    if (code === "DOSSIER_NON_AUTORISE") {
      return NextResponse.json({ erreur: "Accès refusé." }, { status: 403 });
    }
    return NextResponse.json(
      { erreur: e instanceof Error ? e.message : "Erreur." },
      { status: 400 }
    );
  }
}
