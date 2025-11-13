// Code généré par OpenAI - Projet intégrateur League of Legends (2025)
// Script TypeScript pour télécharger les images des champions LoL

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const DOSSIER_IMAGES = path.join('dev', 'images_champions');
const URL_BASE =
  'https://ddragon.leagueoflegends.com/cdn/14.20.1/img/champion/';

// Assurer que le dossier existe
if (!fs.existsSync(DOSSIER_IMAGES)) {
  fs.mkdirSync(DOSSIER_IMAGES, { recursive: true });
}

// Charger le fichier champions.json
const data = JSON.parse(fs.readFileSync('dev/champions.json', 'utf-8'));
const champions = data.data;

(async () => {
  for (const champId in champions) {
    const nom = champions[champId].id; // ex: "Ahri"
    const url = `${URL_BASE}${nom}.png`;
    const cheminFichier = path.join(DOSSIER_IMAGES, `${nom}.png`);

    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      fs.writeFileSync(cheminFichier, response.data);
      console.log(`✅ Téléchargé : ${nom}`);
    } catch (error: any) {
      console.error(`❌ Erreur pour ${nom} :`, error.message);
    }
  }
})();

// Pour exécuter : npx ts-node scripts/telecharger_champions.ts
