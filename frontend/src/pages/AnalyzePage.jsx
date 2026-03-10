import { useLocation, Navigate } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import { useAnalysis } from '../context/AnalysisContext';

export default function AnalyzePage() {
    const location = useLocation();
    const { filename, analysisData } = useAnalysis();

    const displayName = location.state?.filename || filename;

    // If we already have data, redirect to dashboard
    if (analysisData) {
        return <Navigate to="/dashboard" replace />;
    }

    // If no filename at all, redirect to upload
    if (!displayName) {
        return <Navigate to="/" replace />;
    }

    return <LoadingScreen filename={displayName} />;
}
