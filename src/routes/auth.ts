import express from 'express';
import type { Model } from 'mongoose';
import { Utilisateur } from '../models/Utilisateur';
import { genererToken } from '../services/token';
import { verifierToken } from '../middlewares/authentification';
import { envoyerErreurServeur, envoyerErreurValidation } from '../utils/reponses';

export const createAuthRouter = (UtilisateurModel: Model<any> = Utilisateur) => {
  const router = express.Router();

  router.post('/inscription', async (req, res) => {
    try {
      const utilisateur = await UtilisateurModel.create(req.body);
      const token = genererToken({
        id: utilisateur._id.toString(),
        roles: utilisateur.roles,
        courriel: utilisateur.courriel,
        langue: utilisateur.preferencesLangue,
      });
      res.status(201).json({
        utilisateur: {
          id: utilisateur._id,
          prenom: utilisateur.prenom,
          nom: utilisateur.nom,
          courriel: utilisateur.courriel,
          roles: utilisateur.roles,
          preferencesLangue: utilisateur.preferencesLangue,
        },
        token,
      });
    } catch (err) {
      envoyerErreurValidation(
        res,
        "❌ Impossible d'enregistrer l'utilisateur.",
        (err as Error).message,
      );
    }
  });

  router.post('/connexion', async (req, res) => {
    try {
      const { courriel, motDePasse } = req.body;
      const utilisateur = await UtilisateurModel.findOne({ courriel });
      if (!utilisateur) {
        return res.status(401).json({ message: 'Identifiants invalides.' });
      }
      const valide = await (utilisateur as any).comparerMotDePasse(motDePasse);
      if (!valide) {
        return res.status(401).json({ message: 'Identifiants invalides.' });
      }

      utilisateur.derniereConnexion = new Date();
      await utilisateur.save();

      const token = genererToken({
        id: utilisateur._id.toString(),
        roles: utilisateur.roles,
        courriel: utilisateur.courriel,
        langue: utilisateur.preferencesLangue,
      });

      res.json({
        utilisateur: {
          id: utilisateur._id,
          prenom: utilisateur.prenom,
          nom: utilisateur.nom,
          courriel: utilisateur.courriel,
          roles: utilisateur.roles,
          preferencesLangue: utilisateur.preferencesLangue,
        },
        token,
      });
    } catch (err) {
      envoyerErreurServeur(
        res,
        err,
        '❌ Erreur lors de la connexion.',
      );
    }
  });

  router.get('/profil', verifierToken, async (req, res) => {
    try {
      const utilisateur = await UtilisateurModel.findById((req as any).utilisateur?.id);
      if (!utilisateur) {
        return res.status(404).json({ message: 'Utilisateur introuvable.' });
      }
      res.json({
        id: utilisateur._id,
        prenom: utilisateur.prenom,
        nom: utilisateur.nom,
        courriel: utilisateur.courriel,
        roles: utilisateur.roles,
        preferencesLangue: utilisateur.preferencesLangue,
      });
    } catch (err) {
      envoyerErreurServeur(
        res,
        err,
        '❌ Impossible de charger le profil.',
      );
    }
  });

  return router;
};

export default createAuthRouter();
