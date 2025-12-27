import React from 'react';
import { X, ShieldAlert, CheckCircle, Activity, Lock, AlertTriangle } from 'lucide-react';
import { AnalyzedLog, LogSeverity } from '../types';

interface AnalysisModalProps {
  log: AnalyzedLog | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({ log, isOpen, onClose }) => {
  if (!isOpen || !log || !log.analysis) return null;

  const { analysis } = log;
  const isError = analysis.severity === LogSeverity.ERROR;
  const isSafe = !analysis.isThreat && !isError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className={`p-6 flex justify-between items-center border-b ${isSafe ? 'border-green-900 bg-green-900/10' : isError ? 'border-gray-700 bg-gray-800' : 'border-red-900 bg-red-900/10'}`}>
          <div className="flex items-center gap-3">
            {isSafe ? (
              <CheckCircle className="text-green-500 w-8 h-8" />
            ) : isError ? (
              <AlertTriangle className="text-yellow-500 w-8 h-8" />
            ) : (
              <ShieldAlert className="text-red-500 w-8 h-8" />
            )}
            <div>
              <h2 className="text-xl font-bold text-white">
                {isSafe ? 'Traffic Analysis: SAFE' : isError ? 'ANALYSIS FAILED' : `THREAT DETECTED: ${analysis.threatType?.toUpperCase()}`}
              </h2>
              <p className="text-sm text-gray-400 font-mono">{log.timestamp}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Summary Section */}
          <div className="space-y-2">
            <h3 className="text-sm uppercase tracking-wider text-gray-500 font-bold flex items-center gap-2">
              <Activity size={16} /> Analysis Summary
            </h3>
            <p className="text-lg text-gray-200 leading-relaxed">
              {analysis.summary}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <p className="text-xs text-gray-500 mb-1">Confidence Score</p>
              <div className="flex items-center gap-2">
                <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${analysis.confidenceScore > 80 ? 'bg-green-500' : 'bg-yellow-500'}`} 
                    style={{ width: `${analysis.confidenceScore}%` }}
                  ></div>
                </div>
                <span className="font-mono font-bold">{analysis.confidenceScore}%</span>
              </div>
            </div>
            
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <p className="text-xs text-gray-500 mb-1">Severity Level</p>
              <span className={`inline-block px-2 py-0.5 rounded text-sm font-bold 
                ${analysis.severity === LogSeverity.CRITICAL ? 'bg-red-500 text-white' : 
                  analysis.severity === LogSeverity.WARNING ? 'bg-yellow-500 text-black' : 
                  'bg-blue-500 text-white'}`}>
                {analysis.severity}
              </span>
            </div>
          </div>

          {/* Raw Log */}
          <div className="space-y-2">
            <h3 className="text-sm uppercase tracking-wider text-gray-500 font-bold flex items-center gap-2">
              <Lock size={16} /> Raw Log Entry
            </h3>
            <div className="bg-black/50 p-4 rounded-lg border border-gray-800 font-mono text-xs text-gray-300 break-all">
              {log.raw}
            </div>
          </div>

          {/* Mitigation Steps (Only if threat or error) */}
          {!isSafe && analysis.mitigationSteps && (
            <div className="space-y-3">
              <h3 className={`text-sm uppercase tracking-wider font-bold flex items-center gap-2 ${isError ? 'text-yellow-400' : 'text-red-400'}`}>
                <AlertTriangle size={16} /> {isError ? 'Troubleshooting' : 'Recommended Mitigation'}
              </h3>
              <ul className="space-y-2">
                {analysis.mitigationSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 bg-red-500/5 p-3 rounded border border-red-500/10">
                    <span className="bg-red-500/20 text-red-400 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-gray-300 text-sm">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
        
        {/* Footer */}
        <div className="p-4 bg-gray-800 border-t border-gray-700 text-center text-xs text-gray-500">
          Powered by Google Gemini 2.5 Flash
        </div>
      </div>
    </div>
  );
};
