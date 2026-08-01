import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "..", "src", "locales", "reception");

const BLOC_MESSAGERIE = `  messagerie: {
    titreInterface: "Messagerie SIGH",
    sousTitreInterface: "{{nom}} — {{nonLus}} message(s) non lu(s)",
    nouveauMessage: "Nouveau message",
    rechercher: "Rechercher une conversation…",
    rechercherContact: "Rechercher un collègue…",
    filtres: {
      tous: "Tous",
      non_lus: "Non lus",
      canaux: "Canaux",
      directs: "Directs",
      groupes: "Groupes",
      epingles: "Épinglés",
    },
    types: {
      DIRECT: "Message privé",
      GROUPE: "Groupe de travail",
      CANAL_SALLE: "Canal de service",
    },
    priorites: {
      NORMALE: "Normal",
      URGENTE: "Urgent",
      CRITIQUE: "Critique",
    },
    aucuneConversation: "Aucune conversation pour le moment.",
    selectionnerConversation: "Sélectionnez une conversation",
    selectionnerDescription:
      "Communiquez avec les équipes des différents services. Canaux officiels, messages privés et groupes de travail — sécurisés et tracés.",
    aucunMessage: "Aucun message. Soyez le premier à écrire.",
    placeholderMessage: "Rédigez votre message… (Entrée pour envoyer, Maj+Entrée pour une nouvelle ligne)",
    raccourciEnvoi: "Messagerie chiffrée en transit · Accusés de lecture · Priorités médicales",
    envoyer: "Envoyer",
    envoye: "Envoyé",
    lu: "Lu",
    messageSupprime: "Message supprimé",
    retourListe: "Retour aux conversations",
    securise: "SIGH sécurisé",
    details: "Détails",
    participants: "Participants",
    vous: "vous",
    confidentialite:
      "Les échanges sont réservés au personnel autorisé. Ne partagez jamais de données patient sensibles hors protocole établi.",
    annuler: "Annuler",
    demarrerConversation: "Démarrer",
    aucunContact: "Aucun collègue trouvé.",
    erreurListe: "Impossible de charger les conversations.",
    erreurMessages: "Impossible de charger les messages.",
    erreurEnvoi: "Impossible d'envoyer le message.",
    erreurCreation: "Impossible de créer la conversation.",
  },
`;

for (const fichier of fs.readdirSync(dir)) {
  if (!fichier.endsWith(".ts") || fichier === "fr.ts" || fichier === "en.ts") continue;

  const chemin = path.join(dir, fichier);
  let contenu = fs.readFileSync(chemin, "utf8");

  if (contenu.includes("titreInterface:")) continue;

  const avant = contenu;
  contenu = contenu.replace(
    /  tableau: \{\r?\n    recents:/,
    `${BLOC_MESSAGERIE}  notificationsCentre: {
    titre: "Centre de notifications",
    sousTitre: "{{count}} notification(s) non lue(s)",
    toutLu: "Tout marquer lu",
    rechercher: "Rechercher une notification…",
    aucune: "Aucune notification.",
    voir: "Voir",
    marquerLu: "Marquer lu",
    archiver: "Archiver",
    filtres: { tous: "Toutes", non_lus: "Non lues", archives: "Archivées" },
    types: {
      NOUVEAU_PATIENT: "Nouveau patient",
      PATIENT_TRANSFERE: "Transfert",
      PATIENT_EN_ATTENTE: "En attente",
      NOUVEAU_MESSAGE: "Message",
      MENTION: "Mention",
      DIFFUSION: "Annonce",
      RESULTATS_LABO: "Laboratoire",
      PATIENT_A_FACTURER: "Caisse",
      PAIEMENT_VALIDE: "Paiement",
    },
  },
  tableau: {\n    recents:`
  );

  if (contenu === avant) {
    console.warn(`⚠ pas de remplacement : ${fichier}`);
    continue;
  }

  fs.writeFileSync(chemin, contenu);
  console.log(`✓ ${fichier}`);
}

console.log("Patch messagerie i18n terminé");
