/** Parse une réponse fetch en JSON avec message clair si le serveur renvoie du HTML. */
export async function lireReponseJson<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const texte = await res.text();
    const indiceHtml = texte.trimStart().startsWith("<!DOCTYPE") ||
      texte.trimStart().startsWith("<html");
    throw new Error(
      indiceHtml
        ? `Le serveur a renvoyé une page web au lieu de JSON (${res.status}). Vérifiez que l'application est bien démarrée et reconnectez-vous si besoin.`
        : `Réponse serveur invalide (${res.status}). Réessayez dans un instant.`
    );
  }
  return res.json() as Promise<T>;
}
