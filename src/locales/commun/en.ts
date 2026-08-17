/** Cross-cutting translations — validation, messages, SEO, utility pages */

export const communEn = {
  validation: {
    nomMin: "Name must be at least 2 characters",
    nomMax: "Name is too long",
    emailInvalide: "Invalid email address",
    sujetRequis: "Please select a subject",
    messageMin: "Message must be at least 10 characters",
    messageMax: "Message is too long",
    consentementRequis: "You must accept the processing of your data",
    typePrestationRequis: "Please select a type of service",
    dateRequise: "Please choose a date",
    creneauRequis: "Please choose a time slot",
    telephoneInvalide: "Invalid phone number",
    telephoneMax: "Phone number is too long",
    motifMax: "Reason is too long",
    verifierInfos: "Please check the information entered.",
  },
  messages: {
    erreurGenerique: "An error occurred. Please try again or call us.",
    erreurGeneriqueContact:
      "An error occurred. Please try again or call us directly.",
    contactSucces:
      "Your message was sent successfully. Our team will reply as soon as possible.",
    rdvSucces:
      "Your appointment request has been recorded. You will receive confirmation by email or SMS shortly.",
  },
  meta: {
    site: "HAM Laboratory",
    defaultTitle: "HAM Laboratory — Diagnostic and Medical Testing Center",
    defaultDescription:
      "YOUR HEALTH IS MY BURDEN, RELIABILITY IS OUR PRIORITY. Diagnostic and medical testing center in Kinshasa.",
    accueil: {
      title: "Home",
      description:
        "HAM LABORATORY — Diagnostic and Medical Testing Center in Kinshasa. Tests, consultations, screenings, and health campaigns.",
    },
    contact: {
      title: "Contact",
      description:
        "Contact HAM LABORATORY in Kinshasa — address, phones, email, hours, and contact form. MATETE, Avenue Lumière.",
    },
    services: {
      title: "Our services",
      description:
        "Discover HAM LABORATORY services — medical tests, consultations, imaging, pharmacy, and more. Reliability, speed, and accessibility in Kinshasa.",
    },
    campagnes: {
      title: "Campaigns & announcements",
      description:
        "Health campaigns, screenings, vaccinations, and announcements from HAM LABORATORY in Kinshasa. All our prevention and awareness actions.",
    },
    rendezVous: {
      title: "Book an appointment",
      description:
        "Book your consultation or tests online at HAM LABORATORY — Kinshasa, MATETE. Immediate confirmation, slots available Monday to Saturday.",
    },
    aPropos: {
      title: "About us",
      description:
        "Discover HAM LABORATORY — Diagnostic and Medical Testing Center in Kinshasa. Mission, team, values, and commitments.",
    },
    connexion: {
      title: "Sign in — Staff portal",
      description: "Access reserved for HAM Laboratory staff.",
    },
    reinitialisationMotDePasse: {
      title: "Reset password",
      description: "Reset your password for the HAM Laboratory staff portal.",
    },
    application: {
      title: "Mobile app",
      description: "Download the SIGH Central Hospital app.",
    },
    campagneIntrouvable: "Campaign not found",
  },
  connexion: {
    badge: "Staff portal",
    titre: "Sign in",
    description: "Access reserved for staff of",
    identifiant: "Username or email",
    placeholderIdentifiant: "belvie.bokulu or user@ham.local",
    motDePasse: "Password",
    afficherMotDePasse: "Show password",
    masquerMotDePasse: "Hide password",
    securise: "Secure sign-in",
    seSouvenir: "Remember me",
    seSouvenirAide:
      "Your username will be saved on this device for 30 days. Your password is never stored.",
    motDePasseOublie: "Forgot password?",
    seConnecter: "Sign in",
    connexionEnCours: "Signing in...",
    noteDev:
      "This page will provide access to the internal SIGH system (Reception, Physicians, Laboratory, etc.) — under development.",
    retourSite: "Back to public site",
  },
  reinitialisationMotDePasse: {
    badge: "Account security",
    titre: "Forgot your password?",
    description:
      "Enter the email address or username linked to your staff account. We will send instructions to reset your password.",
    email: "Work email or username",
    placeholderEmail: "your@email.com",
    envoyer: "Send reset link",
    envoiEnCours: "Sending...",
    noteSecurite:
      "For security reasons, we do not confirm whether an account exists. Check your inbox and spam folder.",
    succesTitre: "Request received",
    succesTexte:
      "If an account matches this information, you will receive an email with a secure link to set a new password.",
    emailEnvoye: "Instructions sent to {{email}} if the account exists.",
    simulerLien: "Continue — set a new password",
    nouveauTitre: "New password",
    nouveauDescription: "Choose a strong password you do not use elsewhere.",
    nouveauMotDePasse: "New password",
    confirmerMotDePasse: "Confirm password",
    reglesMotDePasse:
      "At least 8 characters — combine letters, numbers, and symbols for better security.",
    enregistrer: "Save password",
    enregistrement: "Saving...",
    motDePasseDifferent: "Passwords do not match.",
    enregistreTitre: "Password updated",
    enregistreTexte:
      "Your password has been saved. You can now sign in with your new credentials.",
    retourConnexion: "Back to sign in",
  },
  construction: {
    retourAccueil: "Back to home",
  },
  campagnesDetail: {
    retour: "Back to campaigns",
    prendreRdv: "Book an appointment",
    nousContacter: "Contact us",
    a: "at",
  },
  placeholders: {
    nomContact: "E.g. John Smith",
    messageContact: "Describe your request in detail...",
    nomRdv: "E.g. Jane Doe",
    motifRdv: "E.g. Full blood panel, Dr. prescription...",
    email: "your@email.com",
  },
} as const;
