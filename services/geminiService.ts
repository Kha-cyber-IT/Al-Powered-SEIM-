import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult, LogSeverity } from '../types';

// Ensure API Key is available
const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const modelId = "gemini-2.5-flash";

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    isThreat: { type: Type.BOOLEAN, description: "Whether the log indicates a security threat." },
    severity: { type: Type.STRING, enum: ["INFO", "WARNING", "ERROR", "CRITICAL"], description: "The severity level of the log." },
    threatType: { type: Type.STRING, description: "The specific type of threat (e.g., SQL Injection, XSS, Brute Force), or null if safe." },
    confidenceScore: { type: Type.NUMBER, description: "Confidence score between 0 and 100." },
    summary: { type: Type.STRING, description: "A brief, one-sentence summary of what happened." },
    mitigationSteps: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING }, 
      description: "List of recommended actions to mitigate this threat." 
    }
  },
  required: ["isThreat", "severity", "confidenceScore", "summary", "mitigationSteps"],
};

export const analyzeLogWithGemini = async (logLine: string): Promise<AIAnalysisResult> => {
  if (!ai) {
    // Fallback for demo if no key (simulated response)
    return new Promise(resolve => {
        setTimeout(() => {
            const isAttack = logLine.includes("OR '1'='1") || logLine.includes("<script>") || logLine.includes("etc/passwd");
            resolve({
                isThreat: isAttack,
                severity: isAttack ? LogSeverity.CRITICAL : LogSeverity.INFO,
                threatType: isAttack ? "Simulated Attack Pattern" : null,
                confidenceScore: isAttack ? 95 : 10,
                summary: isAttack ? "Detected simulated malicious payload in request parameters." : "Standard HTTP access log entry.",
                mitigationSteps: isAttack ? ["Block source IP", "Sanitize input parameters", "Check WAF rules"] : []
            });
        }, 1000);
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Analyze this web server log entry for security threats. 
      Log: ${logLine}
      
      Context: This is a single line from an Apache/Nginx access log. Look for OWASP Top 10 vulnerabilities like SQLi, XSS, Command Injection, etc.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are an expert SOC Analyst and Security Engineer. Your job is to analyze logs with high precision.",
        temperature: 0.2, // Low temperature for consistent, analytical results
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response from Gemini");

    const result = JSON.parse(jsonText) as AIAnalysisResult;
    return result;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      isThreat: false,
      severity: LogSeverity.ERROR,
      threatType: "Analysis Failed",
      confidenceScore: 0,
      summary: "Failed to analyze log due to API error.",
      mitigationSteps: ["Check API Key", "Check Internet Connection"]
    };
  }
};
