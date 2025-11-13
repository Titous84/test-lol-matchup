export interface Champion {
  _id: string;
  nom: string;
  titre: string;
  role: string[];
  image: string;
  attaque: number;
  defense: number;
  magie: number;
  difficulte: number;
}
