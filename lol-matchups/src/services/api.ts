import { Champion } from '../types/Champion';
import { Matchup } from '../types/Matchup';
import { Commentaire } from '../types/Commentaire';

const API_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:4000';

type RequestOptions = RequestInit & { token?: string };

type AuthResponse = {
  utilisateur: {
    id: string;
    prenom: string;
    nom: string;
    courriel: string;
    roles: string[];
    preferencesLangue: 'fr' | 'en';
  };
  token: string;
};

const requete = async <T>(endpoint: string, options: RequestOptions = {}) => {
  const { token, headers: customHeaders, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders ?? {}),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Erreur API');
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
};

export const getChampions = (params: {
  role?: string;
  region?: string;
  nom?: string;
} = {}) => {
  const query = new URLSearchParams();
  if (params.role) query.set('role', params.role);
  if (params.region) query.set('region', params.region);
  if (params.nom) query.set('nom', params.nom);
  const suffixe = query.toString() ? `?${query.toString()}` : '';
  return requete<Champion[]>(`/champions${suffixe}`);
};

export const getMatchups = (params: {
  championPrincipal?: string;
  championAdverse?: string;
  voie?: string;
  favorable?: boolean;
} = {}) => {
  const query = new URLSearchParams();
  if (params.championPrincipal) query.set('championPrincipal', params.championPrincipal);
  if (params.championAdverse) query.set('championAdverse', params.championAdverse);
  if (params.voie) query.set('voie', params.voie);
  if (typeof params.favorable === 'boolean')
    query.set('favorable', String(params.favorable));
  const suffixe = query.toString() ? `?${query.toString()}` : '';
  return requete<Matchup[]>(`/matchups${suffixe}`);
};

export const createMatchup = (data: Partial<Matchup>, token: string) =>
  requete<Matchup>('/matchups', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });

export const updateMatchup = (id: string, data: Partial<Matchup>, token: string) =>
  requete<Matchup>(`/matchups/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    token,
  });

export const deleteMatchup = (id: string, token: string) =>
  requete<{ message: string }>(`/matchups/${id}`, {
    method: 'DELETE',
    token,
  });

export const getCommentaires = (params: { matchup?: string } = {}) => {
  const query = new URLSearchParams();
  if (params.matchup) query.set('matchup', params.matchup);
  const suffixe = query.toString() ? `?${query.toString()}` : '';
  return requete<Commentaire[]>(`/commentaires${suffixe}`);
};

export const createCommentaire = (
  data: Omit<Commentaire, '_id' | 'auteur' | 'creeLe' | 'misAJourLe'>,
  token: string,
) =>
  requete<Commentaire>('/commentaires', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });

export const updateCommentaire = (
  id: string,
  data: Partial<Commentaire>,
  token: string,
) =>
  requete<Commentaire>(`/commentaires/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    token,
  });

export const deleteCommentaire = (id: string, token: string) =>
  requete<{ message: string }>(`/commentaires/${id}`, {
    method: 'DELETE',
    token,
  });

export const login = (data: { courriel: string; motDePasse: string }) =>
  requete<AuthResponse>('/auth/connexion', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const register = (data: {
  prenom: string;
  nom: string;
  courriel: string;
  motDePasse: string;
  preferencesLangue: 'fr' | 'en';
}) =>
  requete<AuthResponse>('/auth/inscription', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const fetchProfile = (token: string) =>
  requete<AuthResponse['utilisateur']>('/auth/profil', {
    method: 'GET',
    token,
  });
