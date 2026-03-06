type GamePhase = 'idle' | 'countdown' | 'running' | 'finished';

interface ExperimentStatusProps {
  phase: GamePhase;
  countdown: number;
  progress: number;
  canStart: boolean;
  onStart: () => void;
}

export default function ExperimentStatus({
  phase,
  countdown,
  progress,
  canStart,
  onStart,
}: ExperimentStatusProps) {
  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-2xl font-bold text-slate-100">Experiment Area</h3>
        <button
          type="button"
          onClick={onStart}
          disabled={!canStart}
          className="rounded-xl bg-cyan-600 px-4 py-2 font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Start Experiment
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/60 p-6 text-center">
        {phase === 'countdown' && (
          <p className="font-display text-7xl font-bold text-cyan-300 animate-pulse">{countdown}</p>
        )}
        {phase === 'running' && (
          <p className="font-display text-4xl font-bold text-blue-300">Running Experiment...</p>
        )}
        {phase === 'finished' && (
          <p className="font-display text-4xl font-bold text-emerald-300">Experiment Complete</p>
        )}
        {phase === 'idle' && (
          <p className="font-display text-2xl font-semibold text-slate-300">Ready to launch</p>
        )}

        <div className="mt-6 h-3 rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </section>
  );
}
