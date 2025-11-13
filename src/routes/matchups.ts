import express from 'express';
import type { Model } from 'mongoose';
import { Types } from 'mongoose';
import { Champion, type ChampionDocument } from '../models/Champion';
import { Matchup, type MatchupDocument } from '../models/Matchup';
import { envoyerErreurServeur, envoyerErreurValidation } from '../utils/reponses';

export const createMatchupsRouter = (
  MatchupModel: Model<MatchupDocument> = Matchup,
  ChampionModel: Model<ChampionDocument> = Champion,
) => {
  const router = express.Router();

  const toPlainObject = (doc: any) =>
    typeof doc?.toObject === 'function' ? doc.toObject() : doc;

  const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const normaliserId = (valeur: unknown): string | undefined => {
    if (!valeur) return undefined;
    if (valeur instanceof Types.ObjectId) return valeur.toString();
    if (typeof valeur === 'string' && valeur.trim().length) return valeur;
    if (typeof valeur === 'object' && valeur !== null) {
      const possible = (valeur as { _id?: unknown; id?: unknown })._id ?? (
        valeur as { id?: unknown }
      ).id;
      if (typeof possible === 'string') return possible;
    }
    return undefined;
  };

  const trouverChampionId = async (valeur: unknown) => {
    if (!valeur) return undefined;
    if (
      typeof valeur === 'string' &&
      Types.ObjectId.isValid(valeur.trim()) &&
      valeur.trim().length
    ) {
      return new Types.ObjectId(valeur.trim());
    }
    if (valeur instanceof Types.ObjectId) {
      return valeur;
    }
    const nom =
      typeof valeur === 'string'
        ? valeur.trim()
        : typeof valeur === 'object' && valeur !== null
          ? ((valeur as { nom?: string }).nom ?? '').trim()
          : '';
    if (!nom) return undefined;
    const champion = await ChampionModel.findOne({
      nom: { $regex: new RegExp(`^${escapeRegex(nom)}$`, 'i') },
    });
    if (!champion) return undefined;
    return new Types.ObjectId(champion._id as any);
  };

  const preparerPayload = async (
    payload: Record<string, unknown>,
    options: { principalObligatoire?: boolean; adverseObligatoire?: boolean } = {},
  ) => {
    const resultat: Record<string, unknown> = { ...payload };
    if (payload.championPrincipal !== undefined || options.principalObligatoire) {
      if (payload.championPrincipal === undefined && options.principalObligatoire) {
        throw new Error('Le champion principal est obligatoire.');
      }
      const id = await trouverChampionId(payload.championPrincipal);
      if (!id) {
        throw new Error('Champion principal introuvable.');
      }
      resultat.championPrincipal = id;
    }
    if (payload.championAdverse !== undefined || options.adverseObligatoire) {
      if (payload.championAdverse === undefined && options.adverseObligatoire) {
        throw new Error('Le champion adverse est obligatoire.');
      }
      const id = await trouverChampionId(payload.championAdverse);
      if (!id) {
        throw new Error('Champion adverse introuvable.');
      }
      resultat.championAdverse = id;
    }
    return resultat;
  };

  const presenterMatchups = async (documents: any[]) => {
    if (!documents.length) return [];
    const ids = documents.flatMap((doc) => [
      normaliserId(toPlainObject(doc).championPrincipal),
      normaliserId(toPlainObject(doc).championAdverse),
    ]);
    const uniques = Array.from(new Set(ids.filter(Boolean))) as string[];
    const identifiantsValides = uniques.filter((id) => Types.ObjectId.isValid(id));
    let correspondances = new Map<string, string>();
    if (identifiantsValides.length) {
      const champions = await ChampionModel.find({
        _id: { $in: identifiantsValides },
      });
      correspondances = new Map(
        champions.map((champ: any) => {
          const plain = toPlainObject(champ);
          return [plain._id.toString(), plain.nom];
        }),
      );
    }
    return documents.map((document) => {
      const plain = toPlainObject(document);
      const principalId = normaliserId(plain.championPrincipal);
      const adverseId = normaliserId(plain.championAdverse);
      return {
        ...plain,
        championPrincipal:
          (principalId && correspondances.get(principalId)) ?? plain.championPrincipal,
        championAdverse:
          (adverseId && correspondances.get(adverseId)) ?? plain.championAdverse,
      };
    });
  };

  router.get('/', async (req, res) => {
    try {
      const filtre: Record<string, unknown> = {};
      if (req.query.championPrincipal) {
        const id = await trouverChampionId(String(req.query.championPrincipal));
        if (!id) {
          return res.json([]);
        }
        filtre.championPrincipal = id;
      }
      if (req.query.championAdverse) {
        const id = await trouverChampionId(String(req.query.championAdverse));
        if (!id) {
          return res.json([]);
        }
        filtre.championAdverse = id;
      }
      if (req.query.voie) filtre.voie = req.query.voie;
      if (req.query.difficulte) filtre.difficulte = req.query.difficulte;
      if (req.query.favorable)
        filtre.favorable = req.query.favorable === 'true';

      const matchups = await MatchupModel.find(filtre);
      const reponse = await presenterMatchups(matchups ?? []);
      res.json(reponse);
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
      const [reponse] = await presenterMatchups([matchup]);
      res.json(reponse ?? matchup);
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
      const payload = await preparerPayload(req.body, {
        principalObligatoire: true,
        adverseObligatoire: true,
      });
      const nouveau = await MatchupModel.create(payload);
      const [reponse] = await presenterMatchups([nouveau]);
      res.status(201).json(reponse ?? nouveau);
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
      const payload = await preparerPayload(req.body);
      const misAJour = await MatchupModel.findByIdAndUpdate(
        req.params.id,
        payload,
        { new: true, runValidators: true },
      );
      if (!misAJour) {
        return res.status(404).json({ message: 'Matchup non trouvé.' });
      }
      const [reponse] = await presenterMatchups([misAJour]);
      res.json(reponse ?? misAJour);
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
