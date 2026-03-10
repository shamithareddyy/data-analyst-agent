import { motion } from 'framer-motion';
import {
  Database, Layers, AlertTriangle, FileText, Brain, Cpu,
  ArrowRight, CheckCircle2, XCircle, Eye, BarChart3, Sparkles,
  Hash, Calendar, Type, ToggleLeft, Tag,
} from 'lucide-react';

/* ── Helpers ── */

const ROLE_STYLES = {
  identifier: { label: 'Identifier', bg: '#818cf830', color: '#818cf8', icon: Hash },
  categorical_feature: { label: 'Categorical', bg: '#c084fc30', color: '#c084fc', icon: Tag },
  numeric_metric: { label: 'Metric', bg: '#38bdf830', color: '#38bdf8', icon: BarChart3 },
  date_dimension: { label: 'Date', bg: '#4ade8030', color: '#4ade80', icon: Calendar },
  text_field: { label: 'Text', bg: '#f5995030', color: '#f59e0b', icon: Type },
  flag: { label: 'Flag', bg: '#f4718530', color: '#f47185', icon: ToggleLeft },
};

function Section({ title, icon: Icon, iconColor, children }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 16, padding: 24,
      transition: 'background 0.3s ease, border-color 0.3s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `${iconColor}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} color={iconColor} />
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function MetricCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 14, padding: '16px 20px',
      flex: '1 1 0', minWidth: 130,
      transition: 'background 0.3s ease, border-color 0.3s ease',
    }}>
      <div style={{ fontSize: 28, fontWeight: 900, color: color || 'var(--text)', marginBottom: 2 }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-4)', fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-6)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function ProgressBar({ value, max = 100, color = '#6366f1', height = 8 }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{
      height, borderRadius: height,
      background: 'var(--track)', overflow: 'hidden',
    }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{
          height: '100%', borderRadius: height,
          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
        }}
      />
    </div>
  );
}

function Badge({ label, bg, color }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '4px 10px', borderRadius: 8,
      background: bg || 'var(--track)',
      color: color || 'var(--text-3)',
      fontSize: 11, fontWeight: 600,
    }}>
      {label}
    </span>
  );
}

/* ── Main Component ── */

