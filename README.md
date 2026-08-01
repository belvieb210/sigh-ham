# SIGH Hôpital Central — Plateforme publique

Plateforme publique officielle du Système Intégré de Gestion Hospitalière (SIGH).

## Stack

- Next.js 15 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- Shadcn/UI (composants custom)
- Framer Motion, Lucide React, TanStack Query, React Hook Form, Zod

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## Structure

```
src/
├── app/           # Pages (App Router)
├── components/    # Composants réutilisables
├── features/      # Fonctionnalités par domaine
├── hooks/         # Hooks React
├── lib/           # Utilitaires
├── services/      # Clients API
├── types/         # Types TypeScript
└── constants/     # Constantes
```

## Pages publiques

- `/` — Accueil (complet)
- `/a-propos`, `/services`, `/medecins`, `/actualites`, `/campagnes`, `/carriere`, `/contact` — en construction
- `/connexion` — Espace personnel (système interne, à venir)
