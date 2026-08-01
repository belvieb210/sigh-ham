import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "..", "src", "locales", "reception");

const BLOC_MESSAGERIE_EXTRA = `    diffusion: {
      titre: "Annonce institutionnelle",
      sujet: "Objet de l'annonce",
      contenu: "Contenu de la diffusion…",
      envoyer: "Diffuser à tout le personnel",
      succes: "Annonce diffusée.",
      erreur: "Impossible de diffuser l'annonce.",
      nonAutorise: "Réservé à l'administration.",
    },
    rechercheAvancee: {
      titre: "Recherche avancée",
      placeholder: "Mot-clé dans les messages…",
      dateDebut: "Date début",
      dateFin: "Date fin",
      lancer: "Rechercher",
      aucunResultat: "Aucun message trouvé.",
      ouvrirConversation: "Ouvrir la conversation",
    },
    patient: {
      ouvrirDiscussion: "Discussion patient",
      erreur: "Impossible d'ouvrir la discussion patient.",
      selectionRequise: "Sélectionnez un patient d'abord.",
    },`;

const BLOC_PREFS = `    preferences: {
      titre: "Préférences",
      inApp: "Notifications in-app",
      tableauBord: "Badge tableau de bord",
      push: "Notifications push (bientôt)",
      email: "Notifications e-mail (bientôt)",
      sms: "Notifications SMS (bientôt)",
      silencieux: "Mode silencieux global",
      enregistrer: "Enregistrer",
      enregistre: "Préférences enregistrées.",
    },`;

for (const fichier of fs.readdirSync(dir)) {
  if (!fichier.endsWith(".ts") || fichier === "fr.ts" || fichier === "en.ts") continue;

  const chemin = path.join(dir, fichier);
  let contenu = fs.readFileSync(chemin, "utf8");
  let modifie = false;

  if (!contenu.includes("diffusion:")) {
    contenu = contenu.replace(
      /(\s+erreurCreation: "[^"]+",\r?\n)(\s+\},\r?\n\s+notificationsCentre:)/,
      `$1${BLOC_MESSAGERIE_EXTRA}\n$2`
    );
    modifie = true;
  }

  if (!contenu.includes("preferences:")) {
    contenu = contenu.replace(
      /(\s+PAIEMENT_VALIDE: "[^"]+",\r?\n)(\s+\},\r?\n\s+tableau:)/,
      `$1${BLOC_PREFS}$2`
    );
    modifie = true;
  }

  if (modifie) {
    fs.writeFileSync(chemin, contenu);
    console.log(`✓ ${fichier}`);
  }
}

console.log("Patch clés messagerie/notifications terminé");
