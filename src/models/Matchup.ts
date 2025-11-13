import { InferSchemaType, Schema, model } from 'mongoose';

const MatchupSchema = new Schema(
  {
    championPrincipal: {
      type: Schema.Types.ObjectId,
      ref: 'Champion',
      required: [true, 'Le champion principal est obligatoire.'],
    },
    championAdverse: {
      type: Schema.Types.ObjectId,
      ref: 'Champion',
      required: [true, "Le champion adverse est obligatoire."],
    },
    voie: {
      type: String,
      enum: ['Top', 'Jungle', 'Mid', 'Bot', 'Support'],
      required: [true, 'La voie est requise.'],
    },
    nbParties: {
      type: Number,
      required: true,
      min: [1, 'Une partie minimum est requise.'],
    },
    nbVictoires: {
      type: Number,
      required: true,
      min: [0, 'Les victoires ne peuvent pas être négatives.'],
    },
    nbDefaites: {
      type: Number,
      required: true,
      min: [0, 'Les défaites ne peuvent pas être négatives.'],
    },
    tauxVictoire: {
      type: Number,
      required: true,
      min: [0, 'Le taux doit être supérieur ou égal à 0%.'],
      max: [100, 'Le taux doit être inférieur ou égal à 100%.'],
    },
    kdaMoyen: {
      type: Number,
      required: true,
      min: [0, 'Le KDA doit être positif.'],
    },
    niveauAvantage: {
      type: Number,
      min: [1, 'Le niveau minimal est 1.'],
      max: [18, 'Le niveau maximal est 18.'],
      required: true,
    },
    difficulte: {
      type: String,
      enum: ['Facile', 'Équilibré', 'Difficile'],
      required: true,
    },
    favorable: {
      type: Boolean,
      required: true,
    },
    conseils: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    visible: {
      type: Boolean,
      default: true,
    },
    creeLe: {
      type: Date,
      default: Date.now,
    },
    misAJourLe: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  },
);

MatchupSchema.pre('validate', function (next) {
  if (this.championPrincipal?.toString() === this.championAdverse?.toString()) {
    return next(
      new Error(
        '❌ Le champion principal doit être différent du champion adverse.',
      ),
    );
  }

  if (this.nbVictoires + this.nbDefaites > this.nbParties) {
    return next(
      new Error(
        '❌ Les victoires + défaites ne peuvent pas dépasser le nombre de parties.',
      ),
    );
  }

  if (
    Math.round((this.nbVictoires / this.nbParties) * 100) !==
    Math.round(this.tauxVictoire)
  ) {
    return next(
      new Error(
        '❌ Le taux de victoire doit correspondre aux victoires et au nombre de parties.',
      ),
    );
  }

  next();
});

MatchupSchema.pre('save', function (next) {
  this.misAJourLe = new Date();
  next();
});

export const Matchup = model('Matchup', MatchupSchema);
export type MatchupDocument = InferSchemaType<typeof MatchupSchema>;
