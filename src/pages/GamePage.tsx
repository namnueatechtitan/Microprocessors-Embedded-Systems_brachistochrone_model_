import { useEffect, useMemo, useRef, useState } from 'react';
import type { MqttClient } from 'mqtt';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Sidebar from '../components/Sidebar';
import ExperimentStatus from '../components/ExperimentStatus';
import PredictionCard from '../components/PredictionCard';
import ScorePanel from '../components/ScorePanel';
import { createMqttClient, MQTT_TOPIC } from '../mqtt/mqttClient';

type PageKey = 'dashboard' | 'game';
type LaneId = 1 | 2 | 3;
type GamePhase = 'idle' | 'countdown' | 'running' | 'finished';

interface GamePageProps {
  onNavigate: (page: PageKey) => void;
}

interface LivePoint {
  step: number;
  lane1: number | null;
  lane2: number | null;
  lane3: number | null;
}

const PREDICT_TOPIC = 'brachistochrone/game/predict';
const START_TOPIC = 'brachistochrone/game/start';

const laneLabels: Record<LaneId, string> = {
  1: 'Cycloid',
  2: 'Straight Line',
  3: 'Circular Arc',
};

export default function GamePage({ onNavigate }: GamePageProps) {
  const [mqttConnected, setMqttConnected] = useState(false);
  const [selectedLane, setSelectedLane] = useState<LaneId | null>(null);
  const [locked, setLocked] = useState(false);
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [countdown, setCountdown] = useState(3);
  const [progress, setProgress] = useState(0);
  const [laneTimes, setLaneTimes] = useState<Record<LaneId, number | null>>({
    1: null,
    2: null,
    3: null,
  });
  const [liveData, setLiveData] = useState<LivePoint[]>([]);
  const [score, setScore] = useState({ points: 0, correct: 0, wrong: 0 });
  const clientRef = useRef<MqttClient | null>(null);
  const phaseRef = useRef<GamePhase>(phase);
  const streamStepRef = useRef(1);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const client = createMqttClient();
    clientRef.current = client;

    client.on('connect', () => {
      setMqttConnected(true);
      client.subscribe(MQTT_TOPIC);
    });
    client.on('reconnect', () => setMqttConnected(false));
    client.on('close', () => setMqttConnected(false));
    client.on('error', () => setMqttConnected(false));

    client.on('message', (topic, payload) => {
      if (topic !== MQTT_TOPIC || phaseRef.current !== 'running') return;
      try {
        const data = JSON.parse(payload.toString()) as { lane?: number; time?: number };
        if (![1, 2, 3].includes(Number(data.lane))) return;
        if (typeof data.time !== 'number') return;
        const lane = data.lane as LaneId;
        const laneTime = data.time;
        setLaneTimes((prev) => ({ ...prev, [lane]: laneTime }));
        setLiveData((prev) => {
          const last = prev[prev.length - 1] ?? { step: 0, lane1: null, lane2: null, lane3: null };
          const next: LivePoint = {
            step: streamStepRef.current,
            lane1: last.lane1,
            lane2: last.lane2,
            lane3: last.lane3,
          };
          if (lane === 1) next.lane1 = laneTime;
          if (lane === 2) next.lane2 = laneTime;
          if (lane === 3) next.lane3 = laneTime;
          streamStepRef.current += 1;
          return [...prev.slice(-39), next];
        });
      } catch {
        // Ignore malformed payload.
      }
    });

    return () => {
      client.end(true);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'running') return;
    const timer = window.setInterval(() => {
      setProgress((prev) => Math.min(prev + 2, 95));
    }, 120);
    return () => window.clearInterval(timer);
  }, [phase]);

  const winner = useMemo(() => {
    if (laneTimes[1] == null || laneTimes[2] == null || laneTimes[3] == null) return null;
    return ([1, 2, 3] as LaneId[]).reduce(
      (best, lane) => ((laneTimes[lane] ?? Number.POSITIVE_INFINITY) < (laneTimes[best] ?? Number.POSITIVE_INFINITY) ? lane : best),
      1 as LaneId,
    );
  }, [laneTimes]);

  useEffect(() => {
    if (phase !== 'running') return;
    if (!winner) return;

    setProgress(100);
    setPhase('finished');
    setScore((prev) => {
      if (selectedLane === winner) {
        return { points: prev.points + 10, correct: prev.correct + 1, wrong: prev.wrong };
      }
      return { points: prev.points, correct: prev.correct, wrong: prev.wrong + 1 };
    });
  }, [phase, selectedLane, winner]);

  const handleSubmitPrediction = () => {
    if (!selectedLane || locked) return;
    clientRef.current?.publish(PREDICT_TOPIC, JSON.stringify({ lane: selectedLane, ts: Date.now() }));
    setLocked(true);
  };

  const handleStart = () => {
    if (!locked || phase === 'running' || phase === 'countdown') return;
    setLaneTimes({ 1: null, 2: null, 3: null });
    setLiveData([]);
    streamStepRef.current = 1;
    setProgress(0);
    setPhase('countdown');
    setCountdown(3);
    clientRef.current?.publish(START_TOPIC, JSON.stringify({ start: true, ts: Date.now() }));

    const interval = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          setPhase('running');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resultMessage =
    phase === 'finished' && winner && selectedLane
      ? selectedLane === winner
        ? '🎉 Correct Prediction! +10 points'
        : `❌ Wrong Prediction. Correct answer: Lane ${winner}`
      : null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#0b122b_0,_#020617_40%)] p-4 text-slate-100 lg:p-6">
      <div className="mx-auto flex max-w-[1600px] gap-4">
        <Sidebar currentRound={1} totalRounds={10} activePage="game" onNavigate={onNavigate} />

        <section className="w-full space-y-4">
          <header className="rounded-3xl border border-slate-700/80 bg-slate-900/70 p-5 backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-4xl font-bold text-white">🎮 Predict the Fastest Path</h2>
                <p className="mt-2 max-w-3xl text-slate-300">
                  Three tracks have different shapes. Which path will reach the finish line first?
                  Choose your prediction before starting the experiment.
                </p>
              </div>
              <ScorePanel score={score.points} correct={score.correct} wrong={score.wrong} />
            </div>
          </header>

          <section className="rounded-2xl border border-slate-700/80 bg-slate-900/80 p-5">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <p className="font-semibold text-slate-200">Prediction Cards</p>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${mqttConnected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                MQTT {mqttConnected ? 'Connected' : 'Disconnected'}
              </span>
              {locked && <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-300">Prediction Locked</span>}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <PredictionCard lane={1} label={laneLabels[1]} selected={selectedLane === 1} locked={locked} onSelect={setSelectedLane} />
              <PredictionCard lane={2} label={laneLabels[2]} selected={selectedLane === 2} locked={locked} onSelect={setSelectedLane} />
              <PredictionCard lane={3} label={laneLabels[3]} selected={selectedLane === 3} locked={locked} onSelect={setSelectedLane} />
            </div>

            <button
              type="button"
              onClick={handleSubmitPrediction}
              disabled={!selectedLane || locked}
              className="mt-5 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Submit Prediction
            </button>
          </section>

          <ExperimentStatus
            phase={phase}
            countdown={countdown}
            progress={progress}
            canStart={locked && phase !== 'running' && phase !== 'countdown'}
            onStart={handleStart}
          />

          <section className="rounded-2xl border border-slate-700/80 bg-slate-900/80 p-5">
            <h3 className="font-display text-2xl font-bold text-slate-100">Live Experiment Stream</h3>
            <p className="text-slate-400">Real-time MQTT updates while experiment is running</p>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={liveData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="step" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" label={{ value: 'Time (seconds)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '0.75rem',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="lane1" name="Lane 1 (Cycloid)" stroke="#2563eb" strokeWidth={3} dot={{ r: 2 }} connectNulls />
                  <Line type="monotone" dataKey="lane2" name="Lane 2 (Straight Line)" stroke="#64748b" strokeWidth={3} dot={{ r: 2 }} connectNulls />
                  <Line type="monotone" dataKey="lane3" name="Lane 3 (Circular Arc)" stroke="#06b6d4" strokeWidth={3} dot={{ r: 2 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-700/80 bg-slate-900/80 p-5">
            <h3 className="font-display text-2xl font-bold text-slate-100">Experiment Result</h3>
            <div className="mt-3 grid gap-2 text-slate-200 md:grid-cols-2">
              <p>Lane 1 : {laneTimes[1] != null ? `${laneTimes[1].toFixed(3)} s` : '--.-- s'}</p>
              <p>Lane 2 : {laneTimes[2] != null ? `${laneTimes[2].toFixed(3)} s` : '--.-- s'}</p>
              <p>Lane 3 : {laneTimes[3] != null ? `${laneTimes[3].toFixed(3)} s` : '--.-- s'}</p>
              <p className="font-semibold text-cyan-300">Winner : {winner ? `Lane ${winner}` : '-'}</p>
            </div>

            {resultMessage && (
              <div className={`mt-4 rounded-xl p-4 font-semibold ${resultMessage.includes('Correct') ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'}`}>
                {resultMessage}
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
