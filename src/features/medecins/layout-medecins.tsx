"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ComponentType } from "react";
import { useTranslation } from "react-i18next";
import { LogOut, Menu, Search, X } from "lucide-react";
import { LogoHam } from "@/components/brand/logo-ham";
import { AvatarUtilisateur } from "@/components/ui/avatar-utilisateur";
import { SelecteurLangue } from "@/components/ui/selecteur-langue";
import { INFORMATIONS_HOPITAL } from "@/constants/navigation";
import { MenuProfilEntete } from "@/features/reception/menu-profil-entete";
import { traduireRoleHospitalier } from "@/features/messagerie/traduire-role";
import { BadgeMessagerieSidebar } from "@/features/messagerie/badge-messagerie-sidebar";
import { BadgeNotificationsSidebar } from "@/features/notifications/badge-notifications-sidebar";
import { BoutonNotificationsEnTete } from "@/features/notifications/composants/bouton-notifications-entete";
import { useNavigationMedecins } from "@/hooks/use-navigation-medecins";
import type { CleBadgeMedecins } from "@/constants/medecins";
import type { UtilisateurMedecins } from "@/lib/auth/props-utilisateur-medecins";
import { cn } from "@/lib/utils";

export type BadgesNavMedecins = Partial<Record<CleBadgeMedecins, number>>;

interface PropsBarreLateraleMedecins {
  utilisateur: UtilisateurMedecins;
  ouvert?: boolean;
  onFermer?: () => void;
  badges?: BadgesNavMedecins;
}

function LiensNavigation({
  utilisateur,
  onFermer,
  badges = {},
}: {
  utilisateur: UtilisateurMedecins;
  onFermer?: () => void;
  badges?: BadgesNavMedecins;
}) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const { tableauDeBord, salle, communication, parametres } =
    useNavigationMedecins();

  const estActif = (href: string) => {
    if (href === "/sigh/medecins") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const lienClasse = (href: string) =>
    cn(
      "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
      estActif(href)
        ? "bg-bleu-medical text-white shadow-sm"
        : "text-texte-principal hover:bg-gris-tres-clair"
    );

  const deconnecter = async () => {
    onFermer?.();
    await fetch("/api/auth/deconnexion", { method: "POST" });
    router.push("/connexion");
    router.refresh();
  };

  type ItemNav = {
    href: string;
    id: string;
    icone: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
    etiquette: string;
    badge?: CleBadgeMedecins;
  };

  const couleurBadge = (id: string) => {
    if (id === "fileAttente" || id === "demandesExamens") {
      return "bg-amber-500 text-white";
    }
    if (id === "patientsDuJour" || id === "ordonnances" || id === "patientsTransferes") {
      return "bg-emerald-600 text-white";
    }
    return "bg-bleu-medical text-white";
  };

  const rendreSection = (titre: string, items: ItemNav[]) => (
    <>
      <p className="mb-2 mt-5 px-2 text-[10px] font-bold uppercase tracking-widest text-texte-secondaire first:mt-0">
        {titre}
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const Icone = item.icone;
          const compteur =
            item.badge && badges[item.badge] != null ? badges[item.badge]! : 0;
          const afficherBadge = Boolean(item.badge) && compteur > 0;
          return (
            <li key={item.href}>
              <Link href={item.href} onClick={onFermer} className={lienClasse(item.href)}>
                <Icone className="h-4 w-4 shrink-0" aria-hidden />
                <span className="min-w-0 flex-1 truncate">{item.etiquette}</span>
                {afficherBadge ? (
                  <span
                    className={cn(
                      "min-w-[1.25rem] rounded-md px-1.5 py-0.5 text-center text-[10px] font-bold",
                      estActif(item.href)
                        ? "bg-white/25 text-white"
                        : couleurBadge(item.id)
                    )}
                  >
                    {compteur}
                  </span>
                ) : null}
                {item.id === "messagerie" ? (
                  <BadgeMessagerieSidebar actif={estActif(item.href)} />
                ) : null}
                {item.id === "notifications" ? (
                  <BadgeNotificationsSidebar actif={estActif(item.href)} />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );

  return (
    <>
      <div className="flex items-start justify-between border-b border-gris-bordure px-4 py-4">
        <div className="min-w-0 flex-1">
          <LogoHam taille="petit" href="/sigh/medecins" className="max-w-full" />
          <p className="mt-2 truncate text-[10px] font-medium uppercase tracking-wider text-texte-secondaire">
            SIGH — {INFORMATIONS_HOPITAL.nomCourt}
          </p>
        </div>
        {onFermer && (
          <button
            type="button"
            onClick={onFermer}
            className="ml-2 shrink-0 rounded-lg p-2 text-texte-secondaire hover:bg-gris-tres-clair"
            aria-label={t("medecins.layout.fermerMenu")}
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {rendreSection(
          t("medecins.layout.sectionTableauDeBord"),
          tableauDeBord as ItemNav[]
        )}
        {rendreSection(t("medecins.layout.sectionSalle"), salle as ItemNav[])}
        {rendreSection(
          t("medecins.layout.sectionCommunication"),
          communication as ItemNav[]
        )}
        {rendreSection(t("medecins.layout.sectionParametres"), parametres as ItemNav[])}
      </nav>

      <div className="space-y-2 border-t border-gris-bordure p-3">
        <Link
          href="/sigh/medecins/profil"
          onClick={onFermer}
          className="flex items-center gap-3 rounded-xl bg-gris-tres-clair p-3 transition-colors hover:bg-bleu-medical-clair/40"
        >
          <AvatarUtilisateur
            prenom={utilisateur.prenom}
            nom={utilisateur.nom}
            photoUrl={utilisateur.photoUrl}
            taille="md"
            forme="rond"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold capitalize text-texte-principal">
              {utilisateur.prenom} {utilisateur.nom.toLowerCase()}
            </p>
            <p className="truncate text-xs text-texte-secondaire">
              {traduireRoleHospitalier(utilisateur.role, t)}
            </p>
          </div>
        </Link>
        {onFermer && (
          <button
            type="button"
            onClick={deconnecter}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gris-bordure py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            {t("medecins.layout.deconnecter")}
          </button>
        )}
      </div>
    </>
  );
}

export function BarreLateraleMedecins({
  utilisateur,
  ouvert = false,
  onFermer,
  badges = {},
}: PropsBarreLateraleMedecins) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!ouvert) return;
    const precedent = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = precedent;
    };
  }, [ouvert]);

  return (
    <>
      <aside className="hidden h-full w-[260px] shrink-0 flex-col border-r border-gris-bordure bg-white lg:flex">
        <LiensNavigation utilisateur={utilisateur} badges={badges} />
      </aside>

      {ouvert && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-50 bg-black/45 lg:hidden"
            aria-label={t("medecins.layout.fermerMenu")}
            onClick={onFermer}
          />
          <aside
            className="fixed inset-y-0 left-0 z-[60] flex w-[min(88vw,320px)] flex-col border-r border-gris-bordure bg-white shadow-2xl lg:hidden"
            role="dialog"
            aria-modal="true"
          >
            <LiensNavigation
              utilisateur={utilisateur}
              onFermer={onFermer}
              badges={badges}
            />
          </aside>
        </>
      )}
    </>
  );
}

