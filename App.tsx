import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  AlertOctagon, 
  Search, 
  Server, 
  Play, 
  Pause,
  Bug,
  Trash2
} from 'lucide-react';
import { generateNormalLog, generateAttackLog } from './services/mockData';
import { analyzeLogWithGemini } from './services/geminiService';
import { AnalyzedLog, LogSeverity } from './types';
import { MetricCard } from './components/MetricCard';
import { LogTable } from './components/LogTable';
import { AnalysisModal } from './components/AnalysisModal';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Constants
const MAX_LOGS = 50;

const App: React.FC = () => {
  const [logs, setLogs] = useState<AnalyzedLog[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AnalyzedLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Stats
  const totalLogs = logs.length;
  const threatsDetected = logs.filter(l => l.analysis?.isThreat).length;
  const criticalThreats = logs.filter(l => l.analysis?.severity === LogSeverity.CRITICAL).length;
  const avgConfidence = threatsDetected > 0 
    ? Math.round(logs.filter(l => l.analysis?.isThreat).reduce((acc, curr) => acc + (curr.analysis?.confidenceScore || 0), 0) / threatsDetected)
    : 0;

  // Chart Data Preparation
  const chartData = [
    { name: 'Normal', value: logs.filter(l => l.analysis && !l.analysis.isThreat).length, color: '#22c55e' },
    { name: 'Suspicious', value: logs.filter(l => l.analysis?.severity === LogSeverity.WARNING).length, color: '#eab308' },
    { name: 'Critical', value: logs.filter(l => l.analysis?.severity === LogSeverity.CRITICAL).length, color: '#ef4444' },
  ];

  // Log Generation Loop
  useEffect(() => {
    if (isGenerating) {
      const interval = window.setInterval(() => {
        const isAttack = Math.random() > 0.8; // 20% chance of attack
        const newLog: AnalyzedLog = isAttack 
          ? generateAttackLog(['SQLi', 'XSS', 'BruteForce', 'PathTraversal'][Math.floor(Math.random() * 4)] as any) 
          : generateNormalLog();
        
        setLogs(prev => {
          const updated = [newLog, ...prev];
          return updated.slice(0, MAX_LOGS);
        });
      }, 1500); // New log every 1.5 seconds

      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  // Handler: Analyze a specific log
  const handleAnalyzeLog = useCallback(async (logToAnalyze: AnalyzedLog) => {
    // Optimistic update to show loading
    setLogs(prev => prev.map(log => 
      log.id === logToAnalyze.id ? { ...log, isAnalyzing: true } : log
    ));

    const analysis = await analyzeLogWithGemini(logToAnalyze.raw);

    setLogs(prev => prev.map(log => 
      log.id === logToAnalyze.id ? { ...log, isAnalyzing: false, analysis } : log
    ));
  }, []);

  // Handler: View Details
  const handleViewDetails = (log: AnalyzedLog) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  // Handler: Auto-Analyze High Risk (Simulated for Demo)
  // In a real app, this would be triggered by a backend service. 
  // Here we just trigger analysis for the top unanalyzed log if it looks suspicious via regex as a "pre-filter"
  useEffect(() => {
    if (isGenerating) {
      const unanalyzedHighRisk = logs.find(l => !l.analysis && !l.isAnalyzing && (l.statusCode >= 400 || l.raw.includes("'") || l.raw.includes("<")));
      if (unanalyzedHighRisk) {
        handleAnalyzeLog(unanalyzedHighRisk);
      }
    }
  }, [logs, isGenerating, handleAnalyzeLog]);


  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-200 font-sans selection:bg-cyan-500/30 flex flex-col">
      
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-[#0B0F19]/80 backdrop-blur-md border-b border-gray-800 z-40">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center border border-cyan-500/30">
              <ShieldCheck className="text-cyan-400" size={20} />
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg tracking-tight text-white leading-tight">Sentinel<span className="text-cyan-400">AI</span></h1>
              <p className="hidden sm:block text-[10px] text-gray-500 font-mono uppercase tracking-widest">Intelligent SIEM System</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 px-2 py-1 sm:px-3 sm:py-1.5 bg-gray-900 rounded-md border border-gray-800">
              <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isGenerating ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
              <span className="text-[10px] sm:text-xs font-mono text-gray-400">{isGenerating ? 'LIVE' : 'STANDBY'}</span>
            </div>
            <button 
              onClick={() => setLogs([])}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Clear Logs"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 pt-20 sm:pt-24 px-4 sm:px-6 lg:px-8 pb-12 w-full max-w-[1920px] mx-auto space-y-6 sm:space-y-8">
        
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-900/50 p-4 rounded-xl border border-gray-800/50">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Security Dashboard</h2>
            <p className="text-gray-400 text-xs sm:text-sm">Real-time threat detection powered by Gemini 2.5 Flash</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
             <button 
              onClick={() => {
                // Generate a burst of logs
                const newLogs = Array.from({length: 5}).map(() => Math.random() > 0.5 ? generateNormalLog() : generateAttackLog('SQLi'));
                setLogs(prev => [...newLogs, ...prev].slice(0, MAX_LOGS));
              }}
              className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg border border-gray-700 transition-all text-xs sm:text-sm font-medium"
            >
              <Bug size={14} /> <span className="hidden sm:inline">Burst</span> Test
            </button>
            <button 
              onClick={() => setIsGenerating(!isGenerating)}
              className={`
                flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 sm:px-6 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all shadow-lg hover:shadow-cyan-500/20 whitespace-nowrap
                ${isGenerating 
                  ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20' 
                  : 'bg-cyan-500 text-black hover:bg-cyan-400'}
              `}
            >
              {isGenerating ? <Pause size={14} /> : <Play size={14} />}
              {isGenerating ? 'Stop Monitor' : 'Start Monitor'}
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <MetricCard 
            title="Total Events" 
            value={totalLogs} 
            icon={Server} 
            color="blue" 
          />
          <MetricCard 
            title="Threats Detected" 
            value={threatsDetected} 
            icon={AlertOctagon} 
            color="yellow" 
            trend={threatsDetected > 0 ? "Requires Attention" : "All clear"}
          />
          <MetricCard 
            title="Critical Incidents" 
            value={criticalThreats} 
            icon={ShieldCheck} 
            color="red" 
            trend={criticalThreats > 0 ? "Immediate Action" : "Secure"}
          />
          <MetricCard 
            title="AI Confidence" 
            value={`${avgConfidence}%`} 
            icon={Activity} 
            color="green" 
          />
        </div>

        {/* Main Interface: Charts & Logs */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 items-start">
          
          {/* Left Column: Logs (2/3 width on XL) */}
          <div className="xl:col-span-2 space-y-4 order-2 xl:order-1 h-full flex flex-col">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-bold text-gray-300 flex items-center gap-2 text-sm sm:text-base">
                <Search size={18} /> Live Traffic Stream
              </h3>
              <span className="text-[10px] sm:text-xs text-gray-500 font-mono hidden sm:inline-block">Auto-analyzing high risk events...</span>
            </div>
            
            <LogTable 
              logs={logs} 
              onAnalyze={handleAnalyzeLog} 
              onViewDetails={handleViewDetails}
            />
          </div>

          {/* Right Column: Visualization (1/3 width on XL) */}
          <div className="xl:col-span-1 space-y-4 sm:space-y-6 order-1 xl:order-2">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6 h-[250px] sm:h-[300px]">
              <h3 className="font-bold text-gray-300 mb-4 sm:mb-6 text-xs sm:text-sm uppercase tracking-wider">Threat Distribution</h3>
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', fontSize: '12px' }}
                    itemStyle={{ color: '#e5e7eb' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Tips Panel */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-4 sm:p-6">
              <h3 className="font-bold text-cyan-400 mb-3 sm:mb-4 flex items-center gap-2 text-sm">
                <ShieldCheck size={16} /> System Status
              </h3>
              <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-gray-400">
                <p>
                  <span className="text-gray-200 font-semibold">Gemini 2.5 Flash</span> is active.
                </p>
                <div className="p-3 bg-black/40 rounded border border-gray-700/50 space-y-1">
                  <p className="font-mono text-green-400">$ system_status: ONLINE</p>
                  <p className="font-mono text-blue-400">$ latency: 45ms</p>
                  <p className="font-mono text-yellow-400">$ active_rules: 128</p>
                </div>
                <p className="opacity-70">
                  Select "Analyze" to request a forensic report.
                </p>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Analysis Modal */}
      <AnalysisModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        log={selectedLog}
      />

    </div>
  );
};

export default App;