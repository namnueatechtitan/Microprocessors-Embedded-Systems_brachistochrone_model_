import { useEffect, useRef, useState } from 'react';
import type { MqttClient } from 'mqtt';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { createMqttClient, MQTT_TOPIC } from '../mqtt/mqttClient';

interface ChartPoint {
  trial: number;
  lane1: number;
  lane2: number;
  lane3: number;
}

type LaneId = 1 | 2 | 3;

interface MqttPayload {
  lane?: number;
  time?: number;
}

const MAX_POINTS = 20;

export default function RealTimeExperimentChart() {
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [connected, setConnected] = useState(false);
  const trialRef = useRef(1);
  const pendingRef = useRef<Record<LaneId, number | null>>({ 1: null, 2: null, 3: null });

  useEffect(() => {
    const client: MqttClient = createMqttClient();

    client.on('connect', () => {
      setConnected(true);
      client.subscribe(MQTT_TOPIC);
    });
    client.on('close', () => setConnected(false));
    client.on('error', () => setConnected(false));
    client.on('reconnect', () => setConnected(false));

    client.on('message', (topic, payload) => {
      if (topic !== MQTT_TOPIC) return;
      try {
        const parsed = JSON.parse(payload.toString()) as MqttPayload;
        if (![1, 2, 3].includes(Number(parsed.lane))) return;
        if (typeof parsed.time !== 'number') return;

        const lane = parsed.lane as LaneId;
        pendingRef.current = { ...pendingRef.current, [lane]: parsed.time };

        const { 1: lane1, 2: lane2, 3: lane3 } = pendingRef.current;
        if (lane1 == null || lane2 == null || lane3 == null) return;

        const nextPoint: ChartPoint = { trial: trialRef.current, lane1, lane2, lane3 };
        trialRef.current += 1;
        pendingRef.current = { 1: null, 2: null, 3: null };

        setChartData((prev) => [...prev.slice(-(MAX_POINTS - 1)), nextPoint]);
      } catch {
        // Ignore malformed MQTT payload.
      }
    });

    return () => {
      client.end(true);
    };
  }, []);

  return (
    <section className="rounded-2xl border border-slate-700/80 bg-slate-900/80 p-6 shadow-lg shadow-slate-950/40">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-display text-2xl font-bold text-slate-100">Real-time Experiment Analytics</h3>
          <p className="text-slate-400">Lane time comparison per trial</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            connected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
          }`}
        >
          MQTT {connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="trial" stroke="#94a3b8" label={{ value: 'Trial Number', position: 'insideBottom', fill: '#94a3b8' }} />
            <YAxis stroke="#94a3b8" label={{ value: 'Time (seconds)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '0.75rem',
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="lane1" name="Lane 1 (Cycloid)" stroke="#2563eb" strokeWidth={3} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="lane2" name="Lane 2 (Straight Line)" stroke="#64748b" strokeWidth={3} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="lane3" name="Lane 3 (Circular Arc)" stroke="#06b6d4" strokeWidth={3} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
