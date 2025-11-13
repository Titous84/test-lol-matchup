import React, { createContext, useContext, useState } from 'react';
import { Langue, traductions } from '../i18n/translations';

type TranslationContextValue = {
  langue: Langue;
  t: (cle: string) => string;
  changerLangue: (langue: Langue) => void;
};

const TranslationContext = createContext<TranslationContextValue | undefined>(
  undefined,
);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [langue, setLangue] = useState<Langue>('fr');

  const t = (cle: string) => traductions[langue][cle] ?? cle;

  return (
    <TranslationContext.Provider
      value={{ langue, t, changerLangue: (nouvelleLangue) => setLangue(nouvelleLangue) }}
    >
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const contexte = useContext(TranslationContext);
  if (!contexte) {
    throw new Error('useTranslation doit être utilisé dans TranslationProvider.');
  }
  return contexte;
};
