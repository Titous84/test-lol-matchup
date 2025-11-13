export interface Matchup {
  _id?: string;
  championPrincipal: string;
  championAdverse: string;
  nbParties: number;
  nbVictoires: number;
  nbDefaites: number;
  avantageNiveau?: number;
  favorable: boolean;
  notesPerso: string[];
  dateDerniereMaj?: string;
}
