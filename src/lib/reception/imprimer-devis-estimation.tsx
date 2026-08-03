import { pdf } from "@react-pdf/renderer";
import {
  DocumentDevisEstimation,
  enregistrerPolicesPdf,
  type DonneesDevisEstimation,
} from "@/features/reception/devis-estimation-pdf";

export type { DonneesDevisEstimation };

const ID_OVERLAY_PDF = "sigh-overlay-pdf-estimation";

function sanitiserNomFichier(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function nomFichierEstimation(donnees: DonneesDevisEstimation): string {
  const patient = sanitiserNomFichier(
    `${donnees.prenomPatient || ""} ${donnees.nomPatient || ""}`.trim()
  );
  const numero = sanitiserNomFichier(donnees.numeroEnregistrement || "devis");
  if (patient) return `estimation-${patient}-${numero}.pdf`;
  return `estimation-${numero}.pdf`;
}

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

async function partagerFichierPdf(blob: Blob, nomFichier: string): Promise<boolean> {
  try {
    const fichier = new File([blob], nomFichier, { type: "application/pdf" });
    const nav = navigator as Navigator & {
      canShare?: (data?: ShareData) => boolean;
      share?: (data: ShareData) => Promise<void>;
    };
    if (typeof nav.share !== "function") return false;
    if (typeof nav.canShare === "function" && !nav.canShare({ files: [fichier] })) {
      return false;
    }
    await nav.share({
      files: [fichier],
      title: nomFichier,
      text: "Estimation / devis",
    });
    return true;
  } catch {
    return false;
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

/**
 * Aperçu PDF via blob: (plus fiable que data: sur mobile).
 * Pas d'ouverture auto après génération async (bloquée hors geste utilisateur).
 */
function afficherApercuPdf(blob: Blob, nomFichier: string): void {
  fermerOverlayPdf();

  const estMobile = estAppareilMobile();
  const blobUrl = URL.createObjectURL(blob);

  const overlay = document.createElement("div");
  overlay.id = ID_OVERLAY_PDF;
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Aperçu du devis PDF");
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
    if (!ok) {
      // Popup bloquée : bascule sur téléchargement (reste dans l'app)
      telechargerViaBlob(blob, nomFichier);
    }
  };

  const btnPartager = document.createElement("button");
  btnPartager.type = "button";
  btnPartager.textContent = "Partager";
  Object.assign(btnPartager.style, styleBouton, {
    background: "#7c3aed",
    color: "#fff",
    display: estMobile ? "inline-block" : "none",
  });
  btnPartager.onclick = () => {
    void partagerFichierPdf(blob, nomFichier);
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

  actions.append(btnOuvrir, btnPartager, btnTelecharger, btnFermer);
  barre.append(titre, actions);

  const cadre = document.createElement("div");
  Object.assign(cadre.style, {
    flex: "1",
    minHeight: "0",
    background: "#fff",
    display: "flex",
    flexDirection: "column",
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
  p1.textContent = "Votre devis est prêt";

  const p2 = document.createElement("p");
  p2.style.cssText = "margin:0;font-size:14px;color:#475569;max-width:340px;line-height:1.45";
  p2.textContent =
    "Touchez « Ouvrir » pour afficher le PDF, « Partager » pour l’envoyer, ou « Télécharger » pour l’enregistrer.";

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

  const btnTelechargerGrand = document.createElement("button");
  btnTelechargerGrand.type = "button";
  btnTelechargerGrand.textContent = "Télécharger le PDF";
  Object.assign(btnTelechargerGrand.style, styleBouton, {
    background: "#0f766e",
    color: "#fff",
    width: "100%",
    maxWidth: "300px",
    padding: "14px 16px",
    fontSize: "16px",
  });
  btnTelechargerGrand.onclick = () => telechargerViaBlob(blob, nomFichier);

  fallback.append(p1, p2, btnOuvrirGrand, btnTelechargerGrand);

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

/**
 * Génère un devis PDF A4 et l'affiche.
 * Utilise une URL blob: (évite les data: trop longs bloqués sur mobile).
 */
export async function imprimerDevisEstimation(
  donnees: DonneesDevisEstimation
): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    enregistrerPolicesPdf();

    const blob = await pdf(<DocumentDevisEstimation donnees={donnees} />).toBlob();
    if (!blob || blob.size < 100) {
      throw new Error("PDF vide ou invalide");
    }

    const nomFichier = nomFichierEstimation(donnees);
    afficherApercuPdf(blob, nomFichier);
    return true;
  } catch (error) {
    console.error("[imprimerDevisEstimation]", error);
    return false;
  }
}
