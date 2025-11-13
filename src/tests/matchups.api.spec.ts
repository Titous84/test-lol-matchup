// Tests pour l'API Matchups

const request = require('supertest');
const express = require('express');
const { randomUUID } = require('crypto');

const { createMatchupsRouter } = require('../routes/matchups');

const creerModeleMatchupMemoire = () => {
  const donnees: any[] = [];

  return {
    reset() {
      donnees.length = 0;
    },
    async create(payload: any) {
      const nouveau = {
        _id: randomUUID(),
        dateDerniereMaj: new Date().toISOString(),
        ...payload,
      };
      donnees.push(nouveau);
      return { ...nouveau };
    },
    async find(filtre: any = {}) {
      return donnees
        .filter((matchup) => {
          if (
            filtre.championPrincipal &&
            filtre.championPrincipal !== matchup.championPrincipal
          )
            return false;
          if (
            filtre.championAdverse &&
            filtre.championAdverse !== matchup.championAdverse
          )
            return false;
          if (
            typeof filtre.favorable === 'boolean' &&
            filtre.favorable !== matchup.favorable
          )
            return false;
          return true;
        })
        .map((matchup) => ({ ...matchup }));
    },
    async findById(id: string) {
      const doc = donnees.find((matchup) => matchup._id === id);
      return doc ? { ...doc } : null;
    },
    async findByIdAndUpdate(id: string, updates: any) {
      const index = donnees.findIndex((matchup) => matchup._id === id);
      if (index === -1) return null;
      donnees[index] = { ...donnees[index], ...updates };
      return { ...donnees[index] };
    },
    async findByIdAndDelete(id: string) {
      const index = donnees.findIndex((matchup) => matchup._id === id);
      if (index === -1) return null;
      const [supprime] = donnees.splice(index, 1);
      return { ...supprime };
    },
  };
};

const modeleMatchupMemoire = creerModeleMatchupMemoire();

const app = express();
app.use(express.json());
app.use('/matchups', createMatchupsRouter(modeleMatchupMemoire));

describe('API Matchups', () => {
  beforeEach(() => {
    modeleMatchupMemoire.reset();
  });

  it('POST /matchups → doit créer un matchup', async () => {
    const res = await request(app)
      .post('/matchups')
      .send({
        championPrincipal: 'Ahri',
        championAdverse: 'Zed',
        nbParties: 3,
        nbVictoires: 2,
        nbDefaites: 1,
        avantageNiveau: 6,
        favorable: true,
        notesPerso: ['Jouer safe avant niveau 6'],
      });
    expect(res.status).toBe(201);
    expect(res.body.championPrincipal).toBe('Ahri');
    expect(res.body._id).toBeTruthy();
  });

  it('GET /matchups → doit retourner un tableau avec le matchup créé', async () => {
    await request(app)
      .post('/matchups')
      .send({
        championPrincipal: 'Ahri',
        championAdverse: 'Zed',
        nbParties: 3,
        nbVictoires: 2,
        nbDefaites: 1,
        avantageNiveau: 6,
        favorable: true,
        notesPerso: ['Jouer safe avant niveau 6'],
      });

    const res = await request(app).get('/matchups');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it('PUT /matchups/:id → doit mettre à jour le matchup', async () => {
    const creation = await request(app)
      .post('/matchups')
      .send({
        championPrincipal: 'Ahri',
        championAdverse: 'Zed',
        nbParties: 3,
        nbVictoires: 2,
        nbDefaites: 1,
        avantageNiveau: 6,
        favorable: true,
        notesPerso: ['Jouer safe avant niveau 6'],
      });
    const id = creation.body._id;

    const res = await request(app).put(`/matchups/${id}`).send({
      nbParties: 3,
      nbVictoires: 3,
      nbDefaites: 0,
      favorable: true,
    });
    expect(res.status).toBe(200);
    expect(res.body.nbVictoires).toBe(3);
  });

  it('DELETE /matchups/:id → doit supprimer le matchup', async () => {
    const creation = await request(app)
      .post('/matchups')
      .send({
        championPrincipal: 'Ahri',
        championAdverse: 'Zed',
        nbParties: 3,
        nbVictoires: 2,
        nbDefaites: 1,
        avantageNiveau: 6,
        favorable: true,
        notesPerso: ['Jouer safe avant niveau 6'],
      });
    const id = creation.body._id;

    const res = await request(app).delete(`/matchups/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('supprimé');
  });
});
