import { Trophy } from 'lucide-react';

interface LaneCardProps {
  lane: number;
  label: string;
  time: number | null;
  rank: number;
  winner: boolean;
  color: string;
}

export default function LaneCard({ lane, label, time, rank, winner, color }: LaneCardProps) {
  return (
    <article className="animate-slide-up rounded-2xl border border-slate-700/80 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/40">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="font-display text-2xl font-bold text-slate-100">Lane {lane}</p>
          <p className="text-slate-400">{label}</p>
        </div>
        {winner && (
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
            <Trophy size={14} />
            Winner
          </div>
        )}
      </div>

      <p className="font-display text-6xl font-bold leading-none" style={{ color }}>
        {time?.toFixed(3) ?? '--.--'}
      </p>
      <p className="mt-1 text-slate-400">seconds</p>

      <div className="mt-6 h-2 w-full rounded-full bg-slate-800">
        <div className="h-full rounded-full transition-all duration-500" style={{ backgroundColor: color, width: time ? '100%' : '12%' }} />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className={`rounded-md px-2 py-1 text-xs font-semibold ${winner ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-700 text-slate-300'}`}>
          {winner ? 'Fastest' : 'Active'}
        </span>
        <span className="text-slate-400">Rank #{rank}</span>
      </div>
    </article>
  );
}
