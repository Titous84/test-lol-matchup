import React from 'react';
import { Matchup } from '../types/Matchup';
import { useTranslation } from '../contexts/TranslationContext';

type Props = {
  matchup: Matchup;
  onSelect: (matchup: Matchup) => void;
  onDelete?: (matchup: Matchup) => void;
  onEdit?: (matchup: Matchup) => void;
};

export const MatchupCard: React.FC<Props> = ({
  matchup,
  onSelect,
  onDelete,
  onEdit,
}) => {
  const { t } = useTranslation();
  return (
    <article className="matchup-card">
      <header>
        <h3>
          {matchup.championPrincipal} vs {matchup.championAdverse}
        </h3>
        <span className={`badge ${matchup.favorable ? 'positive' : 'negative'}`}>
          {matchup.favorable ? t('favorable') : 'Hard'}
        </span>
      </header>
      <p>
        {t('voie')}: {matchup.voie} · {t('difficulte')}: {matchup.difficulte}
      </p>
      <div className="stat-chips">
        <span>{t('victoire')}: {matchup.tauxVictoire}%</span>
        <span>{t('nbParties')}: {matchup.nbParties}</span>
        <span>{t('kda')}: {matchup.kdaMoyen.toFixed(1)}</span>
      </div>
      <footer>
        <button onClick={() => onSelect(matchup)}>{t('commentaires')}</button>
        {onEdit && (
          <button className="link" onClick={() => onEdit(matchup)}>
            {t('modifierMatchup')}
          </button>
        )}
        {onDelete && (
          <button className="link" onClick={() => onDelete(matchup)}>
            {t('supprimer')}
          </button>
        )}
      </footer>
    </article>
  );
};
