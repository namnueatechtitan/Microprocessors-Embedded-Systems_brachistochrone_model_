import { useEffect, useMemo, useRef, useState } from 'react';
import type { MqttClient } from 'mqtt';
import Sidebar from '../components/Sidebar';
import LaneCard from '../components/LaneCard';
import ControlPanel from '../components/ControlPanel';
import TrialHistory from '../components/TrialHistory';
import RealTimeExperimentChart from '../components/RealTimeExperimentChart';
import { createMqttClient, MQTT_TOPIC_RESULT, MQTT_TOPIC_MODE, MQTT_TOPIC_START, MQTT_TOPIC_RESET } from '../mqtt/mqttClient';
import type { ExperimentStatus, LaneId, LaneTimes, TrialRecord } from '../types/dashboard';
import type { PageKey } from '../types/navigation';

const TOTAL_ROUNDS = 10;

const lanes = [
  { lane: 1 as LaneId, label: 'Steep', color: '#2563eb' },
  { lane: 2 as LaneId, label: 'Cycloid', color: '#64748b' },
  { lane: 3 as LaneId, label: 'Straight Line', color: '#06b6d4' },
];

interface DashboardProps {
  onNavigate: (page: PageKey) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [status, setStatus] = useState<ExperimentStatus>('Ready');
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [laneTimes, setLaneTimes] = useState<LaneTimes>({ 1: null, 2: null, 3: null });
  const [history, setHistory] = useState<TrialRecord[]>([]);
  const [mqttConnected, setMqttConnected] = useState(false);
  const [mode, setMode] = useState<'MANUAL' | 'AUTO'>('MANUAL');
  const [lastWinner, setLastWinner] = useState<LaneId | null>(null);
  const clientRef = useRef<MqttClient | null>(null);
  const statusRef = useRef<ExperimentStatus>('Ready');
  const currentRoundRef = useRef<number>(1);

  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { currentRoundRef.current = currentRound; }, [currentRound]);

  useEffect(() => {
    const client: MqttClient = createMqttClient();
    clientRef.current = client;

    client.on('connect', () => {
      setMqttConnected(true);
      client.subscribe(MQTT_TOPIC_RESULT);
    });

    client.on('reconnect', () => setMqttConnected(false));
    client.on('close', () => setMqttConnected(false));
    client.on('error', () => setMqttConnected(false));

    client.on('message', (topic, payload) => {
      if (!topic.startsWith('brachistochrone/result')) return;

      try {
        const data = JSON.parse(payload.toString()) as {
          lane1?: number;
          lane2?: number;
          lane3?: number;
          winner?: number;
        };

        if (
          typeof data.lane1 !== 'number' ||
          typeof data.lane2 !== 'number' ||
          typeof data.lane3 !== 'number' ||
          typeof data.winner !== 'number'
        ) return;

        const winner = data.winner as LaneId;

        // อัปเดต lane times แสดงผล
        setLaneTimes({ 1: data.lane1, 2: data.lane2, 3: data.lane3 });
        setLastWinner(winner);

        // บันทึก trial
        const trialRecord: TrialRecord = {
          trial: currentRoundRef.current,
          lane1: data.lane1,
          lane2: data.lane2,
          lane3: data.lane3,
          winner: `Lane ${winner}`,
          note: winner === 2 ? (currentRoundRef.current === 1 ? 'Matches theory' : 'Consistent') : 'Unexpected outcome',
        };

        setHistory((h) => [...h, trialRecord]);

        // หน่วงเล็กน้อยก่อน reset laneTimes เพื่อให้ UI แสดงผลทัน
        setTimeout(() => {
          setLaneTimes({ 1: null, 2: null, 3: null });
        }, 3000);

        if (currentRoundRef.current >= TOTAL_ROUNDS) {
          setStatus('Finished');
        } else {
          setCurrentRound((r) => r + 1);
          currentRoundRef.current += 1;
          setStatus('Waiting Reset');
        }
      } catch {
        // Ignore malformed payloads.
      }
    });

    return () => { client.end(true); };
  }, []);

  const ranks = useMemo(() => {
    const order = ([1, 2, 3] as LaneId[]).sort((a, b) => {
      const ta = laneTimes[a] ?? Number.POSITIVE_INFINITY;
      const tb = laneTimes[b] ?? Number.POSITIVE_INFINITY;
      return ta - tb;
    });
    return order.reduce<Record<LaneId, number>>(
      (acc, lane, index) => { acc[lane] = index + 1; return acc; },
      { 1: 1, 2: 2, 3: 3 },
    );
  }, [laneTimes]);

  const startExperiment = () => {
    if (status === 'Finished') return;
    setLaneTimes({ 1: null, 2: null, 3: null });
    setLastWinner(null);
    setStatus('Running');
    clientRef.current?.publish(MQTT_TOPIC_START, '1');
  };

  const resetExperiment = () => {
    setStatus('Ready');
    setCurrentRound(1);
    currentRoundRef.current = 1;
    setLaneTimes({ 1: null, 2: null, 3: null });
    setLastWinner(null);
    setHistory([]);
    clientRef.current?.publish(MQTT_TOPIC_RESET, '1');
  };

  const toggleMode = () => {
    const next = mode === 'MANUAL' ? 'AUTO' : 'MANUAL';
    setMode(next);
    clientRef.current?.publish(MQTT_TOPIC_MODE, next);
  };

  const statusLabel: Record<ExperimentStatus, string> = {
    Ready: 'Ready',
    Running: 'Running',
    Finished: 'Completed',
    'Waiting Reset': 'Waiting Reset',
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
                  {statusLabel[item]}
                </span>
              ))}
              <span className={`ml-auto rounded-full px-3 py-1 text-xs font-semibold ${mqttConnected ? 'bg-emerald-500/20 text-emerald-300 animate-pulseglow' : 'bg-rose-500/20 text-rose-300'}`}>
                {mqttConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <p className="mt-3 text-lg font-semibold text-blue-300">
              {statusLabel[status].toUpperCase()} - Round {String(currentRound).padStart(2, '0')} in progress
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
                  winner={lastWinner === lane.lane}
                  color={lane.color}
                />
              ))}
            </div>
            <ControlPanel
              status={status}
              currentRound={currentRound}
              totalRounds={TOTAL_ROUNDS}
              mode={mode}
              onStart={startExperiment}
              onReset={resetExperiment}
              onToggleMode={toggleMode}
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
