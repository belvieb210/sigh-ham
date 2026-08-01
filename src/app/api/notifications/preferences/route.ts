import { NextRequest, NextResponse } from "next/server";
import { obtenirSessionApiMessagerie } from "@/lib/auth/garde-api-messagerie";
import {
  obtenirPreferencesNotification,
  mettreAJourPreferencesNotification,
} from "@/lib/notifications/preferences";
import type { TypeNotification } from "@/generated/prisma/enums";

export async function GET() {
  const session = await obtenirSessionApiMessagerie();
  if (!session) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });

  const preferences = await obtenirPreferencesNotification(session.utilisateur.id);
  return NextResponse.json({ preferences });
}

export async function PATCH(request: NextRequest) {
  const session = await obtenirSessionApiMessagerie();
  if (!session) return NextResponse.json({ message: "Non autorisé." }, { status: 401 });

  const body = (await request.json()) as Partial<{
    inApp: boolean;
    tableauBord: boolean;
    push: boolean;
    son: boolean;
    email: boolean;
    sms: boolean;
    silencieux: boolean;
    typesSilencieux: TypeNotification[];
  }>;

  const preferences = await mettreAJourPreferencesNotification(session.utilisateur.id, body);
  return NextResponse.json({
    preferences: {
      inApp: preferences.inApp,
      tableauBord: preferences.tableauBord,
      push: preferences.push,
      son: preferences.son,
      email: preferences.email,
      sms: preferences.sms,
      silencieux: preferences.silencieux,
      typesSilencieux: preferences.typesSilencieux ?? [],
    },
  });
}
