/**
 * Document HTML autonome pour le scan QR / ouverture navigateur.
 * Styles inline : pas de Tailwind ni providers React (fiable téléphone / PC).
 */

import { INFOS_LEGALES_TICKET } from "@/constants/ticket-thermique";
import type { DetailRecuPublic } from "@/lib/caisse/recu-public";
import { cheminRecuPublic } from "@/lib/caisse/token-recu-public";

function echapper(texte: string): string {
  return texte
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formaterMontant(montant: number, devise: string): string {
  const n = Math.round(montant * 100) / 100;
  const corps = n.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return devise === "CDF" ? `${corps} FCFA` : `${corps} $`;
}

function formaterDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function calculerAge(iso: string | null): string {
  if (!iso) return "—";
  const naissance = new Date(iso);
  if (Number.isNaN(naissance.getTime())) return "—";
  const auj = new Date();
  let age = auj.getFullYear() - naissance.getFullYear();
  const m = auj.getMonth() - naissance.getMonth();
  if (m < 0 || (m === 0 && auj.getDate() < naissance.getDate())) age -= 1;
  return `${age} ans`;
}

const LIBELLES_STATUT: Record<string, string> = {
  PAYEE: "Payée",
  PARTIELLEMENT_PAYEE: "Payée avance",
  EMISE: "Émise",
  PRESCRIT: "Prescrit",
  PRELEVE: "Prélevé",
  EN_ANALYSE: "En analyse",
  TERMINE: "Terminé",
  FACTURE: "Facturé",
};

function libelleStatut(code: string, modeFacture?: string | null) {
  if (code === "PARTIELLEMENT_PAYEE" || modeFacture === "AVANCE") {
    return "Payée avance";
  }
  return LIBELLES_STATUT[code] ?? code.replace(/_/g, " ");
}

function classeStatut(statut: string, modeFacture?: string | null): string {
  if (statut === "PAYEE") return "badge badge-ok";
  if (statut === "PARTIELLEMENT_PAYEE" || modeFacture === "AVANCE") {
    return "badge badge-avance";
  }
  return "badge";
}

export function construireHtmlRecuIntrouvable(): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="robots" content="noindex,nofollow" />
  <title>Reçu introuvable — HAM Laboratoire</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0; min-height: 100dvh; display: flex; align-items: center; justify-content: center;
      padding: 24px; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      background: #f1f5f9; color: #0f172a; text-align: center;
    }
    .card {
      max-width: 420px; width: 100%; background: #fff; border-radius: 16px;
      padding: 28px 22px; box-shadow: 0 10px 30px rgba(15,23,42,.08);
    }
    h1 { margin: 10px 0 0; font-size: 1.25rem; }
    p { margin: 10px 0 0; color: #64748b; font-size: .95rem; line-height: 1.45; }
    a {
      display: inline-block; margin-top: 20px; padding: 12px 18px; border-radius: 10px;
      background: #0f2744; color: #fff; text-decoration: none; font-weight: 600; font-size: .9rem;
    }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#64748b;">HAM Laboratoire</div>
    <h1>Reçu introuvable</h1>
    <p>Ce lien QR n’est plus valide ou ne correspond à aucune facture.</p>
    <a href="/">Retour à l’accueil</a>
  </div>
</body>
</html>`;
}

interface OptionsHtmlRecuPublic {
  token: string;
}

export function construireDocumentHtmlRecuPublic(
  detail: DetailRecuPublic,
  options: OptionsHtmlRecuPublic
): string {
  const L = INFOS_LEGALES_TICKET;
  const reste = Math.max(0, detail.montantTotal - detail.montantPaye);
  const libellePaye =
    reste > 0 || detail.modeFacture === "AVANCE" ? "Avance" : "Payé";
  const nom = echapper(`${detail.patient.prenom} ${detail.patient.nom}`.trim());
  const numeroFacture = echapper(detail.numeroFacture);
  const ticketPath = `${cheminRecuPublic(options.token)}/ticket`;
  const printUrl = echapper(ticketPath);

  const lignesHtml = detail.lignes.length
    ? detail.lignes
        .map((l, i) => {
          const ex = detail.examens[i];
          const meta = [
            ex?.code ? echapper(ex.code) : null,
            echapper(libelleStatut(ex?.statut ?? "FACTURE")),
            l.quantite > 1 ? `×${l.quantite}` : null,
          ]
            .filter(Boolean)
            .join(" · ");
          return `<li class="item">
            <div class="item-main">
              <p class="item-title">${echapper(l.libelle)}</p>
              <p class="item-meta">${meta}</p>
            </div>
            <p class="item-price">${echapper(formaterMontant(l.montant, detail.devise))}</p>
          </li>`;
        })
        .join("")
    : `<li class="empty">Aucune prestation sur cette facture.</li>`;

  const medicamentsHtml =
    detail.lignesMedicaments && detail.lignesMedicaments.length > 0
      ? detail.lignesMedicaments
          .map(
            (l) => `<li class="item">
            <div class="item-main">
              <p class="item-title">${echapper(l.libelle)}</p>
              <p class="item-meta">${l.quantite > 1 ? `×${l.quantite}` : "Médicament"}</p>
            </div>
            <p class="item-price">${echapper(formaterMontant(l.montant, detail.devise))}</p>
          </li>`
          )
          .join("")
      : "";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="#0f2744" />
  <meta name="robots" content="noindex,nofollow" />
  <title>Reçu ${numeroFacture} — HAM Laboratoire</title>
  <style>
    :root {
      --navy: #0f2744;
      --blue: #1d6ef5;
      --sky: #e8f1ff;
      --bg: #eef2f7;
      --card: #ffffff;
      --text: #0f172a;
      --muted: #64748b;
      --line: #e2e8f0;
      --ok: #047857;
      --ok-bg: #ecfdf5;
      --warn: #b45309;
      --warn-bg: #fffbeb;
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
      min-height: 100dvh;
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      -webkit-font-smoothing: antialiased;
    }
    .top {
      background: linear-gradient(160deg, #0f2744 0%, #163a63 100%);
      color: #fff;
      padding: 22px 16px 36px;
    }
    .brand {
      text-align: center;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .18em;
      text-transform: uppercase;
      color: #93c5fd;
    }
    .top h1 {
      margin: 8px 0 0;
      text-align: center;
      font-size: 1.45rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .top .ref {
      margin: 6px 0 0;
      text-align: center;
      font-size: .95rem;
      color: #cbd5e1;
      font-weight: 600;
    }
    .wrap {
      width: min(520px, 100%);
      margin: -18px auto 0;
      padding: 0 12px 28px;
    }
    .card {
      background: var(--card);
      border-radius: 18px;
      box-shadow: 0 8px 28px rgba(15, 39, 68, .08);
      border: 1px solid rgba(226, 232, 240, .9);
      padding: 16px;
      margin-bottom: 12px;
    }
    .card-head {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: flex-start;
    }
    .label {
      margin: 0;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .12em;
      text-transform: uppercase;
      color: var(--muted);
    }
    .name {
      margin: 6px 0 0;
      font-size: 1.15rem;
      font-weight: 800;
      line-height: 1.25;
    }
    .sub {
      margin: 4px 0 0;
      font-size: .9rem;
      color: var(--muted);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      padding: 6px 10px;
      font-size: 12px;
      font-weight: 700;
      background: #f1f5f9;
      color: #334155;
      white-space: nowrap;
    }
    .badge-ok { background: var(--ok-bg); color: var(--ok); }
    .badge-warn { background: var(--warn-bg); color: var(--warn); }
    .badge-avance { background: #e0f2fe; color: #0369a1; }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px solid var(--line);
    }
    .grid dt {
      margin: 0;
      font-size: 12px;
      color: var(--muted);
    }
    .grid dd {
      margin: 3px 0 0;
      font-size: 14px;
      font-weight: 600;
    }
    .row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 8px 0;
      font-size: 14px;
      border-bottom: 1px solid #f1f5f9;
    }
    .row:last-child { border-bottom: 0; }
    .row span:first-child { color: var(--muted); }
    .row strong { color: #0369a1; }
    .list { list-style: none; margin: 0; padding: 0; }
    .item {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid var(--line);
    }
    .item:last-child { border-bottom: 0; }
    .item-title { margin: 0; font-size: 14px; font-weight: 700; }
    .item-meta { margin: 4px 0 0; font-size: 12px; color: var(--muted); }
    .item-price { margin: 0; font-size: 14px; font-weight: 800; white-space: nowrap; }
    .empty { padding: 18px 0; text-align: center; color: var(--muted); font-size: 14px; }
    .totals {
      margin-top: 4px;
      padding: 12px;
      border-radius: 12px;
      background: #f8fafc;
      border: 1px solid var(--line);
    }
    .tot-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 6px 0;
      font-size: 14px;
    }
    .tot-row span:first-child { color: #475569; }
    .tot-main { font-weight: 800; color: #0c4a6e; }
    .tot-reste-ok { font-weight: 800; color: var(--ok); }
    .tot-reste-warn { font-weight: 800; color: var(--warn); }
    .actions {
      display: grid;
      gap: 8px;
      margin: 4px 0 12px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      border: 0;
      border-radius: 12px;
      padding: 13px 16px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
      font-family: inherit;
    }
    .btn-primary { background: var(--navy); color: #fff; }
    .btn-secondary { background: #fff; color: var(--navy); border: 1px solid #cbd5e1; }
    .footer {
      text-align: center;
      font-size: 12px;
      line-height: 1.55;
      color: var(--muted);
      padding: 8px 4px 4px;
    }
    .footer strong { color: #334155; display: block; margin-bottom: 6px; font-size: 13px; }
    #frame-ticket {
      position: fixed; width: 0; height: 0; border: 0; opacity: 0; pointer-events: none;
    }
    @media (min-width: 640px) {
      .top { padding-top: 28px; padding-bottom: 42px; }
      .wrap { margin-top: -22px; }
    }
  </style>
</head>
<body>
  <header class="top">
    <div class="brand">HAM Laboratoire</div>
    <h1>Reçu de caisse</h1>
    <p class="ref">${numeroFacture}</p>
  </header>

  <main class="wrap">
    <div class="actions">
      <a class="btn btn-primary" href="${printUrl}" target="_blank" rel="noopener">Imprimer le ticket 80 mm</a>
    </div>

    <section class="card">
      <div class="card-head">
        <div>
          <p class="label">Patient</p>
          <h2 class="name">${nom}</h2>
          <p class="sub">${echapper(detail.patient.numeroPatient)}</p>
        </div>
        <span class="${classeStatut(detail.statut, detail.modeFacture)}">${echapper(libelleStatut(detail.statut, detail.modeFacture))}</span>
      </div>
      <dl class="grid">
        <div><dt>Âge</dt><dd>${echapper(calculerAge(detail.patient.dateNaissance))}</dd></div>
        <div><dt>Sexe</dt><dd>${echapper(detail.patient.sexe || "—")}</dd></div>
        <div><dt>Téléphone</dt><dd>${echapper(detail.patient.telephone || "—")}</dd></div>
        <div><dt>Dossier</dt><dd>${echapper(detail.dossier.numeroDossier)}</dd></div>
      </dl>
    </section>

    <section class="card">
      <p class="label">Facture</p>
      <div class="row"><span>N° facture</span><strong>${numeroFacture}</strong></div>
      <div class="row"><span>Date</span><span>${echapper(formaterDate(detail.emiseLe))}</span></div>
      <div class="row"><span>Paiement</span><span>${echapper((detail.modePaiement || "—").replace(/_/g, " "))}</span></div>
    </section>

    <section class="card">
      <p class="label">Examens &amp; prestations</p>
      <p class="sub" style="margin-bottom:8px">Liés à cette facture uniquement</p>
      <ul class="list">${lignesHtml}</ul>
      ${
        medicamentsHtml
          ? `<p class="label" style="margin-top:16px">Médicaments</p>
      <p class="sub" style="margin-bottom:8px">Facture pharmacie du même dossier</p>
      <ul class="list">${medicamentsHtml}</ul>`
          : ""
      }
      <div class="totals">
        <div class="tot-row"><span>Total</span><span class="tot-main">${echapper(formaterMontant(detail.montantTotal, detail.devise))}</span></div>
        <div class="tot-row"><span>${echapper(libellePaye)}</span><span>${echapper(formaterMontant(detail.montantPaye, detail.devise))}</span></div>
        <div class="tot-row"><span>Reste</span><span class="${reste <= 0 ? "tot-reste-ok" : "tot-reste-warn"}">${echapper(formaterMontant(reste, detail.devise))}</span></div>
      </div>
    </section>

    <footer class="footer card">
      <strong>${echapper(L.sloganPied)}</strong>
      ${echapper(L.adresseLigne1)}<br />
      ${echapper(L.adresseLigne2)}<br />
      ${echapper(L.ville)}<br /><br />
      ${echapper(L.telephones)}<br />
      ${echapper(L.email)}
    </footer>
  </main>

</body>
</html>`;
}
