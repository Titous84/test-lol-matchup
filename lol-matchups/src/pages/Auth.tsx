import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';

const Auth: React.FC = () => {
  const { seConnecter, creerCompte } = useAuth();
  const { t, langue, changerLangue } = useTranslation();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [erreur, setErreur] = useState<string | undefined>();
  const [formulaire, setFormulaire] = useState({
    prenom: '',
    nom: '',
    courriel: '',
    motDePasse: '',
  });

  const mettreAJour = (cle: keyof typeof formulaire, valeur: string) => {
    setFormulaire((courant) => ({ ...courant, [cle]: valeur }));
  };

  const soumettre = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (mode === 'login') {
        await seConnecter(formulaire.courriel, formulaire.motDePasse);
      } else {
        await creerCompte({
          ...formulaire,
          preferencesLangue: langue,
        });
      }
      setErreur(undefined);
    } catch (error) {
      setErreur((error as Error).message);
    }
  };

  return (
    <form className="panel auth" onSubmit={soumettre}>
      <header>
        <h2>{mode === 'login' ? t('connexion') : t('inscription')}</h2>
        <button type="button" className="link" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? t('inscription') : t('connexion')}
        </button>
      </header>
      {erreur && <p className="error">{erreur}</p>}
      {mode === 'register' && (
        <>
          <label>
            Prénom
            <input
              value={formulaire.prenom}
              onChange={(e) => mettreAJour('prenom', e.target.value)}
              required
            />
          </label>
          <label>
            Nom
            <input
              value={formulaire.nom}
              onChange={(e) => mettreAJour('nom', e.target.value)}
              required
            />
          </label>
        </>
      )}
      <label>
        {t('email')}
        <input
          type="email"
          value={formulaire.courriel}
          onChange={(e) => mettreAJour('courriel', e.target.value)}
          required
        />
      </label>
      <label>
        {t('motDePasse')}
        <input
          type="password"
          minLength={8}
          value={formulaire.motDePasse}
          onChange={(e) => mettreAJour('motDePasse', e.target.value)}
          required
        />
      </label>
      {mode === 'register' && (
        <label>
          {t('langue')}
          <select value={langue} onChange={(e) => changerLangue(e.target.value as 'fr' | 'en')}>
            <option value="fr">FR</option>
            <option value="en">EN</option>
          </select>
        </label>
      )}
      <button className="primary" type="submit">
        {t('confirmer')}
      </button>
      <p className="muted">{t('loginMessage')}</p>
    </form>
  );
};

export default Auth;
