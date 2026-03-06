import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { AnalyticsDatum } from '../types/dashboard';

interface AnalyticsChartProps {
  data: AnalyticsDatum[];
  preAvg: number;
  postAvg: number;
}

export default function AnalyticsChart({ data, preAvg, postAvg }: AnalyticsChartProps) {
  const improvement = preAvg > 0 ? ((postAvg - preAvg) / preAvg) * 100 : 0;

  return (
    <section className="rounded-2xl border border-slate-700/80 bg-slate-900/80 p-6">
      <h3 className="font-display text-2xl font-bold text-slate-100">Learning Analytics</h3>
      <p className="text-slate-400">Pre-test vs Post-test comparison</p>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
          <p className="text-sm text-rose-200">Pre-test Avg</p>
          <p className="font-display text-4xl font-bold text-rose-300">{preAvg.toFixed(1)}</p>
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-sm text-emerald-200">Post-test Avg</p>
          <p className="font-display text-4xl font-bold text-emerald-300">{postAvg.toFixed(1)}</p>
        </div>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-sm text-amber-200">Improvement</p>
          <p className="font-display text-4xl font-bold text-amber-300">
            {improvement >= 0 ? '+' : ''}
            {improvement.toFixed(0)}%
          </p>
        </div>
      </div>

      <div className="mt-6 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" domain={[0, 100]} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
            <Bar dataKey="preTest" name="Pre-test" fill="#fda4af" radius={[4, 4, 0, 0]} />
            <Bar dataKey="postTest" name="Post-test" fill="#6ee7b7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
