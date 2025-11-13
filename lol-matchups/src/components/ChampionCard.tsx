import React from 'react';
import { Champion } from '../types/Champion';
import { useTranslation } from '../contexts/TranslationContext';

const API_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:4000';

const construireUrlImage = (icone: string) => {
  if (!icone) return '';
  if (/^https?:\/\//i.test(icone)) {
    return icone;
  }
  const base = API_URL.replace(/\/$/, '');
  const chemin = icone.startsWith('/') ? icone : `/${icone}`;
  return `${base}${chemin}`;
};

type Props = {
  champion: Champion;
};

export const ChampionCard: React.FC<Props> = ({ champion }) => {
  const { t } = useTranslation();

  return (
    <article className="champion-card">
      <img src={construireUrlImage(champion.icone)} alt={champion.nom} />
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
