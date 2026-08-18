import { NextRequest, NextResponse } from "next/server";
import type { Sexe } from "@/generated/prisma/client";
import {
  obtenirSessionApiAdmin,
  reponseNonAutoriseAdmin,
} from "@/lib/auth/garde-api-admin";
import {
  mettreAJourPersonneAdmin,
  obtenirPersonneAdmin,
  supprimerPersonneAdmin,
} from "@/lib/admin/patients";

const SEXES: Sexe[] = ["MASCULIN", "FEMININ", "AUTRE"];

function sexeDepuisBody(valeur: unknown): Sexe | null | undefined {
  if (valeur === undefined) return undefined;
  if (valeur === null || valeur === "") return null;
  const s = String(valeur);
  return SEXES.includes(s as Sexe) ? (s as Sexe) : null;
}

function texteOptionnel(valeur: unknown): string | null | undefined {
  if (valeur === undefined) return undefined;
  if (valeur === null) return null;
  return String(valeur);
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  const { id } = await context.params;
  const personne = await obtenirPersonneAdmin(id);
  if (!personne) {
    return NextResponse.json({ message: "Introuvable." }, { status: 404 });
  }
  return NextResponse.json({ personne });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  const { id } = await context.params;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const maj = await mettreAJourPersonneAdmin(session.utilisateur.id, id, {
      prenom: body.prenom != null ? String(body.prenom) : undefined,
      nom: body.nom != null ? String(body.nom) : undefined,
      dateNaissance:
        body.dateNaissance === undefined
          ? undefined
          : body.dateNaissance
            ? String(body.dateNaissance)
            : null,
      sexe: sexeDepuisBody(body.sexe),
      telephone: texteOptionnel(body.telephone),
      email: texteOptionnel(body.email),
      adresse: texteOptionnel(body.adresse),
      ville: texteOptionnel(body.ville),
      province: texteOptionnel(body.province),
      pays: texteOptionnel(body.pays),
      groupeSanguin: texteOptionnel(body.groupeSanguin),
      allergies: texteOptionnel(body.allergies),
      contactUrgence: texteOptionnel(body.contactUrgence),
      telephoneUrgence: texteOptionnel(body.telephoneUrgence),
    });
    return NextResponse.json({
      message: "Fiche mise à jour.",
      personne: maj,
    });
  } catch (error) {
    console.error("[PATCH /api/admin/patients/:id]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Modification impossible.",
      },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await obtenirSessionApiAdmin();
  if (!session) return reponseNonAutoriseAdmin();

  const { id } = await context.params;

  try {
    await supprimerPersonneAdmin(session.utilisateur.id, id);
    return NextResponse.json({ message: "Fiche supprimée." });
  } catch (error) {
    console.error("[DELETE /api/admin/patients/:id]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Suppression impossible.",
      },
      { status: 400 }
    );
  }
}
