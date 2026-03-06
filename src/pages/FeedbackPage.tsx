import { RotateCcw } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Sidebar from '../components/Sidebar';
import type { FeedbackStats } from '../types/feedback';
import type { PageKey } from '../types/navigation';

interface FeedbackPageProps {
  onNavigate: (page: PageKey) => void;
  stats: FeedbackStats;
  onResetFeedback: () => void;
}

export default function FeedbackPage({ onNavigate, stats, onResetFeedback }: FeedbackPageProps) {
  const preData = [
    { name: 'Low', value: stats.preUnderstanding.low, fill: '#ef4444' },
    { name: 'Medium', value: stats.preUnderstanding.medium, fill: '#f59e0b' },
    { name: 'High', value: stats.preUnderstanding.high, fill: '#22c55e' },
  ];

  const postData = [
    { name: 'Clear', value: stats.postUnderstanding.clear, fill: '#22c55e' },
    { name: 'Unsure', value: stats.postUnderstanding.unsure, fill: '#f59e0b' },
    { name: 'Confused', value: stats.postUnderstanding.confused, fill: '#ef4444' },
  ];

  const totalResponses =
    stats.preUnderstanding.low +
    stats.preUnderstanding.medium +
    stats.preUnderstanding.high +
    stats.postUnderstanding.clear +
    stats.postUnderstanding.unsure +
    stats.postUnderstanding.confused;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#0b122b_0,_#020617_40%)] p-4 text-slate-100 lg:p-6">
      <div className="mx-auto flex max-w-[1600px] gap-4">
        <Sidebar currentRound={1} totalRounds={10} activePage="feedback" onNavigate={onNavigate} />

        <section className="w-full space-y-4">
          <header className="rounded-3xl border border-slate-700/80 bg-slate-900/70 p-5 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-4xl font-bold text-cyan-200">Feedback Analytics</h2>
                <p className="mt-2 text-slate-300">
                  Summary of learner answers before and after the game
                </p>
              </div>
              <button
                type="button"
                onClick={onResetFeedback}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 font-semibold text-white hover:bg-rose-500"
              >
                <RotateCcw size={16} />
                Reset Feedback Data
              </button>
            </div>
          </header>

          <section className="grid gap-4 lg:grid-cols-3">
            <article className="rounded-2xl border border-slate-700/80 bg-slate-900/80 p-5">
              <p className="text-sm uppercase tracking-wider text-slate-400">Total Feedback Answers</p>
              <p className="mt-2 font-display text-5xl font-bold text-cyan-300">{totalResponses}</p>
            </article>
            <article className="rounded-2xl border border-slate-700/80 bg-slate-900/80 p-5">
              <p className="text-sm uppercase tracking-wider text-slate-400">Pre-Game Answers</p>
              <p className="mt-2 font-display text-5xl font-bold text-blue-300">
                {stats.preUnderstanding.low + stats.preUnderstanding.medium + stats.preUnderstanding.high}
              </p>
            </article>
            <article className="rounded-2xl border border-slate-700/80 bg-slate-900/80 p-5">
              <p className="text-sm uppercase tracking-wider text-slate-400">Post-Game Answers</p>
              <p className="mt-2 font-display text-5xl font-bold text-emerald-300">
                {stats.postUnderstanding.clear + stats.postUnderstanding.unsure + stats.postUnderstanding.confused}
              </p>
            </article>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <article className="rounded-2xl border border-slate-700/80 bg-slate-900/80 p-5">
              <h3 className="font-display text-2xl font-bold text-slate-100">Before Playing</h3>
              <p className="text-slate-400">How well students understood before the game</p>
              <div className="mt-4 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={preData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '0.75rem',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="value" name="Number of Students">
                      {preData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-700/80 bg-slate-900/80 p-5">
              <h3 className="font-display text-2xl font-bold text-slate-100">After Playing</h3>
              <p className="text-slate-400">How clear students feel after the game</p>
              <div className="mt-4 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={postData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '0.75rem',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="value" name="Number of Students">
                      {postData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>
          </section>
        </section>
      </div>
    </main>
  );
}
