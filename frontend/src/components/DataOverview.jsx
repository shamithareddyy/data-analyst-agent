import { motion } from 'framer-motion';
import { Database, Layers, AlertTriangle, TrendingUp } from 'lucide-react';

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 flex flex-col gap-3"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <div className="text-2xl font-black text-white">{value}</div>
        <div className="text-slate-400 text-sm font-medium">{label}</div>
        {sub && <div className="text-slate-600 text-xs mt-0.5">{sub}</div>}
      </div>
    </motion.div>
  );
}

function ColumnTypeBadge({ name, category }) {
  const colors = {
    numeric: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
    categorical: 'bg-purple-500/15 text-purple-300 border-purple-500/25',
    datetime: 'bg-green-500/15 text-green-300 border-green-500/25',
    boolean: 'bg-orange-500/15 text-orange-300 border-orange-500/25',
    text: 'bg-pink-500/15 text-pink-300 border-pink-500/25',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${colors[category] || 'bg-white/5 text-slate-400 border-white/10'}`}>
      <span className="truncate max-w-[100px]">{name}</span>
      <span className="opacity-60">{category}</span>
    </span>
  );
}

function MissingBar({ column, pct, highRisk }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-36 text-xs text-slate-400 truncate shrink-0">{column}</div>
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full rounded-full ${highRisk ? 'bg-red-500' : 'bg-indigo-500'}`}
        />
      </div>
      <div className={`text-xs font-mono w-10 text-right ${highRisk ? 'text-red-400' : 'text-slate-400'}`}>
        {pct.toFixed(1)}%
      </div>
      {highRisk && <AlertTriangle size={12} className="text-red-400 shrink-0" />}
    </div>
  );
}

export default function DataOverview({ overview, profiling }) {
  const { filename, file_size_kb, row_count, column_count } = overview;
  const { column_types, missing_analysis, strong_correlations, outlier_report } = profiling;

  const typeGroups = column_types.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {});

  const totalMissing = missing_analysis.filter(m => m.null_percentage > 0);
  const highRisk = missing_analysis.filter(m => m.high_risk);

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Database} label="Rows" value={row_count.toLocaleString()} sub="records" color="bg-indigo-500/20 text-indigo-400" />
        <StatCard icon={Layers} label="Columns" value={column_count} sub="features" color="bg-purple-500/20 text-purple-400" />
        <StatCard icon={AlertTriangle} label="High-Risk" value={`${highRisk.length}`} sub="missing cols >30%" color={highRisk.length > 0 ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"} />
        <StatCard icon={TrendingUp} label="File Size" value={`${(file_size_kb / 1024).toFixed(1)} MB`} sub={filename} color="bg-blue-500/20 text-blue-400" />
      </div>

      {/* Column type overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="text-white font-bold text-lg mb-2">Column Overview</h3>
        <p className="text-slate-500 text-sm mb-5">
          {Object.entries(typeGroups).map(([type, count]) => `${count} ${type}`).join(' · ')}
        </p>
        <div className="flex flex-wrap gap-2">
          {column_types.map(c => (
            <ColumnTypeBadge key={c.name} name={c.name} category={c.category} />
          ))}
        </div>
      </motion.div>

      {/* Strong correlations */}
      {strong_correlations?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-white font-bold text-lg mb-1">Strong Correlations</h3>
          <p className="text-slate-500 text-sm mb-5">|r| ≥ 0.7 detected between numeric columns</p>
          <div className="space-y-2">
            {strong_correlations.slice(0, 8).map((c, i) => (
              <div key={i} className="flex items-center gap-3 glass rounded-xl px-4 py-2.5">
                <span className="text-slate-300 text-sm font-medium truncate">{c.col1}</span>
                <span className="text-slate-600 text-xs">↔</span>
                <span className="text-slate-300 text-sm font-medium truncate">{c.col2}</span>
                <span className={`ml-auto text-xs font-mono font-bold ${Math.abs(c.correlation) > 0.9 ? 'text-red-400' : 'text-indigo-400'}`}>
                  r = {c.correlation.toFixed(3)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Missing value analysis */}
      {totalMissing.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-white font-bold text-lg mb-1">Missing Value Analysis</h3>
          <p className="text-slate-500 text-sm mb-6">{totalMissing.length} column(s) have missing data</p>
          <div className="space-y-3">
            {totalMissing.slice(0, 15).map(m => (
              <MissingBar key={m.column} column={m.column} pct={m.null_percentage} highRisk={m.high_risk} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

