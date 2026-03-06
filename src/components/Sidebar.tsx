import { Gamepad2, LayoutDashboard } from 'lucide-react';

type PageKey = 'dashboard' | 'game';

interface SidebarProps {
  currentRound: number;
  totalRounds: number;
  activePage: PageKey;
  onNavigate: (page: PageKey) => void;
}

const menus = [
  { key: 'dashboard' as PageKey, label: 'Dashboard', icon: LayoutDashboard },
  { key: 'game' as PageKey, label: 'Game', icon: Gamepad2 },
];

export default function Sidebar({ currentRound, totalRounds, activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="hidden w-72 flex-col rounded-3xl border border-slate-800/70 bg-slate-900/70 p-6 backdrop-blur xl:flex">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-100">BrachioLab</h1>
        <p className="text-sm text-slate-400">Brachistochrone Curve </p>
      </div>

      <nav className="mt-8 space-y-2">
        {menus.map(({ key, label, icon: Icon }) => (
          <button
            key={label}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
              activePage === key
                ? 'bg-blue-600/20 text-blue-300 ring-1 ring-blue-500/30'
                : 'text-slate-300 hover:bg-slate-800/80'
            }`}
            type="button"
            onClick={() => onNavigate(key)}
          >
            <Icon size={18} />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-4">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <p className="font-semibold text-emerald-300">System Online</p>
          <p className="text-sm text-emerald-200/90">ESP32 x2 connected</p>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-4">
          <p className="text-sm text-slate-400">Current Round</p>
          <p className="mt-1 font-display text-4xl font-bold text-blue-300">{String(currentRound).padStart(2, '0')}</p>
          <p className="text-sm text-slate-500">/ {totalRounds} total rounds</p>
        </div>
      </div>
    </aside>
  );
}
