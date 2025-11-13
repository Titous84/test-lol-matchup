// Point d'entrée de l'API League of Legends Matchups

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import des routes
const championsRouter = require('./routes/champions');
const matchupsRouter = require('./routes/matchups');

const app = express();
const port = process.env.PORT || 4000;

// === Middlewares globaux ===
app.use(cors()); // Autorise les requêtes cross-origin (utile pour React)
app.use(express.json()); // Permet de lire les corps JSON

// === Connexion MongoDB locale ===
mongoose
  .connect('mongodb://127.0.0.1:27017/league')
  .then(() => console.log('✅ Connecté à MongoDB local'))
  .catch((err: any) => console.error('❌ Erreur de connexion MongoDB :', err));

// === Routes principales ===
app.use('/champions', championsRouter);
app.use('/matchups', matchupsRouter);

// Page d'accueil → mini documentation JSON
app.get('/', (req: any, res: any) => {
  res.json({
    message: "Bienvenue dans l'API League of Legends Matchups 🚀",
    routes: {
      champions: {
        GET: '/champions → liste tous les champions (filtres: ?role=Mage, ?nom=Ahri)',
        GET_id: '/champions/:id → récupère un champion par son ID',
      },
      matchups: {
        GET: '/matchups → liste tous les matchups (filtres: ?championPrincipal=Ahri, ?favorable=true)',
        GET_id: '/matchups/:id → récupère un matchup par ID',
        POST: '/matchups → crée un nouveau matchup',
        PUT: '/matchups/:id → met à jour un matchup',
        DELETE: '/matchups/:id → supprime un matchup',
      },
    },
  });
});

// === Lancement du serveur ===
app.listen(port, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
});

// Pour exécuter : npx ts-node src/serveur.ts
