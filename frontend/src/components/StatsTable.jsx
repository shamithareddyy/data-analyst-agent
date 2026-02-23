import { motion } from 'framer-motion';

function StatRow({ col, stats }) {
  const keys = ['count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max'];
  const present = keys.filter(k => stats[k] !== undefined);

  const fmt = (v) => {
    if (v === null || v === undefined) return '—';
    if (typeof v !== 'number') return String(v);
    if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(2) + 'M';
    if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(1) + 'K';
    return v.toLocaleString(undefined, { maximumFractionDigits: 3 });
  };

  return (
    <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
      <td className="py-3 pr-4 text-sm font-medium text-slate-300 whitespace-nowrap sticky left-0 bg-transparent">{col}</td>
      {present.map(k => (
        <td key={k} className="py-3 px-3 text-xs text-slate-400 text-right font-mono">{fmt(stats[k])}</td>
      ))}
    </tr>
  );
}

export default function StatsTable({ summaryStats }) {
  if (!summaryStats || Object.keys(summaryStats).length === 0) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <p className="text-slate-500">No numeric columns found for statistical summary.</p>
      </div>
    );
  }

  const columns = Object.keys(summaryStats);
  const headers = ['count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-white/5">
        <h3 className="text-white font-bold">Statistical Summary</h3>
        <p className="text-slate-500 text-sm mt-0.5">{columns.length} numeric column(s)</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="py-3 pr-4 text-left text-xs text-slate-500 font-medium sticky left-0 bg-transparent">Column</th>
              {headers.map(h => (
                <th key={h} className="py-3 px-3 text-right text-xs text-slate-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {columns.map((col, i) => (
              <StatRow key={col} col={col} stats={summaryStats[col]} />
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
