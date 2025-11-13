const express = require('express');
const request = require('supertest');
const { createChampionsRouter } = require('../routes/champions');

const donneesInitiales = [
  {
    _id: '1',
    nom: 'Ahri',
    titre: 'Renarde à neuf queues',
    roles: ['Mage', 'Assassin'],
    region: 'Ionia',
    difficulte: 5,
    attaque: 3,
    defense: 4,
    magie: 8,
    mobilite: 7,
    portee: 'Distance',
    icone: 'ahri.png',
    enRotation: false,
    tags: ['burst'],
    miseAJour: new Date().toISOString(),
  },
  {
    _id: '2',
    nom: 'Garen',
    titre: 'Puissance de Demacia',
    roles: ['Combattant', 'Tank'],
    region: 'Demacia',
    difficulte: 3,
    attaque: 7,
    defense: 7,
    magie: 1,
    mobilite: 5,
    portee: 'Corps à corps',
    icone: 'garen.png',
    enRotation: true,
    tags: ['debutant'],
    miseAJour: new Date().toISOString(),
  },
];

const creerModeleChampionMemoire = () => {
  const donnees = donneesInitiales.map((doc) => ({ ...doc }));

  return {
    reset() {
      donnees.length = 0;
      donnees.push(...donneesInitiales.map((doc) => ({ ...doc })));
    },
    async find(filtre: Record<string, any> = {}) {
      return donnees.filter((champion) => {
        if (filtre.roles && !champion.roles.includes(filtre.roles)) return false;
        if (filtre.region && champion.region !== filtre.region) return false;
        if (filtre.nom && filtre.nom.$regex) {
          const regex = new RegExp(filtre.nom.$regex, filtre.nom.$options);
          if (!regex.test(champion.nom)) return false;
        }
        return true;
      });
    },
    async findById(id: string) {
      return donnees.find((c) => c._id === id) ?? null;
    },
    async create(payload: any) {
      const nouveau = { _id: String(Date.now()), ...payload };
      donnees.push(nouveau);
      return nouveau;
    },
    async findByIdAndUpdate(id: string, updates: any) {
      const index = donnees.findIndex((c) => c._id === id);
      if (index === -1) return null;
      donnees[index] = { ...donnees[index], ...updates };
      return donnees[index];
    },
    async findByIdAndDelete(id: string) {
      const index = donnees.findIndex((c) => c._id === id);
      if (index === -1) return null;
      const [supprime] = donnees.splice(index, 1);
      return supprime;
    },
  };
};

const modeleMemoire = creerModeleChampionMemoire();
const app = express();
app.use(express.json());
app.use('/champions', createChampionsRouter(modeleMemoire as any));

describe('API Champions', () => {
  beforeEach(() => modeleMemoire.reset());

  it('GET /champions → retourne tous les champions', async () => {
    const res = await request(app).get('/champions');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /champions?role=Mage → filtre par rôle', async () => {
    const res = await request(app).get('/champions?role=Mage');
    expect(res.status).toBe(200);
    expect(res.body.every((c: any) => c.roles.includes('Mage'))).toBe(true);
  });

  it('POST /champions → crée un nouveau champion', async () => {
    const res = await request(app).post('/champions').send({
      nom: 'Lux',
      titre: 'Dame de Lumière',
      roles: ['Mage', 'Support'],
      region: 'Demacia',
      difficulte: 5,
      attaque: 2,
      defense: 3,
      magie: 9,
      mobilite: 5,
      portee: 'Distance',
      icone: 'lux.png',
      enRotation: false,
      tags: ['poke'],
    });
    expect(res.status).toBe(201);
    expect(res.body.nom).toBe('Lux');
  });

  it('PUT /champions/:id → met à jour un champion', async () => {
    const res = await request(app)
      .put('/champions/1')
      .send({ attaque: 5 });
    expect(res.status).toBe(200);
    expect(res.body.attaque).toBe(5);
  });

  it('DELETE /champions/:id → supprime un champion', async () => {
    const res = await request(app).delete('/champions/1');
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('supprimé');
  });
});
