import { useEffect, useState } from 'react';
import type { MqttClient } from 'mqtt';
import { createMqttClient, MQTT_TOPIC_RESULT } from '../mqtt/mqttClient';

interface LaneTimes {
  lane1: number | null;
  lane2: number | null;
  lane3: number | null;
}

interface MqttPayload {
  lane1?: number;
  lane2?: number;
  lane3?: number;
  winner?: number;
}

const initialTimes: LaneTimes = {
  lane1: null,
  lane2: null,
  lane3: null,
};

export default function MQTTListener() {
  const [connected, setConnected] = useState(false);
  const [times, setTimes] = useState<LaneTimes>(initialTimes);
  const [winner, setWinner] = useState<number | null>(null);
  const [rawPayload, setRawPayload] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const client: MqttClient = createMqttClient();

    client.on('connect', () => {
      setConnected(true);
      setError(null);
      client.subscribe(MQTT_TOPIC_RESULT);
    });

    client.on('reconnect', () => setConnected(false));
    client.on('close', () => setConnected(false));
    client.on('error', (err) => {
      setConnected(false);
      setError(err.message);
    });

    client.on('message', (topic, payload) => {
      if (!topic.startsWith('brachistochrone/result')) return;
      const text = payload.toString();
      setRawPayload(text);

      try {
        const parsed = JSON.parse(text) as MqttPayload;
        if (
          typeof parsed.lane1 !== 'number' ||
          typeof parsed.lane2 !== 'number' ||
          typeof parsed.lane3 !== 'number' ||
          typeof parsed.winner !== 'number'
        ) {
          setError('Payload format invalid: expected {"lane1":n,"lane2":n,"lane3":n,"winner":n}');
          return;
        }

        setError(null);
        setTimes({ lane1: parsed.lane1, lane2: parsed.lane2, lane3: parsed.lane3 });
        setWinner(parsed.winner);
      } catch {
        setError('Payload parse failed: invalid JSON');
      }
    });

    return () => {
      client.end(true);
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <section className="mx-auto max-w-5xl rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/60">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold">Brachistochrone MQTT Listener</h1>
            <p className="text-slate-400">Real-time lane timing from HiveMQ topic: `brachistochrone/result`</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              connected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
            }`}
          >
            MQTT {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <article className={`rounded-xl border p-4 ${winner === 1 ? 'border-yellow-400/60 bg-yellow-500/10' : 'border-blue-500/30 bg-blue-500/10'}`}>
            <p className="text-sm text-blue-200">Lane 1 (Steep) {winner === 1 ? '🏆' : ''}</p>
            <p className="font-display text-4xl font-bold text-blue-300">
              {times.lane1 == null ? '--.--' : times.lane1.toFixed(3)}s
            </p>
          </article>
          <article className={`rounded-xl border p-4 ${winner === 2 ? 'border-yellow-400/60 bg-yellow-500/10' : 'border-slate-500/30 bg-slate-500/10'}`}>
            <p className="text-sm text-slate-200">Lane 2 (Cycloid) {winner === 2 ? '🏆' : ''}</p>
            <p className="font-display text-4xl font-bold text-slate-300">
              {times.lane2 == null ? '--.--' : times.lane2.toFixed(3)}s
            </p>
          </article>
          <article className={`rounded-xl border p-4 ${winner === 3 ? 'border-yellow-400/60 bg-yellow-500/10' : 'border-cyan-500/30 bg-cyan-500/10'}`}>
            <p className="text-sm text-cyan-200">Lane 3 (Straight Line) {winner === 3 ? '🏆' : ''}</p>
            <p className="font-display text-4xl font-bold text-cyan-300">
              {times.lane3 == null ? '--.--' : times.lane3.toFixed(3)}s
            </p>
          </article>
        </div>

        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Last Payload</p>
          <pre className="mt-2 overflow-x-auto text-sm text-slate-300">{rawPayload || 'Waiting for MQTT message...'}</pre>
          {error && <p className="mt-3 text-sm font-semibold text-rose-300">{error}</p>}
        </section>
      </section>
    </main>
  );
}
