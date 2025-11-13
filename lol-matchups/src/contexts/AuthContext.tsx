import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { login, register, fetchProfile } from '../services/api';

type Utilisateur = {
  id: string;
  prenom: string;
  nom: string;
  courriel: string;
  roles: string[];
  preferencesLangue: 'fr' | 'en';
};

type AuthContextValue = {
  utilisateur?: Utilisateur;
  token?: string;
  chargerProfil: () => Promise<void>;
  seConnecter: (courriel: string, motDePasse: string) => Promise<void>;
  creerCompte: (data: {
    prenom: string;
    nom: string;
    courriel: string;
    motDePasse: string;
    preferencesLangue: 'fr' | 'en';
  }) => Promise<void>;
  seDeconnecter: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'lol-matchups-token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | undefined>(() =>
    localStorage.getItem(STORAGE_KEY) ?? undefined,
  );
  const [utilisateur, setUtilisateur] = useState<Utilisateur | undefined>();

  const seConnecter = async (courriel: string, motDePasse: string) => {
    const reponse = await login({ courriel, motDePasse });
    setToken(reponse.token);
    setUtilisateur(reponse.utilisateur);
  };

  const creerCompte = async (data: {
    prenom: string;
    nom: string;
    courriel: string;
    motDePasse: string;
    preferencesLangue: 'fr' | 'en';
  }) => {
    const reponse = await register(data);
    setToken(reponse.token);
    setUtilisateur(reponse.utilisateur);
  };

  const seDeconnecter = () => {
    setToken(undefined);
  };

  const chargerProfil = useCallback(async () => {
    if (!token) return;
    try {
      const profil = await fetchProfile(token);
      setUtilisateur(profil);
    } catch (error) {
      console.error('Erreur lors du chargement du profil', error);
      setToken(undefined);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      localStorage.setItem(STORAGE_KEY, token);
      void chargerProfil();
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setUtilisateur(undefined);
    }
  }, [token, chargerProfil]);

  return (
    <AuthContext.Provider
      value={{ utilisateur, token, seConnecter, seDeconnecter, creerCompte, chargerProfil }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const contexte = useContext(AuthContext);
  if (!contexte) {
    throw new Error('useAuth doit être utilisé dans AuthProvider.');
  }
  return contexte;
};
