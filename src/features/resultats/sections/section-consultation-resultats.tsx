"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, FileSearch, Phone, Shield } from "lucide-react";
import { INFORMATIONS_HOPITAL } from "@/constants/navigation";
import { Bouton } from "@/components/ui/bouton";
import { useContenuResultats } from "@/hooks/use-contenu-resultats";
import { VisionneuseResultatsPatient } from "@/features/resultats/visionneuse-resultats-patient";
import type { ResultatPatientPublic } from "@/lib/resultats-public/types";
import { cn } from "@/lib/utils";

export function SectionConsultationResultats() {
  const { consultation, form } = useContenuResultats();
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [numeroPatient, setNumeroPatient] = useState("");
  const [numeroFacture, setNumeroFacture] = useState("");
  const [telephone, setTelephone] = useState("");
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [resultat, setResultat] = useState<ResultatPatientPublic | null>(null);

  const reinitialiser = () => {
    setResultat(null);
    setErreur(null);
  };

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    setChargement(true);
    setErreur(null);

    try {
      const res = await fetch("/api/public/resultats/rechercher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, prenom, numeroPatient, numeroFacture, telephone }),
      });
      const data = (await res.json()) as {
        resultat?: ResultatPatientPublic;
        erreur?: string;
      };

      if (!res.ok || !data.resultat) {
        setErreur(data.erreur ?? form.erreur);
        setResultat(null);
        return;
      }

      setResultat(data.resultat);
    } catch {
      setErreur(form.erreur);
      setResultat(null);
    } finally {
      setChargement(false);
    }
  };

  return (
    <section
      id="consultation-resultats"
      className="bg-gris-tres-clair py-10 sm:py-12 lg:py-14"
    >
      <div className="conteneur-principal">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-bleu-medical">
            {consultation.surtitre}
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-texte-principal sm:text-3xl">
            {consultation.titre}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-texte-secondaire sm:text-base">
            {consultation.sousTitre}
          </p>
        </motion.div>

        <div className="mx-auto mt-10 max-w-6xl">
          {resultat ? (
            <VisionneuseResultatsPatient resultat={resultat} onFermer={reinitialiser} />
          ) : (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
              <motion.form
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                onSubmit={soumettre}
                className="rounded-2xl border border-gris-bordure bg-white p-6 shadow-sm sm:p-8"
              >
                <div className="mb-6 flex items-center gap-3 rounded-xl bg-bleu-medical-clair/40 px-4 py-3">
                  <FileSearch className="h-5 w-5 shrink-0 text-bleu-medical" />
                  <p className="text-sm text-texte-principal">
                    {consultation.securite}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="mb-1.5 block font-medium text-texte-principal">
                      {form.nom}
                    </span>
                    <input
                      type="text"
                      required
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      className="w-full rounded-xl border border-gris-bordure px-4 py-2.5 text-sm outline-none ring-bleu-medical/20 focus:border-bleu-medical focus:ring-2"
                      autoComplete="family-name"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1.5 block font-medium text-texte-principal">
                      {form.prenom}
                    </span>
                    <input
                      type="text"
                      required
                      value={prenom}
                      onChange={(e) => setPrenom(e.target.value)}
                      className="w-full rounded-xl border border-gris-bordure px-4 py-2.5 text-sm outline-none ring-bleu-medical/20 focus:border-bleu-medical focus:ring-2"
                      autoComplete="given-name"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1.5 block font-medium text-texte-principal">
                      {form.numeroPatient}
                    </span>
                    <input
                      type="text"
                      required
                      inputMode="numeric"
                      value={numeroPatient}
                      onChange={(e) => setNumeroPatient(e.target.value)}
                      placeholder={form.numeroPatientAide}
                      className="w-full rounded-xl border border-gris-bordure px-4 py-2.5 font-mono text-sm outline-none ring-bleu-medical/20 focus:border-bleu-medical focus:ring-2"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1.5 block font-medium text-texte-principal">
                      {form.numeroFacture}
                    </span>
                    <input
                      type="text"
                      required
                      value={numeroFacture}
                      onChange={(e) => setNumeroFacture(e.target.value)}
                      placeholder={form.numeroFactureAide}
                      className="w-full rounded-xl border border-gris-bordure px-4 py-2.5 font-mono text-sm uppercase outline-none ring-bleu-medical/20 focus:border-bleu-medical focus:ring-2"
                    />
                  </label>
                  <label className="block text-sm sm:col-span-2">
                    <span className="mb-1.5 block font-medium text-texte-principal">
                      {form.telephone}
                    </span>
                    <input
                      type="tel"
                      required
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      placeholder={form.telephoneAide}
                      className="w-full rounded-xl border border-gris-bordure px-4 py-2.5 text-sm outline-none ring-bleu-medical/20 focus:border-bleu-medical focus:ring-2"
                      autoComplete="tel"
                    />
                  </label>
                </div>

                {erreur ? (
                  <div
                    className={cn(
                      "mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                    )}
                    role="alert"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {erreur}
                  </div>
                ) : null}

                <div className="mt-6">
                  <Bouton
                    type="submit"
                    variante="primaire"
                    taille="grand"
                    className="w-full sm:w-auto"
                    disabled={chargement}
                  >
                    {chargement ? form.recherche : form.rechercher}
                  </Bouton>
                </div>
              </motion.form>

              <aside className="space-y-4">
                <div className="rounded-2xl border border-gris-bordure bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-bleu-medical">
                    <Shield className="h-5 w-5" />
                    <h3 className="font-bold text-texte-principal">
                      {consultation.aide}
                    </h3>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-texte-secondaire">
                    {consultation.aideTexte}
                  </p>
                  <a
                    href={`tel:${INFORMATIONS_HOPITAL.telephone.replace(/\s/g, "")}`}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-bleu-medical hover:underline"
                  >
                    <Phone className="h-4 w-4" />
                    {INFORMATIONS_HOPITAL.telephone}
                  </a>
                </div>
              </aside>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