export default function DataOverview({ intelligence }) {
  if (!intelligence) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-5)' }}>
        <Database size={40} style={{ marginBottom: 16, opacity: 0.4 }} />
        <p>No overview data available.</p>
      </div>
    );
  }

  const { classification, profile, health, executive_summary, column_intelligence, key_signals, ml_readiness, suggested_analyses } = intelligence;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── 1. Classification + Executive Summary ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Classification */}
        <Section title="Dataset Classification" icon={Sparkles} iconColor="#a78bfa">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)' }}>{classification.dataset_type}</span>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-4)' }}>Confidence</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: classification.confidence >= 70 ? '#4ade80' : classification.confidence >= 40 ? '#fbbf24' : '#f87171' }}>
                {classification.confidence}%
              </span>
            </div>
            <ProgressBar
              value={classification.confidence}
              color={classification.confidence >= 70 ? '#4ade80' : classification.confidence >= 40 ? '#fbbf24' : '#f87171'}
            />
          </div>
          {classification.matched_keywords.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {classification.matched_keywords.map(kw => (
                <Badge key={kw} label={kw} bg="rgba(167,139,250,0.12)" color="#c4b5fd" />
              ))}
            </div>
          )}
        </Section>

        {/* Executive Summary */}
        <Section title="Executive Summary" icon={Brain} iconColor="#c084fc">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {executive_summary.map((line, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'rgba(192,132,252,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: 1,
                }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#c084fc' }}>{i + 1}</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>{line}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* ── 2. Dataset Profile ── */}
      <Section title="Dataset Profile" icon={Database} iconColor="#818cf8">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12,
        }}>
          <MetricCard label="Total Rows" value={profile.total_rows} color="#818cf8" />
          <MetricCard label="Total Columns" value={profile.total_columns} color="#a78bfa" />
          <MetricCard label="Numeric" value={profile.numeric_count} color="#38bdf8" sub="columns" />
          <MetricCard label="Categorical" value={profile.categorical_count} color="#c084fc" sub="columns" />
          <MetricCard label="Date" value={profile.date_count} color="#4ade80" sub="columns" />
          <MetricCard label="Text" value={profile.text_count} color="#fbbf24" sub="columns" />
        </div>
      </Section>

      {/* ── 3. Data Health ── */}
      <Section title="Data Health" icon={AlertTriangle} iconColor={health.overall_missing_pct > 10 ? '#f87171' : '#4ade80'}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 18 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Missing Values</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: health.overall_missing_pct > 10 ? '#f87171' : health.overall_missing_pct > 2 ? '#fbbf24' : '#4ade80' }}>
                {health.overall_missing_pct}%
              </span>
            </div>
            <ProgressBar value={health.overall_missing_pct} color={health.overall_missing_pct > 10 ? '#f87171' : health.overall_missing_pct > 2 ? '#fbbf24' : '#4ade80'} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 6 }}>Duplicate Rows</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: health.duplicate_rows > 0 ? '#fbbf24' : '#4ade80' }}>
              {health.duplicate_rows.toLocaleString()}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-5)' }}>{health.duplicate_pct}% of total</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 6 }}>Feature Diversity</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#38bdf8' }}>
              {(health.feature_diversity * 100).toFixed(1)}%
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-5)' }}>avg unique ratio</div>
          </div>
        </div>

        {/* Per-column missing */}
        {health.column_missing.length > 0 && (
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-4)', marginBottom: 10, fontWeight: 600 }}>
              Columns with Missing Data ({health.column_missing.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {health.column_missing.slice(0, 10).map(cm => (
                <div key={cm.column} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ width: 140, fontSize: 12, color: 'var(--text-3)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {cm.column}
                  </span>
                  <div style={{ flex: 1 }}>
                    <ProgressBar value={cm.missing_pct} color={cm.missing_pct > 30 ? '#f87171' : cm.missing_pct > 10 ? '#fbbf24' : '#6366f1'} height={6} />
                  </div>
                  <span style={{ width: 48, textAlign: 'right', fontSize: 11, fontWeight: 700, fontFamily: 'monospace', color: cm.missing_pct > 30 ? '#f87171' : '#94a3b8', flexShrink: 0 }}>
                    {cm.missing_pct.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Format issues */}
        {health.format_issues.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, color: '#fbbf24', marginBottom: 6, fontWeight: 600 }}>
              ⚠ Format Issues
            </div>
            {health.format_issues.map((issue, i) => (
              <div key={i} style={{ fontSize: 12, color: '#94a3b8', paddingLeft: 8, borderLeft: '2px solid rgba(251,191,36,0.3)', marginBottom: 4, lineHeight: 1.5 }}>
                {issue}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ── 4. Column Intelligence ── */}
      <Section title="Column Intelligence" icon={Layers} iconColor="#38bdf8">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Column', 'Type', 'Unique', 'Duplicates', 'Missing', 'Distribution', 'Role'].map(h => (
                  <th key={h} style={{
                    padding: '8px 12px', textAlign: 'left',
                    fontSize: 11, color: 'var(--text-5)', fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {column_intelligence.map((col, idx) => {
                const role = ROLE_STYLES[col.suggested_role] || { label: col.suggested_role, bg: '#ffffff15', color: '#94a3b8', icon: Hash };
                const RoleIcon = role.icon;
                return (
                  <tr key={col.name} style={{
                    borderBottom: '1px solid var(--border)',
                    background: idx % 2 === 0 ? 'transparent' : 'var(--row-alt)',
                  }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text)' }}>{col.name}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-4)', background: 'var(--bg-card-strong)', padding: '2px 8px', borderRadius: 6 }}>
                        {col.dtype}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-3)', fontFamily: 'monospace' }}>{col.unique_count.toLocaleString()}</td>
                    <td style={{ padding: '10px 12px', color: col.duplicate_count > 0 ? '#fbbf24' : '#334155', fontFamily: 'monospace' }}>{col.duplicate_count.toLocaleString()}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 12, color: col.missing_pct > 10 ? '#f87171' : col.missing_pct > 0 ? '#fbbf24' : '#334155' }}>
                        {col.missing_pct > 0 ? `${col.missing_pct}%` : '—'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-3)', fontSize: 12, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {col.distribution_insight}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '3px 10px', borderRadius: 8,
                        background: role.bg, color: role.color,
                        fontSize: 11, fontWeight: 600,
                      }}>
                        <RoleIcon size={11} />
                        {role.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ── 5. Key Signals + ML Readiness ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>

        {/* Key Signals */}
        <Section title="Key Signals" icon={Eye} iconColor="#fbbf24">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Strengths */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#4ade80', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={13} /> Strengths
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {key_signals.strengths.map((s, i) => (
                  <div key={i} style={{ fontSize: 13, color: 'var(--text-2)', paddingLeft: 10, borderLeft: '2px solid rgba(74,222,128,0.3)', lineHeight: 1.5 }}>
                    {s}
                  </div>
                ))}
              </div>
            </div>
            {/* Risks */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#f87171', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <XCircle size={13} /> Risks
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {key_signals.risks.map((r, i) => (
                  <div key={i} style={{ fontSize: 13, color: 'var(--text-2)', paddingLeft: 10, borderLeft: '2px solid rgba(248,113,113,0.3)', lineHeight: 1.5 }}>
                    {r}
                  </div>
                ))}
              </div>
            </div>
            {/* Observations */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Eye size={13} /> Observations
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {key_signals.observations.map((o, i) => (
                  <div key={i} style={{ fontSize: 13, color: 'var(--text-3)', paddingLeft: 10, borderLeft: '2px solid var(--border-md)', lineHeight: 1.5 }}>
                    {o}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ML Readiness */}
        <Section title="ML Readiness" icon={Cpu} iconColor="#6366f1">
          {/* Score ring (simplified) */}
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <div style={{
              display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
              width: 120, height: 120, borderRadius: '50%',
              background: `conic-gradient(${ml_readiness.score >= 70 ? '#4ade80' : ml_readiness.score >= 40 ? '#fbbf24' : '#f87171'} ${ml_readiness.score * 3.6}deg, rgba(255,255,255,0.04) 0deg)`,
              justifyContent: 'center',
            }}>
              <div style={{
                width: 96, height: 96, borderRadius: '50%',
                background: 'var(--bg-input)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)' }}>{ml_readiness.score}</span>
                <span style={{ fontSize: 10, color: 'var(--text-4)' }}>/ 100</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {ml_readiness.reasoning.map((r, i) => (
              <div key={i} style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>
                {r}
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* ── 6. Suggested Analyses ── */}
      <Section title="Suggested Next Analyses" icon={ArrowRight} iconColor="#22d3ee">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 10,
        }}>
          {suggested_analyses.map((suggestion, i) => (
            <div key={i} style={{
              padding: '12px 16px', borderRadius: 12,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              display: 'flex', alignItems: 'flex-start', gap: 10,
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: 'rgba(34,211,238,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: 1,
              }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: '#22d3ee' }}>{i + 1}</span>
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>{suggestion}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
