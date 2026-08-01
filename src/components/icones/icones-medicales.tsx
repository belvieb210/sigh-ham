import { cn } from "@/lib/utils";

interface PropsIconeSvg {
  className?: string;
}

/** Logo SIGH — croix médicale dans un bouclier */
export function IconeLogoSigh({ className }: PropsIconeSvg) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-10 w-10", className)}
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="10" className="fill-bleu-medical" />
      <path
        d="M20 10v20M12 18h16"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="32" cy="8" r="4" className="fill-[#7dd3fc]" />
    </svg>
  );
}

/** Icône consultations */
export function IconeConsultations({ className }: PropsIconeSvg) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("h-6 w-6", className)} aria-hidden="true">
      <path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

/** Icône laboratoire */
export function IconeLaboratoire({ className }: PropsIconeSvg) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("h-6 w-6", className)} aria-hidden="true">
      <path d="M9 3h6v7l4 9a2 2 0 01-1.8 3H6.8a2 2 0 01-1.8-3l4-9V3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 3h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Icône pharmacie */
export function IconePharmacie({ className }: PropsIconeSvg) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("h-6 w-6", className)} aria-hidden="true">
      <rect x="3" y="8" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8V5M8 5h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 12v5M9.5 14.5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Icône hospitalisation */
export function IconeHospitalisation({ className }: PropsIconeSvg) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("h-6 w-6", className)} aria-hidden="true">
      <path d="M3 21V7l9-4 9 4v14" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 21v-6h6v6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 7v4M10 9h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Icône urgences */
export function IconeUrgences({ className }: PropsIconeSvg) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("h-6 w-6", className)} aria-hidden="true">
      <path d="M12 2l2.5 7.5H22l-6 4.5 2.5 7.5L12 17l-6.5 4.5L8 14 2 9.5h7.5L12 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

/** Icône imagerie médicale */
export function IconeImagerie({ className }: PropsIconeSvg) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("h-6 w-6", className)} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M7 19c1.5-3 3-4 5-4s3.5 1 5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Icône ruban cancer */
export function IconeRubanCancer({ className }: PropsIconeSvg) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={cn("h-16 w-16", className)} aria-hidden="true">
      <path
        d="M24 8c-4 0-8 3-8 8 0 6 8 14 8 14s8-8 8-14c0-5-4-8-8-8z"
        fill="currentColor"
        opacity="0.2"
      />
      <path
        d="M24 6C18 6 14 10 14 16c0 5 4 10 10 16 6-6 10-11 10-16 0-6-4-10-10-10z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

/** Icône vaccin */
export function IconeVaccin({ className }: PropsIconeSvg) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={cn("h-16 w-16", className)} aria-hidden="true">
      <rect x="18" y="8" width="12" height="28" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M20 14h8M20 20h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 36v4M20 40h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 4l2 4h-4l2-4z" fill="currentColor" />
    </svg>
  );
}

/** Icône diabète */
export function IconeDiabete({ className }: PropsIconeSvg) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={cn("h-16 w-16", className)} aria-hidden="true">
      <rect x="10" y="16" width="28" height="20" rx="4" stroke="currentColor" strokeWidth="2" />
      <path d="M18 26h12M24 20v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="26" r="8" stroke="currentColor" strokeWidth="2" opacity="0.3" />
    </svg>
  );
}

/** Icône cœur / cardiologie */
export function IconeCoeur({ className }: PropsIconeSvg) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={cn("h-16 w-16", className)} aria-hidden="true">
      <path
        d="M24 38S8 26 8 16a8 8 0 0114-4 8 8 0 0114 4c0 10-16 22-16 22z"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.15"
      />
      <path d="M16 28h16M20 24h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Carte des icônes de services par identifiant */
export const CARTE_ICONES_SERVICES = {
  consultations: IconeConsultations,
  laboratoire: IconeLaboratoire,
  pharmacie: IconePharmacie,
  hospitalisation: IconeHospitalisation,
  urgences: IconeUrgences,
  imagerie: IconeImagerie,
} as const;

/** Carte des icônes de campagnes par identifiant */
export const CARTE_ICONES_CAMPAGNES = {
  ruban: IconeRubanCancer,
  vaccin: IconeVaccin,
  diabete: IconeDiabete,
  coeur: IconeCoeur,
} as const;

/** Carte des icônes statistiques */
export const CARTE_ICONES_STATISTIQUES = {
  medecins: IconeConsultations,
  departements: IconeHospitalisation,
  patients: IconeImagerie,
  certification: IconeUrgences,
} as const;
