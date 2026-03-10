import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload, FileSpreadsheet, AlertCircle,
  ArrowRight, Sparkles, Moon, Sun,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ACCEPTED = {
  'text/csv': ['.csv'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
};
const MAX_SIZE = 50 * 1024 * 1024;

export default function UploadZone({ onFileAccepted }) {
  const [error, setError] = useState('');
  const { isDark, toggle } = useTheme();

  const onDrop = useCallback((accepted, rejected) => {
    setError('');
    if (rejected.length > 0) {
      const code = rejected[0].errors[0].code;
      if (code === 'file-too-large') setError('File exceeds 50 MB limit.');
      else if (code === 'file-invalid-type') setError('Only CSV and Excel (.xlsx / .xls) files are accepted.');
      else setError('File rejected — please try a different file.');
      return;
    }
    if (accepted.length > 0) onFileAccepted(accepted[0]);
  }, [onFileAccepted]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop, accept: ACCEPTED, maxSize: MAX_SIZE, multiple: false,
  });

  return (
    <div style={{
      height: '100vh',
      background: 'var(--bg)',
      color: 'var(--text)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      transition: 'background 0.3s ease, color 0.3s ease',
    }}>

      {/* ── Nav ── */}
      <header style={{
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={14} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 14 }}>DataInsight AI</span>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 99,
          background: 'var(--bg-card-strong)',
          border: '1px solid rgba(99,102,241,0.2)',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#6366f1', display: 'inline-block',
          }} />
          <span style={{ fontSize: 11, color: '#a5b4fc', fontWeight: 500 }}>Gemini-Powered</span>
        </div>
        <button
          className="theme-toggle"
          onClick={toggle}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </header>

      {/* ── Main ── */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px',
        width: '100%',
        minHeight: 0,
      }}>

        {/* Badge */}
        <div style={{
          marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 12px', borderRadius: 99,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
        }}>
          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Transform raw data into</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#a78bfa' }}>executive-level intelligence</span>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: "'Syne', 'Inter', sans-serif",
          fontWeight: 900,
          fontSize: 'clamp(1.6rem, 4vw, 2.8rem)',
          lineHeight: 1.1,
          textAlign: 'center',
          marginBottom: 8,
          letterSpacing: '-0.02em',
        }}>
          <span className="hero-gradient">Data Intelligence</span>
          <br />
          <span style={{ color: 'var(--text)' }}>Powered by AI.</span>
        </h1>

        <p style={{
          color: 'var(--text-4)',
          fontSize: 13,
          textAlign: 'center',
          lineHeight: 1.6,
          marginBottom: 24,
          maxWidth: 420,
        }}>
          Upload a CSV or Excel file. Get instant profiling, beautiful charts,
          and Gemini-generated insights — in under 30 seconds.
        </p>

        {/* ── Drop zone ── */}
        <div style={{ width: '100%', maxWidth: 520 }}>
          <div style={{
            padding: 1,
            borderRadius: 16,
            background: isDragActive && !isDragReject
              ? 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)'
              : isDragReject
                ? 'rgba(239,68,68,0.5)'
                : 'var(--border-md)',
          }}>
            <div
              {...getRootProps()}
              style={{
                borderRadius: 15,
                padding: '32px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                background: isDragActive && !isDragReject
                  ? 'rgba(99,102,241,0.06)'
                  : isDragReject
                    ? 'rgba(239,68,68,0.04)'
                    : 'var(--bg-input)',
                transition: 'background 0.2s',
              }}
            >
              <input {...getInputProps()} />

              {isDragActive ? (
                <div>
                  <div style={{
                    width: 56, height: 56, margin: '0 auto 14px',
                    borderRadius: 16,
                    background: 'rgba(99,102,241,0.15)',
                    border: '1px solid rgba(99,102,241,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Upload size={24} color="#a5b4fc" />
                  </div>
                  <p style={{ fontSize: 17, fontWeight: 800, color: '#c7d2fe', marginBottom: 2 }}>Release to Analyze</p>
                  <p style={{ fontSize: 12, color: 'var(--text-4)' }}>We'll handle the rest</p>
                </div>
              ) : (
                <div>
                  <div style={{
                    width: 56, height: 56, margin: '0 auto 14px',
                    borderRadius: 16,
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.06))',
                    border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative',
                  }}>
                    <FileSpreadsheet size={24} color="#cbd5e1" />
                    <div style={{
                      position: 'absolute', top: -3, right: -3,
                      width: 18, height: 18, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ color: '#fff', fontSize: 7, fontWeight: 900 }}>AI</span>
                    </div>
                  </div>

                  <p style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
                    Drop your dataset here
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-5)', marginBottom: 18 }}>
                    Drag &amp; drop a file, or click to browse
                  </p>

                  <button
                    type="button"
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 13,
                      padding: '10px 24px',
                      borderRadius: 12,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 7,
                      boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
                    }}
                  >
                    <Upload size={14} />
                    Choose File
                    <ArrowRight size={12} style={{ opacity: 0.7 }} />
                  </button>

                  <div style={{
                    marginTop: 16,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                    flexWrap: 'wrap',
                  }}>
                    {['.csv', '.xlsx', '.xls'].map(ext => (
                      <span key={ext} style={{
                        padding: '3px 8px', borderRadius: 6,
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        fontSize: 11, color: 'var(--text-5)',
                        fontFamily: 'monospace',
                      }}>
                        {ext}
                      </span>
                    ))}
                    <span style={{ fontSize: 11, color: 'var(--text-6)' }}>· Max 50 MB</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginTop: 10,
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px', borderRadius: 12,
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
            }}>
              <AlertCircle size={14} color="#f87171" />
              <span style={{ fontSize: 12, color: '#fca5a5' }}>{error}</span>
            </div>
          )}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer style={{ textAlign: 'center', padding: '12px 16px', flexShrink: 0 }}>
        <p style={{ fontSize: 10, color: 'var(--text-7)' }}>
          Files are processed in-memory &nbsp;·&nbsp; Never stored permanently &nbsp;·&nbsp; Powered by Google Gemini
        </p>
      </footer>
    </div>
  );
}
