import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiMessagerie } from "@/lib/auth/garde-api-messagerie";
import {
  ajouterParticipantsGroupe,
  modifierConversation,
  modifierPhotoGroupe,
  promouvoirAdminGroupe,
  renommerGroupe,
  retirerAdminGroupe,
  retirerParticipantGroupe,
} from "@/lib/messagerie/actions-avancees";
import {
  estRequeteMultipart,
  extraireImageForm,
  uploaderFichier,
} from "@/lib/stockage/fichiers";

type Params = { params: Promise<{ conversationId: string }> };

type ActionPatch =
  | "epingle"
  | "desepingle"
  | "archive"
  | "desarchive"
  | "ajouter_membres"
  | "retirer_membre"
  | "promouvoir_admin"
  | "retirer_admin"
  | "renommer_groupe"
  | "retirer_photo_groupe";

const TAILLE_MAX_PHOTO = 5 * 1024 * 1024;

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await obtenirSessionApiMessagerie();
  if (!session) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });

  const { conversationId } = await params;

  try {
    if (estRequeteMultipart(request.headers.get("content-type"))) {
      const form = await request.formData();
      const action = String(form.get("action") ?? "").trim();

      if (action === "photo_groupe") {
        const image = await extraireImageForm(form, "photo");
        if (!image) {
          return NextResponse.json(
            { message: "Image requise (JPEG, PNG, WebP ou GIF)." },
            { status: 400 }
          );
        }
        if (image.taille > TAILLE_MAX_PHOTO) {
          return NextResponse.json(
            { message: "L'image ne doit pas dépasser 5 Mo." },
            { status: 400 }
          );
        }
        const upload = await uploaderFichier(image.buffer, image.nom, image.mimeType);
        const resultat = await modifierPhotoGroupe(
          conversationId,
          session.utilisateur.id,
          upload.url
        );
        return NextResponse.json({ ok: true, ...resultat });
      }

      return NextResponse.json({ message: "Action inconnue." }, { status: 400 });
    }

    const body = (await request.json()) as {
      action: ActionPatch;
      participantIds?: string[];
      participantId?: string;
      sujet?: string;
    };

    if (body.action === "ajouter_membres") {
      if (!body.participantIds?.length) {
        return NextResponse.json(
          { message: "Sélectionnez au moins un collègue." },
          { status: 400 }
        );
      }
      const resultat = await ajouterParticipantsGroupe(
        conversationId,
        session.utilisateur.id,
        body.participantIds
      );
      return NextResponse.json({ ok: true, ...resultat });
    }

    if (body.action === "retirer_membre") {
      if (!body.participantId) {
        return NextResponse.json({ message: "Membre requis." }, { status: 400 });
      }
      const resultat = await retirerParticipantGroupe(
        conversationId,
        session.utilisateur.id,
        body.participantId
      );
      return NextResponse.json({ ok: true, ...resultat });
    }

    if (body.action === "promouvoir_admin") {
      if (!body.participantId) {
        return NextResponse.json({ message: "Membre requis." }, { status: 400 });
      }
      await promouvoirAdminGroupe(
        conversationId,
        session.utilisateur.id,
        body.participantId
      );
      return NextResponse.json({ ok: true });
    }

    if (body.action === "retirer_admin") {
      if (!body.participantId) {
        return NextResponse.json({ message: "Membre requis." }, { status: 400 });
      }
      await retirerAdminGroupe(
        conversationId,
        session.utilisateur.id,
        body.participantId
      );
      return NextResponse.json({ ok: true });
    }

    if (body.action === "renommer_groupe") {
      if (!body.sujet?.trim()) {
        return NextResponse.json(
          { message: "Le nom du groupe est obligatoire." },
          { status: 400 }
        );
      }
      const resultat = await renommerGroupe(
        conversationId,
        session.utilisateur.id,
        body.sujet
      );
      return NextResponse.json({ ok: true, ...resultat });
    }

    if (body.action === "retirer_photo_groupe") {
      const resultat = await modifierPhotoGroupe(
        conversationId,
        session.utilisateur.id,
        null
      );
      return NextResponse.json({ ok: true, ...resultat });
    }

    await modifierConversation(conversationId, session.utilisateur.id, body.action);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[PATCH /api/messagerie/conversations/[id]]", error);
    const msg = error instanceof Error ? error.message : "";
    if (msg === "SUJET_REQUIS") {
      return NextResponse.json(
        { message: "Le nom du groupe est obligatoire." },
        { status: 400 }
      );
    }
    if (msg === "AUCUN_NOUVEAU_PARTICIPANT") {
      return NextResponse.json(
        { message: "Ces collègues font déjà partie du groupe." },
        { status: 400 }
      );
    }
    if (msg === "DERNIER_ADMIN") {
      return NextResponse.json(
        { message: "Le groupe doit conserver au moins un administrateur." },
        { status: 400 }
      );
    }
    if (msg === "RETIRER_SOI_INTERDIT") {
      return NextResponse.json(
        { message: "Utilisez « Quitter le groupe » pour vous retirer." },
        { status: 400 }
      );
    }
    if (
      msg === "TYPE_INVALIDE" ||
      msg === "CONVERSATION_INACCESSIBLE" ||
      msg === "NON_ADMIN_GROUPE"
    ) {
      return NextResponse.json({ message: "Action non autorisée." }, { status: 403 });
    }
    if (msg === "PARTICIPANT_INTROUVABLE") {
      return NextResponse.json({ message: "Membre introuvable." }, { status: 404 });
    }
    if (msg === "DEJA_ADMIN" || msg === "PAS_ADMIN") {
      return NextResponse.json({ message: "Action impossible pour ce membre." }, { status: 400 });
    }
    return NextResponse.json(
      {
        message:
          msg && msg.length < 120
            ? msg
            : "Impossible de traiter la photo. Réessayez avec une image JPEG ou PNG.",
      },
      { status: 500 }
    );
  }
}
