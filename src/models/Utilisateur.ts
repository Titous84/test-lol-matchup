import { InferSchemaType, Schema, model } from 'mongoose';
import { comparerMotDePasse, hacherMotDePasse } from '../services/motDePasse';

const UtilisateurSchema = new Schema(
  {
    prenom: {
      type: String,
      required: [true, 'Le prénom est obligatoire.'],
      trim: true,
    },
    nom: {
      type: String,
      required: [true, 'Le nom est obligatoire.'],
      trim: true,
    },
    courriel: {
      type: String,
      required: [true, 'Le courriel est obligatoire.'],
      unique: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Courriel invalide.'],
    },
    motDePasse: {
      type: String,
      required: [true, 'Le mot de passe est obligatoire.'],
      minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères.'],
    },
    roles: {
      type: [String],
      enum: ['joueur', 'administrateur', 'analyste'],
      default: ['joueur'],
    },
    actif: {
      type: Boolean,
      default: true,
    },
    derniereConnexion: {
      type: Date,
    },
    preferencesLangue: {
      type: String,
      enum: ['fr', 'en'],
      default: 'fr',
    },
    avatar: {
      type: String,
      default: '',
    },
    creeLe: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false },
);

UtilisateurSchema.pre('save', async function (next) {
  if (this.isModified('motDePasse')) {
    this.motDePasse = await hacherMotDePasse(this.motDePasse);
  }
  next();
});

UtilisateurSchema.methods.comparerMotDePasse = async function (motDePasse: string) {
  return comparerMotDePasse(motDePasse, this.motDePasse);
};

export const Utilisateur = model('Utilisateur', UtilisateurSchema);
export type UtilisateurDocument = InferSchemaType<typeof UtilisateurSchema> & {
  comparerMotDePasse: (motDePasse: string) => Promise<boolean>;
};
