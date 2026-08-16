/** Navigation et contenus — Salle de Réception HAM LABORATOIRE */

import type { CodeSalle } from "@/generated/prisma/client";
import {
  filtrerOrientationsAutorisees,
  metaOrientationsSauf,
  orientationsAutoriseesDepuis,
} from "@/lib/transferts/orientations-universelles";
import {
  Home,
  UserPlus,
  Users,
  ArrowRightLeft,
  Search,
  History,
  ClipboardList,
  FlaskConical,
  Settings,
  UserCog,
  UserCircle,
  MessageSquare,
  Bell,
} from "lucide-react";

/** Compteurs affichés dans la barre latérale */
export const BADGES_NAVIGATION_RECEPTION = {
  messagerie: 0,
  notifications: 0,
} as const;

export const NAVIGATION_RECEPTION = {
  principal: [
    { href: "/sigh/reception", id: "accueil", icone: Home, actif: true },
    { href: "/sigh/reception/nouveau", id: "nouveauPatient", icone: UserPlus },
    { href: "/sigh/reception/enregistres", id: "patientsEnregistres", icone: Users },
    { href: "/sigh/reception/transferts", id: "patientsTransferes", icone: ArrowRightLeft },
    { href: "/sigh/reception/examens-disponibles", id: "examensDisponibles", icone: FlaskConical },
    { href: "/sigh/reception/recherche", id: "rechercherPatient", icone: Search },
    { href: "/sigh/reception/historique", id: "historique", icone: History },
  ],
  communication: [
    {
      href: "/sigh/reception/messagerie",
      id: "messagerie",
      icone: MessageSquare,
      badge: BADGES_NAVIGATION_RECEPTION.messagerie,
      badgeVariant: "bleu" as const,
    },
    {
      href: "/sigh/reception/notifications",
      id: "notifications",
      icone: Bell,
      badge: BADGES_NAVIGATION_RECEPTION.notifications,
      badgeVariant: "rouge" as const,
    },
  ],
  parametres: [
    { href: "/sigh/reception/profil", id: "profil", icone: UserCircle },
    { href: "/sigh/reception/parametres", id: "parametres", icone: Settings },
  ],
} as const;

/** Identifiants des pages « à venir » (contenu placeholder) */
export type IdPageReceptionAvenir =
  | "recherche"
  | "historique"
  | "messagerie"
  | "notifications"
  | "motifs"
  | "examens"
  | "examensDisponibles"
  | "utilisateurs"
  | "parametres";

export const ETAPES_ENREGISTREMENT = [
  "Informations patient",
  "Motif de visite",
  "Examens initiaux",
  "Orientation",
] as const;

/** Libellés courts pour le stepper mobile */
export const ETAPES_ENREGISTREMENT_MOBILE = [
  "Infos patient",
  "Motif",
  "Examens",
  "Orientation",
] as const;

export const NAVIGATION_BASSE_RECEPTION = [
  { href: "/sigh/reception", id: "accueil", icone: Home },
  { href: "/sigh/reception/nouveau", id: "nouveau", icone: UserPlus },
  { href: "/sigh/reception/enregistres", id: "patients", icone: Users },
  { href: "/sigh/reception/transferts", id: "transferes", icone: ArrowRightLeft },
] as const;

export const TYPES_PATIENT = [
  { value: "nouveau", label: "Nouveau patient" },
  { value: "ancien", label: "Ancien patient" },
  { value: "urgence", label: "Urgence" },
  { value: "rdv", label: "Rendez-vous" },
] as const;

export const ETATS_CIVILS = [
  { value: "celibataire", label: "Célibataire" },
  { value: "marie", label: "Marié(e)" },
  { value: "divorce", label: "Divorcé(e)" },
  { value: "veuf", label: "Veuf(ve)" },
] as const;

export const GROUPES_SANGUINS = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Inconnu",
] as const;

export const ASSURANCES = [
  "Aucune",
  "CNSS",
  "MUGEF",
  "RAWBANK Santé",
  "FARDC",
  "Privée",
  "Autre",
] as const;

