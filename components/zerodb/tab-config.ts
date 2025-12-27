/**
 * ZeroDB Enhanced Tab Configuration
 * Defines the 8-tab system covering all ZeroDB APIs
 */

import { 
  Database, 
  Search, 
  Zap, 
  FolderOpen, 
  Bot, 
  BarChart3, 
  Shield, 
  GraduationCap,
  Table,
  HardDrive,
  Brain,
  Cpu,
  Workflow,
  MessageSquare,
  FileText,
  Cloud,
  Activity,
  TrendingUp,
  DollarSign,
  Key,
  Settings,
  AlertTriangle
} from 'lucide-react';

import { ZeroDBTab } from './types';

export const zeroDBTabs: ZeroDBTab[] = [
  {
    id: 'database-management',
    label: 'Database Management',
    icon: Database,
    description: 'PostgreSQL instances, tables, and ZeroDB collections',
    category: 'storage',
    enhanced: true,
    apiEndpoints: [
      '/v1/zerodb/projects/{id}/postgresql/instances',
      '/v1/zerodb/projects/{id}/postgresql/tables',
      '/v1/zerodb/projects/{id}/collections',
      '/v1/zerodb/projects/{id}/collections/{name}/documents',
      '/v1/zerodb/schema/generate'
    ],
    subTabs: [
      {
        id: 'postgresql',
        label: 'PostgreSQL',
        icon: HardDrive,
        description: 'Dedicated PostgreSQL instances and management',
        apiEndpoints: [
          '/v1/zerodb/projects/{id}/postgresql/instances',
          '/v1/zerodb/projects/{id}/postgresql/tables',
          '/v1/zerodb/projects/{id}/postgresql/query'
        ]
      },
      {
        id: 'collections',
        label: 'Collections',
        icon: Table,
        description: 'NoSQL document collections and schema management',
        apiEndpoints: [
          '/v1/zerodb/projects/{id}/collections',
          '/v1/zerodb/projects/{id}/collections/{name}/documents',
          '/v1/zerodb/projects/{id}/collections/{name}/query',
          '/v1/zerodb/schema/generate'
        ]
      }
    ]
  },
  {
    id: 'vector-search',
    label: 'Vector & Search',
    icon: Search,
    description: 'Qdrant vector storage, semantic search, and ZeroML services',
    category: 'ai-ml',
    enhanced: true,
    apiEndpoints: [
      '/v1/zerodb/projects/{id}/vectors/collections',
      '/v1/zerodb/projects/{id}/vectors/points',
      '/v1/zerodb/projects/{id}/vectors/search',
      '/v1/zerodb/projects/{id}/quantum/compress',
      '/v1/zerodb/projects/{id}/quantum/search',
      '/v1/zerodb/projects/{id}/ml/models',
      '/v1/zerodb/projects/{id}/ml/inference'
    ],
    subTabs: [
      {
        id: 'vectors',
        label: 'Vector Storage',
        icon: Brain,
        description: 'Qdrant vector collections and operations',
        apiEndpoints: [
          '/v1/zerodb/projects/{id}/vectors/collections',
          '/v1/zerodb/projects/{id}/vectors/points',
          '/v1/zerodb/projects/{id}/vectors/search'
        ]
      },
      {
        id: 'quantum',
        label: 'Quantum Services',
        icon: Cpu,
        description: 'Quantum vector compression and enhanced search',
        apiEndpoints: [
          '/v1/zerodb/projects/{id}/quantum/compress',
          '/v1/zerodb/projects/{id}/quantum/search',
          '/v1/zerodb/projects/{id}/quantum/hybrid-score'
        ]
      },
      {
        id: 'ml-models',
        label: 'ML Models',
        icon: GraduationCap,
        description: 'Machine learning model training and inference',
        apiEndpoints: [
          '/v1/zerodb/projects/{id}/ml/models',
          '/v1/zerodb/projects/{id}/ml/train',
          '/v1/zerodb/projects/{id}/ml/inference',
          '/v1/zerodb/projects/{id}/ml/deploy'
        ]
      }
    ]
  },
  {
    id: 'streaming-events',
    label: 'Streaming & Events',
    icon: Zap,
    description: 'Redpanda topics, real-time streaming, and event processing',
    category: 'streaming',
    newFeature: true,
    apiEndpoints: [
      '/v1/zerodb/projects/{id}/streaming/topics',
      '/v1/zerodb/projects/{id}/streaming/producers',
      '/v1/zerodb/projects/{id}/streaming/consumers',
      '/v1/zerodb/projects/{id}/streaming/processors',
      '/v1/zerodb/projects/{id}/events/stream',
      '/v1/zerodb/projects/{id}/events/triggers'
    ],
    subTabs: [
      {
        id: 'topics',
        label: 'Topics',
        icon: MessageSquare,
        description: 'Redpanda topic management and configuration',
        apiEndpoints: [
          '/v1/zerodb/projects/{id}/streaming/topics',
          '/v1/zerodb/projects/{id}/streaming/topics/{name}/publish',
          '/v1/zerodb/projects/{id}/streaming/topics/{name}/subscribe'
        ]
      },
      {
        id: 'processors',
        label: 'Stream Processors',
        icon: Workflow,
        description: 'Real-time data processing and transformations',
        apiEndpoints: [
          '/v1/zerodb/projects/{id}/streaming/processors',
          '/v1/zerodb/projects/{id}/streaming/processors/{id}/start',
          '/v1/zerodb/projects/{id}/streaming/processors/{id}/stop'
        ]
      },
      {
        id: 'events',
        label: 'Event Log',
        icon: FileText,
        description: 'Event logging and real-time event streams',
        apiEndpoints: [
          '/v1/zerodb/projects/{id}/events/stream',
          '/v1/zerodb/projects/{id}/events/triggers',
          '/v1/zerodb/projects/{id}/events/history'
        ]
      }
    ]
  },
  {
    id: 'object-storage',
    label: 'Object Storage',
    icon: FolderOpen,
    description: 'MinIO object storage, file management, and metadata',
    category: 'storage',
    enhanced: true,
    apiEndpoints: [
      '/v1/zerodb/projects/{id}/storage/buckets',
      '/v1/zerodb/projects/{id}/storage/objects',
      '/v1/zerodb/projects/{id}/files/upload',
      '/v1/zerodb/projects/{id}/files/download',
      '/v1/zerodb/projects/{id}/files/metadata'
    ],
    subTabs: [
      {
        id: 'buckets',
        label: 'Buckets',
        icon: FolderOpen,
        description: 'S3-compatible bucket management',
        apiEndpoints: [
          '/v1/zerodb/projects/{id}/storage/buckets',
          '/v1/zerodb/projects/{id}/storage/buckets/{name}/policy'
        ]
      },
      {
        id: 'objects',
        label: 'Objects',
        icon: Cloud,
        description: 'File upload, download, and object operations',
        apiEndpoints: [
          '/v1/zerodb/projects/{id}/storage/objects',
          '/v1/zerodb/projects/{id}/files/upload',
          '/v1/zerodb/projects/{id}/files/download',
          '/v1/zerodb/projects/{id}/files/metadata'
        ]
      }
    ]
  },
  {
    id: 'agent-memory',
    label: 'Agent & Memory',
    icon: Bot,
    description: 'MCP protocol, agent systems, and memory management',
    category: 'agent',
    newFeature: true,
    apiEndpoints: [
      '/v1/zerodb/projects/{id}/mcp/connections',
      '/v1/zerodb/projects/{id}/mcp/send',
      '/v1/zerodb/projects/{id}/agent-memory',
      '/v1/zerodb/projects/{id}/agent-logs',
      '/v1/zerodb/projects/{id}/rlhf/datasets',
      '/v1/zerodb/projects/{id}/rlhf/feedback'
    ],
    subTabs: [
      {
        id: 'mcp-protocol',
        label: 'MCP Protocol',
        icon: MessageSquare,
        description: 'Model Context Protocol connections and messaging',
        apiEndpoints: [
          '/v1/zerodb/projects/{id}/mcp/connections',
          '/v1/zerodb/projects/{id}/mcp/send',
          '/v1/zerodb/projects/{id}/mcp/tools'
        ]
      },
      {
        id: 'agent-memory',
        label: 'Agent Memory',
        icon: Brain,
        description: 'Intelligent memory storage and retrieval',
        apiEndpoints: [
          '/v1/zerodb/projects/{id}/agent-memory',
          '/v1/zerodb/projects/{id}/agent-memory/search',
          '/v1/zerodb/projects/{id}/agent-logs'
        ]
      }
    ]
  },
  {
    id: 'rlhf-training',
    label: 'RLHF & Training',
    icon: GraduationCap,
    description: 'Dataset management, model training, and human feedback',
    category: 'ai-ml',
    newFeature: true,
    apiEndpoints: [
      '/v1/zerodb/projects/{id}/rlhf/datasets',
      '/v1/zerodb/projects/{id}/rlhf/feedback',
      '/v1/zerodb/projects/{id}/rlhf/training',
      '/v1/zerodb/projects/{id}/ml/training-jobs'
    ],
    subTabs: [
      {
        id: 'datasets',
        label: 'Datasets',
        icon: FileText,
        description: 'Training dataset management and curation',
        apiEndpoints: [
          '/v1/zerodb/projects/{id}/rlhf/datasets',
          '/v1/zerodb/projects/{id}/rlhf/datasets/{id}/samples'
        ]
      },
      {
        id: 'feedback',
        label: 'Human Feedback',
        icon: MessageSquare,
        description: 'Collect and manage human feedback for training',
        apiEndpoints: [
          '/v1/zerodb/projects/{id}/rlhf/feedback',
          '/v1/zerodb/projects/{id}/rlhf/feedback/review'
        ]
      },
      {
        id: 'training',
        label: 'Training Jobs',
        icon: Activity,
        description: 'Model training pipeline and job monitoring',
        apiEndpoints: [
          '/v1/zerodb/projects/{id}/rlhf/training',
          '/v1/zerodb/projects/{id}/ml/training-jobs'
        ]
      }
    ]
  },
  {
    id: 'analytics-monitoring',
    label: 'Analytics & Monitoring',
    icon: BarChart3,
    description: 'Usage analytics, performance monitoring, and billing',
    category: 'monitoring',
    enhanced: true,
    apiEndpoints: [
      '/v1/zerodb/projects/{id}/analytics/usage',
      '/v1/zerodb/projects/{id}/monitoring/health',
      '/v1/zerodb/projects/{id}/monitoring/metrics',
      '/v1/zerodb/projects/{id}/billing/current',
      '/v1/zerodb/projects/{id}/billing/history'
    ],
    subTabs: [
      {
        id: 'usage-analytics',
        label: 'Usage Analytics',
        icon: TrendingUp,
        description: 'API usage, performance metrics, and trends',
        apiEndpoints: [
          '/v1/zerodb/projects/{id}/analytics/usage',
          '/v1/zerodb/projects/{id}/analytics/performance',
          '/v1/zerodb/projects/{id}/analytics/trends'
        ]
      },
      {
        id: 'health-monitoring',
        label: 'Health Monitoring',
        icon: Activity,
        description: 'Service health, uptime, and system status',
        apiEndpoints: [
          '/v1/zerodb/projects/{id}/monitoring/health',
          '/v1/zerodb/projects/{id}/monitoring/metrics',
          '/v1/zerodb/projects/{id}/monitoring/alerts'
        ]
      },
      {
        id: 'billing',
        label: 'Billing',
        icon: DollarSign,
        description: 'Cost tracking, usage-based billing, and forecasts',
        apiEndpoints: [
          '/v1/zerodb/projects/{id}/billing/current',
          '/v1/zerodb/projects/{id}/billing/history',
          '/v1/zerodb/projects/{id}/billing/forecast'
        ]
      }
    ]
  },
  {
    id: 'security-access',
    label: 'Security & Access',
    icon: Shield,
    description: 'API keys, authentication, rate limits, and Kong proxy',
    category: 'monitoring',
    enhanced: true,
    apiEndpoints: [
      '/v1/zerodb/projects/{id}/auth/api-keys',
      '/v1/zerodb/projects/{id}/auth/permissions',
      '/v1/zerodb/projects/{id}/rate-limits',
      '/v1/zerodb/projects/{id}/security/audit-logs',
      '/v1/zerodb/projects/{id}/proxy/kong/config'
    ],
    subTabs: [
      {
        id: 'api-keys',
        label: 'API Keys',
        icon: Key,
        description: 'API key generation and management',
        apiEndpoints: [
          '/v1/zerodb/projects/{id}/auth/api-keys',
          '/v1/zerodb/projects/{id}/auth/api-keys/{id}/rotate'
        ]
      },
      {
        id: 'access-control',
        label: 'Access Control',
        icon: Settings,
        description: 'Permissions, roles, and rate limiting',
        apiEndpoints: [
          '/v1/zerodb/projects/{id}/auth/permissions',
          '/v1/zerodb/projects/{id}/rate-limits'
        ]
      },
      {
        id: 'security-audit',
        label: 'Security & Audit',
        icon: AlertTriangle,
        description: 'Security logs, audit trails, and threat detection',
        apiEndpoints: [
          '/v1/zerodb/projects/{id}/security/audit-logs',
          '/v1/zerodb/projects/{id}/security/threats',
          '/v1/zerodb/projects/{id}/proxy/kong/config'
        ]
      }
    ]
  }
];

