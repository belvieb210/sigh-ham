import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "..", "src", "locales", "reception");

const EXTRA_TYPES = `      DIFFUSION: "Annonce institutionnelle",`;

const BLOC_I18N = `    salles: {
      RECEPTION: "Réception",
      INFIRMIERS: "Infirmiers",
      MEDECINS: "Médecins",
      CAISSE: "Caisse",
      LABORATOIRE: "Laboratoire",
      PHARMACIE: "Pharmacie",
      EGLISE: "Église",
      MEDECINS_EXTERNES: "Médecins externes",
      HOSPITALISATION: "Hospitalisation",
      ADMIN: "Administration",
      MESSAGERIE: "Messagerie",
    },
    canal: {
      hashtag: "#{{nom}}",
      officiel: "Canal officiel — {{salle}}",
    },
    groupe: {
      defaut: "Groupe de travail",
      interServices: "Groupe inter-services",
      bouton: "Groupe",
      modal: {
        titre: "Nouveau groupe inter-services",
        placeholder: "Nom du groupe (ex. Urgences, Coordination…)",
        creer: "Créer le groupe",
      },
    },
    conversation: {
      defaut: "Conversation",
      direct: "Message direct",
    },
    dates: {
      hier: "Hier",
    },
    epingle: "Épingler la conversation",
    desepingle: "Désépingler",
    pieceJointe: "Pièce jointe",`;

const BLOC_MESSAGES = `    messages: {
      NOUVEAU_PATIENT: {
        titre: "Nouveau patient enregistré",
        message: "{{prenom}} {{nom}} ({{numero}}) vient d'être enregistré.",
      },
      PATIENT_TRANSFERE: {
        titre: "Patient transféré",
        message: "{{prenom}} {{nom}} a été orienté vers votre service.",
      },
      PATIENT_EN_ATTENTE: {
        titre: "Patient en attente",
        message: "{{prenom}} {{nom}} attend la prise des constantes.",
      },
      NOUVEAU_MESSAGE: {
        titre: "Nouveau message",
        message: "{{expediteur}} : {{apercu}}",
      },
      MENTION: {
        titre: "Vous avez été mentionné",
        message: "{{expediteur}} vous a mentionné dans une conversation.",
      },
      DIFFUSION: {
        titre: "Annonce institutionnelle",
        message: "{{apercu}}",
      },
    },`;

for (const fichier of fs.readdirSync(dir)) {
  if (!fichier.endsWith(".ts") || fichier === "fr.ts" || fichier === "en.ts") continue;

  const chemin = path.join(dir, fichier);
  let contenu = fs.readFileSync(chemin, "utf8");
  let modifie = false;

  if (!contenu.includes("DIFFUSION:") && contenu.includes("CANAL_SALLE:")) {
    contenu = contenu.replace(
      /(CANAL_SALLE: "[^"]+",\r?\n)(\s+\},)/,
      `$1${EXTRA_TYPES}\n$2`
    );
    modifie = true;
  }

  if (!contenu.includes("salles:")) {
    contenu = contenu.replace(
      /(\s+selectionRequise: "[^"]+",\r?\n)(\s+\},)/,
      `$1${BLOC_I18N}\n$2`
    );
    modifie = true;
  }

  if (!contenu.includes("messages:")) {
    contenu = contenu.replace(
      /(\s+enregistre: "[^"]+",\r?\n)(\s+\},)/,
      `$1${BLOC_MESSAGES}$2`
    );
    modifie = true;
  }

  if (modifie) {
    fs.writeFileSync(chemin, contenu);
    console.log(`✓ ${fichier}`);
  }
}

console.log("Patch i18n messagerie/notifications terminé");
