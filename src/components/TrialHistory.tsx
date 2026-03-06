import { Download } from 'lucide-react';
import type { TrialRecord } from '../types/dashboard';

interface TrialHistoryProps {
  rows: TrialRecord[];
}

function exportCsv(rows: TrialRecord[]) {
  const header = ['Trial', 'Lane 1 (s)', 'Lane 2 (s)', 'Lane 3 (s)', 'Winner', 'Note'];
  const content = rows.map((r) => [r.trial, r.lane1.toFixed(3), r.lane2.toFixed(3), r.lane3.toFixed(3), r.winner, r.note].join(','));
  const csv = [header.join(','), ...content].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'brachistochrone-trials.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function TrialHistory({ rows }: TrialHistoryProps) {
  return (
    <section className="rounded-2xl border border-slate-700/80 bg-slate-900/80 p-6">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="font-display text-2xl font-bold text-slate-100">Trial History</h3>
          <p className="text-slate-400">All experiment rounds</p>
        </div>
        <button
          onClick={() => exportCsv(rows)}
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-slate-200">
          <thead>
            <tr className="border-b border-slate-700 text-left text-slate-400">
              <th className="py-2">Trial</th>
              <th className="py-2">Lane 1 (s)</th>
              <th className="py-2">Lane 2 (s)</th>
              <th className="py-2">Lane 3 (s)</th>
              <th className="py-2">Winner</th>
              <th className="py-2">Note</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td className="py-4 text-slate-500" colSpan={6}>
                  Waiting for incoming MQTT data...
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.trial} className="border-b border-slate-800/80">
                <td className="py-3 font-semibold text-blue-300">{String(row.trial).padStart(2, '0')}</td>
                <td>{row.lane1.toFixed(3)}</td>
                <td>{row.lane2.toFixed(3)}</td>
                <td>{row.lane3.toFixed(3)}</td>
                <td className="font-semibold text-emerald-300">{row.winner}</td>
                <td className="text-slate-400">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
