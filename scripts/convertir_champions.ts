// Code généré par OpenAI - Projet intégrateur League of Legends (2025)
// Script pour convertir champions.json (Riot) en champions_simplifies.json (MongoDB)

const fs = require('fs');
const path = require('path');

const FICHIER_ENTREE = path.join('dev', 'champions.json');
const FICHIER_SORTIE = path.join('dev', 'champions_simplifies.json');
const DOSSIER_IMAGES = 'dev/images_champions';

// Charger le fichier officiel Riot
const data = JSON.parse(fs.readFileSync(FICHIER_ENTREE, 'utf-8'));
const champions = data.data;

// Nouveau tableau simplifié
const championsSimplifies: any[] = [];

for (const champId in champions) {
  const champ = champions[champId];

  championsSimplifies.push({
    nom: champ.name, // "Ahri"
    titre: champ.title, // "Renard à neuf queues"
    role: champ.tags, // ["Mage", "Assassin"]
    image: path.join(DOSSIER_IMAGES, champ.image.full), // "dev/images_champions/Ahri.png"
    attaque: champ.info.attack, // 3
    defense: champ.info.defense, // 4
    magie: champ.info.magic, // 8
    difficulte: champ.info.difficulty, // 5
  });
}

// Écrire le fichier de sortie
fs.writeFileSync(
  FICHIER_SORTIE,
  JSON.stringify(championsSimplifies, null, 2),
  'utf-8',
);

console.log(`✅ Fichier généré : ${FICHIER_SORTIE}`);
console.log(`Nombre de champions : ${championsSimplifies.length}`);

// Pour exécuter : npx ts-node scripts/convertir_champions.ts