// Tab categories for organized navigation
export const tabCategories = {
  overview: { label: 'Overview', color: 'blue' },
  storage: { label: 'Data Storage', color: 'green' },
  'ai-ml': { label: 'AI & ML', color: 'purple' },
  streaming: { label: 'Real-time', color: 'orange' },
  agent: { label: 'Agents', color: 'cyan' },
  monitoring: { label: 'Operations', color: 'gray' }
};

// Quick access actions for each tab
export const quickActions = {
  'database-management': [
    { label: 'Create Collection', action: 'create-collection', icon: Database },
    { label: 'Import Data', action: 'import-data', icon: FileText },
    { label: 'Backup Database', action: 'backup-db', icon: HardDrive }
  ],
  'vector-search': [
    { label: 'Create Vector Collection', action: 'create-vector-collection', icon: Brain },
    { label: 'Upload Vectors', action: 'upload-vectors', icon: FileText },
    { label: 'Run Search', action: 'run-search', icon: Search }
  ],
  'streaming-events': [
    { label: 'Create Topic', action: 'create-topic', icon: MessageSquare },
    { label: 'Start Stream', action: 'start-stream', icon: Zap },
    { label: 'View Events', action: 'view-events', icon: Activity }
  ],
  'object-storage': [
    { label: 'Create Bucket', action: 'create-bucket', icon: FolderOpen },
    { label: 'Upload Files', action: 'upload-files', icon: Cloud },
    { label: 'Set Permissions', action: 'set-permissions', icon: Shield }
  ],
  'agent-memory': [
    { label: 'Connect MCP', action: 'connect-mcp', icon: Bot },
    { label: 'View Memory', action: 'view-memory', icon: Brain },
    { label: 'Agent Logs', action: 'agent-logs', icon: FileText }
  ],
  'rlhf-training': [
    { label: 'Create Dataset', action: 'create-dataset', icon: FileText },
    { label: 'Start Training', action: 'start-training', icon: GraduationCap },
    { label: 'Review Feedback', action: 'review-feedback', icon: MessageSquare }
  ],
  'analytics-monitoring': [
    { label: 'View Analytics', action: 'view-analytics', icon: BarChart3 },
    { label: 'Check Health', action: 'check-health', icon: Activity },
    { label: 'Billing Report', action: 'billing-report', icon: DollarSign }
  ],
  'security-access': [
    { label: 'Generate API Key', action: 'generate-api-key', icon: Key },
    { label: 'Set Rate Limits', action: 'set-rate-limits', icon: Settings },
    { label: 'View Audit Logs', action: 'view-audit-logs', icon: AlertTriangle }
  ]
};