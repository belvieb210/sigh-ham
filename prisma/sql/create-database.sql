-- Création de la base SIGH pour HAM LABORATOIRE
-- Exécuter avec pgAdmin 4 ou psql après installation de PostgreSQL 17

-- Connexion en tant que superutilisateur postgres, puis :
CREATE DATABASE sigh_ham
  WITH
  OWNER = postgres
  ENCODING = 'UTF8'
  LC_COLLATE = 'French_France.1252'
  LC_CTYPE = 'French_France.1252'
  TEMPLATE = template0;

-- Optionnel : base fantôme pour les migrations Prisma en développement
-- CREATE DATABASE sigh_ham_shadow OWNER postgres ENCODING 'UTF8';

COMMENT ON DATABASE sigh_ham IS 'SIGH — Système Intégré de Gestion Hospitalière — HAM LABORATOIRE';
