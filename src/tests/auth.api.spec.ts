const express = require('express');
const request = require('supertest');
const { createAuthRouter } = require('../routes/auth');
const { verifierToken } = require('../services/token');

const creerModeleUtilisateurMemoire = () => {
  const donnees: any[] = [];

  const creerDoc = (payload: any) => ({
    ...payload,
    comparerMotDePasse: async (motDePasse: string) =>
      motDePasse === payload.motDePasse,
    save: async function () {
      return this;
    },
  });

  return {
    async create(payload: any) {
      const doc = creerDoc({ _id: String(Date.now()), ...payload });
      donnees.push(doc);
      return doc;
    },
    async findOne(filtre: { courriel: string }) {
      const trouve = donnees.find((doc) => doc.courriel === filtre.courriel);
      return trouve ? creerDoc(trouve) : null;
    },
    async findById(id: string) {
      const trouve = donnees.find((doc) => doc._id === id);
      return trouve ? creerDoc(trouve) : null;
    },
  };
};

const modele = creerModeleUtilisateurMemoire();
const app = express();
app.use(express.json());
app.use('/auth', createAuthRouter(modele as any));

describe('API Auth', () => {
  it("POST /auth/inscription → crée l'utilisateur et retourne un token", async () => {
    const res = await request(app).post('/auth/inscription').send({
      prenom: 'Test',
      nom: 'User',
      courriel: 'test@example.com',
      motDePasse: 'secret123',
      roles: ['joueur'],
      preferencesLangue: 'fr',
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
  });

  it('POST /auth/connexion → retourne un token valide', async () => {
    await request(app).post('/auth/inscription').send({
      prenom: 'Test',
      nom: 'User',
      courriel: 'login@example.com',
      motDePasse: 'secret123',
      roles: ['joueur'],
      preferencesLangue: 'fr',
    });
    const res = await request(app).post('/auth/connexion').send({
      courriel: 'login@example.com',
      motDePasse: 'secret123',
    });
    expect(res.status).toBe(200);
    const payload = verifierToken(res.body.token);
    expect(payload.courriel).toBe('login@example.com');
  });

  it('GET /auth/profil → retourne le profil courant', async () => {
    const inscription = await request(app).post('/auth/inscription').send({
      prenom: 'Profile',
      nom: 'User',
      courriel: 'profil@example.com',
      motDePasse: 'secret123',
      roles: ['joueur'],
      preferencesLangue: 'fr',
    });
    const token = inscription.body.token;
    const res = await request(app)
      .get('/auth/profil')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.courriel).toBe('profil@example.com');
  });
});
