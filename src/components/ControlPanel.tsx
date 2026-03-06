import { Play, RotateCcw } from 'lucide-react';
import type { ExperimentStatus } from '../types/dashboard';

interface ControlPanelProps {
  status: ExperimentStatus;
  currentRound: number;
  totalRounds: number;
  onStart: () => void;
  onReset: () => void;
}

export default function ControlPanel({
  status,
  currentRound,
  totalRounds,
  onStart,
  onReset,
}: ControlPanelProps) {
  const progress = Math.min((currentRound / totalRounds) * 100, 100);

  return (
    <section className="rounded-2xl border border-slate-700/80 bg-slate-900/80 p-6">
      <h3 className="font-display text-2xl font-bold text-slate-100">Control Panel</h3>
      <p className="mb-4 text-slate-400">Experiment controls</p>

      <button
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onStart}
        type="button"
        disabled={status === 'Running' || status === 'Finished'}
      >
        <Play size={18} />
        Start Experiment
      </button>

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
