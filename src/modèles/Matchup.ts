// Modèle Mongoose pour la collection "matchups"

const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const MatchupSchema = new Schema({
  // Nom du champion principal (ex: Ahri)
  championPrincipal: { type: String, required: true },

  // Nom du champion adverse (ex: Zed)
  championAdverse: { type: String, required: true },

  // Nombre total de parties jouées dans ce matchup
  nbParties: { type: Number, required: true, min: 1 },

  // Nombre de victoires enregistrées
  nbVictoires: { type: Number, required: true, min: 0 },

  // Nombre de défaites enregistrées
  nbDefaites: { type: Number, required: true, min: 0 },

  // Niveau à partir duquel le matchup devient favorable (1 à 18)
  avantageNiveau: { type: Number, min: 1, max: 18 },

  // Matchup considéré comme favorable ou non (true/false)
  favorable: { type: Boolean, required: true },

  // Notes personnelles pour se souvenir de stratégies, erreurs, etc.
  notesPerso: { type: [String], default: [] },

  // Date de dernière mise à jour
  dateDerniereMaj: { type: Date, default: Date.now },
});

// Validation personnalisée 1 : victoires + défaites = nbParties
MatchupSchema.pre('save', function (this: any, next: (err?: Error) => void) {
  if (this.nbVictoires + this.nbDefaites !== this.nbParties) {
    return next(
      new Error(
        '❌ Les victoires + défaites doivent être égales au nombre de parties.',
      ),
    );
  }
  next();
});

// Validation personnalisée 2 : championPrincipal ≠ championAdverse
MatchupSchema.pre('save', function (this: any, next: (err?: Error) => void) {
  if (this.championPrincipal === this.championAdverse) {
    return next(
      new Error(
        '❌ Le champion principal et le champion adverse doivent être différents.',
      ),
    );
  }
  next();
});

const Matchup = model('Matchup', MatchupSchema);
module.exports = { Matchup };
