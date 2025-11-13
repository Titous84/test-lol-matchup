const express = require('express');
const request = require('supertest');
const { createMatchupsRouter } = require('../routes/matchups');

const creerModeleMatchupMemoire = () => {
  const donnees: any[] = [];

  return {
    reset() {
      donnees.length = 0;
    },
    async create(payload: any) {
      const doc = {
        _id: String(Date.now() + Math.random()),
        ...payload,
      };
      donnees.push(doc);
      return doc;
    },
    async find(filtre: Record<string, any> = {}) {
      return donnees.filter((doc) => {
        if (
          filtre.championPrincipal &&
          doc.championPrincipal !== filtre.championPrincipal
        )
          return false;
        if (
          filtre.championAdverse &&
          doc.championAdverse !== filtre.championAdverse
        )
          return false;
        if (filtre.voie && doc.voie !== filtre.voie) return false;
        if (
          typeof filtre.favorable === 'boolean' &&
          doc.favorable !== filtre.favorable
        )
          return false;
        return true;
      });
    },
    async findById(id: string) {
      return donnees.find((doc) => doc._id === id) ?? null;
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

const modele = creerModeleMatchupMemoire();
const app = express();
app.use(express.json());
app.use('/matchups', createMatchupsRouter(modele as any));

describe('API Matchups', () => {
  beforeEach(() => modele.reset());

  const basePayload = {
    championPrincipal: '1',
    championAdverse: '2',
    voie: 'Mid',
    nbParties: 10,
    nbVictoires: 6,
    nbDefaites: 4,
    tauxVictoire: 60,
    kdaMoyen: 3.4,
    niveauAvantage: 7,
    difficulte: 'Équilibré',
    favorable: true,
    conseils: ['Utiliser la mobilité'],
    tags: ['poke'],
  };

  it('POST /matchups → crée un matchup', async () => {
    const res = await request(app).post('/matchups').send(basePayload);
    expect(res.status).toBe(201);
    expect(res.body.championPrincipal).toBe('1');
  });

  it('GET /matchups → retourne la liste', async () => {
    await request(app).post('/matchups').send(basePayload);
    const res = await request(app).get('/matchups');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it('GET /matchups?voie=Mid → applique le filtre', async () => {
    await request(app).post('/matchups').send(basePayload);
    const res = await request(app).get('/matchups?voie=Mid');
    expect(res.status).toBe(200);
    expect(res.body[0].voie).toBe('Mid');
  });

  it('PUT /matchups/:id → met à jour le matchup', async () => {
    const creation = await request(app).post('/matchups').send(basePayload);
    const res = await request(app)
      .put(`/matchups/${creation.body._id}`)
      .send({ nbParties: 12 });
    expect(res.status).toBe(200);
    expect(res.body.nbParties).toBe(12);
  });

  it('DELETE /matchups/:id → supprime le matchup', async () => {
    const creation = await request(app).post('/matchups').send(basePayload);
    const res = await request(app).delete(`/matchups/${creation.body._id}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('supprimé');
  });
});
