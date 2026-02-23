import { motion } from 'framer-motion';
import { lazy, Suspense } from 'react';

// Lazy-load Plotly to avoid blocking initial render
const Plot = lazy(() => import('react-plotly.js'));

const PLOTLY_LAYOUT_OVERRIDES = {
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(0,0,0,0)',
  font: { color: '#94a3b8', family: 'Inter, system-ui, sans-serif', size: 11 },
  margin: { l: 48, r: 20, t: 50, b: 50 },
  colorway: ['#6366f1', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'],
  xaxis: {
    gridcolor: 'rgba(99,102,241,0.08)',
    linecolor: 'rgba(255,255,255,0.06)',
    zerolinecolor: 'rgba(255,255,255,0.06)',
    tickfont: { color: '#64748b', size: 10 },
  },
  yaxis: {
    gridcolor: 'rgba(99,102,241,0.08)',
    linecolor: 'rgba(255,255,255,0.06)',
    zerolinecolor: 'rgba(255,255,255,0.06)',
    tickfont: { color: '#64748b', size: 10 },
  },
  title: { font: { color: '#e2e8f0', size: 14, family: 'Inter' } },
  legend: { bgcolor: 'rgba(0,0,0,0)', font: { color: '#94a3b8', size: 10 } },
  hoverlabel: {
    bgcolor: '#1e2538',
    bordercolor: 'rgba(99,102,241,0.4)',
    font: { color: '#f1f5f9', family: 'Inter' },
  },
  modebar: { bgcolor: 'rgba(0,0,0,0)', color: '#4f46e5', activecolor: '#818cf8' },
};

const PLOTLY_CONFIG = {
  displayModeBar: true,
  displaylogo: false,
  modeBarButtonsToRemove: ['sendDataToCloud', 'editInChartStudio', 'lasso2d', 'select2d'],
  responsive: true,
};

function ChartCard({ chart, index }) {
  const plotData = chart.data?.data || [];
  const layout = {
    ...chart.layout,
    ...PLOTLY_LAYOUT_OVERRIDES,
    height: 340,
    title: { ...PLOTLY_LAYOUT_OVERRIDES.title, text: chart.title },
    xaxis: { ...chart.layout?.xaxis, ...PLOTLY_LAYOUT_OVERRIDES.xaxis },
    yaxis: { ...chart.layout?.yaxis, ...PLOTLY_LAYOUT_OVERRIDES.yaxis },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`glass rounded-2xl overflow-hidden ${chart.chart_type === 'heatmap' ? 'col-span-full' : ''}`}
    >
      <div className="px-5 pt-4 pb-0">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          chart.chart_type === 'histogram' ? 'bg-indigo-500/15 text-indigo-300' :
          chart.chart_type === 'bar' ? 'bg-purple-500/15 text-purple-300' :
          chart.chart_type === 'line' ? 'bg-cyan-500/15 text-cyan-300' :
          chart.chart_type === 'heatmap' ? 'bg-green-500/15 text-green-300' :
          chart.chart_type === 'scatter' ? 'bg-yellow-500/15 text-yellow-300' :
          'bg-white/10 text-slate-400'
        }`}>{chart.chart_type}</span>
      </div>
      <Suspense fallback={<div className="h-[340px] flex items-center justify-center"><div className="shimmer h-full w-full" /></div>}>
        <Plot
          data={plotData}
          layout={layout}
          config={PLOTLY_CONFIG}
          className="w-full"
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
      <div className="glass rounded-2xl p-12 text-center">
        <p className="text-slate-500">No visualizations generated for this dataset.</p>
      </div>
    );
  }

  const heatmap = visualizations.find(v => v.chart_type === 'heatmap');
  const others = visualizations.filter(v => v.chart_type !== 'heatmap');

  return (
    <div className="space-y-6">
      {heatmap && <ChartCard chart={heatmap} index={0} />}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {others.map((chart, i) => (
          <ChartCard key={chart.column || chart.title || i} chart={chart} index={i + 1} />
        ))}
      </div>
    </div>
  );
}

