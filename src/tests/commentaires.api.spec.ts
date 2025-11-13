import type { Request, Response } from 'express';
const express = require('express');
const request = require('supertest');
const { createCommentairesRouter } = require('../routes/commentaires');

const creerModeleCommentaireMemoire = () => {
  const donnees: any[] = [];

  return {
    reset() {
      donnees.length = 0;
    },
    async find(filtre: Record<string, any> = {}) {
      return donnees.filter((doc) => {
        if (filtre.matchup && doc.matchup !== filtre.matchup) return false;
        if (filtre.auteur && doc.auteur !== filtre.auteur) return false;
        if (
          typeof filtre.visible === 'boolean' &&
          doc.visible !== filtre.visible
        )
          return false;
        return true;
      });
    },
    async findById(id: string) {
      return donnees.find((doc) => doc._id === id) ?? null;
    },
    async create(payload: any) {
      const doc = {
        _id: String(Date.now() + Math.random()),
        ...payload,
      };
      donnees.push(doc);
      return doc;
    },
    async findByIdAndUpdate(id: string, updates: any) {
      const index = donnees.findIndex((doc) => doc._id === id);
      if (index === -1) return null;
      donnees[index] = { ...donnees[index], ...updates };
      return donnees[index];
    },
    async findByIdAndDelete(id: string) {
      const index = donnees.findIndex((doc) => doc._id === id);
      if (index === -1) return null;
      const [supprime] = donnees.splice(index, 1);
      return supprime;
    },
  };
};

const modele = creerModeleCommentaireMemoire();
const fauxAuth = (req: Request & { utilisateur?: any }, _res: Response, next: any) => {
  req.utilisateur = {
    id: 'user1',
    roles: ['joueur'],
    courriel: 'test@example.com',
    langue: 'fr',
  };
  next();
};

const app = express();
app.use(express.json());
app.use(
  '/commentaires',
  createCommentairesRouter({ CommentaireModel: modele as any, authMiddleware: fauxAuth }),
);

describe('API Commentaires protégée', () => {
  beforeEach(() => modele.reset());

  const payload = {
    matchup: 'match1',
    contenu: 'Matchup difficile après le niveau 6.',
    humeur: 'Neutre',
    difficulteRessentie: 3,
    conseilsSupplementaires: ['Acheter un détecteur'],
    visible: true,
    langue: 'fr',
  };

  it('POST /commentaires → crée un commentaire lié à l’utilisateur', async () => {
    const res = await request(app).post('/commentaires').send(payload);
    expect(res.status).toBe(201);
    expect(res.body.auteur).toBe('user1');
  });

  it('GET /commentaires → retourne les commentaires', async () => {
    await request(app).post('/commentaires').send(payload);
    const res = await request(app).get('/commentaires');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it('PUT /commentaires/:id → met à jour le commentaire', async () => {
    const creation = await request(app).post('/commentaires').send(payload);
    const res = await request(app)
      .put(`/commentaires/${creation.body._id}`)
      .send({ humeur: 'Positif' });
    expect(res.status).toBe(200);
    expect(res.body.humeur).toBe('Positif');
  });

  it('DELETE /commentaires/:id → supprime le commentaire', async () => {
    const creation = await request(app).post('/commentaires').send(payload);
    const res = await request(app).delete(`/commentaires/${creation.body._id}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('supprimé');
  });
});
