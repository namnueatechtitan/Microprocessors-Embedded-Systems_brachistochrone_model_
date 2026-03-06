interface ScorePanelProps {
  score: number;
  correct: number;
  wrong: number;
}

export default function ScorePanel({ score, correct, wrong }: ScorePanelProps) {
  const total = correct + wrong;
  const accuracy = total > 0 ? (correct / total) * 100 : 0;

  return (
    <aside className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
      <p className="text-sm uppercase tracking-wider text-slate-400">Score</p>
      <p className="font-display text-4xl font-bold text-cyan-300">{score}</p>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-emerald-500/10 p-2">
          <p className="text-xs text-emerald-200">Correct</p>
          <p className="font-semibold text-emerald-300">{correct}</p>
        </div>
        <div className="rounded-lg bg-rose-500/10 p-2">
          <p className="text-xs text-rose-200">Wrong</p>
          <p className="font-semibold text-rose-300">{wrong}</p>
        </div>
        <div className="rounded-lg bg-blue-500/10 p-2">
          <p className="text-xs text-blue-200">Accuracy</p>
          <p className="font-semibold text-blue-300">{accuracy.toFixed(0)}%</p>
        </div>
      </div>
    </aside>
  );
}