const COULEUR_MOBILE_DEFAUT = "border-gris-bordure bg-white";
const COULEUR_MOBILE_INFIRMIERS =
  "border-bleu-medical bg-bleu-medical-clair ring-2 ring-bleu-medical/20";

/** Réception : Caisse, Infirmiers et Médecins */
export const ORIENTATIONS_RAPIDES = metaOrientationsSauf("RECEPTION").map((o) => ({
  ...o,
  couleurMobile:
    o.value === "INFIRMIERS" ? COULEUR_MOBILE_INFIRMIERS : COULEUR_MOBILE_DEFAUT,
})) as readonly {
  value: CodeSalle;
  label: string;
  description: string;
  couleur: string;
  couleurMobile: string;
}[];

export const CODES_ORIENTATION_RECEPTION: CodeSalle[] =
  orientationsAutoriseesDepuis("RECEPTION");

export function filtrerOrientationsReception(orientations: string[]): CodeSalle[] {
  const codes = filtrerOrientationsAutorisees("RECEPTION", orientations);
  if (codes.length === 0) return ["INFIRMIERS"];
  return codes;
}

export const MOTIFS_PRINCIPAUX = [
  { value: "consultation", label: "Consultation générale" },
  { value: "analyses", label: "Analyses de laboratoire" },
  { value: "urgence", label: "Urgence" },
  { value: "rdv", label: "Rendez-vous programmé" },
  { value: "prenuptial", label: "Examen prénuptial" },
  { value: "autre", label: "Autre" },
] as const;

export const ORIENTATIONS_RECEPTION = metaOrientationsSauf("RECEPTION").map((o) => ({
  value: o.value,
  label: o.label,
  desc: o.description,
})) as readonly {
  value: CodeSalle;
  label: string;
  desc: string;
}[];

export const STATISTIQUES_RECEPTION = {
  patientsAujourdhui: { valeur: 34, evolution: "+12%", libelle: "par rapport à hier" },
  enAttente: { valeur: 7, libelle: "Dans la salle d'infirmiers" },
  transferes: { valeur: 26, libelle: "Vers différents services" },
} as const;

export const PATIENTS_RECENTS = [
  {
    id: "PAT-2026-0341",
    nom: "KABAMBA Grâce",
    telephone: "+243 812 345 678",
    motif: "Consultation générale",
    orientation: "Infirmiers",
    orientationCouleur: "bg-violet-100 text-violet-700",
    statut: "En attente",
    statutCouleur: "bg-amber-100 text-amber-800",
    heure: "09:42",
  },
  {
    id: "PAT-2026-0340",
    nom: "MULUMBA Jean",
    telephone: "+243 998 112 233",
    motif: "Analyses laboratoire",
    orientation: "Caisse",
    orientationCouleur: "bg-rose-100 text-rose-700",
    statut: "Transféré",
    statutCouleur: "bg-emerald-100 text-emerald-700",
    heure: "09:28",
  },
  {
    id: "PAT-2026-0339",
    nom: "TSHILOMBO Marie",
    telephone: "+243 815 667 890",
    motif: "Examen prénuptial",
    orientation: "Église",
    orientationCouleur: "bg-emerald-100 text-emerald-700",
    statut: "Transféré",
    statutCouleur: "bg-emerald-100 text-emerald-700",
    heure: "09:15",
  },
  {
    id: "PAT-2026-0338",
    nom: "KASONGO Paul",
    telephone: "+243 819 445 123",
    motif: "Urgence",
    orientation: "Infirmiers",
    orientationCouleur: "bg-violet-100 text-violet-700",
    statut: "En cours",
    statutCouleur: "bg-blue-100 text-blue-700",
    heure: "08:55",
  },
] as const;

