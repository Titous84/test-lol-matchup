// Routes Express pour gérer la collection "champions"

const express = require('express');
const { Champion } = require('../modèles/Champion');

// Typage Express (astuce CommonJS)
type Request = import('express').Request;
type Response = import('express').Response;

const router = express.Router();

// === GET /champions → tous les champions (avec filtres facultatifs)
router.get('/', async (req: Request, res: Response) => {
  try {
    const filtre: any = {};
    if (req.query.role) filtre.role = req.query.role;
    if (req.query.nom) filtre.nom = { $regex: req.query.nom, $options: 'i' };

    const champions = await Champion.find(filtre);
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
    const champion = await Champion.findById(req.params.id);
    if (!champion)
      return res.status(404).json({ message: 'Champion non trouvé.' });
    res.json(champion);
  } catch (err) {
    res.status(500).json({
      message: '❌ Erreur serveur lors de la récupération du champion.',
    });
  }
});

module.exports = router;
