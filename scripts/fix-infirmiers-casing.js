const fs = require("fs");
const path = require("path");

const repls = [
  ["Utilisateurinfirmiers", "UtilisateurInfirmiers"],
  ["useNavigationinfirmiers", "useNavigationInfirmiers"],
  ["MiseEnPageinfirmiers", "MiseEnPageInfirmiers"],
  ["BarreLateraleinfirmiers", "BarreLateraleInfirmiers"],
  ["EnTeteinfirmiers", "EnTeteInfirmiers"],
  ["NavigationBasseinfirmiers", "NavigationBasseInfirmiers"],
  ["FournisseurOrientationinfirmiers", "FournisseurOrientationInfirmiers"],
  ["FournisseurSelectioninfirmiers", "FournisseurSelectionInfirmiers"],
  ["useOrientationinfirmiers", "useOrientationInfirmiers"],
  ["useSelectioninfirmiers", "useSelectionInfirmiers"],
  ["OrientationRapideinfirmiers", "OrientationRapideInfirmiers"],
  ["PanneauDroitinfirmiers", "PanneauDroitInfirmiers"],
  ["MenuActionsTransfertinfirmiers", "MenuActionsTransfertInfirmiers"],
  ["ContenuPatientsinfirmiers", "ContenuPatientsInfirmiers"],
  ["ContenuAccueilinfirmiers", "ContenuAccueilInfirmiers"],
  ["ContenuHistoriqueinfirmiers", "ContenuHistoriqueInfirmiers"],
  ["ContenuMessagerieinfirmiers", "ContenuMessagerieInfirmiers"],
  ["ContenuNotificationsinfirmiers", "ContenuNotificationsInfirmiers"],
  ["PatientFileinfirmiers", "PatientFileInfirmiers"],
  ["StatsinfirmiersJour", "StatsInfirmiersJour"],
  ["ContexteOrientationinfirmiers", "ContexteOrientationInfirmiers"],
  ["ContexteSelectioninfirmiers", "ContexteSelectionInfirmiers"],
  ["PropsBarreLateraleinfirmiers", "PropsBarreLateraleInfirmiers"],
  ["PropsOrientationRapideinfirmiers", "PropsOrientationRapideInfirmiers"],
  ["PropsMiseEnPageinfirmiers", "PropsMiseEnPageInfirmiers"],
  ["PropsContenuAccueilinfirmiers", "PropsContenuAccueilInfirmiers"],
  ["PropsContenuPatientsinfirmiers", "PropsContenuPatientsInfirmiers"],
  ["PropsContenuHistoriqueinfirmiers", "PropsContenuHistoriqueInfirmiers"],
  ["reorienterPatientDepuisinfirmiers", "reorienterPatientDepuisInfirmiers"],
  ["confirmerTransfertinfirmiers", "confirmerTransfertInfirmiers"],
  ["rejeterTransfertinfirmiers", "rejeterTransfertInfirmiers"],
  ["restaurerTransfertinfirmiers", "restaurerTransfertInfirmiers"],
  ["chargerTransfertinfirmiers", "chargerTransfertInfirmiers"],
  ["NAVIGATION_BASSE_infirmiers", "NAVIGATION_BASSE_INFIRMIERS"],
  ["NAVIGATION_infirmiers", "NAVIGATION_INFIRMIERS"],
  ["ORIENTATIONS_RAPIDES_infirmiers", "ORIENTATIONS_RAPIDES_INFIRMIERS"],
  ["CODES_ORIENTATION_infirmiers", "CODES_ORIENTATION_INFIRMIERS"],
  ["EVENEMENT_infirmiers_PATIENTS_MODIFIES", "EVENEMENT_INFIRMIERS_PATIENTS_MODIFIES"],
  ["ConsultationHistoriqueinfirmiers", "ConsultationHistoriqueInfirmiers"],
  ['code: "infirmiers"', 'code: "INFIRMIERS"'],
  ['!== "infirmiers"', '!== "INFIRMIERS"'],
  ['{ code: "infirmiers" }', '{ code: "INFIRMIERS" }'],
];

function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(e.name)) {
      let t = fs.readFileSync(p, "utf8");
      const o = t;
      for (const [a, b] of repls) t = t.split(a).join(b);
      if (t !== o) {
        fs.writeFileSync(p, t);
        console.log(p);
      }
    }
  }
}

walk("src/features/infirmiers");
walk("src/lib/infirmiers");
console.log("done");
