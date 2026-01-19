/**
 * Test fixtures for monitoring and observability data
 */

export interface Metric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
}

export interface LogEntry {
  id: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: Date;
}

export interface Alert {
  id: string;
  name: string;
  severity: 'low' | 'medium' | 'high';
  status: 'active' | 'resolved';
  timestamp: Date;
}

export const createMetric = (overrides?: Partial<Metric>): Metric => ({
  id: 'metric-1',
  name: 'api.requests',
  value: 100,
  unit: 'requests',
  timestamp: new Date('2025-01-01T12:00:00Z'),
  ...overrides,
});

export const createLogEntry = (overrides?: Partial<LogEntry>): LogEntry => ({
  id: 'log-1',
  level: 'info',
  message: 'API request processed',
  timestamp: new Date('2025-01-01T12:00:00Z'),
  ...overrides,
});

export const createAlert = (overrides?: Partial<Alert>): Alert => ({
  id: 'alert-1',
  name: 'High Error Rate',
  severity: 'high',
  status: 'active',
  timestamp: new Date('2025-01-01T12:00:00Z'),
  ...overrides,
});

export const metrics = [
  createMetric({ id: 'metric-1', name: 'api.requests' }),
  createMetric({ id: 'metric-2', name: 'api.latency', value: 150, unit: 'ms' }),
];

export const logEntries = [
  createLogEntry({ id: 'log-1', level: 'info' }),
  createLogEntry({ id: 'log-2', level: 'error', message: 'Database error' }),
];

export const alerts = [
  createAlert({ id: 'alert-1', severity: 'high' }),
  createAlert({ id: 'alert-2', severity: 'low', status: 'resolved' }),
];

export const activeAlerts = alerts.filter(a => a.status === 'active');
export const logsByLevel = {
  info: logEntries.filter(l => l.level === 'info'),
  error: logEntries.filter(l => l.level === 'error'),
  warn: logEntries.filter(l => l.level === 'warn'),
};
