import { useEffect, useMemo, useRef, useState } from 'react';
import type { MqttClient } from 'mqtt';
import Sidebar from '../components/Sidebar';
import LaneCard from '../components/LaneCard';
import ControlPanel from '../components/ControlPanel';
import TrialHistory from '../components/TrialHistory';
import RealTimeExperimentChart from '../components/RealTimeExperimentChart';
import { createMqttClient, MQTT_TOPIC } from '../mqtt/mqttClient';
import type { ExperimentStatus, LaneId, LaneTimes, TrialRecord } from '../types/dashboard';

type PageKey = 'dashboard' | 'game';

const TOTAL_ROUNDS = 10;
const INITIAL_LANE_TIMES: LaneTimes = { 1: null, 2: null, 3: null };

const lanes = [
  { lane: 1 as LaneId, label: 'Cycloid', color: '#2563eb' },
  { lane: 2 as LaneId, label: 'Straight Line', color: '#64748b' },
  { lane: 3 as LaneId, label: 'Circular Arc', color: '#06b6d4' },
];

interface DashboardProps {
  onNavigate: (page: PageKey) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [status, setStatus] = useState<ExperimentStatus>('Ready');
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [laneTimes, setLaneTimes] = useState<LaneTimes>(INITIAL_LANE_TIMES);
  const [history, setHistory] = useState<TrialRecord[]>([]);
  const [mqttConnected, setMqttConnected] = useState(false);
  const statusRef = useRef<ExperimentStatus>(status);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    const client: MqttClient = createMqttClient();

    client.on('connect', () => {
      setMqttConnected(true);
      client.subscribe(MQTT_TOPIC);
    });

    client.on('reconnect', () => setMqttConnected(false));
    client.on('close', () => setMqttConnected(false));
    client.on('error', () => setMqttConnected(false));

    client.on('message', (topic, payload) => {
      if (topic !== MQTT_TOPIC || statusRef.current !== 'Running') return;

      try {
        const data = JSON.parse(payload.toString()) as { lane?: number; time?: number };
        if (![1, 2, 3].includes(Number(data.lane))) return;
        if (typeof data.time !== 'number') return;

        const lane = data.lane as LaneId;
        setLaneTimes((prev) => ({ ...prev, [lane]: data.time }));
      } catch {
        // Ignore malformed payloads.
      }
    });

    return () => {
      client.end(true);
    };
  }, []);

  const ranks = useMemo(() => {
    const order = ([1, 2, 3] as LaneId[]).sort((a, b) => {
      const ta = laneTimes[a] ?? Number.POSITIVE_INFINITY;
      const tb = laneTimes[b] ?? Number.POSITIVE_INFINITY;
      return ta - tb;
    });

    return order.reduce<Record<LaneId, number>>(
      (acc, lane, index) => {
        acc[lane] = index + 1;
        return acc;
      },
      { 1: 1, 2: 2, 3: 3 },
    );
  }, [laneTimes]);

  const winnerLane = useMemo(() => {
    if (laneTimes[1] == null || laneTimes[2] == null || laneTimes[3] == null) return null;
    return ([1, 2, 3] as LaneId[]).reduce((best, lane) => ((laneTimes[lane] ?? 99) < (laneTimes[best] ?? 99) ? lane : best), 1 as LaneId);
  }, [laneTimes]);

  useEffect(() => {
    if (status !== 'Running') return;
    if (laneTimes[1] == null || laneTimes[2] == null || laneTimes[3] == null) return;

    const winner = winnerLane ?? 1;
    const trialRecord: TrialRecord = {
      trial: currentRound,
      lane1: laneTimes[1],
      lane2: laneTimes[2],
      lane3: laneTimes[3],
      winner: `Lane ${winner}`,
      note: winner === 1 ? (currentRound === 1 ? 'Matches theory' : 'Consistent') : 'Unexpected outcome',
    };

    setHistory((prev) => [...prev, trialRecord]);
    setLaneTimes(INITIAL_LANE_TIMES);

    if (currentRound >= TOTAL_ROUNDS) {
      setStatus('Finished');
      return;
    }

    setCurrentRound((prev) => prev + 1);
    setStatus('Waiting Reset');
  }, [currentRound, laneTimes, status, winnerLane]);

  const startExperiment = () => {
    if (status === 'Finished') return;
    setLaneTimes(INITIAL_LANE_TIMES);
    setStatus('Running');
  };

  const resetExperiment = () => {
    setStatus('Ready');
    setCurrentRound(1);
    setLaneTimes(INITIAL_LANE_TIMES);
    setHistory([]);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#1e293b_0,_#020617_40%)] p-4 text-slate-100 lg:p-6">
      <div className="mx-auto flex max-w-[1600px] gap-4">
        <Sidebar currentRound={currentRound} totalRounds={TOTAL_ROUNDS} activePage="dashboard" onNavigate={onNavigate} />

        <section className="w-full space-y-4">
          <header className="rounded-3xl border border-slate-700/80 bg-slate-900/70 p-5 backdrop-blur">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-display text-4xl font-bold">Brachistochrone Curve Demonstration</h2>
                <p className="text-slate-400">Real-time IoT Physics Experiment - MQTT + WebSocket</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-600 font-bold">PJ</div>
              </div>
            </div>
          </header>

          <section className="rounded-2xl border border-slate-700/80 bg-slate-900/80 p-4">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {(['Ready', 'Running', 'Finished', 'Waiting Reset'] as ExperimentStatus[]).map((item) => (
                <span
                  key={item}
                  className={`rounded-lg px-4 py-2 ${
                    item === status ? 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/40' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item}
                </span>
              ))}
              <span className={`ml-auto rounded-full px-3 py-1 text-xs font-semibold ${mqttConnected ? 'bg-emerald-500/20 text-emerald-300 animate-pulseglow' : 'bg-rose-500/20 text-rose-300'}`}>
                {mqttConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <p className="mt-3 text-lg font-semibold text-blue-300">
              {status.toUpperCase()} - Round {String(currentRound).padStart(2, '0')} in progress
            </p>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1fr,340px]">
            <div className="grid gap-4 md:grid-cols-3">
              {lanes.map((lane) => (
                <LaneCard
                  key={lane.lane}
                  lane={lane.lane}
                  label={lane.label}
                  time={laneTimes[lane.lane]}
                  rank={ranks[lane.lane]}
                  winner={winnerLane === lane.lane}
                  color={lane.color}
                />
              ))}
            </div>
            <ControlPanel
              status={status}
              currentRound={currentRound}
              totalRounds={TOTAL_ROUNDS}
              onStart={startExperiment}
              onReset={resetExperiment}
            />
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.35fr,1fr]">
            <RealTimeExperimentChart />
            <TrialHistory rows={history} />
          </section>
        </section>
      </div>
    </main>
  );
}
