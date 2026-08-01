/** Durée d'affichage du placeholder « Message supprimé » (1 heure). */
export const DUREE_AFFICHAGE_MESSAGE_SUPPRIME_MS = 60 * 60 * 1000;

export function messageSupprimeEncoreVisible(
  supprime: boolean,
  supprimeLe: string | Date | null | undefined,
  envoyeLe: string | Date
): boolean {
  if (!supprime) return true;
  const reference = supprimeLe ? new Date(supprimeLe) : new Date(envoyeLe);
  return Date.now() - reference.getTime() < DUREE_AFFICHAGE_MESSAGE_SUPPRIME_MS;
}

export function filtreMessagesSupprimeExpires<
  T extends { supprime: boolean; supprimeLe?: string | null; envoyeLe: string }
>(messages: T[]): T[] {
  return messages.filter((m) =>
    messageSupprimeEncoreVisible(m.supprime, m.supprimeLe, m.envoyeLe)
  );
}

export function seuilExpirationMessageSupprime(): Date {
  return new Date(Date.now() - DUREE_AFFICHAGE_MESSAGE_SUPPRIME_MS);
}
