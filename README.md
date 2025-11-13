# 🌌 Plateforme League of Legends Matchups

Projet intégrateur – Développement Web 3 (Automne 2025)

Cette version consolide **API Express + MongoDB** et **frontend React** (i18n FR/EN) afin de suivre les confrontations entre champions, les statistiques provenant de Kaggle et les commentaires privés protégés par JWT.

---

## 🏗️ Architecture globale

```
examen-api-league-matchups/
├── src/
│   ├── config/               # Chargement .env
│   ├── middlewares/          # Authentification JWT
│   ├── models/               # Schémas Champion, Matchup, Commentaire, Utilisateur
│   ├── routes/               # Routes Express modulaires (auth, champions, matchups, commentaires)
│   ├── services/             # Génération JWT custom, hachage Scrypt
│   ├── tests/                # Jasmine + Supertest (mock in-memory)
│   └── serveur.ts            # Point d’entrée Express
├── scripts/
│   └── importKaggle.ts       # Import CSV champions + matchups
├── lol-matchups/             # Application React (TypeScript, hooks, i18n maison)
│   ├── src/components        # ChampionCard, MatchupCard, CommentList, etc.
│   ├── src/contexts          # AuthContext + TranslationContext
│   ├── src/pages             # ChampionList, MatchupList, MatchupForm, Auth
│   └── src/services/api.ts   # Client HTTP `fetch`
└── README.md
```

---

## 🗄️ Modèles MongoDB & validations

| Modèle       | Champs clés (extraits)                                                                                                                                                                | Validations                                                                                                                                         |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Champion** | `nom` unique, `titre`, `roles[]`, `region`, `attaque`, `defense`, `magie`, `mobilite`, `portee`, `icone`, `enRotation`, `tags[]`, `miseAJour`                                          | Types stricts (String/Number/Boolean/Array/Date), bornes 0-10, portée enum                                                                           |
| **Matchup**  | `championPrincipal`, `championAdverse`, `voie`, `nbParties`, `nbVictoires`, `nbDefaites`, `tauxVictoire`, `kdaMoyen`, `niveauAvantage`, `difficulte`, `favorable`, `conseils[]`, `tags[]` | Validations natives + custom : champions différents, `nbVictoires+nbDefaites ≤ nbParties`, cohérence `tauxVictoire`, niveau d’avantage 1-18          |
| **Commentaire** | `matchup`, `auteur`, `contenu`, `humeur`, `difficulteRessentie`, `visible`, `langue`, timestamps                                                                                   | Longueur contenu (10-1000), mood enum, update automatique `misAJourLe`                                                                               |
| **Utilisateur** | `prenom`, `nom`, `courriel` unique, `motDePasse` (haché via scrypt), `roles[]`, `actif`, `derniereConnexion`, `preferencesLangue`, `avatar`, `creeLe`                              | Regex courriel, min 8 caractères, roles limités (`joueur`, `administrateur`, `analyste`)                                                             |

Les erreurs sont renvoyées en français avec le détail Mongoose.

---

## 🚀 API Express (http://localhost:4000)

`GET /` → mini documentation JSON listant toutes les routes.

### Champions

| Méthode | Route                              | Description                                                          |
| ------: | ---------------------------------- | -------------------------------------------------------------------- |
| GET     | `/champions?role=&region=&nom=`    | Listing + filtres dynamiques                                         |
| GET     | `/champions/:id`                   | Lecture d’un champion                                                |
| POST    | `/champions`                       | Création (tous les champs requis)                                    |
| PUT     | `/champions/:id`                   | Mise à jour avec `runValidators`                                     |
| DELETE  | `/champions/:id`                   | Suppression                                                          |

### Matchups

| Méthode | Route                                               | Description                                                           |
| ------: | --------------------------------------------------- | --------------------------------------------------------------------- |
| GET     | `/matchups?championPrincipal=&championAdverse=&voie=&favorable=` | Listing + filtres multi critères                                     |
| GET     | `/matchups/:id`                                     | Lecture détaillée                                                     |
| POST    | `/matchups`                                         | Création (validations personnalisées)                                |
| PUT     | `/matchups/:id`                                     | Mise à jour                                                           |
| DELETE  | `/matchups/:id`                                     | Suppression                                                           |

