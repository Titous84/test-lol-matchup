// Script pour importer les champions dans MongoDB local

const mongoose = require('mongoose');
const fs = require('fs');
const { Champion } = require('../src/modèles/Champion');

async function importer() {
  await mongoose.connect('mongodb://127.0.0.1:27017/league');

  const data = JSON.parse(
    fs.readFileSync('dev/champions_simplifies.json', 'utf-8'),
  );

  try {
    await Champion.deleteMany({});
    console.log('🗑 Ancienne collection nettoyée.');
    await Champion.insertMany(data);
    console.log('✅ Champions importés avec succès !');
  } catch (err: any) {
    console.error("❌ Erreur lors de l'import :", err.message);
  } finally {
    await mongoose.disconnect();
  }
}

importer();

// Pour exécuter : npx ts-node scripts/importer_champions.ts
