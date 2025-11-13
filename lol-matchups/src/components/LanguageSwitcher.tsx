import React from 'react';
import { useTranslation } from '../contexts/TranslationContext';

export const LanguageSwitcher: React.FC = () => {
  const { langue, changerLangue, t } = useTranslation();

  return (
    <div className="language-switcher">
      <span>{t('langue')} :</span>
      <button
        className={langue === 'fr' ? 'active' : ''}
        onClick={() => changerLangue('fr')}
      >
        FR
      </button>
      <button
        className={langue === 'en' ? 'active' : ''}
        onClick={() => changerLangue('en')}
      >
        EN
      </button>
    </div>
  );
};