interface PropsEnTeteMedecins {
  titre: string;
  sousTitre: string;
  utilisateur: UtilisateurMedecins;
  onMenu?: () => void;
}

export function EnTeteMedecins({
  titre,
  sousTitre,
  utilisateur,
  onMenu,
}: PropsEnTeteMedecins) {
  const { t } = useTranslation();
  const [recherche, setRecherche] = useState("");

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-gris-bordure bg-white">
      <div className="flex items-center gap-1.5 px-2.5 py-2 sm:gap-2 sm:px-4 sm:py-2.5 lg:hidden">
        <button
          type="button"
          onClick={onMenu}
          className="shrink-0 rounded-lg p-2 text-texte-principal hover:bg-gris-tres-clair"
          aria-label={t("medecins.layout.ouvrirMenu")}
        >
          <Menu className="h-5 w-5" />
        </button>
        <LogoHam
          taille="petit"
          href="/sigh/medecins"
          afficherTexte={false}
          className="hidden shrink-0 sm:block"
        />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-bold text-texte-principal">{titre}</h1>
          <p className="truncate text-[10px] text-texte-secondaire">{sousTitre}</p>
        </div>
        <SelecteurLangue variante="compacte" className="hidden shrink-0 sm:block" />
        <BoutonNotificationsEnTete />
        <MenuProfilEntete utilisateur={utilisateur} compact hrefProfil="/sigh/medecins/profil" />
      </div>

      <div className="hidden items-center justify-between gap-4 px-6 py-4 lg:flex">
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-texte-principal">{titre}</h1>
          <p className="text-sm text-texte-secondaire">{sousTitre}</p>
        </div>

        <div className="relative hidden min-w-0 flex-1 max-w-md xl:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-texte-secondaire" />
          <input
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder={t("medecins.layout.rechercher")}
            className="w-full rounded-xl border border-gris-bordure bg-gris-tres-clair/50 py-2.5 pl-10 pr-20 text-sm outline-none focus:border-bleu-medical focus:ring-2 focus:ring-bleu-medical/20"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-gris-bordure bg-white px-1.5 py-0.5 text-[10px] text-texte-secondaire">
            {t("medecins.layout.raccourciRecherche")}
          </span>
        </div>

        <div className="flex items-center justify-end gap-3">
          <SelecteurLangue />
          <BoutonNotificationsEnTete />
          <MenuProfilEntete utilisateur={utilisateur} hrefProfil="/sigh/medecins/profil" />
        </div>
      </div>
    </header>
  );
}
