import { motion } from 'framer-motion';
import { Hash, TrendingUp, BarChart2 } from 'lucide-react';

const HEADERS = ['count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max'];
const HEADER_TIPS = {
  count: 'Non-null count',
  mean: 'Average value',
  std: 'Std deviation',
  min: 'Minimum',
  '25%': '25th percentile',
  '50%': 'Median',
  '75%': '75th percentile',
  max: 'Maximum',
};

function fmt(v) {
  if (v === null || v === undefined) return '—';
  if (typeof v !== 'number') return String(v);
  if (!isFinite(v)) return v > 0 ? '∞' : '-∞';
  if (Math.abs(v) >= 1e9) return (v / 1e9).toFixed(2) + 'B';
  if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(2) + 'M';
  if (Math.abs(v) >= 1e4) return (v / 1e3).toFixed(1) + 'K';
  return v.toLocaleString(undefined, { maximumFractionDigits: 3 });
}

function MiniSparkBar({ value, min, max }) {
  if (min === max || value === null || value === undefined) return <span className="text-slate-700 font-mono text-xs">—</span>;
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  return (
    <div className="flex items-center gap-2 justify-end">
      <span className="text-slate-300 font-mono text-xs">{fmt(value)}</span>
      <div className="w-12 h-1.5 bg-white/[0.05] rounded-full overflow-hidden shrink-0">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full"
        />
      </div>
    </div>
  );
}

export default function StatsTable({ summaryStats }) {
  if (!summaryStats || Object.keys(summaryStats).length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-3xl p-14 text-center"
      >
        <BarChart2 size={40} className="text-slate-700 mx-auto mb-4" />
        <p className="text-slate-500 font-medium">No numeric columns for statistical summary.</p>
      </motion.div>
    );
  }

  const columns = Object.keys(summaryStats);

  // Build per-column min/max for sparkbars using mean column
  const means = columns.map(c => summaryStats[c]?.mean).filter(v => typeof v === 'number');
  const globalMin = Math.min(...means);
  const globalMax = Math.max(...means);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 180, damping: 22 }}
      className="glass-card rounded-3xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/[0.06] flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center">
          <Hash size={15} className="text-indigo-400" />
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">Statistical Summary</h3>
          <p className="text-slate-500 text-sm">{columns.length} numeric column(s)</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 glass rounded-xl px-3 py-1.5">
          <TrendingUp size={12} className="text-indigo-400" />
          <span className="text-slate-400 text-xs">{columns.length} features</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.05]">
              <th className="py-3 pl-6 pr-4 text-left text-xs text-slate-600 font-semibold uppercase tracking-wider sticky left-0">
                Column
              </th>
              {HEADERS.map(h => (
                <th key={h}
                  className="py-3 px-3 text-right text-xs text-slate-600 font-semibold uppercase tracking-wider tooltip"
                  data-tip={HEADER_TIPS[h]}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {columns.map((col, idx) => {
              const s = summaryStats[col];
              const present = HEADERS.filter(k => s[k] !== undefined);
              const isEven = idx % 2 === 0;
              return (
                <motion.tr
                  key={col}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04, type: 'spring', stiffness: 200, damping: 25 }}
                  className={`border-b border-white/[0.04] transition-colors row-glow-hover group ${isEven ? 'table-row-even' : 'table-row-odd'
                    }`}
                >
                  <td className="py-3.5 pl-6 pr-4 sticky left-0">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/60 shrink-0" />
                      <span className="text-sm font-semibold text-slate-200 whitespace-nowrap">{col}</span>
                    </div>
                  </td>
                  {HEADERS.map(k => {
                    const v = s[k];
                    if (k === 'mean') {
                      return (
                        <td key={k} className="py-3.5 px-3">
                          <MiniSparkBar value={v} min={globalMin} max={globalMax} />
                        </td>
                      );
                    }
                    if (!present.includes(k)) {
                      return <td key={k} className="py-3.5 px-3 text-right"><span className="text-slate-700 font-mono text-xs">—</span></td>;
                    }
                    return (
                      <td key={k} className="py-3.5 px-3 text-right">
                        <span className={`font-mono text-xs ${k === 'max' || k === 'min' ? 'text-slate-400 font-semibold' : 'text-slate-500'
                          }`}>
                          {fmt(v)}
                        </span>
                      </td>
                    );
                  })}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
