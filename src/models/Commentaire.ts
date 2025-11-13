import { InferSchemaType, Schema, model } from 'mongoose';

const CommentaireSchema = new Schema(
  {
    matchup: {
      type: Schema.Types.ObjectId,
      ref: 'Matchup',
      required: [true, 'Le matchup est requis pour commenter.'],
    },
    auteur: {
      type: Schema.Types.ObjectId,
      ref: 'Utilisateur',
      required: [true, "L'auteur est obligatoire."],
    },
    contenu: {
      type: String,
      required: [true, 'Le contenu est obligatoire.'],
      minlength: [10, 'Le commentaire doit contenir au moins 10 caractères.'],
      maxlength: [1000, 'Le commentaire est trop long.'],
    },
    humeur: {
      type: String,
      enum: ['Positif', 'Neutre', 'Négatif'],
      required: [true, "L'humeur est obligatoire."],
    },
    difficulteRessentie: {
      type: Number,
      min: [1, 'La valeur minimale est 1.'],
      max: [5, 'La valeur maximale est 5.'],
      required: true,
    },
    conseilsSupplementaires: {
      type: [String],
      default: [],
    },
    visible: {
      type: Boolean,
      default: true,
    },
    langue: {
      type: String,
      enum: ['fr', 'en'],
      default: 'fr',
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
  { timestamps: false },
);

CommentaireSchema.pre('save', function (next) {
  this.misAJourLe = new Date();
  next();
});

export const Commentaire = model('Commentaire', CommentaireSchema);
export type CommentaireDocument = InferSchemaType<typeof CommentaireSchema>;