export interface PatientEnregistre {
  /** Clé unique par ligne (enregistrement ou transfert) */
  cleListe: string;
  /** Dossier de visite associé */
  dossierId: string;
  /** N° patient affiché (ex. PAT-2026-0002) */
  id: string;
  nom: string;
  telephone: string;
  motif: string;
  orientation: string;
  orientationCouleur: string;
  statut: string;
  statutCouleur: string;
  heure: string;
  /** Transfert réception actif (pour actions) */
  transfertId?: string;
  /** Statut brut Prisma du transfert */
  statutTransfert?: string;
  /** Données en file de récupération après rejet */
  enRecuperation?: boolean;
  /** Code Prisma de la salle destination (transfert actif) */
  codeSalleDestination?: string;
  /** Codes Prisma des salles destination (multi-sélection) */
  codesSalleDestination?: string[];
  /** Date/heure d'activité ISO (enregistrement ou transfert) pour filtres */
  dateActivite?: string;
}

function avecCleListe(patient: Omit<PatientEnregistre, "cleListe" | "dossierId">): PatientEnregistre {
  return { ...patient, cleListe: patient.id, dossierId: `mock-${patient.id}` };
}

/** Liste complète pour la page Patients enregistrés */
export const PATIENTS_ENREGISTRES: PatientEnregistre[] = [
  ...PATIENTS_RECENTS.map((p) => avecCleListe({ ...p })),
  avecCleListe({
    id: "PAT-2026-0337",
    nom: "LUBOYA Sarah",
    telephone: "+243 810 223 456",
    motif: "Consultation générale",
    orientation: "Médecin",
    orientationCouleur: "bg-blue-100 text-blue-700",
    statut: "Transféré",
    statutCouleur: "bg-emerald-100 text-emerald-700",
    heure: "08:41",
  }),
  avecCleListe({
    id: "PAT-2026-0336",
    nom: "BANZA Patrick",
    telephone: "+243 997 334 567",
    motif: "Rendez-vous programmé",
    orientation: "Infirmiers",
    orientationCouleur: "bg-violet-100 text-violet-700",
    statut: "En attente",
    statutCouleur: "bg-amber-100 text-amber-800",
    heure: "08:22",
  }),
  avecCleListe({
    id: "PAT-2026-0335",
    nom: "NKULU Amina",
    telephone: "+243 818 556 789",
    motif: "Analyses laboratoire",
    orientation: "Laboratoire",
    orientationCouleur: "bg-cyan-100 text-cyan-800",
    statut: "En cours",
    statutCouleur: "bg-blue-100 text-blue-700",
    heure: "08:08",
  }),
  avecCleListe({
    id: "PAT-2026-0334",
    nom: "MONGA David",
    telephone: "+243 816 778 901",
    motif: "Urgence",
    orientation: "Infirmiers",
    orientationCouleur: "bg-violet-100 text-violet-700",
    statut: "Transféré",
    statutCouleur: "bg-emerald-100 text-emerald-700",
    heure: "07:55",
  }),
  avecCleListe({
    id: "PAT-2026-0333",
    nom: "KABEYA Rose",
    telephone: "+243 814 889 012",
    motif: "Examen prénuptial",
    orientation: "Église",
    orientationCouleur: "bg-emerald-100 text-emerald-700",
    statut: "En attente",
    statutCouleur: "bg-amber-100 text-amber-800",
    heure: "07:38",
  }),
  avecCleListe({
    id: "PAT-2026-0332",
    nom: "TSHISEKEDI Marc",
    telephone: "+243 811 990 123",
    motif: "Consultation générale",
    orientation: "Caisse",
    orientationCouleur: "bg-rose-100 text-rose-700",
    statut: "Transféré",
    statutCouleur: "bg-emerald-100 text-emerald-700",
    heure: "07:15",
  }),
];

