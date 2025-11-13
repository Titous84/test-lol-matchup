import { Schema, model, InferSchemaType } from 'mongoose';

const ChampionSchema = new Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom du champion est obligatoire.'],
      unique: true,
      trim: true,
    },
    titre: {
      type: String,
      required: [true, 'Le titre du champion est obligatoire.'],
      trim: true,
    },
    roles: {
      type: [String],
      required: [true, 'Au moins un rôle est requis.'],
    },
    region: {
      type: String,
      required: [true, 'La région est obligatoire.'],
    },
    difficulte: {
      type: Number,
      required: [true, 'La difficulté est obligatoire.'],
      min: [1, 'La difficulté minimale est 1.'],
      max: [10, 'La difficulté maximale est 10.'],
    },
    attaque: {
      type: Number,
      required: true,
      min: [0, 'Le score minimal est 0.'],
      max: [10, 'Le score maximal est 10.'],
    },
    defense: {
      type: Number,
      required: true,
      min: [0, 'Le score minimal est 0.'],
      max: [10, 'Le score maximal est 10.'],
    },
    magie: {
      type: Number,
      required: true,
      min: [0, 'Le score minimal est 0.'],
      max: [10, 'Le score maximal est 10.'],
    },
    mobilite: {
      type: Number,
      required: true,
      min: [0, 'Le score minimal est 0.'],
      max: [10, 'Le score maximal est 10.'],
    },
    portee: {
      type: String,
      enum: ['Corps à corps', 'Distance', 'Hybride'],
      required: [true, 'La portée du champion est obligatoire.'],
    },
    icone: {
      type: String,
      required: [true, 'Une icône est obligatoire.'],
    },
    enRotation: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
    miseAJour: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  },
);

export const Champion = model('Champion', ChampionSchema);
export type ChampionDocument = InferSchemaType<typeof ChampionSchema>;
