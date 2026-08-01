import "server-only";

export function lienMessagerieReception(conversationId: string): string {
  return `/sigh/reception/messagerie?conversation=${encodeURIComponent(conversationId)}`;
}
