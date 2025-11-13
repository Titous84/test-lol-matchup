import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';

export const AuthStatus: React.FC<{ onLoginClick: () => void }> = ({
  onLoginClick,
}) => {
  const { utilisateur, seDeconnecter } = useAuth();
  const { t } = useTranslation();

  if (!utilisateur) {
    return (
      <button className="primary" onClick={onLoginClick}>
        {t('connexion')}
      </button>
    );
  }

  return (
    <div className="auth-status">
      <span>
        {t('statutConnecte')} {utilisateur.prenom}
      </span>
      <button onClick={seDeconnecter}>{t('deconnexion')}</button>
    </div>
  );
};
