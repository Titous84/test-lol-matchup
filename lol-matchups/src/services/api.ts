import axios from 'axios';
import { Champion } from '../types/Champion';
import { Matchup } from '../types/Matchup';

const api = axios.create({
  baseURL: 'http://localhost:4000',
});

// === Champions ===
export const getChampions = () => api.get<Champion[]>('/champions');

// === Matchups ===
export const getMatchups = () => api.get<Matchup[]>('matchups');
export const createMatchup = (data: Matchup) =>
  api.post<Matchup>('/matchups', data);
export const updateMatchup = (id: string, data: Matchup) =>
  api.put<Matchup>(`/matchups/${id}`, data);
export const deleteMatchup = (id: string) => api.delete(`/matchups/${id}`);
