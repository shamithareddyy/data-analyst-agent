import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, ShieldAlert, Zap, Lightbulb, Star } from 'lucide-react';

const SCORE_COLOR = (score) => {
  if (score >= 80) return { text: 'text-green-400', bg: 'bg-green-500/15', border: 'border-green-500/30', label: 'Excellent' };
  if (score >= 60) return { text: 'text-indigo-400', bg: 'bg-indigo-500/15', border: 'border-indigo-500/30', label: 'Good' };
  if (score >= 40) return { text: 'text-yellow-400', bg: 'bg-yellow-500/15', border: 'border-yellow-500/30', label: 'Fair' };
  return { text: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/30', label: 'Poor' };
};

function ScoreRing({ score }) {
  const color = SCORE_COLOR(score);
  const circumference = 2 * Math.PI * 44;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={`inline-flex flex-col items-center justify-center p-6 rounded-2xl ${color.bg} border ${color.border}`}>
      <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
        <circle cx="60" cy="60" r="44" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <motion.circle
          cx="60" cy="60" r="44" fill="none"
          stroke="currentColor" strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className={color.text}
        />
      </svg>
      <div className="mt-[-85px] mb-[20px] text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className={`text-3xl font-black ${color.text}`}
        >
          {score}
        </motion.div>
        <div className="text-slate-500 text-xs font-medium mt-0.5">{color.label}</div>
      </div>
      <p className="text-slate-400 text-xs font-medium">Data Quality Score</p>
    </div>
  );
}

function InsightList({ items, icon: Icon, color, title }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={16} />
        </div>
        <h3 className="text-white font-bold">{title}</h3>
        <span className="ml-auto text-xs text-slate-600 bg-white/5 px-2 py-0.5 rounded-full">{items.length}</span>
      </div>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className="flex gap-3"
          >
            <span className="w-5 h-5 rounded-full bg-white/5 text-slate-600 text-xs flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <span className="text-slate-300 text-sm leading-relaxed">{item}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

export default function InsightPanel({ insights }) {
  const {
    executive_summary,
    key_trends,
    risk_factors,
    anomalies,
    recommendations,
    data_quality_score,
  } = insights;

  return (
    <div className="space-y-6">
      {/* Executive Summary + Score */}
      <div className="grid md:grid-cols-[1fr_auto] gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center">
              <Sparkles size={16} className="text-indigo-400" />
            </div>
            <h3 className="text-white font-bold text-lg">Executive Summary</h3>
            <span className="ml-auto flex items-center gap-1 text-xs text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              <Star size={10} /> Gemini AI
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed text-base">{executive_summary}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center"
        >
          <ScoreRing score={data_quality_score || 0} />
        </motion.div>
      </div>

      {/* Insights grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <InsightList
          title="Key Trends"
          items={key_trends}
          icon={TrendingUp}
          color="bg-blue-500/20 text-blue-400"
        />
        <InsightList
          title="Risk Factors"
          items={risk_factors}
          icon={ShieldAlert}
          color="bg-red-500/20 text-red-400"
        />
        <InsightList
          title="Anomalies"
          items={anomalies}
          icon={Zap}
          color="bg-yellow-500/20 text-yellow-400"
        />
        <InsightList
          title="Recommendations"
          items={recommendations}
          icon={Lightbulb}
          color="bg-green-500/20 text-green-400"
        />
      </div>
    </div>
  );
}
