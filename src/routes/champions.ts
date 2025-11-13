// Routes Express pour gérer la collection "champions"

const express = require('express');
const { Champion } = require('../modèles/Champion');

// Typage Express (astuce CommonJS)
type Request = import('express').Request;
type Response = import('express').Response;

const createChampionsRouter = (ChampionModel = Champion) => {
  const router = express.Router();

  // === GET /champions → tous les champions (avec filtres facultatifs)
  router.get('/', async (req: Request, res: Response) => {
    try {
      const filtre: any = {};
      if (req.query.role) filtre.role = req.query.role;
      if (req.query.nom) filtre.nom = { $regex: req.query.nom, $options: 'i' };

      const champions = await ChampionModel.find(filtre);
      res.json(champions);
    } catch {
      res.status(500).json({
        message: '❌ Erreur serveur lors de la récupération des champions.',
      });
    }
  });

  // === GET /champions/:id → un champion par ID
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const champion = await ChampionModel.findById(req.params.id);
      if (!champion)
        return res.status(404).json({ message: 'Champion non trouvé.' });
      res.json(champion);
    } catch (err) {
      res.status(500).json({
        message: '❌ Erreur serveur lors de la récupération du champion.',
      });
    }
  });

  return router;
};

const defaultRouter = createChampionsRouter();
module.exports = defaultRouter;
module.exports.createChampionsRouter = createChampionsRouter;
