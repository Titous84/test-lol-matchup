// Tests pour l'API Champions

const request = require('supertest');
const express = require('express');

const { createChampionsRouter } = require('../routes/champions');

const fauxChampions = [
  {
    _id: '1',
    nom: 'Ahri',
    titre: 'Renarde à neuf queues',
    role: ['Mage', 'Assassin'],
    image: '/images/ahri.png',
    attaque: 3,
    defense: 4,
    magie: 8,
    difficulte: 5,
  },
  {
    _id: '2',
    nom: 'Garen',
    titre: 'La puissance de Demacia',
    role: ['Combattant', 'Tank'],
    image: '/images/garen.png',
    attaque: 7,
    defense: 7,
    magie: 1,
    difficulte: 3,
  },
];

const modeleChampionMemoire = {
  async find(filtre: any = {}) {
    let resultats = [...fauxChampions];
    if (filtre.role) {
      resultats = resultats.filter((champion) =>
        champion.role.includes(filtre.role),
      );
    }
    if (filtre.nom && filtre.nom.$regex) {
      const regex = new RegExp(filtre.nom.$regex, filtre.nom.$options);
      resultats = resultats.filter((champion) => regex.test(champion.nom));
    }
    return resultats;
  },
  async findById(id: string) {
    return fauxChampions.find((champion) => champion._id === id) ?? null;
  },
};

const app = express();
app.use(express.json());
app.use('/champions', createChampionsRouter(modeleChampionMemoire));

describe('API Champions', () => {
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
