export interface Matchup {
  _id?: string;
  championPrincipal: string;
  championAdverse: string;
  voie: 'Top' | 'Jungle' | 'Mid' | 'Bot' | 'Support';
  nbParties: number;
  nbVictoires: number;
  nbDefaites: number;
  tauxVictoire: number;
  kdaMoyen: number;
  niveauAvantage: number;
  difficulte: 'Facile' | 'Équilibré' | 'Difficile';
  favorable: boolean;
  conseils: string[];
  tags: string[];
  visible?: boolean;
  creeLe?: string;
  misAJourLe?: string;
}
