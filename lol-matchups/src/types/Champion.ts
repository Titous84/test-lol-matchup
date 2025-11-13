export interface Champion {
  _id: string;
  nom: string;
  titre: string;
  roles: string[];
  region: string;
  difficulte: number;
  attaque: number;
  defense: number;
  magie: number;
  mobilite: number;
  portee: string;
  icone: string;
  enRotation: boolean;
  tags: string[];
}
