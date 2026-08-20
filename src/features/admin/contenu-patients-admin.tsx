"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  ContactRound,
  Loader2,
  MoreVertical,
  SquarePen,
  Trash2,
} from "lucide-react";
import {
  MiseEnPageAdmin,
  type UtilisateurAdmin,
} from "@/features/admin/mise-en-page-admin";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import { AvatarUtilisateur } from "@/components/ui/avatar-utilisateur";
import { telechargerCsv } from "@/components/ui/boutons-outils-liste";
import {
  PaginationListe,
  paginerListe,
} from "@/components/ui/pagination-liste";
import {
  FORM_PATIENT_ADMIN_VIDE,
  FormulairePatientAdmin,
  type FormPatientAdmin,
  type TypePersonneAdmin,
} from "@/features/admin/formulaire-patient-admin";
import { BarreOutilsListeAdmin } from "@/features/admin/barre-outils-liste-admin";
import {
  compterFiltresPatientsAdmin,
  FILTRES_PATIENTS_ADMIN_VIDES,
  FormulaireFiltresPatientsAdmin,
  personneCorrespondFiltresAdmin,
  type FiltresPatientsAdmin,
} from "@/features/admin/formulaire-filtres-patients-admin";
import { MenuDeroulantPortail } from "@/features/admin/menu-deroulant-portail";
import { cn } from "@/lib/utils";

type PersonneItem = {
  id: string;
  type: TypePersonneAdmin;
  numeroPatient: string;
  prenom: string;
  nom: string;
  dateNaissance: string | null;
  age: number | null;
  sexe: "MASCULIN" | "FEMININ" | "AUTRE" | null;
  telephone: string | null;
  email: string | null;
  adresse: string | null;
  ville: string | null;
  province: string | null;
  pays: string;
  groupeSanguin: string | null;
  allergies: string | null;
  contactUrgence: string | null;
  telephoneUrgence: string | null;
  photoUrl: string | null;
  dernierDossier: {
    id: string;
    numeroDossier: string;
    statut: string;
    ouvertLe: string;
    clotureLe: string | null;
    salleEnregistrement: string;
  } | null;
  dossiers: {
    id: string;
    numeroDossier: string;
    statut: string;
    ouvertLe: string;
    salleEnregistrement: string;
  }[];
};

type ModePanneau = "consultation" | "edition";
type ActionMenuPatient =
  | "resultat"
  | "reinitialiser"
  | "annulerTransfert"
  | "restaurerTransfert";

const PAR_PAGE = 5;

const CLASSE_BOUTON_ACTION =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gris-bordure text-slate-500 transition-colors hover:bg-gris-tres-clair hover:text-bleu-medical";

const CLASSE_BOUTON_SUPPRIMER =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gris-bordure text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700";

function dateIsoVersChamp(iso: string | null) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function formaterDateRelative(
  iso: string | null,
  locale: string,
  t: (cle: string) => string
) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  const maintenant = new Date();
  const debutAujourdhui = new Date(
    maintenant.getFullYear(),
    maintenant.getMonth(),
    maintenant.getDate()
  );
  const debutHier = new Date(debutAujourdhui);
  debutHier.setDate(debutHier.getDate() - 1);
  const heure = date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (date >= debutAujourdhui) {
    return `${t("admin.patients.aujourdhui")} ${heure}`;
  }
  if (date >= debutHier) {
    return `${t("admin.patients.hier")} ${heure}`;
  }
  return date.toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formVersPersonne(p: PersonneItem): FormPatientAdmin {
  return {
    prenom: p.prenom,
    nom: p.nom,
    dateNaissance: dateIsoVersChamp(p.dateNaissance),
    age: p.age != null ? String(p.age) : "",
    sexe: p.sexe ?? "",
    telephone: p.telephone ?? "",
    email: p.email ?? "",
    adresse: p.adresse ?? "",
    ville: p.ville ?? "",
    province: p.province ?? "",
    pays: p.pays || "RD Congo",
    groupeSanguin: p.groupeSanguin ?? "",
    allergies: p.allergies ?? "",
    contactUrgence: p.contactUrgence ?? "",
    telephoneUrgence: p.telephoneUrgence ?? "",
  };
}

