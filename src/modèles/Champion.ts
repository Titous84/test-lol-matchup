// Modèle Mongoose pour la collection "champions"

const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const ChampionSchema = new Schema({
  // Nom du champion (unique)
  nom: { type: String, required: true, unique: true },

  // Titre du champion (ex: "Renard à neuf queues")
  titre: { type: String, required: true },

  // Rôles associés (ex: ["Mage", "Assassin"])
  role: { type: [String], required: true },

  // Image locale ou URL
  image: { type: String, required: true },

  // Statistiques de base
  attaque: { type: Number, required: true },
  defense: { type: Number, required: true },
  magie: { type: Number, required: true },
  difficulte: { type: Number, required: true },
});

const Champion = model('Champion', ChampionSchema);
module.exports = { Champion };
