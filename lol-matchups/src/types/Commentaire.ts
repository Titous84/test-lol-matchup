export interface Commentaire {
  _id: string;
  matchup: string;
  auteur: string;
  contenu: string;
  humeur: 'Positif' | 'Neutre' | 'Négatif';
  difficulteRessentie: number;
  conseilsSupplementaires: string[];
  visible: boolean;
  langue: 'fr' | 'en';
  creeLe?: string;
  misAJourLe?: string;
}
