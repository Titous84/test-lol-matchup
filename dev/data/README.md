# Données Kaggle locales

Déposez ici les fichiers CSV ou JSON fournis par le professeur (7 fichiers de matchups). Le script `npm run seed:dev` lit **tous** les fichiers `*.csv`/`*.json` présents dans ce dossier, peu importe leur nom, et les fusionne pour remplir la collection `matchups`.

- Colonnes acceptées : `MainChampion`, `OpponentChampion`, `Lane`, `WinRate`, `Wins`, `Losses`, `Games`, `KDA`, `AdvantageLevel`, `Difficulty`, `Favorable`, `Tips`, `Tags` (l'outil reconnaît aussi les équivalents FR/EN).
- Les champions doivent correspondre aux noms Riot officiels (Ahri, Sett, Kai'Sa…).
- Vous pouvez mélanger CSV et JSON dans ce même dossier.

Ensuite :

```bash
npm install
cp .env.example .env # si ce n'est pas déjà fait
npm run seed:dev            # importe champions + matchups
npm run dev                 # lance l'API sur http://localhost:4000
```
