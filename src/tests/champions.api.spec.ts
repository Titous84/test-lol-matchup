// Tests pour l'API Champions

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');

const championsRouter = require('../routes/champions');

const app = express();
app.use(express.json());
app.use('/champions', championsRouter);

describe('API Champions', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/league');
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('GET /champions → doit retourner un tableau de champions', async () => {
    const res = await request(app).get('/champions');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /champions?role=Mage → doit retourner uniquement des mages', async () => {
    const res = await request(app).get('/champions?role=Mage');
    expect(res.status).toBe(200);
    expect(res.body.every((c: any) => c.role.includes('Mage'))).toBe(true);
  });

  it('GET /champions?nom=ahri → doit retourner Ahri', async () => {
    const res = await request(app).get('/champions?nom=ahri');
    expect(res.status).toBe(200);
    expect(res.body[0].nom).toBe('Ahri');
  });
});
