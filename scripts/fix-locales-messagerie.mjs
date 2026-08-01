import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "..", "src", "locales", "reception");

const BLOC_MESSAGERIE = `    salles: {
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
  let c = fs.readFileSync(chemin, "utf8");

  // Retirer bloc erroné injecté dans actions
  c = c.replace(
    /(\n    selectionRequise: "[^"]+",)\n    salles: \{[\s\S]*?pieceJointe: "[^"]+",\n  \},/,
    "$1\n  },"
  );

  // Corriger preferences / messages mal imbriqués
  c = c.replace(
    /(preferences: \{[\s\S]*?enregistre: "[^"]+",)\n    messages:/,
    "$1\n    },\n    messages:"
  );
  c = c.replace(/\},\s+\},\s+\n  \},\n\n  tableau:/, "},\n  },\n\n  tableau:");

  // DIFFUSION dans types messagerie
  if (c.includes("CANAL_SALLE:") && !c.match(/messagerie:[\s\S]*DIFFUSION:/)) {
    c = c.replace(
      /(messagerie:[\s\S]*?CANAL_SALLE: "[^"]+",\n)(\s+\},)/,
      '$1      DIFFUSION: "Annonce institutionnelle",\n$2'
    );
  }

  // Bloc messagerie salles/canal/etc.
  if (!c.match(/messagerie:[\s\S]*?salles:/)) {
    c = c.replace(
      /(    patient: \{[\s\S]*?selectionRequise: "[^"]+",\n    \},)/,
      `$1\n${BLOC_MESSAGERIE}\n`
    );
  }

  // Bloc messages notifications
  if (!c.match(/notificationsCentre:[\s\S]*?messages:/)) {
    c = c.replace(
      /(    preferences: \{[\s\S]*?enregistre: "[^"]+",\n    \},)/,
      `$1\n${BLOC_MESSAGES}`
    );
  }

  fs.writeFileSync(chemin, c);
  console.log(`✓ corrigé ${fichier}`);
}

console.log("Correction locales terminée");
