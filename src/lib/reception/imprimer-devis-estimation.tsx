import { pdf } from "@react-pdf/renderer";
import {
  DocumentDevisEstimation,
  enregistrerPolicesPdf,
  type DonneesDevisEstimation,
} from "@/features/reception/devis-estimation-pdf";

export type { DonneesDevisEstimation };

const ID_OVERLAY_PDF = "sigh-overlay-pdf-estimation";

function blobVersDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Lecture PDF impossible"));
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error("Lecture PDF impossible"));
    reader.readAsDataURL(blob);
  });
}

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

function fermerOverlayPdf() {
  document.getElementById(ID_OVERLAY_PDF)?.remove();
}

function ouvrirPdfSansTelechargement(dataUrl: string): void {
  // Sans attribut download : le navigateur tente d'afficher le PDF
  const a = document.createElement("a");
  a.href = dataUrl;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function telechargerPdf(dataUrl: string, nomFichier: string): void {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = nomFichier;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * Aperçu PDF sans URL blob:.
 * Mobile : ouvrir d'abord (pas de téléchargement auto).
 */
function afficherApercuPdf(dataUrl: string, nomFichier: string): void {
  fermerOverlayPdf();

  const estMobile =
    /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) ||
    (navigator.maxTouchPoints > 0 && window.innerWidth < 1024);

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
    padding: "8px 12px",
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
  btnOuvrir.onclick = () => ouvrirPdfSansTelechargement(dataUrl);

  const btnTelecharger = document.createElement("button");
  btnTelecharger.type = "button";
  btnTelecharger.textContent = "Télécharger";
  Object.assign(btnTelecharger.style, styleBouton, {
    background: "#0f766e",
    color: "#fff",
  });
  btnTelecharger.onclick = () => telechargerPdf(dataUrl, nomFichier);

  const btnFermer = document.createElement("button");
  btnFermer.type = "button";
  btnFermer.textContent = "Fermer";
  Object.assign(btnFermer.style, styleBouton, {
    background: "#e2e8f0",
    color: "#0f172a",
  });
  btnFermer.onclick = () => fermerOverlayPdf();

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
  iframe.src = dataUrl;
  Object.assign(iframe.style, {
    width: "100%",
    height: "100%",
    border: "none",
    display: "block",
    flex: "1",
  } as CSSStyleDeclaration);

  const fallback = document.createElement("div");
  Object.assign(fallback.style, {
    display: estMobile ? "flex" : "none",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    padding: "28px 16px",
    textAlign: "center",
    color: "#0f172a",
    fontFamily: "system-ui, sans-serif",
    flex: "1",
    background: "#fff",
  } as CSSStyleDeclaration);

  const p1 = document.createElement("p");
  p1.style.cssText = "margin:0;font-size:15px;font-weight:600";
  p1.textContent = estMobile
    ? "Votre devis est prêt"
    : "Aperçu PDF indisponible sur ce navigateur.";

  const p2 = document.createElement("p");
  p2.style.cssText = "margin:0;font-size:13px;color:#475569;max-width:320px";
  p2.textContent = estMobile
    ? "Touchez « Ouvrir » pour afficher le PDF, ou « Télécharger » pour l'enregistrer."
    : "Utilisez Ouvrir ou Télécharger pour consulter le devis.";

  const btnOuvrirGrand = document.createElement("button");
  btnOuvrirGrand.type = "button";
  btnOuvrirGrand.textContent = "Ouvrir le PDF";
  Object.assign(btnOuvrirGrand.style, styleBouton, {
    background: "#2563eb",
    color: "#fff",
    width: "100%",
    maxWidth: "280px",
    padding: "14px 16px",
    fontSize: "15px",
  });
  btnOuvrirGrand.onclick = () => ouvrirPdfSansTelechargement(dataUrl);

  fallback.append(p1, p2, btnOuvrirGrand);

  if (estMobile) {
    // Sur mobile l'iframe PDF est souvent vide : écran d'actions clair, sans auto-download
    iframe.style.display = "none";
  }

  cadre.append(iframe, fallback);
  overlay.append(barre, cadre);

  const onTouche = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      fermerOverlayPdf();
      window.removeEventListener("keydown", onTouche);
    }
  };
  window.addEventListener("keydown", onTouche);

  document.body.appendChild(overlay);

  // Mobile : ouvrir automatiquement en visualisation (pas de téléchargement forcé)
  if (estMobile) {
    window.setTimeout(() => ouvrirPdfSansTelechargement(dataUrl), 180);
  }
}

/**
 * Génère un devis PDF A4 et l'affiche sans jamais utiliser d'URL blob:.
 */
export async function imprimerDevisEstimation(
  donnees: DonneesDevisEstimation
): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    enregistrerPolicesPdf();

    const blob = await pdf(<DocumentDevisEstimation donnees={donnees} />).toBlob();
    const nomFichier = nomFichierEstimation(donnees);
    const dataUrl = await blobVersDataUrl(blob);

    afficherApercuPdf(dataUrl, nomFichier);
    return true;
  } catch (error) {
    console.error("[imprimerDevisEstimation]", error);
    return false;
  }
}
