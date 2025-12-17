import React from 'react';
import { AnalyzedLog, LogSeverity } from '../types';
import { Play, Loader2, AlertTriangle, Check, Shield } from 'lucide-react';

interface LogTableProps {
  logs: AnalyzedLog[];
  onAnalyze: (log: AnalyzedLog) => void;
  onViewDetails: (log: AnalyzedLog) => void;
}

export const LogTable: React.FC<LogTableProps> = ({ logs, onAnalyze, onViewDetails }) => {
  return (
    <div className="w-full bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-sm flex-1">
      <div className="overflow-x-auto h-full scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        <table className="w-full text-left border-collapse min-w-[800px] xl:min-w-full">
          <thead>
            <tr className="bg-gray-800/50 border-b border-gray-700 text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider">
              <th className="px-4 py-3 sm:px-6 sm:py-4 font-semibold sticky top-0 bg-gray-800/90 backdrop-blur z-10">Timestamp</th>
              <th className="px-4 py-3 sm:px-6 sm:py-4 font-semibold sticky top-0 bg-gray-800/90 backdrop-blur z-10">Method</th>
              <th className="px-4 py-3 sm:px-6 sm:py-4 font-semibold sticky top-0 bg-gray-800/90 backdrop-blur z-10">Source IP</th>
              <th className="px-4 py-3 sm:px-6 sm:py-4 font-semibold sticky top-0 bg-gray-800/90 backdrop-blur z-10">Endpoint</th>
              <th className="px-4 py-3 sm:px-6 sm:py-4 font-semibold text-center sticky top-0 bg-gray-800/90 backdrop-blur z-10">Status</th>
              <th className="px-4 py-3 sm:px-6 sm:py-4 font-semibold text-center sticky top-0 bg-gray-800/90 backdrop-blur z-10">Analysis</th>
              <th className="px-4 py-3 sm:px-6 sm:py-4 font-semibold text-right sticky top-0 bg-gray-800/90 backdrop-blur z-10">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500 text-sm">
                  No logs available. Start traffic generation.
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const isThreat = log.analysis?.isThreat;
                const severity = log.analysis?.severity || LogSeverity.INFO;
                
                return (
                  <tr 
                    key={log.id} 
                    className={`
                      group transition-colors duration-200 
                      ${isThreat ? 'bg-red-900/10 hover:bg-red-900/20' : 'hover:bg-gray-800/50'}
                    `}
                  >
                    <td className="px-4 py-3 sm:px-6 sm:py-3 text-[10px] sm:text-xs font-mono text-gray-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3 sm:px-6 sm:py-3">
                      <span className={`
                        text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded 
                        ${log.method === 'GET' ? 'bg-blue-500/20 text-blue-400' : 
                          log.method === 'POST' ? 'bg-green-500/20 text-green-400' : 
                          'bg-purple-500/20 text-purple-400'}
                      `}>
                        {log.method}
                      </span>
                    </td>
                    <td className="px-4 py-3 sm:px-6 sm:py-3 text-[10px] sm:text-xs font-mono text-gray-300 whitespace-nowrap">{log.sourceIp}</td>
                    <td className="px-4 py-3 sm:px-6 sm:py-3 text-[10px] sm:text-xs text-gray-300 max-w-[150px] sm:max-w-[200px] truncate font-mono" title={log.endpoint}>
                      {log.endpoint}
                    </td>
                    <td className="px-4 py-3 sm:px-6 sm:py-3 text-center">
                      <span className={`
                        text-[10px] sm:text-xs font-bold
                        ${log.statusCode >= 500 ? 'text-red-500' :
                          log.statusCode >= 400 ? 'text-yellow-500' :
                          'text-green-500'}
                      `}>
                        {log.statusCode}
                      </span>
                    </td>
                    <td className="px-4 py-3 sm:px-6 sm:py-3 text-center">
                      {log.isAnalyzing ? (
                        <div className="flex justify-center">
                          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-cyan-400" />
                        </div>
                      ) : log.analysis ? (
                         log.analysis.isThreat ? (
                           <div className="flex items-center justify-center gap-1 text-red-500">
                             <AlertTriangle size={12} className="sm:w-3.5 sm:h-3.5" />
                             <span className="text-[10px] sm:text-xs font-bold">THREAT</span>
                           </div>
                         ) : (
                           <div className="flex items-center justify-center gap-1 text-green-500">
                             <Shield size={12} className="sm:w-3.5 sm:h-3.5" />
                             <span className="text-[10px] sm:text-xs font-bold">SAFE</span>
                           </div>
                         )
                      ) : (
                        <span className="text-[10px] sm:text-xs text-gray-600">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 sm:px-6 sm:py-3 text-right">
                      {log.analysis ? (
                        <button 
                          onClick={() => onViewDetails(log)}
                          className="text-[10px] sm:text-xs bg-gray-800 hover:bg-gray-700 text-cyan-400 px-2 py-1 sm:px-3 sm:py-1.5 rounded border border-gray-700 transition-colors whitespace-nowrap"
                        >
                          View Report
                        </button>
                      ) : (
                        <button 
                          onClick={() => onAnalyze(log)}
                          disabled={log.isAnalyzing}
                          className="text-[10px] sm:text-xs bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 px-2 py-1 sm:px-3 sm:py-1.5 rounded border border-cyan-500/20 transition-colors flex items-center gap-1 ml-auto whitespace-nowrap"
                        >
                          <Play size={10} /> Analyze
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};