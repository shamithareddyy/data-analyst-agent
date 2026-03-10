import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import UploadZone from '../components/UploadZone';
import { analyzeFile } from '../api/client';
import { useAnalysis } from '../context/AnalysisContext';

export default function UploadPage() {
    const navigate = useNavigate();
    const { setAnalysisData, setFilename } = useAnalysis();

    const handleFileAccepted = useCallback(async (file) => {
        setFilename(file.name);
        navigate('/analyze', { state: { filename: file.name } });

        try {
            const result = await analyzeFile(file);
            setAnalysisData(result);
            toast.success('Analysis complete!', {
                style: {
                    background: 'rgba(15,23,42,0.95)',
                    color: '#f1f5f9',
                    border: '1px solid rgba(99,102,241,0.35)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '14px',
                    fontWeight: 600,
                    fontSize: '14px',
                },
                iconTheme: { primary: '#6366f1', secondary: '#f1f5f9' },
            });
            navigate('/dashboard');
        } catch (err) {
            const msg = err?.response?.data?.detail || err.message || 'Analysis failed. Check your file and try again.';
            toast.error(msg, {
                style: {
                    background: 'rgba(15,23,42,0.95)',
                    color: '#f1f5f9',
                    border: '1px solid rgba(239,68,68,0.35)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '14px',
                    fontWeight: 600,
                    fontSize: '14px',
                },
                duration: 6000,
            });
            navigate('/');
        }
    }, [navigate, setAnalysisData, setFilename]);

    return <UploadZone onFileAccepted={handleFileAccepted} />;
}
