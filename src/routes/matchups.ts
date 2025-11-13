import express from 'express';
import type { Model } from 'mongoose';
import { Matchup, type MatchupDocument } from '../models/Matchup';
import { envoyerErreurServeur, envoyerErreurValidation } from '../utils/reponses';

export const createMatchupsRouter = (
  MatchupModel: Model<MatchupDocument> = Matchup,
) => {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const filtre: Record<string, unknown> = {};
      if (req.query.championPrincipal)
        filtre.championPrincipal = req.query.championPrincipal;
      if (req.query.championAdverse)
        filtre.championAdverse = req.query.championAdverse;
      if (req.query.voie) filtre.voie = req.query.voie;
      if (req.query.difficulte) filtre.difficulte = req.query.difficulte;
      if (req.query.favorable)
        filtre.favorable = req.query.favorable === 'true';

      const matchups = await MatchupModel.find(filtre);
      res.json(matchups);
    } catch (err) {
      envoyerErreurServeur(
        res,
        err,
        '❌ Impossible de récupérer les matchups.',
      );
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const matchup = await MatchupModel.findById(req.params.id);
      if (!matchup) {
        return res.status(404).json({ message: 'Matchup non trouvé.' });
      }
      res.json(matchup);
    } catch (err) {
      envoyerErreurServeur(
        res,
        err,
        '❌ Erreur lors de la récupération du matchup.',
      );
    }
  });

  router.post('/', async (req, res) => {
    try {
      const nouveau = await MatchupModel.create(req.body);
      res.status(201).json(nouveau);
    } catch (err) {
      envoyerErreurValidation(
        res,
        '❌ Impossible de créer le matchup.',
        (err as Error).message,
      );
    }
  });

  router.put('/:id', async (req, res) => {
    try {
      const misAJour = await MatchupModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true },
      );
      if (!misAJour) {
        return res.status(404).json({ message: 'Matchup non trouvé.' });
      }
      res.json(misAJour);
    } catch (err) {
      envoyerErreurValidation(
        res,
        '❌ Impossible de mettre à jour le matchup.',
        (err as Error).message,
      );
    }
  });

  router.delete('/:id', async (req, res) => {
    try {
      const supprime = await MatchupModel.findByIdAndDelete(req.params.id);
      if (!supprime) {
        return res.status(404).json({ message: 'Matchup non trouvé.' });
      }
      res.json({ message: 'Matchup supprimé avec succès.' });
    } catch (err) {
      envoyerErreurServeur(
        res,
        err,
        '❌ Impossible de supprimer le matchup.',
      );
    }
  });

  return router;
};

export default createMatchupsRouter();
