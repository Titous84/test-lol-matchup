import React, { useEffect, useState } from 'react';
import { getChampions } from '../services/api';
import { Champion } from '../types/Champion';

const ChampionList: React.FC = () => {
  const [champions, setChampions] = useState<Champion[]>([]);

  useEffect(() => {
    getChampions().then((res) => setChampions(res.data));
  }, []);

  return (
    <div>
      <h2>Liste des champions</h2>
      <ul>
        {champions.map((champion) => (
          <li key={champion._id}>
            <img src={champion.image} alt={champion.nom} width={40} />
            <strong>{champion.nom}</strong> – {champion.role.join(', ')}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChampionList;
