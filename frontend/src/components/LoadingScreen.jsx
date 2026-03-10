import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import ParticleField from './ParticleField';

const STEPS = [
  { label: 'Parsing file structure', detail: 'Detecting encodings & schema', duration: 1200 },
  { label: 'Running data profiling engine', detail: 'Types, nulls, outliers, correlations', duration: 2000 },
  { label: 'Generating visualizations', detail: 'Auto-selecting the best chart types', duration: 1500 },
  { label: 'Consulting Gemini AI', detail: 'Building structured insight prompt', duration: 2500 },
  { label: 'Aggregating final report', detail: 'Merging stats, charts & AI insights', duration: 1000 },
];

const TOTAL = STEPS.reduce((a, s) => a + s.duration, 0);

/* ── Smooth number ticker ── */
function useSmoothCounter(target, duration = 500) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef({ time: 0, value: 0 });

  useEffect(() => {
    if (target === value) return;
    startRef.current = { time: performance.now(), value };

    const animate = (now) => {
      const elapsed = now - startRef.current.time;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = startRef.current.value + (target - startRef.current.value) * eased;
      setValue(Math.round(current));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}

function Ring({ progress, size = 140, stroke = 10 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative">
      {/* Glow trail */}
      <div className="glow-trail" style={{ opacity: progress > 5 ? 0.6 : 0 }} />
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (progress / 100) * circ }}
          transition={{ ease: 'easeInOut', duration: 0.6 }}
        />
        <defs>
          <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default function LoadingScreen({ filename }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const smoothProgress = useSmoothCounter(progress, 600);

  useEffect(() => {
    let elapsed = 0;
    STEPS.forEach((step, i) => {
      setTimeout(() => {
        setCurrentStep(i);
        const pct = Math.round(((elapsed + step.duration) / TOTAL) * 95);
        setProgress(pct);
        if (i === STEPS.length - 1) {
          setTimeout(() => { setProgress(100); setDone(true); }, step.duration);
        }
      }, elapsed);
      elapsed += step.duration;
    });
  }, []);

  return (
    <div className="min-h-screen gradient-bg grid-pattern flex items-center justify-center px-6 relative overflow-hidden">

      {/* Particle background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <ParticleField className="pointer-events-auto" />
      </div>

      {/* Aurora orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-[1]" aria-hidden>
        <div className="aurora-1 absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)' }} />
        <div className="aurora-2 absolute -bottom-40 right-1/4 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)' }} />
      </div>

      {/* Morphing wave behind card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] morph-wave z-[2] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.04) 40%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 30, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 glass-card rounded-3xl p-10 max-w-lg w-full"
        style={{ border: '1px solid rgba(255,255,255,0.09)' }}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-8 right-8 h-px gradient-border-animated rounded-full" style={{ height: '2px' }} />

        {/* Ring + percentage */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative flex items-center justify-center">
            <Ring progress={smoothProgress} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white tabular-nums">
                {smoothProgress}%
              </span>
              <span className="text-slate-500 text-xs mt-0.5">complete</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-black text-white text-center mb-1">
          Analyzing Dataset
        </h2>
        <p className="text-slate-500 text-sm text-center truncate mb-8 max-w-xs mx-auto">
          {filename}
        </p>

        {/* Steps */}
        <div className="space-y-2.5">
          {STEPS.map((step, i) => {
            const isActive = i === currentStep;
            const isDone = i < currentStep || done;
            return (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: i <= currentStep || done ? 1 : 0.25, x: 0 }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 200, damping: 25 }}
                className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-300 ${isActive && !done ? 'bg-indigo-500/10 border border-indigo-500/20' : 'border border-transparent'
                  }`}
              >
                {/* Step icon */}
                <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${isDone
                    ? 'bg-indigo-500'
                    : isActive
                      ? 'border border-indigo-500/60 bg-indigo-500/10'
                      : 'border border-white/10 bg-white/3'
                  }`}>
                  {isDone ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <CheckCircle2 size={12} className="text-white" />
                    </motion.div>
                  ) : isActive ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                    >
                      <Loader2 size={10} className="text-indigo-400" />
                    </motion.div>
                  ) : null}
                </div>

                {/* Step text */}
                <div className="min-w-0">
                  <div className={`text-sm font-semibold leading-tight ${isDone ? 'text-slate-400' : isActive ? 'text-white' : 'text-slate-600'
                    }`}>
                    {step.label}
                  </div>
                  <AnimatePresence>
                    {isActive && !done && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-indigo-400/70 text-xs mt-0.5"
                      >
                        {step.detail}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Duration pill */}
                {isDone && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5, x: 10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="ml-auto text-xs text-indigo-400/60 bg-indigo-500/10 px-2 py-0.5 rounded-full shrink-0"
                  >
                    ✓
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <p className="text-slate-700 text-xs text-center mt-8">
          Powered by Google Gemini &nbsp;·&nbsp; Usually completes in 15–30 seconds
        </p>
      </motion.div>
    </div>
  );
}
