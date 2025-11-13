import React, { useState } from 'react';
import { Commentaire } from '../types/Commentaire';
import { useTranslation } from '../contexts/TranslationContext';

type Props = {
  commentaires: Commentaire[];
  peutEditer: (commentaire: Commentaire) => boolean;
  onSave: (commentaire: Commentaire, contenu: Partial<Commentaire>) => Promise<void>;
  onDelete: (commentaire: Commentaire) => Promise<void>;
};

export const CommentList: React.FC<Props> = ({
  commentaires,
  peutEditer,
  onSave,
  onDelete,
}) => {
  const { t } = useTranslation();
  const [editionId, setEditionId] = useState<string | undefined>();
  const [contenu, setContenu] = useState('');

  const demarrerEdition = (commentaire: Commentaire) => {
    setEditionId(commentaire._id);
    setContenu(commentaire.contenu);
  };

  const sauvegarder = async (commentaire: Commentaire) => {
    await onSave(commentaire, { contenu });
    setEditionId(undefined);
    setContenu('');
  };

  if (commentaires.length === 0) {
    return <p className="empty-state">{t('aucunCommentaire')}</p>;
  }

  return (
    <ul className="comment-list">
      {commentaires.map((commentaire) => (
        <li key={commentaire._id}>
          <header>
            <span>{commentaire.humeur}</span>
            <small>{commentaire.langue.toUpperCase()}</small>
          </header>
          {editionId === commentaire._id ? (
            <textarea value={contenu} onChange={(e) => setContenu(e.target.value)} />
          ) : (
            <p>{commentaire.contenu}</p>
          )}
          <footer>
            <small>
              {t('difficulteRessentie')}: {commentaire.difficulteRessentie}/5
            </small>
            {peutEditer(commentaire) && (
              <div className="actions">
                {editionId === commentaire._id ? (
                  <button onClick={() => sauvegarder(commentaire)}>{t('sauvegarder')}</button>
                ) : (
                  <button onClick={() => demarrerEdition(commentaire)}>{t('modifierMatchup')}</button>
                )}
                <button className="link" onClick={() => onDelete(commentaire)}>
                  {t('supprimer')}
                </button>
              </div>
            )}
          </footer>
        </li>
      ))}
    </ul>
  );
};
