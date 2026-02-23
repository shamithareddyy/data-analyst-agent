import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const steps = [
  { label: 'Parsing file structure', duration: 1200 },
  { label: 'Running data profiling engine', duration: 2000 },
  { label: 'Generating visualizations', duration: 1500 },
  { label: 'Sending to Gemini AI', duration: 2500 },
  { label: 'Aggregating insights', duration: 1000 },
];

function ProgressBar({ progress }) {
  return (
    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ ease: 'easeInOut', duration: 0.4 }}
      />
    </div>
  );
}

export default function LoadingScreen({ filename }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let totalElapsed = 0;
    const totalDuration = steps.reduce((a, s) => a + s.duration, 0);

    steps.forEach((step, i) => {
      setTimeout(() => {
        setCurrentStep(i);
        setProgress(Math.round(((totalElapsed + step.duration) / totalDuration) * 95));
      }, totalElapsed);
      totalElapsed += step.duration;
    });
  }, []);

  return (
    <div className="min-h-screen gradient-bg grid-pattern flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-3xl p-12 max-w-lg w-full text-center"
      >
        {/* Animated logo */}
        <div className="relative w-24 h-24 mx-auto mb-10">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-indigo-500/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border-2 border-purple-500/30 border-dashed"
            animate={{ rotate: -360 }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute inset-4 rounded-full bg-indigo-500/20 flex items-center justify-center">
            <span className="text-2xl">✦</span>
          </div>
          <div className="absolute inset-0 rounded-full pulse-glow" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Analyzing Dataset</h2>
        <p className="text-slate-500 text-sm mb-10 truncate max-w-xs mx-auto">{filename}</p>

        <ProgressBar progress={progress} />

        <div className="mt-8 space-y-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: i <= currentStep ? 1 : 0.25, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 text-left"
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                i < currentStep
                  ? 'bg-indigo-500'
                  : i === currentStep
                  ? 'bg-indigo-500/30 border border-indigo-500'
                  : 'bg-white/5 border border-white/10'
              }`}>
                {i < currentStep && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                )}
                {i === currentStep && (
                  <motion.div
                    className="w-2 h-2 rounded-full bg-indigo-400"
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </div>
              <span className={`text-sm ${i === currentStep ? 'text-indigo-300 font-semibold' : i < currentStep ? 'text-slate-400' : 'text-slate-600'}`}>
                {step.label}
              </span>
            </motion.div>
          ))}
        </div>

        <p className="text-slate-600 text-xs mt-10">Powered by Google Gemini · This may take 15–30 seconds</p>
      </motion.div>
    </div>
  );
}
