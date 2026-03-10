import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, BarChart3, Brain, TableProperties,
  FileSpreadsheet, ChevronRight, Sparkles,
  Database, Star, Moon, Sun,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import DataOverview from './DataOverview';
import InsightPanel from './InsightPanel';
import ChartRenderer from './ChartRenderer';
import StatsTable from './StatsTable';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3, color: 'text-indigo-400' },
  { id: 'insights', label: 'AI Insights', icon: Brain, color: 'text-purple-400' },
  { id: 'charts', label: 'Visualizations', icon: TableProperties, color: 'text-cyan-400' },
  { id: 'stats', label: 'Statistics', icon: FileSpreadsheet, color: 'text-green-400' },
];

function MetricChip({ label, value, accent }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      padding: '16px 20px',
      flex: '1 1 0',
      minWidth: 140,
      transition: 'background 0.3s ease, border-color 0.3s ease',
    }}>
      <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 2 }} className={accent || 'text-white'}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-4)', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

export default function Dashboard({ data, onReset }) {
  const [activeTab, setActiveTab] = useState('overview');
  const { isDark, toggle } = useTheme();
  const { dataset_overview, profiling, insights, visualizations, dataset_intelligence } = data;

  const qualityColor =
    insights.data_quality_score >= 70 ? 'text-green-400' :
      insights.data_quality_score >= 40 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', transition: 'background 0.3s ease, color 0.3s ease' }}>

      {/* ── Top bar ── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--bg-nav)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--separator)',
      }}>
        <div style={{
          padding: '0 32px',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          width: '100%',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={14} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>DataInsight AI</span>
          </div>

          <span style={{ color: 'var(--separator)' }}>|</span>

          {/* File breadcrumb */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 10, padding: '5px 12px',
            minWidth: 0, maxWidth: 280,
          }}>
            <FileSpreadsheet size={12} color="#818cf8" style={{ flexShrink: 0 }} />
            <ChevronRight size={10} color="var(--text-6)" style={{ flexShrink: 0 }} />
            <span style={{
              fontSize: 12, color: 'var(--text-2)', fontWeight: 500,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{dataset_overview.filename}</span>
          </div>

          {/* Metadata */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 10, padding: '5px 12px',
            flexShrink: 0,
          }}>
            <Database size={11} color="var(--text-4)" />
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
              {dataset_overview.row_count.toLocaleString()} rows
            </span>
            <span style={{ color: 'var(--text-6)' }}>×</span>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
              {dataset_overview.column_count} cols
            </span>
          </div>

          {/* Quality */}
          {insights.data_quality_score !== undefined && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 10, padding: '5px 12px',
              flexShrink: 0,
            }}>
              <Star size={11} className={qualityColor} />
              <span style={{ fontSize: 12, fontWeight: 700 }} className={qualityColor}>
                {insights.data_quality_score}/100
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-4)' }}>quality</span>
            </div>
          )}

          {/* New Analysis button + Theme toggle */}
          <div style={{ marginLeft: 'auto', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className="theme-toggle"
              onClick={toggle}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button
              onClick={onReset}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 12,
                padding: '8px 16px',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
              }}
            >
              <Upload size={12} />
              New Analysis
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content — full width ── */}
      <main style={{ padding: '28px 32px', width: '100%' }}>

        {/* Metric strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 16,
          marginBottom: 28,
        }}>
          <MetricChip label="Total Rows" value={dataset_overview.row_count.toLocaleString()} accent="text-indigo-300" />
          <MetricChip label="Columns" value={dataset_overview.column_count} accent="text-purple-300" />
          <MetricChip label="Visualizations" value={visualizations.length} accent="text-cyan-300" />
          <MetricChip label="Quality Score" value={`${insights.data_quality_score || 0}/100`} accent={qualityColor} />
        </div>

        {/* Executive summary */}
        {insights.executive_summary && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '16px 20px',
            marginBottom: 28,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
          }}>
            <Brain size={16} color="#c084fc" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6, margin: 0 }}>
              {insights.executive_summary}
            </p>
          </div>
        )}

        {/* Tab navigation */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', gap: 4, padding: 5,
            background: 'var(--bg-card-strong)',
            border: '1px solid var(--border)',
            borderRadius: 14,
          }}>
            {TABS.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '8px 18px', borderRadius: 10,
                    fontSize: 13, fontWeight: 600,
                    border: 'none', cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: active
                      ? 'linear-gradient(135deg, rgba(99,102,241,0.9), rgba(124,58,237,0.9))'
                      : 'transparent',
                    color: active ? '#fff' : 'var(--text-4)',
                    boxShadow: active ? '0 0 16px rgba(99,102,241,0.35)' : 'none',
                  }}
                >
                  <Icon size={14} className={active ? 'text-white' : tab.color} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === 'overview' && <DataOverview intelligence={dataset_intelligence} />}
            {activeTab === 'insights' && <InsightPanel insights={insights} />}
            {activeTab === 'charts' && <ChartRenderer visualizations={visualizations} />}
            {activeTab === 'stats' && <StatsTable summaryStats={profiling.summary_stats} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
