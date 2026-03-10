import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, ShieldAlert, Zap, Lightbulb, Star, Activity } from 'lucide-react';

const SCORE_META = (s) => {
  if (s >= 80) return { color: '#22c55e', label: 'Excellent', track: 'rgba(34,197,94,0.12)' };
  if (s >= 60) return { color: '#6366f1', label: 'Good', track: 'rgba(99,102,241,0.12)' };
  if (s >= 40) return { color: '#f59e0b', label: 'Fair', track: 'rgba(245,158,11,0.12)' };
  return { color: '#ef4444', label: 'Poor', track: 'rgba(239,68,68,0.12)' };
};

function QualityRing({ score }) {
  const meta = SCORE_META(score);
  const r = 52;
  const circ = 2 * Math.PI * r;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 180, damping: 18 }}
      className="flex flex-col items-center p-6 rounded-3xl relative"
      style={{ background: meta.track, border: `1px solid ${meta.color}30` }}
    >
      <div className="relative">
        {/* Glow trail */}
        <div className="glow-trail" style={{ opacity: 0.4 }} />
        <svg width="130" height="130" viewBox="0 0 130 130" className="-rotate-90">
          <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="9" />
          <motion.circle
            cx="65" cy="65" r={r} fill="none"
            strokeWidth="9" strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - (score / 100) * circ }}
            transition={{ duration: 2, ease: [0.25, 0.1, 0.25, 1], delay: 0.4 }}
            style={{ stroke: meta.color }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, type: 'spring', stiffness: 250, damping: 18 }}
            className="text-3xl font-black text-white"
          >{score}</motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-xs font-bold mt-0.5"
            style={{ color: meta.color }}
          >{meta.label}</motion.span>
        </div>
      </div>
      <p className="text-slate-500 text-xs text-center mt-3 font-medium">Data Quality Score</p>
    </motion.div>
  );
}

const INSIGHT_CONFIGS = {
  'Key Trends': { icon: TrendingUp, borderColor: '#3b82f6', bg: 'rgba(59,130,246,0.08)', iconBg: 'rgba(59,130,246,0.15)', iconColor: '#60a5fa' },
  'Risk Factors': { icon: ShieldAlert, borderColor: '#ef4444', bg: 'rgba(239,68,68,0.08)', iconBg: 'rgba(239,68,68,0.15)', iconColor: '#f87171' },
  'Anomalies Detected': { icon: Zap, borderColor: '#f59e0b', bg: 'rgba(245,158,11,0.08)', iconBg: 'rgba(245,158,11,0.15)', iconColor: '#fbbf24' },
  'Recommendations': { icon: Lightbulb, borderColor: '#22c55e', bg: 'rgba(34,197,94,0.08)', iconBg: 'rgba(34,197,94,0.15)', iconColor: '#4ade80' },
};

function InsightCard({ title, items, delay = 0 }) {
  if (!items?.length) return null;
  const cfg = INSIGHT_CONFIGS[title] || INSIGHT_CONFIGS['Key Trends'];
  const Icon = cfg.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay, type: 'spring', stiffness: 180, damping: 22 }}
      whileHover={{ y: -3, scale: 1.01, transition: { duration: 0.2 } }}
      className="insight-card rounded-2xl p-6 cursor-default breathe"
      style={{ borderLeftColor: cfg.borderColor, background: cfg.bg }}
    >
      <div className="flex items-center gap-3 mb-5">
        <motion.div
          whileHover={{ rotate: 10, scale: 1.15 }}
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: cfg.iconBg }}
        >
          <Icon size={15} style={{ color: cfg.iconColor }} />
        </motion.div>
        <h3 className="text-white font-bold text-base flex-1">{title}</h3>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ background: cfg.iconBg, color: cfg.iconColor }}>
          {items.length}
        </span>
      </div>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: delay + i * 0.07, type: 'spring', stiffness: 200, damping: 22 }}
            className="flex gap-3"
          >
            <span
              className="w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: cfg.iconBg, color: cfg.iconColor }}
            >
              {i + 1}
            </span>
            <span className="text-slate-300 text-sm leading-relaxed">{item}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function InsightPanel({ insights }) {
  const { executive_summary, key_trends, risk_factors, anomalies, recommendations, data_quality_score } = insights;

  return (
    <div className="space-y-6">

      {/* Executive Summary + Score */}
      <div className="grid md:grid-cols-[1fr_auto] gap-6 items-start">
        <motion.div
          initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ type: 'spring', stiffness: 160, damping: 22 }}
          className="glass-card rounded-3xl p-7 relative overflow-hidden"
        >
          {/* Decorative gradient */}
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none morph-wave"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />

          <div className="flex items-center gap-3 mb-5 relative z-10">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center"
            >
              <Sparkles size={16} className="text-indigo-300" />
            </motion.div>
            <div>
              <h3 className="text-white font-bold text-lg leading-tight">Executive Summary</h3>
              <p className="text-slate-500 text-xs">Generated by Google Gemini AI</p>
            </div>
            <span className="ml-auto flex items-center gap-1 text-xs text-indigo-300 bg-indigo-500/15 px-3 py-1 rounded-full border border-indigo-500/20 shrink-0">
              <Star size={9} />  Gemini
            </span>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-slate-200 leading-relaxed text-[0.95rem] relative z-10"
          >{executive_summary}</motion.p>

          {/* Bottom stats row */}
          <div className="mt-6 pt-5 border-t border-white/[0.06] flex flex-wrap gap-4 relative z-10">
            {[
              { label: 'Trends', count: key_trends?.length || 0, color: '#60a5fa' },
              { label: 'Risks', count: risk_factors?.length || 0, color: '#f87171' },
              { label: 'Anomalies', count: anomalies?.length || 0, color: '#fbbf24' },
              { label: 'Recommendations', count: recommendations?.length || 0, color: '#4ade80' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                className="flex items-center gap-2"
              >
                <Activity size={11} style={{ color: s.color }} />
                <span className="text-slate-400 text-xs">{s.label}:</span>
                <span className="text-white text-xs font-bold">{s.count}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <QualityRing score={data_quality_score || 0} />
      </div>

      {/* Insight cards grid */}
      <div className="grid md:grid-cols-2 gap-5">
        <InsightCard title="Key Trends" items={key_trends} delay={0.05} />
        <InsightCard title="Risk Factors" items={risk_factors} delay={0.10} />
        <InsightCard title="Anomalies Detected" items={anomalies} delay={0.15} />
        <InsightCard title="Recommendations" items={recommendations} delay={0.20} />
      </div>
    </div>
  );
}
