# 🌌 API League of Legends Matchups

Projet intégrateur – Développement Web 3 (Automne 2025)  
Auteur : Nathan Reyes  
Évaluation : 50% de la note finale

---

## 📖 Description

Cette API permet de **gérer une base de données League of Legends** :

- **Champions** (nom, rôle, titre, statistiques de base).
- **Matchups** (résultats des parties jouées entre deux champions, avec notes et statistiques personnelles).

Objectif : avoir une application complète qui aide le joueur à analyser ses confrontations (winrate, avantages par niveau, notes personnelles).

---

## 📂 Structure du projet

```
examen-api-league-matchups/
│── src/
│   ├── modèles/           # Schémas Mongoose (Champion.ts, Matchup.ts)
│   ├── routes/            # Routes Express (champions.ts, matchups.ts)
│   ├── tests/             # Jasmine + Supertest
│   └── serveur.ts         # Point d'entrée Express
│
│── dev/                   # Données & assets de développement
│   ├── champions.json                 # Fichier officiel Riot (fr_FR)
│   ├── champions_simplifies.json      # Fichier prêt pour MongoDB
│   └── images_champions/              # .png téléchargés (Data Dragon)
│
│── scripts/               # Scripts utilitaires Node/TS
│   ├── telecharger_champions.ts
│   ├── convertir_champions.ts
│   └── importer_champions.ts
│
│── spec/support/jasmine.json
│── tsconfig.json
│── package.json
```

---

## ⚙️ Installation locale

### 1) Cloner & installer

```bash
git clone https://github.com/ton-compte/examen-api-league-matchups.git
cd examen-api-league-matchups
npm install
```

### 2) Lancer l'API (MongoDB local requis)

```bash
npm run dev
```

Serveur : **http://localhost:3000**  
BD locale : **mongodb://127.0.0.1:27017/league**

---

## 🗄️ Base de données

- **MongoDB local** par défaut : `mongodb://127.0.0.1:27017/league`
- Collections :
  - `champions` (~160 docs importés de Data Dragon)
  - `matchups` (saisis après les parties)

### Scripts utiles

- `scripts/telecharger_champions.ts` → télécharge toutes les images `.png` des champions.
- `scripts/convertir_champions.ts` → convertit le JSON officiel Riot en `champions_simplifies.json`.
- `scripts/importer_champions.ts` → insère le JSON simplifié dans MongoDB (via Mongoose).

> Astuce : les scripts sont pensés pour un projet **CommonJS** (utilisent `require`).

---

## Importer les données de test

Le fichier `dev/champions_simplifies.json` peut être importé via **MongoDB Compass** (Collections → `Import Data`).

---

## 🚀 Endpoints disponibles

### 📌 Champions

| Méthode | Route                  | Description                                     |
| ------: | ---------------------- | ----------------------------------------------- |
|     GET | `/champions`           | Liste tous les champions                        |
|     GET | `/champions?role=Mage` | Filtre par rôle                                 |
|     GET | `/champions?nom=ahri`  | Filtre par nom (partiel, insensible à la casse) |
|     GET | `/champions/:id`       | Récupère un champion par ID                     |

### 📌 Matchups

| Méthode | Route                              | Description                   |
| ------: | ---------------------------------- | ----------------------------- |
|     GET | `/matchups`                        | Liste tous les matchups       |
|     GET | `/matchups?championPrincipal=Ahri` | Filtre par champion principal |
|     GET | `/matchups?championAdverse=Zed`    | Filtre par champion adverse   |
|     GET | `/matchups?favorable=true`         | Filtre par statut favorable   |
|     GET | `/matchups/:id`                    | Récupère un matchup par ID    |
|    POST | `/matchups`                        | Crée un nouveau matchup       |
|     PUT | `/matchups/:id`                    | Met à jour un matchup         |
|  DELETE | `/matchups/:id`                    | Supprime un matchup           |

### Exemples (Bruno/Postman)

- `GET http://localhost:3000/champions?role=Mage`
- `GET http://localhost:3000/champions?nom=ahri`
- `POST http://localhost:3000/matchups` (Body JSON) :

```json
{
  "championPrincipal": "Ahri",
  "championAdverse": "Zed",
  "nbParties": 3,
  "nbVictoires": 2,
  "nbDefaites": 1,
  "avantageNiveau": 6,
  "favorable": true,
  "notesPerso": ["Jouer safe avant niveau 6"]
}
```

---

## 🧪 Tests automatisés

- Outils : **Jasmine + Supertest**
- Fichiers : `src/tests/champions.api.spec.ts`, `src/tests/matchups.api.spec.ts`

### Lancer les tests

```bash
npm test
```

### Résultat attendu

```
Started
.......
7 specs, 0 failures
Finished in 0.15 seconds
```

---

## 📜 Validations intégrées

### Matchups

- **Validation native** :
  - `nbParties` ≥ 1
  - `avantageNiveau` entre 1 et 18
- **Validation personnalisée** :
  - `nbVictoires + nbDefaites = nbParties`
  - `championPrincipal ≠ championAdverse`

### Champions

- Nom **unique**.
- Champs obligatoires pour les rôles, images et stats de base.

---

## 🧭 Page d’accueil de l’API

`GET /` renvoie une mini documentation JSON listant les routes disponibles et leurs filtres.

---

## 🌍 Publication (à venir)

- API : Render / Railway
- Base de données : MongoDB Atlas
- Variables d’environnement : `MONGO_URI` (à substituer à l’URI locale pour la prod)

---

## 🧩 Pistes d’amélioration (pour la partie React)

- Authentification (JWT) pour sécuriser la création/édition de matchups.
- Tableau de bord (winrate par champion, courbes d’évolution).
- Internationalisation (FR/EN).
- Design mobile-first responsive.

---

## 👨‍🏫 Auteur

Projet réalisé dans le cadre du cours **Développement Web 3 – Projet intégrateur**  
Cégep de Victoriaville – Automne 2025  
Enseignant : Étienne Rivard
