import {
  extraireNomFichierContentDisposition,
  nomFichierResultatPdf,
} from "@/lib/laboratoire/pdf-resultats/nom-fichier-resultat-pdf";

const ID_OVERLAY_PDF = "sigh-overlay-pdf-resultat-labo";

function estAppareilMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) ||
    (navigator.maxTouchPoints > 0 && window.innerWidth < 1024)
  );
}

function fermerOverlayPdf(urlARevoquer?: string | null) {
  document.getElementById(ID_OVERLAY_PDF)?.remove();
  if (urlARevoquer?.startsWith("blob:")) {
    try {
      URL.revokeObjectURL(urlARevoquer);
    } catch {
      /* ignore */
    }
  }
}

function telechargerViaBlob(blob: Blob, nomFichier: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomFichier;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function ouvrirDansNouvelOnglet(url: string): boolean {
  const fenetre = window.open(url, "_blank", "noopener,noreferrer");
  return Boolean(fenetre);
}

function afficherApercuPdf(blob: Blob, nomFichier: string): void {
  fermerOverlayPdf();

  const estMobile = estAppareilMobile();
  const blobUrl = URL.createObjectURL(blob);

  const overlay = document.createElement("div");
  overlay.id = ID_OVERLAY_PDF;
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Aperçu du résultat PDF");
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    zIndex: "99999",
    background: "rgba(15, 23, 42, 0.92)",
    display: "flex",
    flexDirection: "column",
  } as CSSStyleDeclaration);

  const barre = document.createElement("div");
  Object.assign(barre.style, {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    padding: "10px 12px",
    background: "#0f172a",
    color: "#fff",
    fontFamily: "system-ui, sans-serif",
    flexShrink: "0",
  } as CSSStyleDeclaration);

  const titre = document.createElement("div");
  titre.textContent = nomFichier;
  Object.assign(titre.style, {
    fontSize: "13px",
    fontWeight: "600",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flex: "1",
    minWidth: "0",
  } as CSSStyleDeclaration);

  const actions = document.createElement("div");
  Object.assign(actions.style, {
    display: "flex",
    gap: "8px",
    flexShrink: "0",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  } as CSSStyleDeclaration);

  const styleBouton = {
    border: "none",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  } as Partial<CSSStyleDeclaration>;

  const btnOuvrir = document.createElement("button");
  btnOuvrir.type = "button";
  btnOuvrir.textContent = "Ouvrir";
  Object.assign(btnOuvrir.style, styleBouton, {
    background: "#2563eb",
    color: "#fff",
  });
  btnOuvrir.onclick = () => {
    const ok = ouvrirDansNouvelOnglet(blobUrl);
    if (!ok) telechargerViaBlob(blob, nomFichier);
  };

  const btnTelecharger = document.createElement("button");
  btnTelecharger.type = "button";
  btnTelecharger.textContent = "Télécharger";
  Object.assign(btnTelecharger.style, styleBouton, {
    background: "#0f766e",
    color: "#fff",
  });
  btnTelecharger.onclick = () => telechargerViaBlob(blob, nomFichier);

  const btnFermer = document.createElement("button");
  btnFermer.type = "button";
  btnFermer.textContent = "Fermer";
  Object.assign(btnFermer.style, styleBouton, {
    background: "#e2e8f0",
    color: "#0f172a",
  });
  btnFermer.onclick = () => fermerOverlayPdf(blobUrl);

  actions.append(btnOuvrir, btnTelecharger, btnFermer);
  barre.append(titre, actions);

  const cadre = document.createElement("div");
  Object.assign(cadre.style, {
    flex: "1",
    minHeight: "0",
    background: "#fff",
    display: "flex",
    flexDirection: "column",
  } as CSSStyleDeclaration);

  const iframe = document.createElement("iframe");
  iframe.title = nomFichier;
  iframe.src = blobUrl;
  Object.assign(iframe.style, {
    width: "100%",
    height: "100%",
    border: "none",
    display: estMobile ? "none" : "block",
    flex: "1",
  } as CSSStyleDeclaration);

  const fallback = document.createElement("div");
  Object.assign(fallback.style, {
    display: estMobile ? "flex" : "none",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "14px",
    padding: "28px 16px",
    textAlign: "center",
    color: "#0f172a",
    fontFamily: "system-ui, sans-serif",
    flex: "1",
    background: "#fff",
  } as CSSStyleDeclaration);

  const p1 = document.createElement("p");
  p1.style.cssText = "margin:0;font-size:16px;font-weight:700";
  p1.textContent = "Votre résultat est prêt";

  const btnOuvrirGrand = document.createElement("button");
  btnOuvrirGrand.type = "button";
  btnOuvrirGrand.textContent = "Ouvrir le PDF";
  Object.assign(btnOuvrirGrand.style, styleBouton, {
    background: "#2563eb",
    color: "#fff",
    width: "100%",
    maxWidth: "300px",
    padding: "14px 16px",
    fontSize: "16px",
  });
  btnOuvrirGrand.onclick = () => {
    const ok = ouvrirDansNouvelOnglet(blobUrl);
    if (!ok) telechargerViaBlob(blob, nomFichier);
  };

  fallback.append(p1, btnOuvrirGrand);
  cadre.append(iframe, fallback);
  overlay.append(barre, cadre);

  const onTouche = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      fermerOverlayPdf(blobUrl);
      window.removeEventListener("keydown", onTouche);
    }
  };
  window.addEventListener("keydown", onTouche);

  document.body.appendChild(overlay);
}

