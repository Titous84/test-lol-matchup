import express from 'express';
import type { Model } from 'mongoose';
import { Commentaire, type CommentaireDocument } from '../models/Commentaire';
import { envoyerErreurServeur, envoyerErreurValidation } from '../utils/reponses';
import { verifierToken } from '../middlewares/authentification';

export const createCommentairesRouter = (
  options: {
    CommentaireModel?: Model<CommentaireDocument>;
    authMiddleware?: typeof verifierToken;
  } = {},
) => {
  const { CommentaireModel = Commentaire, authMiddleware = verifierToken } = options;
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const filtre: Record<string, unknown> = {};
      if (req.query.matchup) filtre.matchup = req.query.matchup;
      if (req.query.auteur) filtre.auteur = req.query.auteur;
      if (req.query.visible)
        filtre.visible = req.query.visible === 'true';

      const commentaires = await CommentaireModel.find(filtre);
      res.json(commentaires);
    } catch (err) {
      envoyerErreurServeur(
        res,
        err,
        '❌ Impossible de récupérer les commentaires.',
      );
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const commentaire = await CommentaireModel.findById(req.params.id);
      if (!commentaire) {
        return res.status(404).json({ message: 'Commentaire non trouvé.' });
      }
      res.json(commentaire);
    } catch (err) {
      envoyerErreurServeur(
        res,
        err,
        '❌ Erreur lors de la récupération du commentaire.',
      );
    }
  });

  router.post('/', authMiddleware, async (req, res) => {
    try {
      const utilisateurCourant = (req as any).utilisateur;
      const commentaire = await CommentaireModel.create({
        ...req.body,
        auteur: utilisateurCourant?.id,
        langue: utilisateurCourant?.langue ?? 'fr',
      });
      res.status(201).json(commentaire);
    } catch (err) {
      envoyerErreurValidation(
        res,
        '❌ Impossible de créer le commentaire.',
        (err as Error).message,
      );
    }
  });

  router.put('/:id', authMiddleware, async (req, res) => {
    try {
      const utilisateurCourant = (req as any).utilisateur;
      const ancien = await CommentaireModel.findById(req.params.id);
      if (!ancien) {
        return res.status(404).json({ message: 'Commentaire non trouvé.' });
      }
      if (
        ancien.auteur?.toString() !== utilisateurCourant?.id &&
        !utilisateurCourant?.roles?.includes('administrateur')
      ) {
        return res
          .status(403)
          .json({ message: 'Vous ne pouvez modifier que vos commentaires.' });
      }

      const miseAJour = await CommentaireModel.findByIdAndUpdate(
        req.params.id,
        { ...req.body, misAJourLe: new Date() },
        { new: true, runValidators: true },
      );
      res.json(miseAJour);
    } catch (err) {
      envoyerErreurValidation(
        res,
        '❌ Impossible de mettre à jour le commentaire.',
        (err as Error).message,
      );
    }
  });

  router.delete('/:id', authMiddleware, async (req, res) => {
    try {
      const utilisateurCourant = (req as any).utilisateur;
      const commentaire = await CommentaireModel.findById(req.params.id);
      if (!commentaire) {
        return res.status(404).json({ message: 'Commentaire non trouvé.' });
      }
      if (
        commentaire.auteur?.toString() !== utilisateurCourant?.id &&
        !utilisateurCourant?.roles?.includes('administrateur')
      ) {
        return res
          .status(403)
          .json({ message: 'Vous ne pouvez supprimer que vos commentaires.' });
      }

      await CommentaireModel.findByIdAndDelete(req.params.id);
      res.json({ message: 'Commentaire supprimé avec succès.' });
    } catch (err) {
      envoyerErreurServeur(
        res,
        err,
        '❌ Impossible de supprimer le commentaire.',
      );
    }
  });

  return router;
};

export default createCommentairesRouter();
