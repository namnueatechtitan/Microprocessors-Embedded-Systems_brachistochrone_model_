interface PredictionCardProps {
  lane: 1 | 2 | 3;
  label: string;
  selected: boolean;
  locked: boolean;
  onSelect: (lane: 1 | 2 | 3) => void;
}

export default function PredictionCard({
  lane,
  label,
  selected,
  locked,
  onSelect,
}: PredictionCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(lane)}
      disabled={locked}
      className={`rounded-2xl border p-5 text-left transition-all duration-300 ${
        selected
          ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_30px_rgba(34,211,238,0.25)]'
          : 'border-slate-700 bg-slate-900/70 hover:border-slate-500'
      } ${locked ? 'cursor-not-allowed opacity-80' : ''}`}
    >
      <p className="font-display text-2xl font-bold text-slate-100">Lane {lane}</p>
      <p className="mt-1 text-slate-300">{label}</p>
      {selected && <p className="mt-3 text-sm font-semibold text-cyan-300">Selected Prediction</p>}
    </button>
  );
}
