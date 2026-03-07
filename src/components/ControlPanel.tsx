import { Play, RotateCcw } from 'lucide-react';
import type { ExperimentStatus } from '../types/dashboard';

interface ControlPanelProps {
  status: ExperimentStatus;
  currentRound: number;
  totalRounds: number;
  mode: 'MANUAL' | 'AUTO';
  onStart: () => void;
  onReset: () => void;
  onToggleMode: () => void;
}

export default function ControlPanel({
  status,
  currentRound,
  totalRounds,
  mode,
  onStart,
  onReset,
  onToggleMode,
}: ControlPanelProps) {
  const progress = Math.min((currentRound / totalRounds) * 100, 100);

  return (
    <section className="rounded-2xl border border-slate-700/80 bg-slate-900/80 p-6">
      <h3 className="font-display text-2xl font-bold text-slate-100">Control Panel</h3>
      <p className="mb-4 text-slate-400">Experiment controls</p>

      {/* Mode Toggle */}
      <div className="mb-4 rounded-xl border border-slate-700 bg-slate-800/60 p-3">
        <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">Mode</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => mode !== 'MANUAL' && onToggleMode()}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
              mode === 'MANUAL'
                ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            MANUAL
          </button>
          <button
            type="button"
            onClick={() => mode !== 'AUTO' && onToggleMode()}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
              mode === 'AUTO'
                ? 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/40'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            AUTO
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {mode === 'MANUAL' ? 'Press physical button on ESP32 to start' : 'Start experiment from this dashboard'}
        </p>
      </div>

      <button
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onStart}
        type="button"
        disabled={status === 'Running' || status === 'Finished' || mode === 'MANUAL'}
      >
        <Play size={18} />
        Start Experiment
      </button>
      {mode === 'MANUAL' && (
        <p className="mt-1 text-center text-xs text-slate-500">Switch to AUTO to start from here</p>
      )}

      <button
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-700 px-5 py-3 font-semibold text-slate-100 transition hover:bg-slate-600"
        onClick={onReset}
        type="button"
      >
        <RotateCcw size={18} />
        Reset
      </button>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-sm text-slate-400">
          <span>Round Progress</span>
          <span>
            {currentRound} / {totalRounds} rounds
          </span>
        </div>
        <div className="h-2 rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </section>
  );
}
