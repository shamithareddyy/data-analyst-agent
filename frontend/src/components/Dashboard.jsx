import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, BarChart3, Brain, TableProperties, FileSpreadsheet, ChevronRight } from 'lucide-react';
import DataOverview from './DataOverview';
import InsightPanel from './InsightPanel';
import ChartRenderer from './ChartRenderer';
import StatsTable from './StatsTable';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'insights', label: 'AI Insights', icon: Brain },
  { id: 'charts', label: 'Visualizations', icon: TableProperties },
  { id: 'stats', label: 'Statistics', icon: FileSpreadsheet },
];

export default function Dashboard({ data, onReset }) {
  const [activeTab, setActiveTab] = useState('overview');

  const { dataset_overview, profiling, insights, visualizations } = data;

  return (
    <div className="min-h-screen gradient-bg">
      {/* Top bar */}
      <header className="sticky top-0 z-50 glass border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-white text-xs font-black">DI</span>
            </div>
            <span className="text-white font-bold text-sm hidden sm:block">DataInsight AI</span>
          </div>

          {/* File breadcrumb */}
          <div className="flex items-center gap-2 glass rounded-xl px-3 py-1.5 min-w-0">
            <FileSpreadsheet size={13} className="text-indigo-400 shrink-0" />
            <ChevronRight size={12} className="text-slate-600 shrink-0" />
            <span className="text-slate-300 text-xs truncate">{dataset_overview.filename}</span>
            <span className="text-slate-600 text-xs shrink-0">
              · {dataset_overview.row_count.toLocaleString()}r × {dataset_overview.column_count}c
            </span>
          </div>

          {/* Quality badge */}
          <div className="flex items-center gap-4 shrink-0">
            {insights.data_quality_score !== undefined && (
              <div className="hidden sm:flex items-center gap-2 glass rounded-xl px-3 py-1.5">
                <div className={`w-2 h-2 rounded-full ${
                  insights.data_quality_score >= 70 ? 'bg-green-400' :
                  insights.data_quality_score >= 40 ? 'bg-yellow-400' : 'bg-red-400'
                } pulse-glow`} />
                <span className="text-slate-300 text-xs font-medium">Quality: {insights.data_quality_score}/100</span>
              </div>
            )}
            <button
              onClick={onReset}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 transition-colors px-4 py-2 rounded-xl text-white text-xs font-semibold"
            >
              <Upload size={13} />
              New Analysis
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero metrics strip */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8"
        >
          {[
            { label: 'Total Rows', value: dataset_overview.row_count.toLocaleString() },
            { label: 'Columns', value: dataset_overview.column_count },
            { label: 'Visualizations', value: visualizations.length },
            { label: 'Quality Score', value: `${insights.data_quality_score || 0}/100` },
          ].map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass rounded-xl px-4 py-3 flex items-center justify-between"
            >
              <span className="text-slate-500 text-xs">{m.label}</span>
              <span className="text-white font-bold text-sm">{m.value}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Tab navigation */}
        <div className="flex gap-1 glass rounded-2xl p-1 mb-8 w-fit">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-indigo-600 text-white glow-brand-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && (
              <DataOverview overview={dataset_overview} profiling={profiling} />
            )}
            {activeTab === 'insights' && <InsightPanel insights={insights} />}
            {activeTab === 'charts' && <ChartRenderer visualizations={visualizations} />}
            {activeTab === 'stats' && <StatsTable summaryStats={profiling.summary_stats} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
