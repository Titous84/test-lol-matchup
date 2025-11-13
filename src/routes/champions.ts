import express from 'express';
import type { Model } from 'mongoose';
import { Champion, type ChampionDocument } from '../models/Champion';
import { envoyerErreurServeur, envoyerErreurValidation } from '../utils/reponses';

export const createChampionsRouter = (
  ChampionModel: Model<ChampionDocument> = Champion,
) => {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const filtre: Record<string, unknown> = {};
      if (req.query.role) filtre.roles = req.query.role;
      if (req.query.region) filtre.region = req.query.region;
      if (req.query.nom)
        filtre.nom = { $regex: req.query.nom, $options: 'i' };

      const champions = await ChampionModel.find(filtre);
      res.json(champions);
    } catch (err) {
      envoyerErreurServeur(res, err, '❌ Impossible de récupérer les champions.');
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const champion = await ChampionModel.findById(req.params.id);
      if (!champion) {
        return res.status(404).json({ message: 'Champion non trouvé.' });
      }
      res.json(champion);
    } catch (err) {
      envoyerErreurServeur(
        res,
        err,
        '❌ Erreur lors de la récupération du champion.',
      );
    }
  });

  router.post('/', async (req, res) => {
    try {
      const nouveau = await ChampionModel.create(req.body);
      res.status(201).json(nouveau);
    } catch (err) {
      envoyerErreurValidation(
        res,
        '❌ Impossible de créer le champion.',
        (err as Error).message,
      );
    }
  });

  router.put('/:id', async (req, res) => {
    try {
      const misAJour = await ChampionModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true },
      );
      if (!misAJour) {
        return res.status(404).json({ message: 'Champion non trouvé.' });
      }
      res.json(misAJour);
    } catch (err) {
      envoyerErreurValidation(
        res,
        '❌ Impossible de mettre à jour le champion.',
        (err as Error).message,
      );
    }
  });

  router.delete('/:id', async (req, res) => {
    try {
      const supprime = await ChampionModel.findByIdAndDelete(req.params.id);
      if (!supprime) {
        return res.status(404).json({ message: 'Champion non trouvé.' });
      }
      res.json({ message: 'Champion supprimé avec succès.' });
    } catch (err) {
      envoyerErreurServeur(
        res,
        err,
        '❌ Impossible de supprimer le champion.',
      );
    }
  });

  return router;
};

export default createChampionsRouter();
