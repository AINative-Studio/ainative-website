/**
 * ZeroDB Components Index
 * Export all ZeroDB-related components for easy importing
 */

// Main components
export { EnhancedZeroDBPage } from './enhanced-zerodb-page';
export { EnhancedTabs } from './enhanced-tabs';
export { DataTable } from './data-table';
export type { DataTableColumn, DataTableAction, DataTableProps } from './data-table';
export { MetricsDashboard, MetricsGrid, TimeSeriesChart, ServiceHealthCard, PerformanceOverview } from './metrics-dashboard';

// Configuration
export { zeroDBTabs, tabCategories, quickActions } from './tab-config';

// Types
export * from './types';

// Re-export commonly used types for convenience
export type {
  ZeroDBTab,
  ZeroDBSubTab,
  Project,
  Collection,
  PostgreSQLInstance,
  VectorCollection,
  RedpandaTopic,
  StorageBucket,
  MCPConnection,
  RLHFDataset,
  MetricCard,
  TimeSeriesData,
  ServiceHealth
} from './types';