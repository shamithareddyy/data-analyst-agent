import { useState, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import UploadZone from './components/UploadZone';
import LoadingScreen from './components/LoadingScreen';
import Dashboard from './components/Dashboard';
import { analyzeFile } from './api/client';

const STATES = { IDLE: 'idle', LOADING: 'loading', DONE: 'done' };

export default function App() {
  const [appState, setAppState] = useState(STATES.IDLE);
  const [data, setData] = useState(null);
  const [filename, setFilename] = useState('');

  const handleFileAccepted = useCallback(async (file) => {
    setFilename(file.name);
    setAppState(STATES.LOADING);

    try {
      const result = await analyzeFile(file);
      setData(result);
      setAppState(STATES.DONE);
      toast.success('Analysis complete!', {
        style: { background: '#1e2538', color: '#f1f5f9', border: '1px solid rgba(99,102,241,0.3)' },
        iconTheme: { primary: '#6366f1', secondary: '#f1f5f9' },
      });
    } catch (err) {
      const msg = err?.response?.data?.detail || err.message || 'Analysis failed. Check your file and try again.';
      toast.error(msg, {
        style: { background: '#1e2538', color: '#f1f5f9', border: '1px solid rgba(239,68,68,0.3)' },
        duration: 6000,
      });
      setAppState(STATES.IDLE);
    }
  }, []);

  const handleReset = useCallback(() => {
    setAppState(STATES.IDLE);
    setData(null);
    setFilename('');
  }, []);

  return (
    <>
      <Toaster position="top-right" />
      <AnimatePresence mode="wait">
        {appState === STATES.IDLE && (
          <UploadZone key="upload" onFileAccepted={handleFileAccepted} />
        )}
        {appState === STATES.LOADING && (
          <LoadingScreen key="loading" filename={filename} />
        )}
        {appState === STATES.DONE && data && (
          <Dashboard key="dashboard" data={data} onReset={handleReset} />
        )}
      </AnimatePresence>
    </>
  );
}
