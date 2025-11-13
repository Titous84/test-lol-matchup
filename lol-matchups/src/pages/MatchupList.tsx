import React, { useEffect, useState } from 'react';
import {
  getMatchups,
  deleteMatchup,
  getCommentaires,
  createCommentaire,
  updateCommentaire,
  deleteCommentaire,
} from '../services/api';
import { Matchup } from '../types/Matchup';
import { Commentaire } from '../types/Commentaire';
import { PageSection } from '../components/PageSection';
import { MatchupCard } from '../components/MatchupCard';
import { CommentList } from '../components/CommentList';
import MatchupForm from './MatchupForm';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';

const MatchupList: React.FC = () => {
  const { token, utilisateur } = useAuth();
  const { t } = useTranslation();
  const [matchups, setMatchups] = useState<Matchup[]>([]);
  const [selection, setSelection] = useState<Matchup | undefined>();
  const [edition, setEdition] = useState<Matchup | undefined>();
  const [commentaires, setCommentaires] = useState<Commentaire[]>([]);
  const [commentaireTexte, setCommentaireTexte] = useState('');
  const [humeur, setHumeur] = useState<Commentaire['humeur']>('Neutre');
  const [difficulte, setDifficulte] = useState(3);
  const [messageErreur, setMessageErreur] = useState<string | undefined>();

  const chargerMatchups = () => {
    getMatchups()
      .then((data) => setMatchups(data))
      .catch((error) => setMessageErreur(error.message));
  };

  useEffect(() => {
    chargerMatchups();
  }, []);

  const chargerCommentaires = (matchupId: string) => {
    getCommentaires({ matchup: matchupId })
      .then((data) => setCommentaires(data))
      .catch((error) => setMessageErreur(error.message));
  };

  const selectionnerMatchup = (matchup: Matchup) => {
    setSelection(matchup);
    chargerCommentaires(matchup._id!);
  };

  const supprimer = async (matchup: Matchup) => {
    if (!token || !matchup._id) {
      setMessageErreur(t('loginMessage'));
      return;
    }
    await deleteMatchup(matchup._id, token);
    chargerMatchups();
    if (selection?._id === matchup._id) {
      setSelection(undefined);
      setCommentaires([]);
    }
    setMessageErreur(undefined);
  };

  const creerCommentaire = async () => {
    if (!token || !selection) {
      setMessageErreur(t('loginMessage'));
      return;
    }
    if (!commentaireTexte.trim()) {
      setMessageErreur(t('erreurGenerique'));
      return;
    }
    await createCommentaire(
      {
        matchup: selection._id!,
        contenu: commentaireTexte,
        humeur,
        difficulteRessentie: difficulte,
        conseilsSupplementaires: [],
        visible: true,
        langue: utilisateur?.preferencesLangue ?? 'fr',
      },
      token,
    );
    setMessageErreur(undefined);
    setCommentaireTexte('');
    chargerCommentaires(selection._id!);
  };

  const mettreAJourCommentaire = async (
    commentaire: Commentaire,
    payload: Partial<Commentaire>,
  ) => {
    if (!token) {
      setMessageErreur(t('loginMessage'));
      return;
    }
    await updateCommentaire(commentaire._id, payload, token);
    if (selection?._id) chargerCommentaires(selection._id);
  };

  const supprimerCommentaire = async (commentaire: Commentaire) => {
    if (!token) {
      setMessageErreur(t('loginMessage'));
      return;
    }
    await deleteCommentaire(commentaire._id, token);
    if (selection?._id) chargerCommentaires(selection._id);
  };

  return (
    <div className="matchups-grid">
      <div>
        <PageSection title={t('matchups')}>
          {messageErreur && <p className="error">{messageErreur}</p>}
          <div className="grid">
            {matchups.map((matchup) => (
              <MatchupCard
                key={matchup._id}
                matchup={matchup}
                onSelect={selectionnerMatchup}
                onEdit={(m) => setEdition(m)}
                onDelete={token ? supprimer : undefined}
              />
            ))}
          </div>
        </PageSection>
        {selection && (
          <PageSection title={t('commentairesTitre')}>
            <div className="panel">
              <textarea
                placeholder={t('creerCommentaire')}
                value={commentaireTexte}
                onChange={(e) => setCommentaireTexte(e.target.value)}
              />
              <div className="form-inline">
                <label>
                  {t('humeur')}
                  <select value={humeur} onChange={(e) => setHumeur(e.target.value as Commentaire['humeur'])}>
                    <option value="Positif">Positif</option>
                    <option value="Neutre">Neutre</option>
                    <option value="Négatif">Négatif</option>
                  </select>
                </label>
                <label>
                  {t('difficulteRessentie')}
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={difficulte}
                    onChange={(e) => setDifficulte(Number(e.target.value))}
                  />
                </label>
                <button className="primary" onClick={creerCommentaire}>
                  {t('creerCommentaire')}
                </button>
              </div>
            </div>
            <CommentList
              commentaires={commentaires}
              peutEditer={(commentaire) =>
                commentaire.auteur === utilisateur?.id ||
                utilisateur?.roles?.includes('administrateur') === true
              }
              onSave={mettreAJourCommentaire}
              onDelete={supprimerCommentaire}
            />
          </PageSection>
        )}
      </div>
      <div>
        <MatchupForm
          matchup={edition}
          onSaved={() => {
            setEdition(undefined);
            chargerMatchups();
          }}
        />
      </div>
    </div>
  );
};

export default MatchupList;
