import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileSpreadsheet, AlertCircle, Zap, BarChart3, Brain } from 'lucide-react';

const ACCEPTED = {
  'text/csv': ['.csv'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
};

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

const features = [
  { icon: BarChart3, label: 'Auto Profiling', desc: 'Full EDA in seconds' },
  { icon: Brain, label: 'Gemini AI', desc: 'Executive insights' },
  { icon: Zap, label: 'Smart Charts', desc: 'Auto-generated visuals' },
];

export default function UploadZone({ onFileAccepted }) {
  const [error, setError] = useState('');

  const onDrop = useCallback((accepted, rejected) => {
    setError('');
    if (rejected.length > 0) {
      const code = rejected[0].errors[0].code;
      if (code === 'file-too-large') setError('File exceeds 50MB limit.');
      else if (code === 'file-invalid-type') setError('Only CSV and Excel files are accepted.');
      else setError('File rejected. Please try again.');
      return;
    }
    if (accepted.length > 0) onFileAccepted(accepted[0]);
  }, [onFileAccepted]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxSize: MAX_SIZE,
    multiple: false,
  });

  return (
    <div className="min-h-screen gradient-bg grid-pattern flex flex-col items-center justify-center px-6 py-16">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="text-center mb-14 max-w-3xl"
      >
        {/* Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8 border border-indigo-500/30"
        >
          <span className="w-2 h-2 rounded-full bg-indigo-400 pulse-glow" />
          <span className="text-indigo-300 text-sm font-medium tracking-wide">Gemini-Powered Intelligence</span>
        </motion.div>

        <h1 className="text-6xl md:text-7xl font-black tracking-tight mb-6 leading-none">
          <span className="text-white">Data </span>
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 bg-clip-text text-transparent text-glow">
            Insight
          </span>
          <span className="text-white"> AI</span>
        </h1>

        <p className="text-slate-400 text-xl leading-relaxed max-w-2xl mx-auto">
          Transform raw datasets into{' '}
          <span className="text-indigo-300 font-semibold">executive-level intelligence</span>.
          Upload a file and watch Gemini turn your data into strategic gold.
        </p>
      </motion.div>

      {/* Feature Pills */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap justify-center gap-4 mb-12"
      >
        {features.map(({ icon: Icon, label, desc }) => (
          <div key={label} className="flex items-center gap-3 glass px-5 py-3 rounded-2xl">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <Icon size={16} className="text-indigo-400" />
            </div>
            <div>
              <div className="text-white text-sm font-semibold">{label}</div>
              <div className="text-slate-500 text-xs">{desc}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Drop Zone */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <div
          {...getRootProps()}
          className={`
            relative cursor-pointer rounded-3xl p-16 text-center transition-all duration-300
            ${isDragActive && !isDragReject
              ? 'glass-strong glow-brand border-2 border-indigo-500/60 scale-[1.02]'
              : isDragReject
              ? 'glass border-2 border-red-500/60'
              : 'glass border-2 border-dashed border-white/10 hover:border-indigo-500/40 hover:glow-brand-sm'
            }
          `}
        >
          <input {...getInputProps()} />

          {/* Background orb */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
            <div className={`absolute inset-0 transition-opacity duration-500 ${isDragActive ? 'opacity-100' : 'opacity-0'}`}>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isDragActive ? (
              <motion.div key="drag" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-indigo-500/20 flex items-center justify-center float">
                  <Upload size={36} className="text-indigo-400" />
                </div>
                <p className="text-2xl font-bold text-indigo-300">Drop it like it's hot</p>
                <p className="text-slate-500 mt-2">Release to begin analysis</p>
              </motion.div>
            ) : (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center">
                  <FileSpreadsheet size={36} className="text-slate-400" />
                </div>
                <p className="text-2xl font-bold text-white mb-2">Drop your dataset here</p>
                <p className="text-slate-500 mb-6">or click to browse files</p>
                <div className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 transition-colors px-6 py-3 rounded-xl text-white font-semibold text-sm">
                  <Upload size={16} />
                  Choose File
                </div>
                <p className="text-slate-600 text-sm mt-6">Accepts .csv, .xlsx · Max 50MB</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3"
            >
              <AlertCircle size={16} className="text-red-400 shrink-0" />
              <span className="text-red-300 text-sm">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12 text-slate-600 text-sm text-center"
      >
        Files are processed in-memory and never stored permanently
      </motion.p>
    </div>
  );
}
