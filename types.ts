export enum LogSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export interface LogEntry {
  id: string;
  timestamp: string;
  sourceIp: string;
  method: string;
  endpoint: string;
  statusCode: number;
  message: string;
  raw: string; // The full raw log line
}

export interface AIAnalysisResult {
  isThreat: boolean;
  severity: LogSeverity;
  threatType: string | null; // e.g., "SQL Injection", "XSS", "Brute Force"
  confidenceScore: number; // 0-100
  summary: string;
  mitigationSteps: string[];
}

export interface AnalyzedLog extends LogEntry {
  analysis?: AIAnalysisResult;
  isAnalyzing?: boolean;
}
