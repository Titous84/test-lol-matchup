// Routes pour la collection "matchups"

const express = require('express');
const { Matchup } = require('../modèles/Matchup');

// Typage Express (astuce CommonJS)
type Request = import('express').Request;
type Response = import('express').Response;

const createMatchupsRouter = (MatchupModel = Matchup) => {
  const router = express.Router();

  // === GET /matchups → liste tous ou filtrés
  router.get('/', async (req: Request, res: Response) => {
    try {
      const filtre: any = {};
      if (req.query.championPrincipal)
        filtre.championPrincipal = req.query.championPrincipal;
      if (req.query.championAdverse)
        filtre.championAdverse = req.query.championAdverse;
      if (req.query.favorable)
        filtre.favorable = req.query.favorable === 'true';

      const matchups = await MatchupModel.find(filtre);
      res.json(matchups);
    } catch (err) {
      res
        .status(500)
        .json({ message: 'Erreur lors de la récupération des matchups.' });
    }
  });

  // === GET /matchups/:id → un matchup par ID
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const matchup = await MatchupModel.findById(req.params.id);
      if (!matchup)
        return res.status(404).json({ message: 'Matchup non trouvé.' });
      res.json(matchup);
    } catch {
      res
        .status(500)
        .json({ message: 'Erreur lors de la récupération du matchup.' });
    }
  });

  // === POST /matchups → créer un matchup
  router.post('/', async (req: Request, res: Response) => {
    try {
      const matchup = await MatchupModel.create(req.body);
      res.status(201).json(matchup);
    } catch (err: any) {
      res.status(400).json({
        message: 'Erreur lors de la création du matchup',
        details: err.message,
      });
    }
  });

  // === PUT /matchups/:id → mettre à jour un matchup
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const matchup = await MatchupModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        },
      );
      if (!matchup)
        return res.status(404).json({ message: 'Matchup non trouvé.' });
      res.json(matchup);
    } catch (err: any) {
      res.status(400).json({
        message: 'Erreur lors de la mise à jour du matchup',
        details: err.message,
      });
    }
  });

  // === DELETE /matchups/:id → supprimer un matchup
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const result = await MatchupModel.findByIdAndDelete(req.params.id);
      if (!result)
        return res.status(404).json({ message: 'Matchup non trouvé.' });
      res.json({ message: 'Matchup supprimé avec succès.' });
    } catch {
      res
        .status(500)
        .json({ message: 'Erreur lors de la suppression du matchup.' });
    }
  });

  return router;
};

const defaultRouter = createMatchupsRouter();
module.exports = defaultRouter;
module.exports.createMatchupsRouter = createMatchupsRouter;
