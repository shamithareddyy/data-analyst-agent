import { motion } from 'framer-motion';
import { lazy, Suspense } from 'react';
import { BarChart3, LineChart, PieChart, ScatterChart, Layers, Hash } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Plot = lazy(() => import('react-plotly.js'));

function getLayout(isDark) {
  return {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: isDark ? '#94a3b8' : '#475569', family: 'Inter, system-ui, sans-serif', size: 11 },
    margin: { l: 52, r: 20, t: 20, b: 52 },
    colorway: ['#6366f1', '#8b5cf6', '#38bdf8', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#f97316'],
    xaxis: {
      gridcolor: isDark ? 'rgba(99,102,241,0.07)' : 'rgba(99,102,241,0.10)',
      linecolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)',
      zerolinecolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)',
      tickfont: { color: isDark ? '#475569' : '#64748b', size: 10 },
    },
    yaxis: {
      gridcolor: isDark ? 'rgba(99,102,241,0.07)' : 'rgba(99,102,241,0.10)',
      linecolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)',
      zerolinecolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)',
      tickfont: { color: isDark ? '#475569' : '#64748b', size: 10 },
    },
    legend: { bgcolor: 'rgba(0,0,0,0)', font: { color: isDark ? '#64748b' : '#475569', size: 10 } },
    hoverlabel: {
      bgcolor: isDark ? '#0f172a' : '#ffffff',
      bordercolor: 'rgba(99,102,241,0.5)',
      font: { color: isDark ? '#f1f5f9' : '#0f172a', family: 'Inter' },
    },
    modebar: { bgcolor: 'rgba(0,0,0,0)', color: '#4f46e5', activecolor: '#818cf8' },
  };
}

const CONFIG = {
  displayModeBar: true, displaylogo: false,
  modeBarButtonsToRemove: ['sendDataToCloud', 'editInChartStudio', 'lasso2d', 'select2d', 'autoScale2d'],
  responsive: true,
};

const TYPE_META = {
  histogram: { label: 'Histogram', Icon: BarChart3, color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  bar: { label: 'Bar', Icon: BarChart3, color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  line: { label: 'Line', Icon: LineChart, color: '#38bdf8', bg: 'rgba(56,189,248,0.12)' },
  heatmap: { label: 'Heatmap', Icon: Layers, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  scatter: { label: 'Scatter', Icon: ScatterChart, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  pie: { label: 'Pie', Icon: PieChart, color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
};

function ChartCard({ chart, index, wide = false }) {
  const { isDark } = useTheme();
  const plotData = chart.data?.data || [];
  const meta = TYPE_META[chart.chart_type] || { label: chart.chart_type, Icon: Hash, color: '#94a3b8', bg: 'rgba(148,163,184,0.10)' };
  const { Icon } = meta;
  const layoutBase = getLayout(isDark);

  const layout = {
    ...chart.layout,
    ...layoutBase,
    height: wide ? 400 : 330,
    title: undefined,
    xaxis: { ...chart.layout?.xaxis, ...layoutBase.xaxis },
    yaxis: { ...chart.layout?.yaxis, ...layoutBase.yaxis },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.94, rotateX: 8 }}
      whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.07, duration: 0.5, type: 'spring', stiffness: 160, damping: 22 }}
      whileHover={{ y: -5, scale: 1.015, transition: { duration: 0.2 } }}
      className={`glass-card rounded-3xl overflow-hidden chart-card cursor-default ${wide ? 'col-span-full' : ''}`}
      style={{ perspective: '1200px' }}
    >
      {/* Card header */}
      <div className="px-5 py-4 flex items-center gap-3 border-b border-white/[0.05]">
        <motion.div
          whileHover={{ rotate: 15, scale: 1.15 }}
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: meta.bg }}
        >
          <Icon size={14} style={{ color: meta.color }} />
        </motion.div>
        <div className="min-w-0 flex-1">
          <div className="text-white text-sm font-semibold truncate">{chart.title}</div>
          {chart.column && <div className="text-slate-600 text-xs truncate">{chart.column}</div>}
        </div>
        <span className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
          style={{ background: meta.bg, color: meta.color }}>
          {meta.label}
        </span>
      </div>

      {/* Chart */}
      <Suspense fallback={
        <div className="flex items-center justify-center" style={{ height: wide ? 400 : 330 }}>
          <div className="shimmer w-full h-full" />
        </div>
      }>
        <Plot
          data={plotData}
          layout={layout}
          config={CONFIG}
          useResizeHandler
          style={{ width: '100%' }}
        />
      </Suspense>
    </motion.div>
  );
}

export default function ChartRenderer({ visualizations }) {
  if (!visualizations?.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-3xl p-14 text-center"
      >
        <BarChart3 size={40} className="text-slate-700 mx-auto mb-4" />
        <p className="text-slate-500 font-medium">No visualizations generated for this dataset.</p>
        <p className="text-slate-700 text-sm mt-1">The dataset may not have enough numeric columns.</p>
      </motion.div>
    );
  }

  const heatmap = visualizations.find(v => v.chart_type === 'heatmap');
  const others = visualizations.filter(v => v.chart_type !== 'heatmap');

  return (
    <div className="space-y-5">
      {heatmap && <ChartCard chart={heatmap} index={0} wide />}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {others.map((chart, i) => (
          <ChartCard key={chart.column || chart.title || i} chart={chart} index={i + 1} />
        ))}
      </div>
    </div>
  );
}