export function ContenuPatientsAdmin({
  utilisateur,
}: {
  utilisateur: UtilisateurAdmin;
}) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [patients, setPatients] = useState<PersonneItem[]>([]);
  const [clients, setClients] = useState<PersonneItem[]>([]);
  const [rechercheRapide, setRechercheRapide] = useState("");
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [brouillon, setBrouillon] = useState<FiltresPatientsAdmin>(
    FILTRES_PATIENTS_ADMIN_VIDES
  );
  const [appliques, setAppliques] = useState<FiltresPatientsAdmin>(
    FILTRES_PATIENTS_ADMIN_VIDES
  );
  const [salles, setSalles] = useState<{ code: string; nom: string }[]>([]);
  const [idsCoches, setIdsCoches] = useState<string[]>([]);
  const [pagePatients, setPagePatients] = useState(1);
  const [pageClients, setPageClients] = useState(1);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectionId, setSelectionId] = useState<string | null>(null);
  const [form, setForm] = useState<FormPatientAdmin>({ ...FORM_PATIENT_ADMIN_VIDE });
  const [photo, setPhoto] = useState<File | null>(null);
  const [modePanneau, setModePanneau] = useState<ModePanneau | null>(null);
  const [menuOuvertId, setMenuOuvertId] = useState<string | null>(null);
  const [menuAncre, setMenuAncre] = useState<HTMLElement | null>(null);
  const [enCours, setEnCours] = useState(false);

  const toutes = useMemo(() => [...patients, ...clients], [patients, clients]);
  const selection = toutes.find((p) => p.id === selectionId) ?? null;
  const lectureSeule = modePanneau !== "edition";

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const [res, sRes] = await Promise.all([
        fetch("/api/admin/patients"),
        fetch("/api/admin/salles"),
      ]);
      const data = (await res.json()) as {
        patients?: PersonneItem[];
        clients?: PersonneItem[];
        message?: string;
      };
      const sData = (await sRes.json()) as {
        salles?: { code: string; nom: string }[];
      };
      if (!res.ok) throw new Error(data.message ?? t("admin.patients.erreur"));
      setPatients(data.patients ?? []);
      setClients(data.clients ?? []);
      setSalles(sData.salles ?? []);
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("admin.patients.erreur"));
    } finally {
      setChargement(false);
    }
  }, [t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  useEffect(() => {
    if (selection && modePanneau === "consultation") {
      setForm(formVersPersonne(selection));
    }
  }, [selection, modePanneau]);

  const patientsFiltres = useMemo(
    () =>
      patients.filter((p) =>
        personneCorrespondFiltresAdmin(p, appliques, rechercheRapide)
      ),
    [patients, appliques, rechercheRapide]
  );
  const clientsFiltres = useMemo(
    () =>
      clients.filter((p) =>
        personneCorrespondFiltresAdmin(p, appliques, rechercheRapide)
      ),
    [clients, appliques, rechercheRapide]
  );
  const filtresTous = useMemo(
    () => [...patientsFiltres, ...clientsFiltres],
    [patientsFiltres, clientsFiltres]
  );

  const pagePatientsData = useMemo(
    () => paginerListe(patientsFiltres, pagePatients, PAR_PAGE),
    [patientsFiltres, pagePatients]
  );
  const pageClientsData = useMemo(
    () => paginerListe(clientsFiltres, pageClients, PAR_PAGE),
    [clientsFiltres, pageClients]
  );

  useEffect(() => {
    setPagePatients(1);
    setPageClients(1);
  }, [rechercheRapide, appliques]);

  const nbFiltres = compterFiltresPatientsAdmin(appliques);
  const toutSelectionne =
    filtresTous.length > 0 && filtresTous.every((p) => idsCoches.includes(p.id));

  const fermerMenu = useCallback(() => {
    setMenuOuvertId(null);
    setMenuAncre(null);
  }, []);

  const fermerPanneau = () => {
    setSelectionId(null);
    setModePanneau(null);
    setMenuOuvertId(null);
    setMenuAncre(null);
    setForm({ ...FORM_PATIENT_ADMIN_VIDE });
    setPhoto(null);
  };

  const consulter = (p: PersonneItem) => {
    setSelectionId(p.id);
    setModePanneau("consultation");
    setForm(formVersPersonne(p));
    setPhoto(null);
    setMenuOuvertId(null);
    setMenuAncre(null);
    setMessage(null);
    setErreur(null);
  };

  const editer = (p: PersonneItem) => {
    setSelectionId(p.id);
    setModePanneau("edition");
    setForm(formVersPersonne(p));
    setPhoto(null);
    setMenuOuvertId(null);
    setMenuAncre(null);
    setMessage(null);
    setErreur(null);
  };

  const basculerCoche = (id: string) => {
    setIdsCoches((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
    );
  };

  const basculerSelectionTout = () => {
    setIdsCoches(toutSelectionne ? [] : filtresTous.map((p) => p.id));
  };

  const exporterSelection = () => {
    const coches = new Set(idsCoches);
    const cibles =
      coches.size > 0 ? filtresTous.filter((p) => coches.has(p.id)) : filtresTous;
    if (cibles.length === 0) return;
    telechargerCsv(
      `admin-patients-clients-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        t("admin.patients.champs.type"),
        t("admin.patients.colonnes.personne"),
        t("admin.patients.champs.numero"),
        t("admin.patients.champs.telephone"),
        t("admin.patients.colonnes.dossier"),
        t("admin.patients.colonnes.statut"),
        t("admin.patients.colonnes.derniereVisite"),
      ],
      cibles.map((p) => [
        t(`admin.patients.types.${p.type}`),
        `${p.prenom} ${p.nom}`,
        p.numeroPatient,
        p.telephone ?? "",
        p.dernierDossier?.numeroDossier ?? "",
        p.dernierDossier
          ? t(`admin.patients.statutsDossier.${p.dernierDossier.statut}`, {
              defaultValue: p.dernierDossier.statut,
            })
          : "",
        formaterDateRelative(p.dernierDossier?.ouvertLe ?? null, i18n.language, t),
      ])
    );
  };

  const supprimer = async (p: PersonneItem) => {
    if (!window.confirm(t("admin.patients.confirmerSuppression", { nom: `${p.prenom} ${p.nom}` }))) {
      return;
    }
    setEnCours(true);
    setErreur(null);
    setMessage(null);
    setMenuOuvertId(null);
    setMenuAncre(null);
    try {
      const res = await fetch(`/api/admin/patients/${p.id}`, { method: "DELETE" });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
      setMessage(data.message ?? t("admin.patients.supprime"));
      if (selectionId === p.id) fermerPanneau();
      await charger();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("admin.common.erreur"));
    } finally {
      setEnCours(false);
    }
  };

  const actionMenu = (p: PersonneItem, action: ActionMenuPatient) => {
    setMenuOuvertId(null);
    setMenuAncre(null);
    const routes: Record<ActionMenuPatient, string> = {
      resultat: `/sigh/admin/patients/${p.id}/resultats`,
      annulerTransfert: `/sigh/admin/patients/${p.id}/annuler-transfert`,
      restaurerTransfert: `/sigh/admin/patients/${p.id}/restaurer-transfert`,
      reinitialiser: `/sigh/admin/patients/${p.id}/reinitialiser`,
    };
    router.push(routes[action]);
  };

  const soumettre = async () => {
    if (!selectionId || !form.prenom.trim() || !form.nom.trim()) {
      setErreur(t("admin.patients.champsRequis"));
      return;
    }
    setEnCours(true);
    setErreur(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/patients/${selectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prenom: form.prenom,
          nom: form.nom,
          dateNaissance: form.dateNaissance || null,
          age: form.age.trim() === "" ? null : Number(form.age),
          sexe: form.sexe || null,
          telephone: form.telephone || null,
          email: form.email || null,
          adresse: form.adresse || null,
          ville: form.ville || null,
          province: form.province || null,
          pays: form.pays || null,
          groupeSanguin: form.groupeSanguin || null,
          allergies: form.allergies || null,
          contactUrgence: form.contactUrgence || null,
          telephoneUrgence: form.telephoneUrgence || null,
        }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));

      if (photo) {
        const fd = new FormData();
        fd.append("photo", photo);
        const photoRes = await fetch(`/api/admin/patients/${selectionId}/photo`, {
          method: "POST",
          body: fd,
        });
        const photoData = (await photoRes.json()) as { message?: string };
        if (!photoRes.ok) {
          throw new Error(photoData.message ?? t("admin.common.erreur"));
        }
      }

      setMessage(data.message ?? t("admin.patients.maj"));
      setPhoto(null);
      setModePanneau("consultation");
      await charger();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("admin.common.erreur"));
    } finally {
      setEnCours(false);
    }
  };

  const rendreTableau = (
    items: PersonneItem[],
    pageData: ReturnType<typeof paginerListe<PersonneItem>>,
    onPage: (n: number) => void,
    vide: string
  ) => {
    if (items.length === 0) {
      return (
        <p className="px-4 py-8 text-center text-sm text-texte-secondaire">{vide}</p>
      );
    }
    return (
      <>
        <div className="w-full max-w-full overflow-x-auto">
          <table className="tableau-sigh w-full min-w-[720px] table-fixed">
            <thead className="bg-gris-tres-clair text-xs uppercase text-texte-secondaire">
              <tr>
                <th className="w-10 px-2 py-2">
                  <span className="sr-only">
                    {t("reception.liste.selectionnerTout")}
                  </span>
                </th>
                <th className="px-2 py-2 text-left">
                  {t("admin.patients.colonnes.personne")}
                </th>
                <th className="hidden w-[9.5rem] px-2 py-2 text-left xl:table-cell">
                  {t("admin.patients.colonnes.telephone")}
                </th>
                <th className="w-[8.5rem] px-2 py-2 text-left">
                  {t("admin.patients.colonnes.dossier")}
                </th>
                <th className="hidden w-[6.5rem] px-2 py-2 text-left 2xl:table-cell">
                  {t("admin.patients.colonnes.statut")}
                </th>
                <th className="hidden w-[7rem] px-2 py-2 text-left 2xl:table-cell">
                  {t("admin.patients.colonnes.derniereVisite")}
                </th>
                <th className="w-[8.25rem] px-2 py-2 text-center">
                  {t("admin.patients.colonnes.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {pageData.itemsPage.map((p) => (
                <tr
                  key={p.id}
                  className={cn(
                    "cursor-pointer border-t border-gris-bordure hover:bg-bleu-medical-clair/20",
                    selectionId === p.id && "bg-bleu-medical-clair/30"
                  )}
                  onClick={() => consulter(p)}
                >
                  <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={idsCoches.includes(p.id)}
                      onChange={() => basculerCoche(p.id)}
                      aria-label={`${p.prenom} ${p.nom}`}
                    />
                  </td>
                  <td className="px-2 py-2.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <AvatarUtilisateur
                        prenom={p.prenom}
                        nom={p.nom}
                        photoUrl={p.photoUrl}
                        taille="sm"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-texte-principal">
                          {p.prenom} {p.nom}
                        </p>
                        <p className="truncate text-xs text-texte-secondaire">
                          {p.numeroPatient}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden truncate whitespace-nowrap px-2 py-2.5 text-sm xl:table-cell">
                    {p.telephone || "—"}
                  </td>
                  <td className="truncate whitespace-nowrap px-2 py-2.5 text-sm">
                    {p.dernierDossier?.numeroDossier ?? "—"}
                  </td>
                  <td className="hidden px-2 py-2.5 2xl:table-cell">
                    {p.dernierDossier ? (
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                          p.dernierDossier.statut === "CLOTURE"
                            ? "bg-slate-100 text-slate-700"
                            : "bg-emerald-50 text-emerald-700"
                        )}
                      >
                        {t(`admin.patients.statutsDossier.${p.dernierDossier.statut}`, {
                          defaultValue: p.dernierDossier.statut,
                        })}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="hidden whitespace-nowrap px-2 py-2.5 text-xs text-texte-secondaire 2xl:table-cell">
                    {formaterDateRelative(
                      p.dernierDossier?.ouvertLe ?? null,
                      i18n.language,
                      t
                    )}
                  </td>
                  <td className="px-2 py-2.5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => void supprimer(p)}
                        className={CLASSE_BOUTON_SUPPRIMER}
                        aria-label={t("admin.patients.supprimer")}
                        title={t("admin.patients.supprimer")}
                        disabled={enCours}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => editer(p)}
                        className={CLASSE_BOUTON_ACTION}
                        aria-label={t("admin.patients.editer")}
                        title={t("admin.patients.editer")}
                      >
                        <SquarePen className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          const cible = e.currentTarget;
                          setMenuOuvertId((id) => {
                            if (id === p.id) {
                              setMenuAncre(null);
                              return null;
                            }
                            setMenuAncre(cible);
                            return p.id;
                          });
                        }}
                        className={CLASSE_BOUTON_ACTION}
                        aria-label={t("admin.patients.plusActions")}
                        title={t("admin.patients.plusActions")}
                        aria-expanded={menuOuvertId === p.id}
                        aria-haspopup="menu"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <PaginationListe
          page={pageData.pageCourante}
          totalPages={pageData.totalPages}
          totalItems={items.length}
          parPage={PAR_PAGE}
          onChange={onPage}
          labelPrec={t("reception.liste.prec")}
          labelSuiv={t("reception.liste.suiv")}
        />
      </>
    );
  };

  return (
    <MiseEnPageAdmin
      utilisateur={utilisateur}
      titre={t("admin.patients.titre")}
      sousTitre={t("admin.layout.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <EnTetePageReception
          icone={ContactRound}
          titre={t("admin.patients.titre")}
          description={t("admin.patients.description")}
          fil={[
            { label: t("admin.common.salle"), href: "/sigh/admin" },
            { label: t("admin.patients.fil") },
          ]}
        />

        <div className="mt-4 space-y-3">
          <BarreOutilsListeAdmin
            recherche={rechercheRapide}
            onRecherche={setRechercheRapide}
            placeholder={t("admin.patients.recherche")}
            filtresOuverts={filtresOuverts}
            onFiltres={() => setFiltresOuverts((o) => !o)}
            nbFiltres={nbFiltres}
            toutSelectionne={toutSelectionne}
            onSelectionnerTout={basculerSelectionTout}
            onExporter={exporterSelection}
          />
          {filtresOuverts ? (
            <FormulaireFiltresPatientsAdmin
              valeurs={brouillon}
              onChange={setBrouillon}
              onRechercher={() => {
                setAppliques(brouillon);
                setPagePatients(1);
                setPageClients(1);
              }}
              onReinitialiser={() => {
                setBrouillon(FILTRES_PATIENTS_ADMIN_VIDES);
                setAppliques(FILTRES_PATIENTS_ADMIN_VIDES);
                setPagePatients(1);
                setPageClients(1);
              }}
              salles={salles}
            />
          ) : null}
        </div>

        {message ? (
          <p className="mt-3 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
            {message}
          </p>
        ) : null}
        {erreur ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {erreur}
          </p>
        ) : null}

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(22rem,1fr)]">
          <div className="space-y-4">
            <div className="overflow-visible rounded-xl border border-gris-bordure bg-white shadow-sm">
              <div className="border-b border-gris-bordure px-4 py-3">
                <h2 className="text-sm font-bold uppercase tracking-wide text-texte-principal">
                  {t("admin.patients.titrePatients")}
                  <span className="ml-2 font-normal text-texte-secondaire">
                    ({patientsFiltres.length})
                  </span>
                </h2>
              </div>
              {chargement ? (
                <p className="flex items-center gap-2 p-6 text-sm text-texte-secondaire">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("admin.common.chargement")}
                </p>
              ) : (
                rendreTableau(
                  patientsFiltres,
                  pagePatientsData,
                  setPagePatients,
                  t("admin.patients.aucunPatient")
                )
              )}
            </div>

            <div className="overflow-visible rounded-xl border border-gris-bordure bg-white shadow-sm">
              <div className="border-b border-gris-bordure px-4 py-3">
                <h2 className="text-sm font-bold uppercase tracking-wide text-texte-principal">
                  {t("admin.patients.titreClients")}
                  <span className="ml-2 font-normal text-texte-secondaire">
                    ({clientsFiltres.length})
                  </span>
                </h2>
              </div>
              {chargement ? (
                <p className="flex items-center gap-2 p-6 text-sm text-texte-secondaire">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("admin.common.chargement")}
                </p>
              ) : (
                rendreTableau(
                  clientsFiltres,
                  pageClientsData,
                  setPageClients,
                  t("admin.patients.aucunClient")
                )
              )}
            </div>
          </div>

          <FormulairePatientAdmin
            form={form}
            onChange={setForm}
            modePanneau={modePanneau}
            typePersonne={selection?.type ?? null}
            numeroPatient={selection?.numeroPatient ?? null}
            dossiers={selection?.dossiers ?? []}
            lectureSeule={lectureSeule}
            enCours={enCours}
            photo={photo}
            photoUrlExistante={selection?.photoUrl}
            onPhoto={setPhoto}
            onSoumettre={() => void soumettre()}
            onFermer={fermerPanneau}
          />
        </div>
      </div>
      <MenuDeroulantPortail
        ouvert={Boolean(menuOuvertId)}
        ancre={menuAncre}
        onFermer={fermerMenu}
      >
        {(
          [
            ["resultat", "admin.patients.menu.resultat"],
            ["reinitialiser", "admin.patients.menu.reinitialiser"],
            ["annulerTransfert", "admin.patients.menu.annulerTransfert"],
            ["restaurerTransfert", "admin.patients.menu.restaurerTransfert"],
          ] as const
        ).map(([action, cle]) => (
          <button
            key={action}
            type="button"
            role="menuitem"
            onClick={() => {
              const cible = toutes.find((x) => x.id === menuOuvertId);
              if (cible) actionMenu(cible, action);
            }}
            className="block w-full px-3 py-2 text-left text-sm text-texte-principal hover:bg-gris-tres-clair"
          >
            {t(cle)}
          </button>
        ))}
      </MenuDeroulantPortail>
    </MiseEnPageAdmin>
  );
}
