# FresCoop Filières Agricoles UEMOA 2026

Adaptation du projet FresCoop pour le Hackathon Filières Agricoles organisé par le GIM-UEMOA.

FresCoop positionne la solution sur une chaîne de valeur agricole régionale:

- Micro-hubs frigorifiques solaires pour réduire les pertes post-récolte.
- Intelligence marché pour orienter les lots vers le meilleur débouché.
- Paiement partenaire et preuve économique portable pour rendre chaque transaction lisible par banques, SFD, fintechs et acheteurs B2B.

## Lancer

```bash
npm run install:web
npm run dev
```

URL locale Vite: `http://127.0.0.1:5173/`

Le script `dev` lance aussi l’API locale FresCoop sur `http://127.0.0.1:4174/api`.

## Mode production local

```bash
npm run build
npm run start
```

URL application + API: `http://127.0.0.1:4174/`

Les données applicatives sont persistées dans `backend/data/store.json` en local et restent exportables depuis la page Données.

## MongoDB Atlas en production

Pour eviter que les donnees de demonstration reviennent apres une suppression, utilisez Atlas comme source de verite et desactivez le seed automatique sur l'environnement de production.

Variables a configurer sur Railway:

```bash
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=frescoop
FRESCOOP_REQUIRE_MONGODB=true
FRESCOOP_SEED_MODE=none
TOKEN_SECRET=une-longue-cle-aleatoire-stable
```

Avec `MONGODB_URI`, le serveur cree la collection `store` au premier demarrage sans charger `backend/seed-data.json`, sauf si `FRESCOOP_SEED_MODE=demo` est force. `FRESCOOP_REQUIRE_MONGODB=true` empeche un fallback discret vers `backend/data/store.json` si Atlas est inaccessible.

Pour migrer le fichier local actuel vers Atlas une seule fois:

```bash
npm run migrate:atlas -- backend/data/store.json
```

## Verifier

```bash
npm run build
```

## Deploiement Render + Vercel

### Backend sur Render

Le fichier `render.yaml` de la racine deploie l'API Node depuis `backend`.

1. Poussez la branche `master` sur GitHub.
2. Dans Render, creez un nouveau Blueprint depuis le repo GitHub.
3. Gardez le chemin Blueprint par defaut: `render.yaml`.
4. Renseignez au minimum:

```bash
MONGODB_URI=mongodb+srv://...
TOKEN_SECRET=une-longue-cle-aleatoire-stable
CORS_ORIGINS=https://votre-projet.vercel.app
```

Variables optionnelles si les modules correspondants sont utilises: `PAYDUNYA_*`, `CLOUDINARY_*`, `OPENROUTER_*`, `FRESCOOP_*_PASSWORD_HASH`.

L'API expose le healthcheck sur `/api/health`. Avec le nom de service actuel, l'URL attendue est:

```bash
https://frescoop-api.onrender.com/api/health
```

### Frontend sur Vercel

Le frontend doit etre importe comme projet Vercel separe avec `frontend` comme Root Directory.

Parametres Vercel:

```bash
Root Directory: frontend
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
```

Ne definissez pas `VITE_API_URL` si vous voulez utiliser le proxy `/api` configure dans `frontend/vercel.json`. Le rewrite envoie les appels API vers:

```bash
https://frescoop-api.onrender.com
```

Si Render genere une autre URL de service, mettez a jour la destination `/api/:path*` dans `frontend/vercel.json`, puis redeployez Vercel.

## Ce que montre la démo UEMOA

- Cockpit exécutif pour pitcher au jury.
- Parcours du lot du champ au paiement vérifiable.
- Optimisation de route de vente selon prix net, demande, confiance et délai.
- Micro-hubs solaires avec capacité, froid, batterie et pertes évitées.
- Passeport économique consenti pour productrices, coopératives, collectrices et commerçants.
- Simulateur d’impact pour les filières agricoles UEMOA.
- Dossier de bancabilité et preuves exportables pour banques, SFD et partenaires.
