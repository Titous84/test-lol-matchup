import React, { useEffect, useState } from 'react';
import { getChampions } from '../services/api';
import { Champion } from '../types/Champion';
import { ChampionCard } from '../components/ChampionCard';
import { PageSection } from '../components/PageSection';
import { useTranslation } from '../contexts/TranslationContext';

const roles = ['Mage', 'Assassin', 'Combattant', 'Tank', 'Support', 'Tireur'];

const regions = ['Ionia', 'Demacia', 'Noxus', 'Piltover', 'Zaun', 'Shurima'];

const ChampionList: React.FC = () => {
  const { t } = useTranslation();
  const [champions, setChampions] = useState<Champion[]>([]);
  const [filtreRole, setFiltreRole] = useState('');
  const [filtreRegion, setFiltreRegion] = useState('');

  useEffect(() => {
    getChampions({ role: filtreRole || undefined, region: filtreRegion || undefined })
      .then((data) => setChampions(data))
      .catch((error) => console.error('Erreur champions', error));
  }, [filtreRole, filtreRegion]);

  return (
    <PageSection
      title={t('champions')}
      actions={
        <div className="filters">
          <label>
            {t('role')}
            <select value={filtreRole} onChange={(e) => setFiltreRole(e.target.value)}>
              <option value="">--</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t('region')}
            <select value={filtreRegion} onChange={(e) => setFiltreRegion(e.target.value)}>
              <option value="">--</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </label>
        </div>
      }
    >
      <div className="grid">
        {champions.map((champion) => (
          <ChampionCard key={champion._id} champion={champion} />
        ))}
      </div>
    </PageSection>
  );
};

export default ChampionList;
