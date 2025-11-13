import React from 'react';
import { Champion } from '../types/Champion';
import { useTranslation } from '../contexts/TranslationContext';

type Props = {
  champion: Champion;
};

export const ChampionCard: React.FC<Props> = ({ champion }) => {
  const { t } = useTranslation();

  return (
    <article className="champion-card">
      <img src={champion.icone} alt={champion.nom} />
      <div>
        <h3>{champion.nom}</h3>
        <p>{champion.titre}</p>
        <p>
          {t('role')}: {champion.roles.join(', ')}
        </p>
        <p>
          {t('region')}: {champion.region}
        </p>
        <div className="stat-chips">
          <span>ATK {champion.attaque}</span>
          <span>DEF {champion.defense}</span>
          <span>MAG {champion.magie}</span>
          <span>{t('difficulte')} {champion.difficulte}/10</span>
        </div>
      </div>
    </article>
  );
};
