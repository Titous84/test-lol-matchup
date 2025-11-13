// Tests pour l'API Matchups

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');

const matchupsRouter = require('../routes/matchups');
const { Matchup } = require('../modèles/Matchup');

const app = express();
app.use(express.json());
app.use('/matchups', matchupsRouter);

describe('API Matchups', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/league');
    await Matchup.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  let matchupId: string;

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
    matchupId = res.body._id;
  });

  it('GET /matchups → doit retourner un tableau avec le matchup créé', async () => {
    const res = await request(app).get('/matchups');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it('PUT /matchups/:id → doit mettre à jour le matchup', async () => {
    const res = await request(app).put(`/matchups/${matchupId}`).send({
      nbParties: 3,
      nbVictoires: 3,
      nbDefaites: 0,
      favorable: true,
    });
    expect(res.status).toBe(200);
    expect(res.body.nbVictoires).toBe(3);
  });

  it('DELETE /matchups/:id → doit supprimer le matchup', async () => {
    const res = await request(app).delete(`/matchups/${matchupId}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('supprimé');
  });
});
