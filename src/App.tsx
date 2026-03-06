import { useState } from 'react';
import MQTTListener from './components/MQTTListener';
import Dashboard from './pages/Dashboard';
import FeedbackPage from './pages/FeedbackPage';
import GamePage from './pages/GamePage';
import { initialFeedbackStats } from './types/feedback';
import type { PageKey } from './types/navigation';

export default function App() {
  const simpleMqttMode = import.meta.env.VITE_SIMPLE_MQTT_LISTENER === 'true';
  const [page, setPage] = useState<PageKey>('dashboard');
  const [feedbackStats, setFeedbackStats] = useState(initialFeedbackStats);

  if (simpleMqttMode) {
    return <MQTTListener />;
  }

  if (page === 'game') {
    return <GamePage onNavigate={setPage} onUpdateFeedback={setFeedbackStats} />;
  }

  if (page === 'feedback') {
    return (
      <FeedbackPage
        onNavigate={setPage}
        stats={feedbackStats}
        onResetFeedback={() => setFeedbackStats(initialFeedbackStats)}
      />
    );
  }

  return <Dashboard onNavigate={setPage} />;
}
