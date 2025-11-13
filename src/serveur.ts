import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { env } from './config/env';
import createAuthRouter from './routes/auth';
import createChampionsRouter from './routes/champions';
import createMatchupsRouter from './routes/matchups';
import createCommentairesRouter from './routes/commentaires';

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  '/images/champions',
  express.static(path.resolve(__dirname, '..', 'dev', 'images_champions')),
);

app.get('/', (_req, res) => {
  res.json({
    message: "Bienvenue sur l'API League Matchups", 
    documentation: {
      champions: {
        liste: 'GET /champions?role=&region=&nom=',
        detail: 'GET /champions/:id',
        creation: 'POST /champions',
        miseAJour: 'PUT /champions/:id',
        suppression: 'DELETE /champions/:id',
      },
      matchups: {
        liste: 'GET /matchups?championPrincipal=&championAdverse=&voie=&favorable=',
        detail: 'GET /matchups/:id',
        creation: 'POST /matchups',
        miseAJour: 'PUT /matchups/:id',
        suppression: 'DELETE /matchups/:id',
      },
      commentaires: {
        liste: 'GET /commentaires?matchup=&auteur=',
        detail: 'GET /commentaires/:id',
        creation: 'POST /commentaires (JWT requis)',
        miseAJour: 'PUT /commentaires/:id (JWT requis)',
        suppression: 'DELETE /commentaires/:id (JWT requis)',
      },
      auth: {
        inscription: 'POST /auth/inscription',
        connexion: 'POST /auth/connexion',
        profil: 'GET /auth/profil',
      },
    },
  });
});

app.use('/auth', createAuthRouter());
app.use('/champions', createChampionsRouter());
app.use('/matchups', createMatchupsRouter());
app.use('/commentaires', createCommentairesRouter());

mongoose
  .connect(env.mongodbUri)
  .then(() => {
    app.listen(env.port, () => {
      console.log(`🚀 Serveur prêt sur http://localhost:${env.port}`);
    });
  })
  .catch((err) => {
    console.error('❌ Impossible de se connecter à MongoDB', err);
    process.exit(1);
  });

export { app };
