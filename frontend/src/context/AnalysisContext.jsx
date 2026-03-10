import { createContext, useContext, useState, useCallback } from 'react';

const AnalysisContext = createContext(null);

export function AnalysisProvider({ children }) {
    const [analysisData, setAnalysisData] = useState(null);
    const [filename, setFilename] = useState('');

    const reset = useCallback(() => {
        setAnalysisData(null);
        setFilename('');
    }, []);

    return (
        <AnalysisContext.Provider value={{
            analysisData,
            setAnalysisData,
            filename,
            setFilename,
            reset,
        }}>
            {children}
        </AnalysisContext.Provider>
    );
}

export function useAnalysis() {
    const ctx = useContext(AnalysisContext);
    if (!ctx) throw new Error('useAnalysis must be used within AnalysisProvider');
    return ctx;
}