/** Patients orientés vers un autre service (statut Transféré) */
export const PATIENTS_TRANSFERES: PatientEnregistre[] = [
  ...PATIENTS_ENREGISTRES.filter((p) => p.statut === "Transféré"),
  avecCleListe({
    id: "PAT-2026-0331",
    nom: "ILUNGA Thérèse",
    telephone: "+243 817 112 334",
    motif: "Consultation spécialisée",
    orientation: "Médecin",
    orientationCouleur: "bg-blue-100 text-blue-700",
    statut: "Transféré",
    statutCouleur: "bg-emerald-100 text-emerald-700",
    heure: "07:02",
  }),
  avecCleListe({
    id: "PAT-2026-0330",
    nom: "MUTOMBO Eric",
    telephone: "+243 813 445 667",
    motif: "Analyses laboratoire",
    orientation: "Laboratoire",
    orientationCouleur: "bg-cyan-100 text-cyan-800",
    statut: "Transféré",
    statutCouleur: "bg-emerald-100 text-emerald-700",
    heure: "06:48",
  }),
  avecCleListe({
    id: "PAT-2026-0329",
    nom: "KAPENGA Nadine",
    telephone: "+243 809 778 990",
    motif: "Facturation",
    orientation: "Caisse",
    orientationCouleur: "bg-rose-100 text-rose-700",
    statut: "Transféré",
    statutCouleur: "bg-emerald-100 text-emerald-700",
    heure: "06:30",
  }),
];

export const FILTRES_STATUT_PATIENT = [
  "Tous",
  "En attente",
  "À confirmer",
  "En cours",
  "Transféré",
  "Rejeté",
] as const;

/** Événement client pour rafraîchir accueil / patients enregistrés après une action transfert. */
export const EVENEMENT_RECEPTION_PATIENTS_MODIFIES = "sigh:reception-patients-modifies";

/** Événement client lorsqu'un patient est choisi via la barre de recherche globale. */
export const EVENEMENT_RECEPTION_PATIENT_RECHERCHE = "sigh:reception-patient-recherche-selectionne";

/** Patient existant épinglé dans « Patients récemment enregistrés » (depuis le formulaire). */
export const EVENEMENT_RECEPTION_PATIENT_EPINGLE_RECENTS =
  "sigh:reception-patient-epingle-recents";

/** Focus la barre de recherche globale (Ctrl+K). */
export const EVENEMENT_RECEPTION_FOCUS_RECHERCHE = "sigh:reception-focus-recherche";

export interface DetailPatientRechercheSelectionne {
  numeroPatient: string;
  dossierId?: string;
}

/** Patient ajouté à la liste « récemment enregistrés » depuis le formulaire. */
export interface DetailPatientEpingleRecents {
  patient: PatientEnregistre;
}

/** Mise à jour locale d'une ligne (évite de recharger toute la liste). */
export interface DetailPatientOrientationModifiee {
  type: "orientation";
  patientId: string;
  orientation: string;
  orientationCouleur: string;
  codeSalleDestination: string;
}

export const COULEURS_ORIENTATION_LISTE: Record<string, string> = {
  Infirmiers: "bg-violet-100 text-violet-700",
  Médecin: "bg-blue-100 text-blue-700",
  Médecins: "bg-blue-100 text-blue-700",
  "Médecin externe": "bg-amber-100 text-amber-800",
  Caisse: "bg-rose-100 text-rose-700",
  Laboratoire: "bg-cyan-100 text-cyan-800",
  Église: "bg-emerald-100 text-emerald-700",
  Pharmacie: "bg-indigo-100 text-indigo-700",
  Hospitalisation: "bg-orange-100 text-orange-800",
  Réception: "bg-slate-100 text-slate-600",
  "Non orienté": "bg-slate-100 text-slate-600",
};

export const FILTRES_ORIENTATION_PATIENT = [
  "Toutes",
  "Non orienté",
  "Infirmiers",
  "Médecin",
  "Caisse",
  "Laboratoire",
  "Église",
] as const;

export const APERCU_PATIENT = {
  initiales: "GK",
  nom: "KABAMBA Grâce",
  id: "PAT-2026-0341",
  age: "28 ans",
  telephone: "+243 812 345 678",
  adresse: "Matete, Kinshasa",
  assurance: "CNSS",
} as const;

export const CLASSE_CHAMP_RECEPTION =
  "w-full rounded-lg border border-gris-bordure bg-white px-3 py-2 text-sm text-texte-principal placeholder:text-texte-secondaire/60 focus:border-bleu-medical focus:outline-none focus:ring-2 focus:ring-bleu-medical/15";

export const CLASSE_LABEL_RECEPTION =
  "mb-1 block text-xs font-semibold uppercase tracking-wide text-texte-secondaire";
