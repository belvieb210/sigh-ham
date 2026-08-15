import { CAMPAGNES_PUBLICATIONS } from "./campagnes";
import { versFormatAccueil } from "@/lib/campagnes-utils";

/** Liens de navigation principale */
export const LIENS_NAVIGATION = [
  { etiquette: "Accueil", href: "/" },
  { etiquette: "À propos", href: "/a-propos" },
  { etiquette: "Services", href: "/services" },
  { etiquette: "Campagnes", href: "/campagnes" },
  { etiquette: "Résultats disponibles", href: "/resultats" },
  { etiquette: "Contact", href: "/contact" },
] as const;

/** URL du système interne (personnel) */
export const URL_CONNEXION_INTERNE = "/connexion";

/** Chemin du logo officiel */
export const CHEMIN_LOGO_HAM = "/images/logo-ham.jpg";

/** Informations de l'établissement — HAM LABORATOIRE */
export const INFORMATIONS_HOPITAL = {
  nom: "HAM LABORATOIRE",
  nomCourt: "HAM Laboratoire",
  typeEtablissement: "Centre de Diagnostic et d'Analyses Médicales",
  slogan: "VOTRE SANTÉ MON FARDEAU, LA FIABILITÉ NOTRE PRÉÉMINENCE",
  titreAccueil: "Votre santé mon fardeau,",
  titreAccueilSuite: "la fiabilité notre prééminence",
  description:
    "Des soins de qualité, des équipements de pointe et une équipe médicale à votre écoute.",
  nomComplet:
    'Centre de Diagnostic et d\'Analyses Médicales "HAM LABORATOIRE"',
  adresse:
    "259, Avenue Lumière, Entrée Debonhomme Troisième Parcelle À Droit Commune MATETE, Kinshasa, République démocratique du Congo",
  adresseCourte: "259, Avenue Lumière, Commune MATETE, Kinshasa, RDC",
  telephone: "+243 819 191 643",
  telephoneSecondaire: "+243 815 129 111",
  telephoneResponsable: "+243 815 129 111",
  siteWeb: "https://hamlabor.org/",
  email: "obb5lab@gmail.com",
  certification: "ISO 9001:2015",
} as const;

/** Statistiques affichées sur la page d'accueil */
export const STATISTIQUES_ACCUEIL = [
  {
    id: "medecins",
    valeur: "50+",
    libelle: "Médecins spécialistes",
    icone: "medecins" as const,
  },
  {
    id: "departements",
    valeur: "12",
    libelle: "Départements",
    icone: "departements" as const,
  },
  {
    id: "patients",
    valeur: "24K+",
    libelle: "Patients pris en charge",
    icone: "patients" as const,
  },
  {
    id: "certification",
    valeur: "ISO 9001:2015",
    libelle: "Certification qualité",
    icone: "certification" as const,
  },
] as const;

/** Services médicaux principaux */
export const SERVICES_MEDICAUX = [
  {
    id: "consultations",
    titre: "Consultations",
    description:
      "Consultations générales et spécialisées avec nos médecins expérimentés.",
    href: "/services/consultations",
    couleurIcone: "text-bleu-medical",
    fondIcone: "bg-bleu-medical-clair",
    icone: "consultations" as const,
  },
  {
    id: "laboratoire",
    titre: "Laboratoire",
    description:
      "Analyses médicales complètes avec des équipements de dernière génération.",
    href: "/services/laboratoire",
    couleurIcone: "text-violet-600",
    fondIcone: "bg-violet-50",
    icone: "laboratoire" as const,
  },
  {
    id: "pharmacie",
    titre: "Pharmacie",
    description:
      "Médicaments de qualité et conseils pharmaceutiques personnalisés.",
    href: "/services/pharmacie",
    couleurIcone: "text-[#2d2a6e]",
    fondIcone: "bg-indigo-50",
    icone: "pharmacie" as const,
  },
  {
    id: "hospitalisation",
    titre: "Hospitalisation",
    description:
      "Prise en charge hospitalière avec un suivi médical continu.",
    href: "/services/hospitalisation",
    couleurIcone: "text-orange-600",
    fondIcone: "bg-orange-50",
    icone: "hospitalisation" as const,
  },
  {
    id: "urgences",
    titre: "Urgences",
    description:
      "Service d'urgences disponible 24h/24 pour les situations critiques.",
    href: "/services/urgences",
    couleurIcone: "text-red-600",
    fondIcone: "bg-red-50",
    icone: "urgences" as const,
  },
  {
    id: "imagerie",
    titre: "Imagerie médicale",
    description:
      "Radiologie, échographie et IRM pour un diagnostic précis.",
    href: "/services/imagerie",
    couleurIcone: "text-cyan-600",
    fondIcone: "bg-cyan-50",
    icone: "imagerie" as const,
  },
] as const;

/** Campagnes de santé en cours — dérivées des publications officielles */
export const CAMPAGNES_SANTE = versFormatAccueil(CAMPAGNES_PUBLICATIONS);

/** Accès rapide aux fonctionnalités */
export const ACCES_RAPIDES = [
  {
    id: "rdv",
    titre: "Prise de rendez-vous",
    sousTitre: "En ligne 24h/24",
    href: "/rendez-vous",
    icone: "calendrier" as const,
  },
  {
    id: "resultats",
    titre: "Résultats disponibles",
    sousTitre: "Consultables en ligne",
    href: "/resultats",
    icone: "resultats" as const,
  },
  {
    id: "paiement",
    titre: "Paiement sécurisé",
    sousTitre: "En ligne",
    href: "/paiement",
    icone: "paiement" as const,
  },
  {
    id: "support",
    titre: "Support patient",
    sousTitre: "Assistance dédiée",
    href: "/contact",
    icone: "support" as const,
  },
] as const;

/** Navigation mobile (barre inférieure) */
export const LIENS_NAVIGATION_MOBILE = [
  { etiquette: "Accueil", href: "/", icone: "accueil" as const },
  { etiquette: "Services", href: "/services", icone: "services" as const },
  { etiquette: "Rendez-vous", href: "/rendez-vous", icone: "rdv" as const },
  { etiquette: "Campagnes", href: "/campagnes", icone: "campagnes" as const },
  { etiquette: "Contact", href: "/contact", icone: "contact" as const },
] as const;

/** Langues disponibles dans l'application (site public + réception SIGH) */
export const LANGUES_DISPONIBLES = [
  { code: "fr", libelle: "FR" },
  { code: "en", libelle: "EN" },
  { code: "ln", libelle: "LN" },
  { code: "sw", libelle: "SW" },
  { code: "kg", libelle: "KG" },
  { code: "lua", libelle: "LUA" },
  { code: "es", libelle: "ES" },
  { code: "de", libelle: "DE" },
  { code: "hi", libelle: "HI" },
  { code: "pt", libelle: "PT" },
  { code: "zh", libelle: "ZH" },
  { code: "he", libelle: "HE" },
  { code: "ar", libelle: "AR" },
] as const;