### Commentaires (JWT obligatoire)

| Méthode | Route                  | Description                                             |
| ------: | ---------------------- | ------------------------------------------------------- |
| GET     | `/commentaires?matchup=&auteur=` | Liste filtrée                                        |
| GET     | `/commentaires/:id`    | Lecture                                                 |
| POST    | `/commentaires`        | Création (auteur injecté depuis le token)               |
| PUT     | `/commentaires/:id`    | Mise à jour (auteur ou admin uniquement)                |
| DELETE  | `/commentaires/:id`    | Suppression sécurisée                                   |

### Authentification

| Méthode | Route              | Description                                             |
| ------: | ------------------ | ------------------------------------------------------- |
| POST    | `/auth/inscription`| Création d’un compte + token signé maison (HS256)       |
| POST    | `/auth/connexion`  | Connexion + mise à jour `derniereConnexion`             |
| GET     | `/auth/profil`     | Profil courant (JWT requis)                             |

JWT maison : signature HMAC-SHA256 via `crypto`. Expiration 8 h.

---

## 🔄 Scripts & données Kaggle

`npm run ts-node scripts/importKaggle.ts champions.csv matchups.csv`

1. Lit deux CSV (séparateur `,`).
2. Convertit dynamiquement les colonnes Kaggle (`Name`, `Lane`, `WinRate`, etc.).
3. Vide puis remplit les collections `champions` et `matchups`.

> Adapter les en-têtes en modifiant les alias (`row.Name`, `row.MainChampion`, …).

---

## 🧪 Tests Jasmine + Supertest

Tests isolés de MongoDB grâce à des **modèles en mémoire** injectés dans chaque router.

```bash
npm test
```

Couvre toutes les méthodes HTTP :
- `champions.api.spec.ts`
- `matchups.api.spec.ts`
- `commentaires.api.spec.ts`
- `auth.api.spec.ts`

---

## 💻 Frontend React (`lol-matchups/`)

Fonctionnalités principales :
- **i18n FR/EN** via un TranslationContext maison + switcher global.
- **AuthContext** (login/register, token localStorage, statut dans l’entête).
- **MatchupList** : affichage, filtres, sélection, suppression sécurisée, panneau de commentaires (CRUD complet) + édition inline.
- **MatchupForm** : ≥ 5 champs liés aux validations backend (voies, taux, niv. avantage, checkboxes…).
- **ChampionList** : filtres role/région, cartes responsives.
- **Auth** : formulaire double (connexion / inscription) + changement de langue.
- **Design responsive** (mobile <640px, tablette <960px, bureau) avec composants réutilisables.

### Démarrer le frontend

```bash
cd lol-matchups
npm install
npm start
```

Configurer l’URL de l’API via `REACT_APP_API_URL` si besoin (par défaut `http://localhost:4000`).

---

## ✅ Checklist déploiement

1. MongoDB Atlas + variables d’environnement (`MONGODB_URI`, `JWT_SECRET`).
2. Render / Railway pour l’API (`npm run dev` → `ts-node src/serveur.ts`).
3. Build React (`npm run build` dans `lol-matchups/`) puis publication Netlify/GitHub Pages.
4. Mettre à jour `REACT_APP_API_URL` selon l’URL publique de l’API.

---

## 🔜 TODO prioritaire

1. **Seeder Kaggle** : intégrer les vrais fichiers fournis par le professeur via `scripts/importKaggle.ts` et valider les conversions de colonnes.
2. **Protection avancée** : limiter la création/mise à jour des matchups aux rôles `administrateur` (middleware rôle).
3. **Tableau de bord React** : ajouter des graphiques (ex. Chart.js) pour les winrates par champion.
4. **Tests E2E** : ajouter une suite Playwright/Cypress simulant la création d’un compte + ajout de commentaires.
5. **Publication** : brancher Render + Netlify avec variables d’environnement, ajouter la configuration CORS stricte.

Ces étapes permettent de finaliser complètement le projet intégrateur selon le cahier des charges.
