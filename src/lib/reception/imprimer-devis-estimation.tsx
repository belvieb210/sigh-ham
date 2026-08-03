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

function fermerOverlayPdf() {
  document.getElementById(ID_OVERLAY_PDF)?.remove();
}

/**
 * Aperçu PDF sans URL blob: (évite ERR_FILE_NOT_FOUND au rafraîchissement).
 * Affiche le PDF dans une couche plein écran sur la page courante.
 */
function afficherApercuPdf(dataUrl: string, nomFichier: string): void {
  fermerOverlayPdf();

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
  } as CSSStyleDeclaration);

  const actions = document.createElement("div");
  Object.assign(actions.style, {
    display: "flex",
    gap: "8px",
    flexShrink: "0",
  } as CSSStyleDeclaration);

  const styleBouton = {
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  } as Partial<CSSStyleDeclaration>;

  const btnTelecharger = document.createElement("button");
  btnTelecharger.type = "button";
  btnTelecharger.textContent = "Télécharger";
  Object.assign(btnTelecharger.style, styleBouton, {
    background: "#2563eb",
    color: "#fff",
  });
  btnTelecharger.onclick = () => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = nomFichier;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const btnFermer = document.createElement("button");
  btnFermer.type = "button";
  btnFermer.textContent = "Fermer";
  Object.assign(btnFermer.style, styleBouton, {
    background: "#e2e8f0",
    color: "#0f172a",
  });
  btnFermer.onclick = () => fermerOverlayPdf();

  actions.append(btnTelecharger, btnFermer);
  barre.append(titre, actions);

  const cadre = document.createElement("div");
  Object.assign(cadre.style, {
    flex: "1",
    minHeight: "0",
    background: "#fff",
  } as CSSStyleDeclaration);

  // iframe + data: — pas de blob: dans la barre d'adresse
  const iframe = document.createElement("iframe");
  iframe.title = nomFichier;
  iframe.src = dataUrl;
  Object.assign(iframe.style, {
    width: "100%",
    height: "100%",
    border: "none",
    display: "block",
  } as CSSStyleDeclaration);

  // Fallback si le navigateur mobile n'affiche pas le PDF dans l'iframe
  const fallback = document.createElement("div");
  Object.assign(fallback.style, {
    display: "none",
    padding: "24px 16px",
    textAlign: "center",
    color: "#0f172a",
    fontFamily: "system-ui, sans-serif",
  } as CSSStyleDeclaration);
  fallback.innerHTML = `
    <p style="margin:0 0 12px;font-size:15px;font-weight:600">Aperçu PDF indisponible sur ce navigateur.</p>
    <p style="margin:0 0 16px;font-size:13px;color:#475569">Utilisez le bouton Télécharger pour ouvrir le devis.</p>
  `;

  const estMobile =
    /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) ||
    (navigator.maxTouchPoints > 0 && window.innerWidth < 1024);

  if (estMobile) {
    // Beaucoup de navigateurs mobiles n'affichent pas le PDF dans une iframe :
    // on propose immédiatement une action claire + tentative d'ouverture native.
    fallback.style.display = "block";
    fallback.style.background = "#fff";
    fallback.style.flex = "1";
    const btnOuvrir = document.createElement("button");
    btnOuvrir.type = "button";
    btnOuvrir.textContent = "Ouvrir le PDF";
    Object.assign(btnOuvrir.style, styleBouton, {
      background: "#2563eb",
      color: "#fff",
      width: "100%",
      maxWidth: "280px",
      margin: "0 auto",
      display: "block",
      padding: "14px 16px",
      fontSize: "15px",
    });
    btnOuvrir.onclick = () => btnTelecharger.click();
    fallback.appendChild(btnOuvrir);
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

  // Un seul clic suffit : sur mobile, lancer aussi le téléchargement/ouverture système
  if (estMobile) {
    window.setTimeout(() => btnTelecharger.click(), 120);
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
    const nomFichier = `estimation-${donnees.numeroEnregistrement || "devis"}.pdf`;
    const dataUrl = await blobVersDataUrl(blob);

    afficherApercuPdf(dataUrl, nomFichier);
    return true;
  } catch (error) {
    console.error("[imprimerDevisEstimation]", error);
    return false;
  }
}