function urlPdfResultatExamen(options: {
  dossierId: string;
  examenId: string;
  examenIds?: string[];
}): string {
  const params = new URLSearchParams({ dossierId: options.dossierId });
  const ids =
    options.examenIds && options.examenIds.length > 1
      ? options.examenIds
      : null;
  if (ids) {
    params.set("examIds", ids.join(","));
  }
  return `/api/laboratoire/examens/${encodeURIComponent(options.examenId)}/resultat-pdf?${params}`;
}

export interface OptionsImpressionResultatExamen {
  dossierId: string;
  examenId: string;
  numeroPatient?: string;
  libelleExamen?: string;
  examenIds?: string[];
}

/**
 * Télécharge le PDF résultat depuis l'API laboratoire et l'affiche (aperçu / impression).
 */
export async function imprimerResultatExamenLaboratoire(
  options: OptionsImpressionResultatExamen
): Promise<{ ok: boolean; erreur?: string }> {
  if (typeof window === "undefined") {
    return { ok: false, erreur: "contexte_serveur" };
  }

  try {
    const url = urlPdfResultatExamen(options);
    const response = await fetch(url, { credentials: "include" });

    if (!response.ok) {
      let message = "pdf_indisponible";
      try {
        const json = (await response.json()) as { erreur?: string };
        if (json.erreur) message = json.erreur;
      } catch {
        /* corps non JSON */
      }
      return { ok: false, erreur: message };
    }

    const blob = await response.blob();
    if (!blob || blob.size < 100) {
      return { ok: false, erreur: "pdf_vide" };
    }

    const nbExamens = options.examenIds?.length ?? 1;
    const nomFichierApi = extraireNomFichierContentDisposition(
      response.headers.get("Content-Disposition")
    );
    const nomFichier =
      nomFichierApi ??
      nomFichierResultatPdf({
        numeroPatient: options.numeroPatient ?? "",
        nbExamens,
        libelleExamen: options.libelleExamen ?? options.examenId,
      });

    afficherApercuPdf(blob, nomFichier);
    return { ok: true };
  } catch (error) {
    console.error("[imprimerResultatExamenLaboratoire]", error);
    return { ok: false, erreur: "erreur_reseau" };
  }
}
