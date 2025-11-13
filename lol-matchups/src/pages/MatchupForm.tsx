import React, { useEffect, useState } from 'react';
import { Matchup } from '../types/Matchup';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { createMatchup, updateMatchup } from '../services/api';

type Props = {
  matchup?: Matchup;
  onSaved: () => void;
};

const voies = ['Top', 'Jungle', 'Mid', 'Bot', 'Support'] as const;
const difficultes = ['Facile', 'Équilibré', 'Difficile'] as const;

const creerValeurInitiale = (): Matchup => ({
  championPrincipal: '',
  championAdverse: '',
  voie: 'Mid',
  nbParties: 1,
  nbVictoires: 1,
  nbDefaites: 0,
  tauxVictoire: 50,
  kdaMoyen: 2,
  niveauAvantage: 6,
  difficulte: 'Équilibré',
  favorable: true,
  conseils: [],
  tags: [],
});

const MatchupForm: React.FC<Props> = ({ matchup, onSaved }) => {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [formulaire, setFormulaire] = useState<Matchup>(creerValeurInitiale());
  const [erreurs, setErreurs] = useState<string | undefined>();

  useEffect(() => {
    if (matchup) {
      setFormulaire({
        ...matchup,
        conseils: [...(matchup.conseils ?? [])],
        tags: [...(matchup.tags ?? [])],
      });
    } else {
      setFormulaire(creerValeurInitiale());
    }
  }, [matchup]);

  const mettreAJour = (cle: keyof Matchup, valeur: string | number | boolean) => {
    setFormulaire((courant) => ({ ...courant, [cle]: valeur }));
  };

  const valider = () => {
    if (!formulaire.championPrincipal || !formulaire.championAdverse) {
      return 'Merci de sélectionner deux champions.';
    }
    if (formulaire.championPrincipal === formulaire.championAdverse) {
      return 'Les champions doivent être différents.';
    }
    if (formulaire.nbVictoires + formulaire.nbDefaites > formulaire.nbParties) {
      return 'La somme victoires/défaites dépasse le nombre de parties.';
    }
    return undefined;
  };

  const soumettre = async (event: React.FormEvent) => {
    event.preventDefault();
    const message = valider();
    if (message) {
      setErreurs(message);
      return;
    }
    if (!token) {
      setErreurs(t('loginMessage'));
      return;
    }
    try {
      if (matchup?._id) {
        await updateMatchup(matchup._id, formulaire, token);
      } else {
        await createMatchup(formulaire, token);
      }
      setErreurs(undefined);
      setFormulaire(creerValeurInitiale());
      onSaved();
    } catch (error) {
      setErreurs((error as Error).message);
    }
  };

  return (
    <form className="panel" onSubmit={soumettre}>
      <h3>{matchup ? t('modifierMatchup') : t('ajouterMatchup')}</h3>
      {erreurs && <p className="error">{erreurs}</p>}
      <div className="form-grid">
        <label>
          Champion principal
          <input
            value={formulaire.championPrincipal}
            onChange={(e) => mettreAJour('championPrincipal', e.target.value)}
            required
          />
        </label>
        <label>
          Champion adverse
          <input
            value={formulaire.championAdverse}
            onChange={(e) => mettreAJour('championAdverse', e.target.value)}
            required
          />
        </label>
        <label>
          {t('voie')}
          <select
            value={formulaire.voie}
            onChange={(e) => mettreAJour('voie', e.target.value as Matchup['voie'])}
          >
            {voies.map((voie) => (
              <option key={voie} value={voie}>
                {voie}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('difficulte')}
          <select
            value={formulaire.difficulte}
            onChange={(e) =>
              mettreAJour('difficulte', e.target.value as Matchup['difficulte'])
            }
          >
            {difficultes.map((niveau) => (
              <option key={niveau} value={niveau}>
                {niveau}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('nbParties')}
          <input
            type="number"
            min={1}
            value={formulaire.nbParties}
            onChange={(e) => mettreAJour('nbParties', Number(e.target.value))}
          />
        </label>
        <label>
          Victoires
          <input
            type="number"
            min={0}
            value={formulaire.nbVictoires}
            onChange={(e) => mettreAJour('nbVictoires', Number(e.target.value))}
          />
        </label>
        <label>
          Défaites
          <input
            type="number"
            min={0}
            value={formulaire.nbDefaites}
            onChange={(e) => mettreAJour('nbDefaites', Number(e.target.value))}
          />
        </label>
        <label>
          {t('victoire')} %
          <input
            type="number"
            min={0}
            max={100}
            value={formulaire.tauxVictoire}
            onChange={(e) => mettreAJour('tauxVictoire', Number(e.target.value))}
          />
        </label>
        <label>
          {t('kda')}
          <input
            type="number"
            step="0.1"
            min={0}
            value={formulaire.kdaMoyen}
            onChange={(e) => mettreAJour('kdaMoyen', Number(e.target.value))}
          />
        </label>
        <label>
          Niveau avantage
          <input
            type="number"
            min={1}
            max={18}
            value={formulaire.niveauAvantage}
            onChange={(e) => mettreAJour('niveauAvantage', Number(e.target.value))}
          />
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={formulaire.favorable}
            onChange={(e) => mettreAJour('favorable', e.target.checked)}
          />
          {t('favorable')}
        </label>
        <label>
          Conseils (séparés par des virgules)
          <input
            value={formulaire.conseils.join(', ')}
            onChange={(e) =>
              mettreAJour(
                'conseils',
                e.target.value
                  .split(',')
                  .map((valeur) => valeur.trim())
                  .filter(Boolean),
              )
            }
          />
        </label>
        <label>
          Tags
          <input
            value={formulaire.tags.join(', ')}
            onChange={(e) =>
              mettreAJour(
                'tags',
                e.target.value
                  .split(',')
                  .map((valeur) => valeur.trim())
                  .filter(Boolean),
              )
            }
          />
        </label>
      </div>
      <button className="primary" type="submit">
        {t('sauvegarder')}
      </button>
    </form>
  );
};

export default MatchupForm;
