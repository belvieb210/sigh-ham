import type { TypeExamenReception } from "@/lib/reception/types";

function formaterPrix(prix: number): string {
  return `$ ${prix.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function echapperHtml(texte: string): string {
  return texte
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export interface DonneesDevisEstimation {
  examens: TypeExamenReception[];
  medecinResponsable: string;
  nomPatient: string;
  prenomPatient: string;
  numeroEnregistrement: string;
  dateEnregistrement: string;
  labels: {
    titre: string;
    estimation: string;
    patient: string;
    medecin: string;
    code: string;
    nom: string;
    categorie: string;
    prix: string;
    montantTotal: string;
    mentionLegale: string;
  };
}

/** Impression via fenêtre dédiée — évite de perturber le DOM React (window.print sur la page). */
export function imprimerDevisEstimation(donnees: DonneesDevisEstimation): boolean {
  const fenetre = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
  if (!fenetre) return false;

  const montantTotal = donnees.examens.reduce((total, e) => total + e.prix, 0);
  const lignesExamens = donnees.examens
    .map(
      (examen) => `
        <tr>
          <td>${echapperHtml(examen.code)}</td>
          <td>${echapperHtml(examen.libelle)}</td>
          <td>${echapperHtml(examen.categorie)}</td>
          <td class="prix">${formaterPrix(examen.prix)}</td>
        </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>${echapperHtml(donnees.labels.titre)}</title>
  <style>
    body { font-family: system-ui, sans-serif; color: #0f172a; margin: 2rem; }
    h1 { font-size: 1.5rem; margin: 0.5rem 0; }
    .meta { color: #64748b; font-size: 0.875rem; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin: 1.5rem 0; }
    .label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; font-size: 0.875rem; }
    th, td { border-bottom: 1px solid #e2e8f0; padding: 0.5rem 0.75rem; text-align: left; }
    th { font-size: 0.7rem; text-transform: uppercase; color: #64748b; }
    .prix, td.prix { text-align: right; font-weight: 600; }
    tfoot td { border-top: 2px solid #cbd5e1; padding-top: 1rem; font-weight: 700; }
    .legal { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; font-size: 0.75rem; color: #64748b; }
  </style>
</head>
<body>
  <p class="meta">HAM LABORATOIRE</p>
  <h1>${echapperHtml(donnees.labels.titre)} — ${echapperHtml(donnees.labels.estimation)}</h1>
  <p class="meta">${echapperHtml(donnees.dateEnregistrement)}</p>
  <div class="grid">
    <div>
      <p class="label">${echapperHtml(donnees.labels.patient)}</p>
      <p><strong>${echapperHtml(donnees.prenomPatient)} ${echapperHtml(donnees.nomPatient)}</strong></p>
      <p class="meta">${echapperHtml(donnees.numeroEnregistrement)}</p>
    </div>
    <div>
      <p class="label">${echapperHtml(donnees.labels.medecin)}</p>
      <p><strong>${echapperHtml(donnees.medecinResponsable)}</strong></p>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>${echapperHtml(donnees.labels.code)}</th>
        <th>${echapperHtml(donnees.labels.nom)}</th>
        <th>${echapperHtml(donnees.labels.categorie)}</th>
        <th class="prix">${echapperHtml(donnees.labels.prix)}</th>
      </tr>
    </thead>
    <tbody>${lignesExamens}</tbody>
    <tfoot>
      <tr>
        <td colspan="3" class="prix">${echapperHtml(donnees.labels.montantTotal)}</td>
        <td class="prix">${formaterPrix(montantTotal)}</td>
      </tr>
    </tfoot>
  </table>
  <p class="legal">${echapperHtml(donnees.labels.mentionLegale)}</p>
  <script>
    window.onload = function () {
      window.focus();
      window.print();
      window.onafterprint = function () { window.close(); };
    };
  </script>
</body>
</html>`;

  fenetre.document.open();
  fenetre.document.write(html);
  fenetre.document.close();
  return true;
}
