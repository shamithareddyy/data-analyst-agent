import { useNavigate, Navigate } from 'react-router-dom';
import { useCallback } from 'react';
import Dashboard from '../components/Dashboard';
import { useAnalysis } from '../context/AnalysisContext';

export default function DashboardPage() {
    const navigate = useNavigate();
    const { analysisData, reset } = useAnalysis();

    const handleReset = useCallback(() => {
        reset();
        navigate('/');
    }, [navigate, reset]);

    // Guard: redirect to upload if no data
    if (!analysisData) {
        return <Navigate to="/" replace />;
    }

    return <Dashboard data={analysisData} onReset={handleReset} />;
}
