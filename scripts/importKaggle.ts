import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { Champion } from '../src/models/Champion';
import { Matchup } from '../src/models/Matchup';
import { env } from '../src/config/env';

const [championsCsv, matchupsCsv] = process.argv.slice(2);

if (!championsCsv || !matchupsCsv) {
  console.error(
    'Veuillez fournir le chemin du CSV des champions puis celui des matchups.',
  );
  process.exit(1);
}

const lireCsv = (chemin: string) => {
  const contenu = fs.readFileSync(path.resolve(chemin), 'utf8');
  const lignes = contenu
    .split(/\r?\n/)
    .map((ligne) => ligne.trim())
    .filter((ligne) => ligne.length > 0);
  const [entetes, ...valeurs] = lignes;
  if (!entetes) return [];
  const colonnes = entetes.split(',').map((col) => col.trim());
  return valeurs.map((ligne) => {
    const cellules = ligne.split(',');
    const objet: Record<string, string> = {};
    colonnes.forEach((col, index) => {
      objet[col] = (cellules[index] ?? '').trim();
    });
    return objet;
  });
};

const convertirChampion = (row: Record<string, string>) => {
  const porteeSource = row.portee || row.Range || 'Distance';
  const porteeNormalisee = /corps|melee/i.test(porteeSource)
    ? 'Corps à corps'
    : 'Distance';

  return {
    nom: row.nom || row.Name,
    titre: row.titre || row.Title,
    roles: (row.roles || row.Roles || '').split('|').filter(Boolean),
    region: row.region || row.Region || 'Inconnue',
    difficulte: Number(row.difficulte ?? row.Difficulty ?? 5),
    attaque: Number(row.attaque ?? row.Attack ?? 0),
    defense: Number(row.defense ?? row.Defense ?? 0),
    magie: Number(row.magie ?? row.Magic ?? 0),
    mobilite: Number(row.mobilite ?? row.Mobility ?? 0),
    portee: porteeNormalisee,
    icone: row.icone || row.Icon || '',
    enRotation: row.enRotation === 'true' || row.Rotation === 'true',
    tags: (row.tags || row.Tags || '').split('|').filter(Boolean),
  };
};

const convertirMatchup = (row: Record<string, string>) => ({
  championPrincipal: row.championPrincipal || row.MainChampion,
  championAdverse: row.championAdverse || row.OpponentChampion,
  voie: row.voie || row.Lane || 'Mid',
  nbParties: Number(row.nbParties ?? row.TotalGames ?? 1),
  nbVictoires: Number(row.nbVictoires ?? row.Wins ?? 0),
  nbDefaites: Number(row.nbDefaites ?? row.Losses ?? 0),
  tauxVictoire: Number(row.tauxVictoire ?? row.WinRate ?? 50),
  kdaMoyen: Number(row.kdaMoyen ?? row.KDA ?? 2),
  niveauAvantage: Number(row.niveauAvantage ?? row.PowerSpike ?? 6),
  difficulte: row.difficulte || row.Difficulty || 'Équilibré',
  favorable: (row.favorable ?? row.Favorable ?? 'true') === 'true',
  conseils: (row.conseils || row.Tips || '').split('|').filter(Boolean),
  tags: (row.tags || row.Tags || '').split('|').filter(Boolean),
});

(async () => {
  await mongoose.connect(env.mongodbUri);

  const champions = lireCsv(championsCsv).map(convertirChampion);
  const matchups = lireCsv(matchupsCsv).map(convertirMatchup);

  await Champion.deleteMany({});
  await Champion.insertMany(champions);

  await Matchup.deleteMany({});
  await Matchup.insertMany(matchups);

  console.log(`Import terminé : ${champions.length} champions, ${matchups.length} matchups.`);
  await mongoose.disconnect();
})();
