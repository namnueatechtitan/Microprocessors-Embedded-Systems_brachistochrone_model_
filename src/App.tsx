import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import GamePage from './pages/GamePage';

type PageKey = 'dashboard' | 'game';

export default function App() {
  const [page, setPage] = useState<PageKey>('dashboard');

  if (page === 'game') {
    return <GamePage onNavigate={setPage} />;
  }

  return <Dashboard onNavigate={setPage} />;
}
