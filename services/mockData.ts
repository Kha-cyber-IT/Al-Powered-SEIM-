import { LogEntry, LogSeverity } from '../types';

const IP_ADDRESSES = [
  '192.168.1.5', '192.168.1.12', '10.0.0.45', '172.16.0.22', // Internal
  '45.23.11.2', '89.12.34.55', '203.0.113.5', '198.51.100.23' // External/Attacker
];

const ENDPOINTS = [
  '/api/v1/users', '/login', '/dashboard', '/assets/logo.png', 
  '/api/v1/products', '/contact', '/admin/settings', '/wp-admin'
];

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  'Python-urllib/3.8',
  'curl/7.64.1',
  'sqlmap/1.5.2'
];

let logCounter = 0;

const generateLogId = () => `log-${Date.now()}-${logCounter++}`;

export const generateNormalLog = (): LogEntry => {
  const ip = IP_ADDRESSES[Math.floor(Math.random() * 4)]; // Pick internal/safe IPs mostly
  const method = ['GET', 'POST'][Math.floor(Math.random() * 2)];
  const endpoint = ENDPOINTS[Math.floor(Math.random() * (ENDPOINTS.length - 2))]; // Skip admin/wp-admin mostly
  const status = [200, 201, 304][Math.floor(Math.random() * 3)];
  const ua = USER_AGENTS[Math.floor(Math.random() * 2)];
  
  const timestamp = new Date().toISOString();
  const raw = `${ip} - - [${timestamp}] "${method} ${endpoint} HTTP/1.1" ${status} 512 "${ua}"`;

  return {
    id: generateLogId(),
    timestamp,
    sourceIp: ip,
    method,
    endpoint,
    statusCode: status,
    message: "Request processed successfully",
    raw,
  };
};

export const generateAttackLog = (type: 'SQLi' | 'XSS' | 'BruteForce' | 'PathTraversal'): LogEntry => {
  const ip = IP_ADDRESSES[Math.floor(Math.random() * 4) + 4]; // Pick external/risky IPs
  const timestamp = new Date().toISOString();
  
  let method = 'GET';
  let endpoint = '/';
  let status = 403;
  let ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  let payload = '';

  switch (type) {
    case 'SQLi':
      endpoint = '/api/v1/products';
      payload = `?id=1' OR '1'='1`;
      method = 'GET';
      status = 200; // Successful injection often returns 200
      ua = 'sqlmap/1.5.2';
      break;
    case 'XSS':
      endpoint = '/contact';
      method = 'POST';
      payload = `<script>alert(document.cookie)</script>`;
      status = 200;
      break;
    case 'BruteForce':
      endpoint = '/login';
      method = 'POST';
      status = 401;
      break;
    case 'PathTraversal':
      endpoint = '/../../../../etc/passwd';
      method = 'GET';
      status = 404;
      break;
  }

  const raw = `${ip} - - [${timestamp}] "${method} ${endpoint}${payload} HTTP/1.1" ${status} 124 "${ua}"`;

  return {
    id: generateLogId(),
    timestamp,
    sourceIp: ip,
    method,
    endpoint: endpoint + payload,
    statusCode: status,
    message: "Suspicious request pattern detected",
    raw,
  };
};
