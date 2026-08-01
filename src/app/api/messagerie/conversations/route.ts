import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiMessagerie } from "@/lib/auth/garde-api-messagerie";
import { listerConversations } from "@/lib/messagerie/lister-conversations";
import { creerConversation } from "@/lib/messagerie/creer-conversation";
import type { FiltreConversation, PayloadCreerConversation } from "@/lib/messagerie/types";
import type { TypeConversation } from "@/generated/prisma/enums";
import { uploaderFichier, extraireImageForm, estRequeteMultipart } from "@/lib/stockage/fichiers";

const TAILLE_MAX_PHOTO = 5 * 1024 * 1024;

async function parserCorpsCreation(request: NextRequest): Promise<PayloadCreerConversation> {
  const contentType = request.headers.get("content-type") ?? "";

  if (estRequeteMultipart(contentType)) {
    const form = await request.formData();
    const type = form.get("type") as TypeConversation;
    const sujet = String(form.get("sujet") ?? "").trim();
    const categorieGroupe = form.get("categorieGroupe");
    const participantIdsRaw = form.get("participantIds");
    let participantIds: string[] | undefined;
    if (typeof participantIdsRaw === "string" && participantIdsRaw) {
      try {
        participantIds = JSON.parse(participantIdsRaw) as string[];
      } catch {
        participantIds = undefined;
      }
    }

    let photoUrl: string | undefined;
    const image = await extraireImageForm(form, "photo");
    if (image) {
      if (image.taille > TAILLE_MAX_PHOTO) {
        throw new Error("PHOTO_TROP_VOLUMINEUSE");
      }
      const upload = await uploaderFichier(image.buffer, image.nom, image.mimeType);
      photoUrl = upload.url;
    }

    return {
      type,
      sujet,
      photoUrl,
      participantIds,
      categorieGroupe: categorieGroupe
        ? (String(categorieGroupe) as PayloadCreerConversation["categorieGroupe"])
        : undefined,
    };
  }

  return (await request.json()) as PayloadCreerConversation;
}

export async function GET(request: NextRequest) {
  const session = await obtenirSessionApiMessagerie();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const filtre = (request.nextUrl.searchParams.get("filtre") ?? "tous") as FiltreConversation;
    const recherche = request.nextUrl.searchParams.get("q") ?? undefined;
    const salleCode = session.utilisateur.role.salle?.code ?? null;

    const conversations = await listerConversations(
      session.utilisateur.id,
      salleCode,
      { filtre, recherche }
    );

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("[GET /api/messagerie/conversations]", error);
    return NextResponse.json(
      { message: "Impossible de charger les conversations." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await obtenirSessionApiMessagerie();
  if (!session) {
    return NextResponse.json({ message: "Non autorisé." }, { status: 401 });
  }

  try {
    const body = await parserCorpsCreation(request);
    const type = body.type as TypeConversation;

    if (!type) {
      return NextResponse.json({ message: "Type de conversation requis." }, { status: 400 });
    }

    const resultat = await creerConversation(session.utilisateur.id, {
      ...body,
      type,
    });

    return NextResponse.json(resultat, { status: resultat.existante ? 200 : 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "SUJET_REQUIS") {
      return NextResponse.json(
        { message: "Le nom du groupe est obligatoire." },
        { status: 400 }
      );
    }
    if (msg === "PHOTO_TYPE_INVALIDE") {
      return NextResponse.json(
        { message: "Seules les images sont acceptées." },
        { status: 400 }
      );
    }
    if (msg === "PHOTO_TROP_VOLUMINEUSE") {
      return NextResponse.json(
        { message: "L'image ne doit pas dépasser 5 Mo." },
        { status: 400 }
      );
    }
    if (msg === "PARTICIPANT_REQUIS" || msg === "PARTICIPANTS_REQUIS") {
      return NextResponse.json({ message: "Sélectionnez au moins un destinataire." }, { status: 400 });
    }
    if (msg === "PREMIER_MESSAGE_REQUIS") {
      return NextResponse.json(
        { message: "Un premier message est requis pour démarrer la conversation." },
        { status: 400 }
      );
    }
    if (msg === "TYPE_INVALIDE") {
      return NextResponse.json({ message: "Type de conversation invalide." }, { status: 400 });
    }
    console.error("[POST /api/messagerie/conversations]", error);
    return NextResponse.json(
      { message: "Impossible de créer la conversation." },
      { status: 500 }
    );
  }
}
