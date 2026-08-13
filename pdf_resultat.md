# Documentation — `pdf_resultat.php`

> Guide de référence pour comprendre **comment chaque type d'examen est rendu en PDF** dans le laboratoire HAM.  
> Fichier source legacy : [`docs/legacy/pdf_resultat.php`](docs/legacy/pdf_resultat.php) (~6200 lignes, FPDF + Calibri).  
> Implémentation Next.js : `src/lib/laboratoire/pdf-resultats/` (@react-pdf/renderer).

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Points d'entrée HTTP](#2-points-dentrée-http)
3. [Flux de génération](#3-flux-de-génération)
4. [Blocs communs de rendu](#4-blocs-communs-de-rendu)
5. [Routage automatique des types](#5-routage-automatique-des-types)
6. [Pattern standard d'un PDF examen](#6-pattern-standard-dun-pdf-examen)
7. [Catalogue des renders par type d'examen](#7-catalogue-des-renders-par-type-dexamen)
8. [PDF multi-examens consolidé](#8-pdf-multi-examens-consolidé)
9. [Données en base utilisées](#9-données-en-base-utilisées)
10. [Ajouter un nouveau type d'examen PDF](#10-ajouter-un-nouveau-type-dexamen-pdf)

---

## 1. Vue d'ensemble

`pdf_resultat.php` génère les **rapports PDF officiels** des résultats de laboratoire enregistrés dans `exam_results`.

| Composant | Rôle |
|-----------|------|
| **FPDF** (`fpdf186/`) | Moteur PDF bas niveau |
| **ExamResultPDF** | Classe principale : en-tête patient, tableaux, signature |
| **SmartExamDetector** | Détecte le type d'examen (modal_type, nom, structure JSON) |
| **MethodDiscoveryRegistry** | Résout `modal_type` → méthode `generateXxxPDF()` / `renderXxx()` |
| **generateExamResultPDF()** | Orchestrateur : charge DB → route → produit le PDF |
| **generateMultiExamPDF()** | Plusieurs examens d'un patient dans un seul PDF |

**Format page :** A4 portrait  
**Marges :** haut 40 mm, bas 25 mm, gauche/droite 15 mm  
**Police :** Calibri (fallback Helvetica)

---

## 2. Points d'entrée HTTP

### GET — PDF unitaire (Next.js)

```
GET /api/laboratoire/examens/{examenId}/resultat-pdf?dossierId={dossierId}
```

### GET — PDF multi-examens

```
GET /api/laboratoire/examens/{examenId}/resultat-pdf?dossierId={dossierId}&examIds=id1,id2,id3
```

### GET — PDF unitaire (legacy PHP)

```
docs/legacy/pdf_resultat.php?patient_id={id}&exam_id={id}&type={modal_type}
```

- `type` (optionnel) : force le `modal_type` si la détection automatique échoue
- Réponse : PDF inline (`Content-Disposition: inline`)

### GET — PDF consolidé (multi-examens)

```
pdf_resultat.php?patient_id={id}&exam_ids=1,2,3
```

- Paramètres optionnels : `zip=1`, `download=1`
- Copie serveur dans `documentsPatients/` si configuré

### POST — JSON (labo / API)

```json
{
  "exam_id": 123,
  "patient_id": 456,
  "type": "sellesRoutine"
}
```

ou mode consolidé :

```json
{
  "patient_id": 456,
  "exam_ids": [123, 124, 125]
}
```

Retourne `{ "success": true, "pdf": "<base64>", "filename": "..." }`.

---

## 3. Flux de génération

```text
Requête HTTP (GET/POST)
        │
        ▼
generateExamResultPDF(examId, patientId, examType?)
        │
        ├─ SELECT exam_results + patients + examens (is_latest = 1)
        ├─ JSON decode parameters_json → examData['results']
        ├─ Transformation spéciale groupage sanguin (liste → clés plates)
        │
        ▼
new ExamResultPDF(pdfData, patientData, labInfo)
        │
        ├─ SmartExamDetector::detect() → type + confidence
        ├─ Candidats : type URL → type détecté → modal_type DB
        ├─ MethodDiscoveryRegistry::resolveMethod()
        │     ex. selles_routine → generateSellesRoutinesPDF()
        │
        ▼
$pdf->generateXxxPDF()  →  return Output('S')  (binaire PDF)
```

**Échecs possibles :**

| Code | Cause |
|------|--------|
| `no_exam_row` | Aucune ligne `exam_results` pour ce couple exam/patient |
| `no_pdf_method` | Aucune méthode `generate*PDF` trouvée pour le type |
| `exception` | Erreur PHP (log dans `lastPdfGenerationError`) |

---

## 4. Blocs communs de rendu

Tous les PDF partagent une **structure visuelle commune**.

### 4.1 En-tête (chaque page sauf annexe)

| Méthode | Contenu |
|---------|---------|
| `Header()` → `renderPatientInfo()` | Cadre patient : nom, prénom, âge, sexe, n° enregistrement, médecin demandeur, CNOM, avatar silhouette, **QR code** (lien facture via `/s.php?c=...`) |

### 4.2 Bandeau titre examen

| Méthode | Contenu |
|---------|---------|
| `renderTitre(nom, specimen)` | Bandeau bleu/gris : **NOM EXAMEN (SPÉCIMEN)** centré |

### 4.3 Tableau paramètres générique

| Méthode | Colonnes configurables |
|---------|------------------------|
| `renderParamètres($showFlag, $showRange, $showValues, $printHeader, $showUnit, $paramProportion, $centerAll, $equalFour)` | **Paramètres** · Flag · **Résultat** (+ unité) · Range usuelle · (optionnel) Valeur |

Paramètres `$showFlag / $showRange / $showUnit` typiques :

| Profil | Flag | Range | Unité | Usage |
|--------|------|-------|-------|-------|
| Biochimie / CLIA / Hormones | ✅ | ✅ | ✅ | `renderBioCliaHorm` (tableau dédié) |
| NFS / Ionogramme / Bilans | ✅ | ✅ | ✅ | `renderParamètres()` défaut |
| Urines / Selles / Sédiment | ❌ | ✅ | ❌ | Parasitologie urinaire/fécale |
| Spermogramme / Frottis | ❌ | ✅/❌ | variable | Sans flag H/L |

### 4.4 Sections fin de page

| Méthode | Contenu |
|---------|---------|
| `renderCommentIndividuel()` | Commentaires saisis par paramètre (boutons ➕ du modal labo) |
| `renderComments($text)` | Commentaire global de l'examen |
| `renderExamDescription($text)` | Texte descriptif depuis catalogue `examens.description` |
| `renderSignature()` | Signature biologiste + tampon + date validation |
| `renderFichiers()` | Liste des pièces jointes (`attachments` JSON) |
| `renderValidationAndAnnexes()` | Page annexe si images jointes |

### 4.5 Utilitaires texte

| Méthode | Rôle |
|---------|------|
| `renderTexte()` | UTF-8 → Windows-1252 pour FPDF |
| `renderMajuscule()` | Majuscules avec accents |
| `renderPolice()` | Calibri taille/style |

---

## 5. Routage automatique des types

### 5.1 SmartExamDetector

Détection en 3 niveaux (score de confiance) :

1. **Champ exact** : `modal_type`, `exam_type`, `type` → confiance 1.0
2. **Mots-clés** dans `exam_name` (ex. « HEMOGRAMME », « IONOGRAMME »)
3. **Structure JSON** des paramètres (clés attendues par type)

### 5.2 MethodDiscoveryRegistry — aliases

Le `modal_type` enregistré en base (camelCase côté JS) est **normalisé** puis mappé vers le nom de méthode PHP :

| modal_type / alias DB | Méthode PHP cible |
|----------------------|-------------------|
| `nfs`, `hematologie` | `hemogramme` → `generateHemogrammePDF` |
| `nfl` | `ionogramme` → `generateIonogrammePDF` |
| `biochimie`, `clia`, `hormones`, `biocliahorm` | `bioCliaHorm` → `generateBioCliaHormPDF` |
| `sellesRoutine`, `selles_routine` | `sellesRoutines` → `generateSellesRoutinesPDF` |
| `sedimentUrinaire` | `sedimentUrinaire` → `generateSedimentUrinairePDF` |
| `urinesRoutines` | `urinesRoutines` → `generateUrinesRoutinesPDF` |
| `ptt`, `proteinurie24` | `bilanProtTot` → `generateBilanProtTotPDF` |
| `bilans_azotes` | `bilanAzotes` → `generateBilanAzotesPDF` |
| `bilirubi` | `bilirCompl` → `generateBilirComplPDF` |
| `profil_lipidique` | `profLip` → `generateProfLipPDF` |
| `spot_urines` | `spotUrine` → `generateSpotUrinePDF` |
| `proteineBincesJones` | `proteineBincesJones` → `generateProteineBincesJonesPDF` |
| `frottis_sang`, `frottis_blood` | `frottiessangperiph` → `generateFrottiessangperiphPDF` |
| `frottis_secretion` | `frottisSecretion` → `generateFrottisSecretionPDF` |
| `groupage_sanguin`, `groupe_sanguin` | `groupageSanguin` → `generateGroupageSanguinPDF` |
| `malaria_ge`, `malaria_tdr` | `malariaTDR` → `generateMalariaTDRPDF` |
| `charge_viral`, `chargeviral` | `chargeViral` → `generateChargeViralPDF` |
| `ziehl_nelsen`, `ZN` | `ziehlNelsen` → `generateZiehlNelsenPDF` |
| `tp_inr` | `tpInr` → `generateTpInrPDF` |
| `surveillance_prostatique` | `surveillanceProstat` → `generateSurveillanceProstatPDF` |
| `micro_albuminuries` | `microAlbuminuries` → `generateMicroAlbuminuriesPDF` |
| `bilans_torch` | `bilansTorch` → `generateBilansTorchPDF` |
| `glycemie_gestationnelle` | `glycemieGestationnelle` → `generateGlycemieGestationnellePDF` |

**Convention de nommage :**  
`selles_routine` → camelCase `SellesRoutines` → `generateSellesRoutinesPDF()` / `renderSellesRoutines()`

---

## 6. Pattern standard d'un PDF examen

Presque toutes les méthodes `generateXxxPDF()` suivent ce modèle :

```php
public function generateXxxPDF() {
    $this->AddPage();
    $this->AliasNbPages();

    $this->renderXxx();                              // Corps spécifique
    $this->renderComments($this->examData['comments'] ?? '');
    $this->renderExamDescription(...);               // Description catalogue
    $this->renderSignature();                          // Signature (1 seule fois en mono)
    $this->renderFichiers();                           // Pièces jointes

    return $this->Output('S');
}
```

---

## 7. Catalogue des renders par type d'examen

Pour chaque type : **modal_type** (formulaire labo), **méthodes**, **colonnes affichées**, **particularités**.

### 7.1 Biochimie / CLIA / Hormones / Immunologie (examens simples)

| modal_type | Méthodes | Colonnes PDF |
|------------|----------|--------------|
| `examForm`, `biochimie`, `clia`, `hormones`, `biocliahorm` | `renderBioCliaHorm` / `generateBioCliaHormPDF` | Paramètres · **Flag** · Résultat (+ unité) · Range usuelle |

**Exemples catalogue :** ACIDE FOLIQUE, GLUCOSE, HORMONE CORTICOTROPE, HEPATITE-C, etc.  
**Source données :** `parameters_json[]` avec `name`, `value`, `flag`, `unit`, `reference_range`, `is_not_required`.

---

### 7.2 Parasitologie — urines & selles

| modal_type | Nom examen | Méthodes | Colonnes |
|------------|------------|----------|----------|
| `sedimentUrinaire` | SEDIMENT URINAIRE | `renderSedimentUrinaire` | Paramètres · Résultat · Range (sans Flag, sans unité) |
| `urinesRoutines` | URINES ROUTINES | `renderUrinesRoutines` | Idem sédiment |
| `sellesRoutine` | SELLES ROUTINE | `renderSellesRoutines` | Idem |
| `proteineBincesJones` | PROTEINE DE BINCES-JONES | `renderProteineBincesJones` | Tableau 2 colonnes dédié (Protéine / Résultat) |
| `rivalta` | RIVALTA | `renderRivalta` | Proportion 30% / 70% (Param / Résultat) |
| `trypanosomiase` | TRYPANOSOMIASE | `renderTrypanosomiase` | Tableau spécifique parasite |
| `sangOcculte` | SANG OCCULTE | `renderSangOcculte` | Tableau qualitatif |

---

### 7.3 Sérologie & tests rapides

| modal_type | Nom | Méthodes | Colonnes |
|------------|-----|----------|----------|
| `serologie` | SEROLOGIE (générique) | `renderSerologie` / `generateSerologiePDF` | Paramètres · Résultat · Valeur (groupe IgG/IgM) |
| `salmonella` | SALMONELLA | `renderSalmonella` | Idem sérologie (RESULTAT + VALEUR par antigène) |
| `widal` | WIDAL TEST | `renderWidal` | Idem (normalise suffixes RESULTAT/VALEUR) |
| `malaria` | MALARIA TEST RAPIDE | `renderMalaria` | Param · Résultat · Valeur (Pf, PAN…) |
| `malaria_ge` | MALARIA GOUTTE EPAISSE | `renderMalariaTDR` | Layout goutte épaisse + TDR |

**Logique commune sérologie :** regroupe les paires `{prefix} RESULTAT` + `{prefix} VALEUR(S)` sur une ligne.

---

### 7.4 Hématologie

| modal_type | Nom | Méthodes | Colonnes / layout |
|------------|-----|----------|-------------------|
| `nfs`, `hematologie` | HEMOGRAMME COMPLET (NFS) | `renderHemogramme` | Param · Flag · Résultat · Range |
| `nfl` | NUMERATIONS ET FORMULES LEUCOCYTAIRES | `renderNfl` | Idem NFS |
| `hb_hct` | HEMOGLOBINE & HEMATOCRITE | `renderHemogramme` (alias) | Tableau simple |
| `reticulocyte` | RETICULOCYTE | `renderReticulocyte` | Paramètres génériques |
| `hematologie` | Autres hémato | `renderHematologie` | Paramètres génériques |
| `microfilaire` | MICROFILAIRE | `renderMicrofilaire` | **Spécifique** : SPECIMEN + MÉTHODE, puis Espèce · Observation · Pathologie |
| `goutte_fraiche` | GOUTTE FRAICHE | `renderGoutteFraiche` | Tableau parasite / observation |
| `valeur_absolu_eosinophiles` | VAE | `renderValeurAbsoluEosinophiles` | Paramètres génériques |
| `electrophorese` | ELECTROPHORESE HB | `renderElectrophorese` | **4 cols** : Variante HB · Résultat % · % Normal · Variante homozygote |
| `frottis_blood`, `frottis_sang` | FROTTIS SANG PÉRIPHÉRIQUE | `renderFrottiessangperiph` | Paramètres sans flag |
| `groupage_sanguin` | GROUPAGE SANGUIN | `renderGroupageSanguin` | **Grille Beth/Simonin** A/B/AB/O + Rhésus + méthode (transformation JSON spéciale) |

---

### 7.5 Coagulation

| modal_type | Nom | Méthodes |
|------------|-----|----------|
| `coagulation` | COAGULATION | `renderCoagulation` → `renderParamètres()` |
| `temps_saignement` | TEMPS DE SAIGNEMENT | `renderTempsSaignement` |
| `tp_inr` | TP / INR | `renderTpInr` |

---

### 7.6 Microbiologie

| modal_type | Nom | Méthodes | Layout |
|------------|-----|----------|--------|
| `microbiologie` | MICROBIOLOGIE | `renderMicrobiologie` | Germe · Antibiogramme · Sensibilité |
| `hemoculture` | HEMOCULTURE | `renderHemoculture` | Culture + résultat |
| `coproculture` | COPROCULTURE | `renderCoproculture` | Idem |
| `ziehl_nelsen`, `ZN` | ZIEHL NEELSEN | `renderZiehlNelsen` | **4 cols** : DATE · ÉCHANTILLON · ASPECT · RÉSULTAT (lignes LIGNE_N_*) |

---

### 7.7 Bilans & profils métaboliques

| modal_type | Nom catalogue | Méthodes | Colonnes |
|------------|---------------|----------|----------|
| `bilans_azotes` | Bilans Azote | `renderBilanAzotes` | Param · Flag · Résultat · Range |
| `profil_lipidique` | Profil Lipidique | `renderProfLip` | Idem |
| `bilirubi` | Bilirubine Complètes | `renderBilirCompl` | Idem (plusieurs paramètres bilirubine) |
| `proteinurie24`, `ptt` | Protéinurie 24h / PTT | `renderProteinurie24h`, `renderBilanProtTot` | Idem |
| `spot_urines` | SPOT URINES Na+ Cl- K+ | `renderSpotUrines` | Idem |
| `ionogramme` | IONOGRAMME | `renderIonogramme` | Idem |
| `surveillance_prostatique` | SURVEILLANCE PROSTATIQUE | `renderSurveillanceProstat` | Idem |
| `micro_albuminuries` | MICRO ALBUMINURIES | `renderMicroAlbuminuries` | Idem |
| `glycemie_gestationnelle` | GLYCÉMIE GESTATIONNELLE | `renderGlycemieGestationnelle` | Idem |
| `bilans_torch` | BILANS DE TORCH | `renderBilansTorch` | Tableau multi-pathogènes (IgG/IgM par agent) |

---

### 7.8 Imagerie / anatomopathologie / virologie

| modal_type | Nom | Méthodes | Layout |
|------------|-----|----------|--------|
| `histopathologie` | HISTOPATHOLOGIE | `renderHistopathologie` | Diagnostic + description macro/micro |
| `charge_viral`, `chargeviral` | CHARGE VIRAL | `renderChargeViral` | Résultat viral + log |
| `spermogramme` | SPERMOGRAMME | `renderSpermogramme` | Param · Résultat · Range (sans flag) |

---

### 7.9 Frottis & liquides biologiques

| modal_type | Nom | Méthodes | Colonnes |
|------------|-----|----------|----------|
| `frottis_secretion` | FROTTIS SECRETION | `renderFrottisSecretion` | Param · Résultat (sans flag) |
| `fluide` | FLUIDE / LIQUIDE BIOLOGIQUE | `renderFluide` | Param · Résultat (sans flag) — ASC, BAL, etc. |

---

### 7.10 Fallback générique

| Type | Méthode | Usage |
|------|---------|-------|
| `generic` (non détecté) | `generatePDF()` → `renderResults()` | Tableau simple : Paramètre · Résultat · Unité · Valeurs normales · Flag |

Utilisé si aucune méthode `generate*PDF` spécialisée n'est trouvée → erreur `no_pdf_method` en production.

---

## 8. PDF multi-examens consolidé

**Fonction :** `generateMultiExamPDF($patientId, $examIds)`

```text
Pour chaque exam_id (ordre conservé) :
  generateExamResultPDF(..., appendMode=true)
      → appelle renderXxx() (pas generateXxxPDF)
      → PAS de signature intermédiaire
      → commentaires + description + fichiers par examen

Fin :
  renderSignature() une seule fois
  Output('S')
```

**Différences vs PDF unitaire :**

| Aspect | Mono-examen | Multi-examens |
|--------|-------------|---------------|
| Pages | 1 AddPage par examen | Flux continu |
| Signature | Après chaque examen | **Une seule** en fin |
| En-tête patient | Chaque page | Chaque page (Header FPDF) |
| Échec partiel | Échec total | Examens invalides ignorés |

---

## 9. Données en base utilisées

### Table `exam_results`

| Champ | Usage PDF |
|-------|-----------|
| `exam_id` | Lien catalogue `examens` |
| `patient_id` | En-tête patient |
| `modal_type` | **Routage render** |
| `parameters_json` | Lignes du tableau résultats |
| `comments` | Section commentaires globaux |
| `attachments` | Pièces jointes + annexe |
| `is_latest` | Seule la version courante est imprimée |
| `status` | Non affiché directement (workflow labo) |

### Structure typique `parameters_json`

```json
[
  {
    "name": "GLUCOSE",
    "value": "1.02",
    "flag": "",
    "unit": "g/L",
    "reference_range": "0.70-1.10",
    "is_not_required": 0,
    "comment": "",
    "other": ""
  }
]
```

### Table `examens` (catalogue)

| Champ | Usage PDF |
|-------|-----------|
| `nom` | Titre + détection SmartExamDetector |
| `description` | `renderExamDescription()` |
| `specimen` | Sous-titre du bandeau |
| `meta.parameters` | Référence (non re-lu à l'impression ; valeurs viennent de `exam_results`) |

---

## 10. Ajouter un nouveau type d'examen PDF

Checklist pour un nouveau modal labo (ex. `monExamen`) :

1. **Modal labo** (`labo.js`) : formulaire de saisie + `modal_type: 'monExamen'`
2. **Classe ExamResultPDF** :
   - `renderMonExamen()` — corps du tableau
   - `generateMonExamenPDF()` — pattern standard (AddPage → render → comments → description → signature → fichiers)
3. **MethodDiscoveryRegistry** (si alias nécessaire) :
   ```php
   'mon_examen' => 'monExamen',
   ```
4. **SmartExamDetector** : ajouter `'monexamen'` dans `$knownExamTypes` + keywords si besoin
5. **Tester** :
   ```
   pdf_resultat.php?patient_id=X&exam_id=Y&type=monExamen
   ```

**Réutiliser en priorité :**

- `renderParamètres()` pour tout examen tabulaire standard
- `renderBioCliaHorm()` pour biochimie avec flags
- Copier `renderSalmonella` / `renderWidal` pour sérologies avec paires RESULTAT/VALEUR

---

## Annexe — Correspondance modal labo ↔ PDF

Référence croisée avec [`liste_examens_et_paramètres.json`](liste_examens_et_paramètres.json) (champ `formulaire`) :

| formulaire (catalogue) | generate*PDF |
|------------------------|---------------|
| `examForm` | `generateBioCliaHormPDF` |
| `sellesRoutine` | `generateSellesRoutinesPDF` |
| `urinesRoutines` | `generateUrinesRoutinesPDF` |
| `sedimentUrinaire` | `generateSedimentUrinairePDF` |
| `nfs` | `generateHemogrammePDF` |
| `nfl` | `generateNflPDF` |
| `serologie` | `generateSerologiePDF` |
| `salmonella` | `generateSalmonellaPDF` |
| `widal` | `generateWidalPDF` |
| `malaria` | `generateMalariaPDF` |
| `malaria_ge` | `generateMalariaTDRPDF` |
| `groupage_sanguin` | `generateGroupageSanguinPDF` |
| `electrophorese` | `generateElectrophoresePDF` |
| `spermogramme` | `generateSpermogrammePDF` |
| `fluide` | `generateFluidePDF` |
| `bilans_azotes` | `generateBilanAzotesPDF` |
| `profil_lipidique` | `generateProfLipPDF` |
| `bilirubi` | `generateBilirComplPDF` |
| … | (voir section 7) |

---

*Document généré pour la refonte SIGH — à maintenir à jour lors de l'ajout de nouveaux modals labo.*
