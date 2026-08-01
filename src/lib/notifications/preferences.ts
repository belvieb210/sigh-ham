import "server-only";
import { prisma } from "@/lib/prisma";
import type { TypeNotification } from "@/generated/prisma/enums";

export interface PreferencesNotificationDto {
  inApp: boolean;
  tableauBord: boolean;
  push: boolean;
  son: boolean;
  email: boolean;
  sms: boolean;
  silencieux: boolean;
  typesSilencieux: TypeNotification[];
}

const DEFAUT: PreferencesNotificationDto = {
  inApp: true,
  tableauBord: true,
  push: false,
  son: true,
  email: false,
  sms: false,
  silencieux: false,
  typesSilencieux: [],
};

export async function obtenirPreferencesNotification(
  utilisateurId: string
): Promise<PreferencesNotificationDto> {
  const prefs = await prisma.preferenceNotification.findUnique({
    where: { utilisateurId },
  });
  if (!prefs) return DEFAUT;
  return {
    inApp: prefs.inApp,
    tableauBord: prefs.tableauBord,
    push: prefs.push,
    son: prefs.son,
    email: prefs.email,
    sms: prefs.sms,
    silencieux: prefs.silencieux,
    typesSilencieux: prefs.typesSilencieux ?? [],
  };
}

export async function mettreAJourPreferencesNotification(
  utilisateurId: string,
  donnees: Partial<PreferencesNotificationDto>
) {
  return prisma.preferenceNotification.upsert({
    where: { utilisateurId },
    create: {
      utilisateurId,
      inApp: donnees.inApp ?? DEFAUT.inApp,
      tableauBord: donnees.tableauBord ?? DEFAUT.tableauBord,
      push: donnees.push ?? DEFAUT.push,
      son: donnees.son ?? DEFAUT.son,
      email: donnees.email ?? DEFAUT.email,
      sms: donnees.sms ?? DEFAUT.sms,
      silencieux: donnees.silencieux ?? DEFAUT.silencieux,
      typesSilencieux: donnees.typesSilencieux ?? DEFAUT.typesSilencieux,
    },
    update: {
      ...(donnees.inApp !== undefined ? { inApp: donnees.inApp } : {}),
      ...(donnees.tableauBord !== undefined ? { tableauBord: donnees.tableauBord } : {}),
      ...(donnees.push !== undefined ? { push: donnees.push } : {}),
      ...(donnees.son !== undefined ? { son: donnees.son } : {}),
      ...(donnees.email !== undefined ? { email: donnees.email } : {}),
      ...(donnees.sms !== undefined ? { sms: donnees.sms } : {}),
      ...(donnees.silencieux !== undefined ? { silencieux: donnees.silencieux } : {}),
      ...(donnees.typesSilencieux !== undefined
        ? { typesSilencieux: donnees.typesSilencieux }
        : {}),
    },
  });
}
