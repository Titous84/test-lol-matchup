import React, { useState } from 'react';
import './App.css';
import ChampionList from './pages/ChampionList';
import MatchupList from './pages/MatchupList';
import Auth from './pages/Auth';
import { TranslationProvider } from './contexts/TranslationContext';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { AuthStatus } from './components/AuthStatus';
import { useTranslation } from './contexts/TranslationContext';

const Navigation: React.FC<{
  page: string;
  onNavigate: (page: 'champions' | 'matchups' | 'auth') => void;
}> = ({ page, onNavigate }) => {
  const { t } = useTranslation();
  return (
    <nav>
      <button className={page === 'champions' ? 'active' : ''} onClick={() => onNavigate('champions')}>
        {t('champions')}
      </button>
      <button className={page === 'matchups' ? 'active' : ''} onClick={() => onNavigate('matchups')}>
        {t('matchups')}
      </button>
      <button className={page === 'auth' ? 'active' : ''} onClick={() => onNavigate('auth')}>
        {t('connexion')}
      </button>
    </nav>
  );
};

const Contenu: React.FC<{ page: 'champions' | 'matchups' | 'auth' }> = ({ page }) => {
  if (page === 'matchups') return <MatchupList />;
  if (page === 'auth') return <Auth />;
  return <ChampionList />;
};

const AppShell: React.FC = () => {
  const [page, setPage] = useState<'champions' | 'matchups' | 'auth'>('champions');
  return (
    <div className="App">
      <header className="app-header">
        <div>
          <h1>League Matchups</h1>
          <LanguageSwitcher />
        </div>
        <Navigation page={page} onNavigate={setPage} />
        <AuthStatus onLoginClick={() => setPage('auth')} />
      </header>
      <main>
        <Contenu page={page} />
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <TranslationProvider>
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  </TranslationProvider>
);

export default App;
