import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Copy,
  Check,
  Search,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Code,
  Shield,
  Activity,
  FileSignature,
  Cpu,
  AlertCircle
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example?: string;
}

interface StatusCode {
  code: number;
  description: string;
}

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  parameters?: {
    path?: Parameter[];
    query?: Parameter[];
    body?: Parameter[];
  };
  requestExample: {
    curl: string;
    python: string;
    javascript: string;
  };
  responseExample: string;
  statusCodes: StatusCode[];
  errorExample?: string;
}

interface EndpointCategory {
  title: string;
  description: string;
  icon: React.ReactNode;
  endpoints: Endpoint[];
}

export default function APIDocumentation() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'curl' | 'python' | 'javascript'>('python');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [openEndpoints, setOpenEndpoints] = useState<Set<string>>(new Set());
  const [isDarkMode] = useState(true); // You can connect this to your theme provider

  const copyToClipboard = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleEndpoint = (path: string) => {
    const newOpen = new Set(openEndpoints);
    if (newOpen.has(path)) {
      newOpen.delete(path);
    } else {
      newOpen.add(path);
    }
    setOpenEndpoints(newOpen);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20';
      case 'POST':
        return 'bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20';
      case 'PUT':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500/20';
      case 'DELETE':
        return 'bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  // API Categories Data
  const apiCategories: EndpointCategory[] = [
    {
      title: 'Model Management',
      description: 'Create, retrieve, update, and delete quantum and classical models',
      icon: <Cpu className="h-5 w-5" />,
      endpoints: [
        {
          method: 'GET',
          path: '/api/v1/models',
          description: 'Retrieves a list of all available models with filtering and pagination support',
          parameters: {
            query: [
              { name: 'page', type: 'integer', required: false, description: 'Page number for pagination', example: '1' },
              { name: 'limit', type: 'integer', required: false, description: 'Number of models per page', example: '10' },
              { name: 'type', type: 'string', required: false, description: 'Filter by model type (quantum/classical/hybrid)', example: 'quantum' }
            ]
          },
          requestExample: {
            curl: `curl -X GET "https://api.qnn.com/api/v1/models?type=quantum&limit=10" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
            python: `import requests

url = "https://api.qnn.com/api/v1/models"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
params = {
    "type": "quantum",
    "limit": 10
}

response = requests.get(url, headers=headers, params=params)
models = response.json()
print(models)`,
            javascript: `const response = await fetch('https://api.qnn.com/api/v1/models?type=quantum&limit=10', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const models = await response.json();
console.log(models);`
          },
          responseExample: `{
  "success": true,
  "data": [
    {
      "id": "model_abc123",
      "name": "Quantum Classification Model",
      "type": "quantum",
      "status": "active",
      "accuracy": 0.94,
      "created_at": "2025-10-15T10:30:00Z",
      "parameters": {
        "qubits": 8,
        "layers": 3,
        "entanglement": "linear"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45
  }
}`,
          statusCodes: [
            { code: 200, description: 'Success - Returns list of models' },
            { code: 400, description: 'Bad Request - Invalid parameters' },
            { code: 401, description: 'Unauthorized - Invalid API key' },
            { code: 429, description: 'Rate Limit Exceeded' }
          ]
        },
        {
          method: 'GET',
          path: '/api/v1/models/{model_id}',
          description: 'Retrieves detailed information about a specific model including architecture and performance metrics',
          parameters: {
            path: [
              { name: 'model_id', type: 'string', required: true, description: 'Unique identifier of the model', example: 'model_abc123' }
            ]
          },
          requestExample: {
            curl: `curl -X GET "https://api.qnn.com/api/v1/models/model_abc123" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
            python: `import requests

model_id = "model_abc123"
url = f"https://api.qnn.com/api/v1/models/{model_id}"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

response = requests.get(url, headers=headers)
model = response.json()
print(model)`,
            javascript: `const modelId = 'model_abc123';
const response = await fetch(\`https://api.qnn.com/api/v1/models/\${modelId}\`, {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const model = await response.json();
console.log(model);`
          },
          responseExample: `{
  "success": true,
  "data": {
    "id": "model_abc123",
    "name": "Quantum Classification Model",
    "type": "quantum",
    "status": "active",
    "accuracy": 0.94,
    "created_at": "2025-10-15T10:30:00Z",
    "updated_at": "2025-10-20T14:20:00Z",
    "parameters": {
      "qubits": 8,
      "layers": 3,
      "entanglement": "linear"
    },
    "metrics": {
      "precision": 0.92,
      "recall": 0.91,
      "f1_score": 0.915
    },
    "signature": {
      "id": "sig_xyz789",
      "verified": true,
      "created_at": "2025-10-15T10:35:00Z"
    }
  }
}`,
          statusCodes: [
            { code: 200, description: 'Success - Returns model details' },
            { code: 404, description: 'Not Found - Model does not exist' },
            { code: 401, description: 'Unauthorized - Invalid API key' }
          ]
        },
        {
          method: 'POST',
          path: '/api/v1/models',
          description: 'Creates a new quantum or classical model with specified parameters',
          parameters: {
            body: [
              { name: 'name', type: 'string', required: true, description: 'Name of the model', example: 'My Quantum Model' },
              { name: 'type', type: 'string', required: true, description: 'Type of model (quantum/classical/hybrid)', example: 'quantum' },
              { name: 'parameters', type: 'object', required: true, description: 'Model architecture parameters' }
            ]
          },
          requestExample: {
            curl: `curl -X POST "https://api.qnn.com/api/v1/models" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "My Quantum Model",
    "type": "quantum",
    "parameters": {
      "qubits": 8,
      "layers": 3,
      "entanglement": "linear"
    }
  }'`,
            python: `import requests

url = "https://api.qnn.com/api/v1/models"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "name": "My Quantum Model",
    "type": "quantum",
    "parameters": {
        "qubits": 8,
        "layers": 3,
        "entanglement": "linear"
    }
}

response = requests.post(url, headers=headers, json=data)
new_model = response.json()
print(new_model)`,
            javascript: `const response = await fetch('https://api.qnn.com/api/v1/models', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'My Quantum Model',
    type: 'quantum',
    parameters: {
      qubits: 8,
      layers: 3,
      entanglement: 'linear'
    }
  })
});

const newModel = await response.json();
console.log(newModel);`
          },
          responseExample: `{
  "success": true,
  "data": {
    "id": "model_def456",
    "name": "My Quantum Model",
    "type": "quantum",
    "status": "idle",
    "created_at": "2025-10-29T10:30:00Z",
    "parameters": {
      "qubits": 8,
      "layers": 3,
      "entanglement": "linear"
    }
  }
}`,
          statusCodes: [
            { code: 201, description: 'Created - Model successfully created' },
            { code: 400, description: 'Bad Request - Invalid parameters' },
            { code: 401, description: 'Unauthorized - Invalid API key' },
            { code: 422, description: 'Unprocessable Entity - Validation error' }
          ],
          errorExample: `{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid model parameters",
    "details": {
      "qubits": "Must be between 2 and 20"
    }
  }
}`
        },
        {
          method: 'PUT',
          path: '/api/v1/models/{model_id}',
          description: 'Updates an existing model\'s configuration and parameters',
          parameters: {
            path: [
              { name: 'model_id', type: 'string', required: true, description: 'Unique identifier of the model', example: 'model_abc123' }
            ],
            body: [
              { name: 'name', type: 'string', required: false, description: 'Updated name for the model' },
              { name: 'parameters', type: 'object', required: false, description: 'Updated model parameters' }
            ]
          },
          requestExample: {
            curl: `curl -X PUT "https://api.qnn.com/api/v1/models/model_abc123" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Updated Quantum Model",
    "parameters": {
      "layers": 4
    }
  }'`,
            python: `import requests

model_id = "model_abc123"
url = f"https://api.qnn.com/api/v1/models/{model_id}"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "name": "Updated Quantum Model",
    "parameters": {
        "layers": 4
    }
}

response = requests.put(url, headers=headers, json=data)
updated_model = response.json()
print(updated_model)`,
            javascript: `const modelId = 'model_abc123';
const response = await fetch(\`https://api.qnn.com/api/v1/models/\${modelId}\`, {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Updated Quantum Model',
    parameters: {
      layers: 4
    }
  })
});

const updatedModel = await response.json();
console.log(updatedModel);`
          },
          responseExample: `{
  "success": true,
  "data": {
    "id": "model_abc123",
    "name": "Updated Quantum Model",
    "type": "quantum",
    "status": "active",
    "updated_at": "2025-10-29T15:45:00Z",
    "parameters": {
      "qubits": 8,
      "layers": 4,
      "entanglement": "linear"
    }
  }
}`,
          statusCodes: [
            { code: 200, description: 'Success - Model updated' },
            { code: 400, description: 'Bad Request - Invalid parameters' },
            { code: 404, description: 'Not Found - Model does not exist' },
            { code: 401, description: 'Unauthorized - Invalid API key' }
          ]
        },
        {
          method: 'DELETE',
          path: '/api/v1/models/{model_id}',
          description: 'Permanently deletes a model and all associated data',
          parameters: {
            path: [
              { name: 'model_id', type: 'string', required: true, description: 'Unique identifier of the model', example: 'model_abc123' }
            ]
          },
          requestExample: {
            curl: `curl -X DELETE "https://api.qnn.com/api/v1/models/model_abc123" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
            python: `import requests

model_id = "model_abc123"
url = f"https://api.qnn.com/api/v1/models/{model_id}"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

response = requests.delete(url, headers=headers)
result = response.json()
print(result)`,
            javascript: `const modelId = 'model_abc123';
const response = await fetch(\`https://api.qnn.com/api/v1/models/\${modelId}\`, {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const result = await response.json();
console.log(result);`
          },
          responseExample: `{
  "success": true,
  "message": "Model successfully deleted",
  "data": {
    "id": "model_abc123",
    "deleted_at": "2025-10-29T16:00:00Z"
  }
}`,
          statusCodes: [
            { code: 200, description: 'Success - Model deleted' },
            { code: 404, description: 'Not Found - Model does not exist' },
            { code: 401, description: 'Unauthorized - Invalid API key' },
            { code: 409, description: 'Conflict - Model is currently in use' }
          ]
        }
      ]
    },
    {
      title: 'Training & Evaluation',
      description: 'Train models and evaluate their performance with comprehensive metrics',
      icon: <Activity className="h-5 w-5" />,
      endpoints: [
        {
          method: 'POST',
          path: '/api/v1/training/start',
          description: 'Initiates a training job for a quantum or classical model',
          parameters: {
            body: [
              { name: 'model_type', type: 'string', required: true, description: 'Type of model to train', example: 'quantum' },
              { name: 'dataset_id', type: 'string', required: true, description: 'ID of the training dataset', example: 'ds_123' },
              { name: 'hyperparameters', type: 'object', required: true, description: 'Training hyperparameters' }
            ]
          },
          requestExample: {
            curl: `curl -X POST "https://api.qnn.com/api/v1/training/start" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model_type": "quantum",
    "dataset_id": "ds_123",
    "hyperparameters": {
      "learning_rate": 0.01,
      "epochs": 50,
      "batch_size": 32
    }
  }'`,
            python: `import requests

url = "https://api.qnn.com/api/v1/training/start"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "model_type": "quantum",
    "dataset_id": "ds_123",
    "hyperparameters": {
        "learning_rate": 0.01,
        "epochs": 50,
        "batch_size": 32
    }
}

response = requests.post(url, headers=headers, json=data)
job = response.json()
print(f"Training job started: {job['data']['job_id']}")`,
            javascript: `const response = await fetch('https://api.qnn.com/api/v1/training/start', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model_type: 'quantum',
    dataset_id: 'ds_123',
    hyperparameters: {
      learning_rate: 0.01,
      epochs: 50,
      batch_size: 32
    }
  })
});

const job = await response.json();
console.log(\`Training job started: \${job.data.job_id}\`);`
          },
          responseExample: `{
  "success": true,
  "data": {
    "job_id": "job_train_789",
    "status": "queued",
    "model_type": "quantum",
    "dataset_id": "ds_123",
    "created_at": "2025-10-29T10:00:00Z",
    "estimated_completion": "2025-10-29T12:30:00Z"
  }
}`,
          statusCodes: [
            { code: 201, description: 'Created - Training job initiated' },
            { code: 400, description: 'Bad Request - Invalid parameters' },
            { code: 401, description: 'Unauthorized - Invalid API key' },
            { code: 429, description: 'Rate Limit - Too many concurrent jobs' }
          ]
        },
        {
          method: 'GET',
          path: '/api/v1/training/status/{job_id}',
          description: 'Retrieves the current status and progress of a training job',
          parameters: {
            path: [
              { name: 'job_id', type: 'string', required: true, description: 'Unique identifier of the training job', example: 'job_train_789' }
            ]
          },
          requestExample: {
            curl: `curl -X GET "https://api.qnn.com/api/v1/training/status/job_train_789" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
            python: `import requests

job_id = "job_train_789"
url = f"https://api.qnn.com/api/v1/training/status/{job_id}"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

response = requests.get(url, headers=headers)
status = response.json()
print(f"Status: {status['data']['status']}")
print(f"Progress: {status['data']['progress']}%")`,
            javascript: `const jobId = 'job_train_789';
const response = await fetch(\`https://api.qnn.com/api/v1/training/status/\${jobId}\`, {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const status = await response.json();
console.log(\`Status: \${status.data.status}\`);
console.log(\`Progress: \${status.data.progress}%\`);`
          },
          responseExample: `{
  "success": true,
  "data": {
    "job_id": "job_train_789",
    "status": "running",
    "progress": 65,
    "current_epoch": 33,
    "total_epochs": 50,
    "metrics": {
      "loss": 0.234,
      "accuracy": 0.87
    },
    "started_at": "2025-10-29T10:05:00Z",
    "estimated_completion": "2025-10-29T12:30:00Z"
  }
}`,
          statusCodes: [
            { code: 200, description: 'Success - Returns job status' },
            { code: 404, description: 'Not Found - Job does not exist' },
            { code: 401, description: 'Unauthorized - Invalid API key' }
          ]
        },
        {
          method: 'POST',
          path: '/api/v1/evaluation/start',
          description: 'Starts an evaluation job to test model performance on a dataset',
          parameters: {
            body: [
              { name: 'model_id', type: 'string', required: true, description: 'ID of the model to evaluate', example: 'model_abc123' },
              { name: 'dataset_id', type: 'string', required: true, description: 'ID of the evaluation dataset', example: 'ds_456' },
              { name: 'metrics', type: 'array', required: true, description: 'Metrics to calculate', example: '["accuracy", "precision"]' }
            ]
          },
          requestExample: {
            curl: `curl -X POST "https://api.qnn.com/api/v1/evaluation/start" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model_id": "model_abc123",
    "dataset_id": "ds_456",
    "metrics": ["accuracy", "precision", "recall", "f1_score"]
  }'`,
            python: `import requests

url = "https://api.qnn.com/api/v1/evaluation/start"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "model_id": "model_abc123",
    "dataset_id": "ds_456",
    "metrics": ["accuracy", "precision", "recall", "f1_score"]
}

response = requests.post(url, headers=headers, json=data)
job = response.json()
print(f"Evaluation job started: {job['data']['job_id']}")`,
            javascript: `const response = await fetch('https://api.qnn.com/api/v1/evaluation/start', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model_id: 'model_abc123',
    dataset_id: 'ds_456',
    metrics: ['accuracy', 'precision', 'recall', 'f1_score']
  })
});

const job = await response.json();
console.log(\`Evaluation job started: \${job.data.job_id}\`);`
          },
          responseExample: `{
  "success": true,
  "data": {
    "job_id": "job_eval_456",
    "status": "queued",
    "model_id": "model_abc123",
    "dataset_id": "ds_456",
    "created_at": "2025-10-29T11:00:00Z"
  }
}`,
          statusCodes: [
            { code: 201, description: 'Created - Evaluation job initiated' },
            { code: 400, description: 'Bad Request - Invalid parameters' },
            { code: 404, description: 'Not Found - Model or dataset not found' },
            { code: 401, description: 'Unauthorized - Invalid API key' }
          ]
        },
        {
          method: 'GET',
          path: '/api/v1/evaluation/results/{job_id}',
          description: 'Retrieves evaluation results including all calculated metrics',
          parameters: {
            path: [
              { name: 'job_id', type: 'string', required: true, description: 'Unique identifier of the evaluation job', example: 'job_eval_456' }
            ]
          },
          requestExample: {
            curl: `curl -X GET "https://api.qnn.com/api/v1/evaluation/results/job_eval_456" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
            python: `import requests

job_id = "job_eval_456"
url = f"https://api.qnn.com/api/v1/evaluation/results/{job_id}"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

response = requests.get(url, headers=headers)
results = response.json()
print(f"Accuracy: {results['data']['metrics']['accuracy']}")`,
            javascript: `const jobId = 'job_eval_456';
const response = await fetch(\`https://api.qnn.com/api/v1/evaluation/results/\${jobId}\`, {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const results = await response.json();
console.log(\`Accuracy: \${results.data.metrics.accuracy}\`);`
          },
          responseExample: `{
  "success": true,
  "data": {
    "job_id": "job_eval_456",
    "status": "completed",
    "model_id": "model_abc123",
    "dataset_id": "ds_456",
    "metrics": {
      "accuracy": 0.94,
      "precision": 0.92,
      "recall": 0.91,
      "f1_score": 0.915
    },
    "confusion_matrix": [[850, 50], [90, 810]],
    "completed_at": "2025-10-29T11:30:00Z"
  }
}`,
          statusCodes: [
            { code: 200, description: 'Success - Returns evaluation results' },
            { code: 202, description: 'Accepted - Job still running' },
            { code: 404, description: 'Not Found - Job does not exist' },
            { code: 401, description: 'Unauthorized - Invalid API key' }
          ]
        },
        {
          method: 'POST',
          path: '/api/v1/features/extract',
          description: 'Extracts code quality features from a code snippet for analysis',
          parameters: {
            body: [
              { name: 'code', type: 'string', required: true, description: 'Source code to analyze' },
              { name: 'language', type: 'string', required: false, description: 'Programming language (auto-detected if not provided)' }
            ]
          },
          requestExample: {
            curl: `curl -X POST "https://api.qnn.com/api/v1/features/extract" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "code": "def calculate_sum(a, b):\\n    return a + b",
    "language": "python"
  }'`,
            python: `import requests

url = "https://api.qnn.com/api/v1/features/extract"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "code": """
def calculate_sum(a, b):
    return a + b
    """,
    "language": "python"
}

response = requests.post(url, headers=headers, json=data)
features = response.json()
print(f"Quality Score: {features['data']['quality_score']}")`,
            javascript: `const response = await fetch('https://api.qnn.com/api/v1/features/extract', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    code: 'def calculate_sum(a, b):\\n    return a + b',
    language: 'python'
  })
});

const features = await response.json();
console.log(\`Quality Score: \${features.data.quality_score}\`);`
          },
          responseExample: `{
  "success": true,
  "data": {
    "language": "python",
    "quality_score": 0.85,
    "features": {
      "complexity": 1,
      "lines_of_code": 2,
      "comment_ratio": 0.0,
      "function_count": 1,
      "class_count": 0
    },
    "suggestions": [
      "Consider adding docstring",
      "Add type hints for parameters"
    ]
  }
}`,
          statusCodes: [
            { code: 200, description: 'Success - Returns extracted features' },
            { code: 400, description: 'Bad Request - Invalid code' },
            { code: 401, description: 'Unauthorized - Invalid API key' }
          ]
        }
      ]
    },
    {
      title: 'Signing & Verification',
      description: 'Quantum signature operations for model integrity and security',
      icon: <FileSignature className="h-5 w-5" />,
      endpoints: [
        {
          method: 'POST',
          path: '/api/v1/signing/sign',
          description: 'Creates a quantum-resistant signature for a model to ensure integrity',
          parameters: {
            body: [
              { name: 'model_id', type: 'string', required: true, description: 'ID of the model to sign', example: 'model_abc123' },
              { name: 'signature_level', type: 'string', required: true, description: 'Security level (standard/strong/maximum)', example: 'strong' }
            ]
          },
          requestExample: {
            curl: `curl -X POST "https://api.qnn.com/api/v1/signing/sign" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model_id": "model_abc123",
    "signature_level": "strong"
  }'`,
            python: `import requests

url = "https://api.qnn.com/api/v1/signing/sign"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "model_id": "model_abc123",
    "signature_level": "strong"
}

response = requests.post(url, headers=headers, json=data)
signature = response.json()
print(f"Signature ID: {signature['data']['signature_id']}")`,
            javascript: `const response = await fetch('https://api.qnn.com/api/v1/signing/sign', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model_id: 'model_abc123',
    signature_level: 'strong'
  })
});

const signature = await response.json();
console.log(\`Signature ID: \${signature.data.signature_id}\`);`
          },
          responseExample: `{
  "success": true,
  "data": {
    "signature_id": "sig_xyz789",
    "model_id": "model_abc123",
    "signature_level": "strong",
    "algorithm": "CRYSTALS-Dilithium",
    "signature_hash": "a3f5c8e9...",
    "created_at": "2025-10-29T12:00:00Z",
    "expires_at": "2026-10-29T12:00:00Z"
  }
}`,
          statusCodes: [
            { code: 201, description: 'Created - Signature generated' },
            { code: 400, description: 'Bad Request - Invalid parameters' },
            { code: 404, description: 'Not Found - Model does not exist' },
            { code: 401, description: 'Unauthorized - Invalid API key' }
          ]
        },
        {
          method: 'POST',
          path: '/api/v1/signing/verify',
          description: 'Verifies the quantum signature of a model to ensure it has not been tampered with',
          parameters: {
            body: [
              { name: 'model_id', type: 'string', required: true, description: 'ID of the model to verify', example: 'model_abc123' },
              { name: 'signature_id', type: 'string', required: false, description: 'Specific signature to verify (uses latest if omitted)', example: 'sig_xyz789' }
            ]
          },
          requestExample: {
            curl: `curl -X POST "https://api.qnn.com/api/v1/signing/verify" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model_id": "model_abc123",
    "signature_id": "sig_xyz789"
  }'`,
            python: `import requests

url = "https://api.qnn.com/api/v1/signing/verify"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "model_id": "model_abc123",
    "signature_id": "sig_xyz789"
}

response = requests.post(url, headers=headers, json=data)
verification = response.json()
if verification['data']['verified']:
    print("Model signature is valid!")
else:
    print(f"Verification failed: {verification['data']['reason']}")`,
            javascript: `const response = await fetch('https://api.qnn.com/api/v1/signing/verify', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model_id: 'model_abc123',
    signature_id: 'sig_xyz789'
  })
});

const verification = await response.json();
if (verification.data.verified) {
  console.log('Model signature is valid!');
} else {
  console.log(\`Verification failed: \${verification.data.reason}\`);
}`
          },
          responseExample: `{
  "success": true,
  "data": {
    "verified": true,
    "model_id": "model_abc123",
    "signature_id": "sig_xyz789",
    "verified_at": "2025-10-29T12:15:00Z",
    "signature_age_days": 5,
    "integrity_check": "passed"
  }
}`,
          statusCodes: [
            { code: 200, description: 'Success - Returns verification result' },
            { code: 400, description: 'Bad Request - Invalid parameters' },
            { code: 404, description: 'Not Found - Model or signature not found' },
            { code: 401, description: 'Unauthorized - Invalid API key' }
          ],
          errorExample: `{
  "success": true,
  "data": {
    "verified": false,
    "model_id": "model_abc123",
    "signature_id": "sig_xyz789",
    "reason": "Model parameters have been modified",
    "verified_at": "2025-10-29T12:15:00Z"
  }
}`
        },
        {
          method: 'GET',
          path: '/api/v1/signing/signatures/{model_id}',
          description: 'Retrieves all quantum signatures associated with a specific model',
          parameters: {
            path: [
              { name: 'model_id', type: 'string', required: true, description: 'ID of the model', example: 'model_abc123' }
            ]
          },
          requestExample: {
            curl: `curl -X GET "https://api.qnn.com/api/v1/signing/signatures/model_abc123" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
            python: `import requests

model_id = "model_abc123"
url = f"https://api.qnn.com/api/v1/signing/signatures/{model_id}"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

response = requests.get(url, headers=headers)
signatures = response.json()
print(f"Found {len(signatures['data'])} signatures")`,
            javascript: `const modelId = 'model_abc123';
const response = await fetch(\`https://api.qnn.com/api/v1/signing/signatures/\${modelId}\`, {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const signatures = await response.json();
console.log(\`Found \${signatures.data.length} signatures\`);`
          },
          responseExample: `{
  "success": true,
  "data": [
    {
      "signature_id": "sig_xyz789",
      "signature_level": "strong",
      "algorithm": "CRYSTALS-Dilithium",
      "created_at": "2025-10-24T12:00:00Z",
      "expires_at": "2026-10-24T12:00:00Z",
      "status": "active"
    },
    {
      "signature_id": "sig_abc456",
      "signature_level": "standard",
      "algorithm": "CRYSTALS-Dilithium",
      "created_at": "2025-10-15T10:00:00Z",
      "expires_at": "2026-10-15T10:00:00Z",
      "status": "expired"
    }
  ]
}`,
          statusCodes: [
            { code: 200, description: 'Success - Returns list of signatures' },
            { code: 404, description: 'Not Found - Model does not exist' },
            { code: 401, description: 'Unauthorized - Invalid API key' }
          ]
        }
      ]
    },
    {
      title: 'Monitoring & Metrics',
      description: 'Real-time system monitoring and performance metrics',
      icon: <Activity className="h-5 w-5" />,
      endpoints: [
        {
          method: 'GET',
          path: '/api/v1/monitoring/metrics',
          description: 'Retrieves comprehensive system and quantum metrics',
          parameters: {
            query: [
              { name: 'time_range', type: 'string', required: false, description: 'Time range for metrics (1h, 24h, 7d, 30d)', example: '24h' }
            ]
          },
          requestExample: {
            curl: `curl -X GET "https://api.qnn.com/api/v1/monitoring/metrics?time_range=24h" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
            python: `import requests

url = "https://api.qnn.com/api/v1/monitoring/metrics"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
params = {"time_range": "24h"}

response = requests.get(url, headers=headers, params=params)
metrics = response.json()
print(f"System uptime: {metrics['data']['system']['uptime']}")`,
            javascript: `const response = await fetch('https://api.qnn.com/api/v1/monitoring/metrics?time_range=24h', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const metrics = await response.json();
console.log(\`System uptime: \${metrics.data.system.uptime}\`);`
          },
          responseExample: `{
  "success": true,
  "data": {
    "timestamp": "2025-10-29T13:00:00Z",
    "time_range": "24h",
    "system": {
      "uptime": "99.98%",
      "cpu_usage": 45.2,
      "memory_usage": 62.8,
      "active_jobs": 12
    },
    "quantum": {
      "total_qubits_used": 156,
      "quantum_volume": 64,
      "gate_fidelity": 0.9995,
      "decoherence_time_us": 100
    },
    "api": {
      "requests_per_minute": 234,
      "average_response_time_ms": 145,
      "error_rate": 0.002
    }
  }
}`,
          statusCodes: [
            { code: 200, description: 'Success - Returns metrics' },
            { code: 400, description: 'Bad Request - Invalid time range' },
            { code: 401, description: 'Unauthorized - Invalid API key' }
          ]
        },
        {
          method: 'GET',
          path: '/api/v1/monitoring/anomalies',
          description: 'Retrieves detected anomalies in the quantum system',
          parameters: {
            query: [
              { name: 'severity', type: 'string', required: false, description: 'Filter by severity (low, medium, high, critical)', example: 'high' }
            ]
          },
          requestExample: {
            curl: `curl -X GET "https://api.qnn.com/api/v1/monitoring/anomalies?severity=high" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
            python: `import requests

url = "https://api.qnn.com/api/v1/monitoring/anomalies"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
params = {"severity": "high"}

response = requests.get(url, headers=headers, params=params)
anomalies = response.json()
print(f"Found {len(anomalies['data'])} high-severity anomalies")`,
            javascript: `const response = await fetch('https://api.qnn.com/api/v1/monitoring/anomalies?severity=high', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const anomalies = await response.json();
console.log(\`Found \${anomalies.data.length} high-severity anomalies\`);`
          },
          responseExample: `{
  "success": true,
  "data": [
    {
      "id": "anom_123",
      "type": "quantum_decoherence",
      "severity": "high",
      "description": "Elevated decoherence rate detected on Device Q-3",
      "detected_at": "2025-10-29T12:45:00Z",
      "affected_resource": "device_q3",
      "recommendation": "Consider device recalibration"
    }
  ]
}`,
          statusCodes: [
            { code: 200, description: 'Success - Returns anomalies' },
            { code: 401, description: 'Unauthorized - Invalid API key' }
          ]
        },
        {
          method: 'GET',
          path: '/api/v1/monitoring/devices',
          description: 'Retrieves quantum device status and availability',
          requestExample: {
            curl: `curl -X GET "https://api.qnn.com/api/v1/monitoring/devices" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
            python: `import requests

url = "https://api.qnn.com/api/v1/monitoring/devices"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

response = requests.get(url, headers=headers)
devices = response.json()
for device in devices['data']:
    print(f"{device['name']}: {device['status']}")`,
            javascript: `const response = await fetch('https://api.qnn.com/api/v1/monitoring/devices', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const devices = await response.json();
devices.data.forEach(device => {
  console.log(\`\${device.name}: \${device.status}\`);
});`
          },
          responseExample: `{
  "success": true,
  "data": [
    {
      "device_id": "device_q1",
      "name": "IBM Quantum Eagle",
      "status": "online",
      "qubits": 127,
      "queue_length": 3,
      "availability": "95%",
      "last_calibration": "2025-10-29T06:00:00Z"
    },
    {
      "device_id": "device_q2",
      "name": "Rigetti Aspen-M-3",
      "status": "maintenance",
      "qubits": 80,
      "queue_length": 0,
      "availability": "0%",
      "last_calibration": "2025-10-28T18:00:00Z"
    }
  ]
}`,
          statusCodes: [
            { code: 200, description: 'Success - Returns device status' },
            { code: 401, description: 'Unauthorized - Invalid API key' }
          ]
        },
        {
          method: 'GET',
          path: '/api/v1/monitoring/costs',
          description: 'Retrieves quantum computing resource costs and usage',
          parameters: {
            query: [
              { name: 'period', type: 'string', required: false, description: 'Time period (daily, monthly, yearly)', example: 'monthly' }
            ]
          },
          requestExample: {
            curl: `curl -X GET "https://api.qnn.com/api/v1/monitoring/costs?period=monthly" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
            python: `import requests

url = "https://api.qnn.com/api/v1/monitoring/costs"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
params = {"period": "monthly"}

response = requests.get(url, headers=headers, params=params)
costs = response.json()
print(f"Total cost: \${costs['data']['total_cost']}")`,
            javascript: `const response = await fetch('https://api.qnn.com/api/v1/monitoring/costs?period=monthly', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const costs = await response.json();
console.log(\`Total cost: $\${costs.data.total_cost}\`);`
          },
          responseExample: `{
  "success": true,
  "data": {
    "period": "monthly",
    "start_date": "2025-10-01",
    "end_date": "2025-10-29",
    "total_cost": 4567.89,
    "currency": "USD",
    "breakdown": {
      "quantum_compute": 3200.50,
      "classical_compute": 890.25,
      "storage": 234.14,
      "api_calls": 243.00
    },
    "usage": {
      "quantum_hours": 128,
      "shots_executed": 1250000,
      "models_trained": 45
    }
  }
}`,
          statusCodes: [
            { code: 200, description: 'Success - Returns cost metrics' },
            { code: 400, description: 'Bad Request - Invalid period' },
            { code: 401, description: 'Unauthorized - Invalid API key' }
          ]
        }
      ]
    }
  ];

  // Security Guidelines Content
  const securityContent = {
    title: 'Security Guidelines',
    description: 'Essential security practices for QNN API integration',
    icon: <Shield className="h-5 w-5" />,
    sections: [
      {
        title: 'Model Security Requirements',
        content: `All models in the QNN system must adhere to strict security protocols to ensure integrity and prevent tampering.`,
        items: [
          {
            title: 'Quantum Signatures',
            description: 'All models must be quantum-signed before deployment. The signing process creates a quantum-resistant signature using CRYSTALS-Dilithium algorithm that ensures the integrity of the model.',
            code: `# Sign a model before deployment
import requests

url = "https://api.qnn.com/api/v1/signing/sign"
headers = {"Authorization": "Bearer YOUR_API_KEY"}
data = {
    "model_id": "model_abc123",
    "signature_level": "strong"
}

response = requests.post(url, headers=headers, json=data)
signature = response.json()
print(f"Model signed: {signature['data']['signature_id']}")`
          },
          {
            title: 'Parameter Protection',
            description: 'Only hashed model parameters are stored in the system, ensuring that raw parameters cannot be extracted or tampered with. All parameter modifications invalidate existing signatures.',
            code: `# Verify model integrity before use
response = requests.post(
    "https://api.qnn.com/api/v1/signing/verify",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    json={"model_id": "model_abc123"}
)

if response.json()['data']['verified']:
    # Safe to use model
    deploy_model(model_id)
else:
    # Model has been compromised
    log_security_alert(model_id)`
          },
          {
            title: 'Signature Validation',
            description: 'All quantum signatures must be validated before model execution or deployment. Expired or invalid signatures must trigger security alerts.',
            code: `# Complete security workflow
def secure_model_deployment(model_id: str) -> bool:
    """Securely deploy a model after verification."""

    # 1. Verify quantum signature
    verification = verify_quantum_signature(model_id)
    if not verification['verified']:
        log_error(f"Signature verification failed: {verification['reason']}")
        return False

    # 2. Check parameter integrity
    if not verify_parameter_hashes(model_id):
        log_error(f"Parameter tampering detected")
        return False

    # 3. Deploy if all checks pass
    return deploy_model(model_id)`
          }
        ]
      },
      {
        title: 'API Security Best Practices',
        content: `Follow these essential practices to secure your API integration.`,
        items: [
          {
            title: 'Authentication',
            description: 'Always use API keys in headers, never in URLs. Rotate keys regularly and use different keys for different environments.',
            code: `# Correct: API key in header
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
response = requests.get(url, headers=headers)

# Wrong: API key in URL (vulnerable to logs)
# response = requests.get(f"{url}?api_key=YOUR_API_KEY")`
          },
          {
            title: 'Input Sanitization',
            description: 'All code inputs are sanitized server-side to prevent injection attacks. Never trust client input.',
            code: `# Server-side validation example
def sanitize_code_input(code: str) -> str:
    """Sanitize code input before processing."""

    # Remove dangerous patterns
    forbidden_patterns = ['__import__', 'eval', 'exec']
    for pattern in forbidden_patterns:
        if pattern in code:
            raise ValueError(f"Forbidden pattern: {pattern}")

    # Limit code length
    if len(code) > 10000:
        raise ValueError("Code exceeds maximum length")

    return code`
          },
          {
            title: 'Rate Limiting',
            description: 'Implement exponential backoff for rate limit errors. Quantum operations are rate-limited to prevent resource exhaustion.',
            code: `import time
from typing import Callable

def retry_with_backoff(func: Callable, max_retries: int = 3):
    """Retry API calls with exponential backoff."""
    for attempt in range(max_retries):
        try:
            return func()
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 429:
                wait_time = 2 ** attempt
                print(f"Rate limited. Waiting {wait_time}s...")
                time.sleep(wait_time)
            else:
                raise
    raise Exception("Max retries exceeded")`
          },
          {
            title: 'Access Logging',
            description: 'All model access attempts are logged for audit purposes. Implement comprehensive logging in your application.',
            code: `import logging

# Configure secure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

def log_model_access(model_id: str, action: str, user_id: str):
    """Log all model access for auditing."""
    logging.info(
        f"Model Access - ID: {model_id}, "
        f"Action: {action}, User: {user_id}"
    )`
          }
        ]
      },
      {
        title: 'Secure Deployment Example',
        content: `Complete example of secure model deployment workflow.`,
        items: [
          {
            title: 'Production-Ready Security Implementation',
            description: 'This example demonstrates all security checks required for production deployment.',
            code: `import requests
import logging
from typing import Dict, Optional

class SecureQNNClient:
    """Secure client for QNN API with built-in security checks."""

    def __init__(self, api_key: str, base_url: str):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        self.logger = logging.getLogger(__name__)

    def verify_model_signature(self, model_id: str) -> Dict:
        """Verify model quantum signature."""
        url = f"{self.base_url}/api/v1/signing/verify"
        response = requests.post(
            url,
            headers=self.headers,
            json={"model_id": model_id}
        )
        response.raise_for_status()
        return response.json()

    def deploy_model_securely(self, model_id: str) -> bool:
        """Deploy model with complete security verification."""

        try:
            # Step 1: Verify quantum signature
            self.logger.info(f"Verifying signature for {model_id}")
            verification = self.verify_model_signature(model_id)

            if not verification['data']['verified']:
                self.logger.error(
                    f"Signature verification failed: "
                    f"{verification['data'].get('reason')}"
                )
                return False

            # Step 2: Check signature expiry
            sig_age = verification['data']['signature_age_days']
            if sig_age > 30:
                self.logger.warning(
                    f"Signature is {sig_age} days old. "
                    "Consider re-signing."
                )

            # Step 3: Get model details
            model_url = f"{self.base_url}/api/v1/models/{model_id}"
            model_response = requests.get(model_url, headers=self.headers)
            model_response.raise_for_status()
            model = model_response.json()['data']

            # Step 4: Verify model status
            if model['status'] != 'active':
                self.logger.error(
                    f"Model {model_id} is not active. "
                    f"Status: {model['status']}"
                )
                return False

            # Step 5: Log deployment
            self.logger.info(
                f"Model {model_id} passed all security checks. "
                "Proceeding with deployment."
            )

            return True

        except requests.exceptions.HTTPError as e:
            self.logger.error(f"API error: {e}")
            return False
        except Exception as e:
            self.logger.error(f"Unexpected error: {e}")
            return False

# Usage
client = SecureQNNClient(
    api_key="YOUR_API_KEY",
    base_url="https://api.qnn.com"
)

if client.deploy_model_securely("model_abc123"):
    print("Model deployed securely!")
else:
    print("Deployment failed security checks")`
          }
        ]
      }
    ]
  };

  // Filter endpoints based on search
  const filteredCategories = apiCategories.map(category => ({
    ...category,
    endpoints: category.endpoints.filter(endpoint =>
      searchQuery === '' ||
      endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.method.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.endpoints.length > 0);

  const EndpointCard = ({ endpoint, categoryTitle }: { endpoint: Endpoint; categoryTitle: string }) => {
    const endpointId = `${categoryTitle}-${endpoint.path}`;
    const isOpen = openEndpoints.has(endpointId);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="mb-4 border-2 hover:border-purple-500/50 transition-all duration-200">
          <Collapsible open={isOpen} onOpenChange={() => toggleEndpoint(endpointId)}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Badge
                      variant="outline"
                      className={`${getMethodColor(endpoint.method)} font-mono font-bold px-3 py-1`}
                    >
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm font-mono text-purple-400">{endpoint.path}</code>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <CardDescription className="mt-2 ml-20">
                  {endpoint.description}
                </CardDescription>
              </CardHeader>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <CardContent className="pt-0">
                <Separator className="mb-6" />

                {/* Parameters */}
                {endpoint.parameters && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Parameters
                    </h4>
                    {endpoint.parameters.path && endpoint.parameters.path.length > 0 && (
                      <div className="mb-3">
                        <Badge variant="secondary" className="mb-2">Path Parameters</Badge>
                        <div className="space-y-2 ml-4">
                          {endpoint.parameters.path.map((param, idx) => (
                            <div key={idx} className="text-sm">
                              <code className="text-purple-400">{param.name}</code>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {param.type}
                              </Badge>
                              {param.required && (
                                <Badge variant="destructive" className="ml-1 text-xs">required</Badge>
                              )}
                              <p className="text-muted-foreground mt-1">{param.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {endpoint.parameters.query && endpoint.parameters.query.length > 0 && (
                      <div className="mb-3">
                        <Badge variant="secondary" className="mb-2">Query Parameters</Badge>
                        <div className="space-y-2 ml-4">
                          {endpoint.parameters.query.map((param, idx) => (
                            <div key={idx} className="text-sm">
                              <code className="text-purple-400">{param.name}</code>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {param.type}
                              </Badge>
                              {param.required && (
                                <Badge variant="destructive" className="ml-1 text-xs">required</Badge>
                              )}
                              <p className="text-muted-foreground mt-1">{param.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {endpoint.parameters.body && endpoint.parameters.body.length > 0 && (
                      <div>
                        <Badge variant="secondary" className="mb-2">Body Parameters</Badge>
                        <div className="space-y-2 ml-4">
                          {endpoint.parameters.body.map((param, idx) => (
                            <div key={idx} className="text-sm">
                              <code className="text-purple-400">{param.name}</code>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {param.type}
                              </Badge>
                              {param.required && (
                                <Badge variant="destructive" className="ml-1 text-xs">required</Badge>
                              )}
                              <p className="text-muted-foreground mt-1">{param.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Request Example */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Request Example
                    </h4>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={selectedLanguage === 'curl' ? 'default' : 'ghost'}
                        onClick={() => setSelectedLanguage('curl')}
                      >
                        cURL
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedLanguage === 'python' ? 'default' : 'ghost'}
                        onClick={() => setSelectedLanguage('python')}
                      >
                        Python
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedLanguage === 'javascript' ? 'default' : 'ghost'}
                        onClick={() => setSelectedLanguage('javascript')}
                      >
                        JavaScript
                      </Button>
                    </div>
                  </div>
                  <div className="relative">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-2 top-2 z-10"
                      onClick={() => copyToClipboard(endpoint.requestExample[selectedLanguage], `${endpointId}-request`)}
                    >
                      {copiedCode === `${endpointId}-request` ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <SyntaxHighlighter
                      language={selectedLanguage === 'curl' ? 'bash' : selectedLanguage}
                      style={isDarkMode ? vscDarkPlus : vs}
                      customStyle={{
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        padding: '1rem',
                        paddingTop: '2.5rem'
                      }}
                    >
                      {endpoint.requestExample[selectedLanguage]}
                    </SyntaxHighlighter>
                  </div>
                </div>

                {/* Response Example */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Response Example
                    </h4>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(endpoint.responseExample, `${endpointId}-response`)}
                    >
                      {copiedCode === `${endpointId}-response` ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <SyntaxHighlighter
                    language="json"
                    style={isDarkMode ? vscDarkPlus : vs}
                    customStyle={{
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      padding: '1rem'
                    }}
                  >
                    {endpoint.responseExample}
                  </SyntaxHighlighter>
                </div>

                {/* Status Codes */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Status Codes
                  </h4>
                  <div className="space-y-2">
                    {endpoint.statusCodes.map((status, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-sm">
                        <Badge
                          variant={status.code < 300 ? 'default' : 'destructive'}
                          className="font-mono"
                        >
                          {status.code}
                        </Badge>
                        <span className="text-muted-foreground">{status.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Error Example */}
                {endpoint.errorExample && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        Error Response Example
                      </h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(endpoint.errorExample!, `${endpointId}-error`)}
                      >
                        {copiedCode === `${endpointId}-error` ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <SyntaxHighlighter
                      language="json"
                      style={isDarkMode ? vscDarkPlus : vs}
                      customStyle={{
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        padding: '1rem'
                      }}
                    >
                      {endpoint.errorExample}
                    </SyntaxHighlighter>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="mb-6 border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-blue-500/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">QNN API Documentation</CardTitle>
                <CardDescription className="text-base mt-1">
                  Comprehensive API reference with code examples and security guidelines
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search endpoints... (e.g., 'models', 'training', 'POST')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="model-management" className="w-full">
          <ScrollArea className="w-full">
            <TabsList className="inline-flex w-full justify-start mb-6">
              <TabsTrigger value="model-management" className="flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                Model Management
              </TabsTrigger>
              <TabsTrigger value="training" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Training & Evaluation
              </TabsTrigger>
              <TabsTrigger value="signing" className="flex items-center gap-2">
                <FileSignature className="h-4 w-4" />
                Signing & Verification
              </TabsTrigger>
              <TabsTrigger value="monitoring" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Monitoring & Metrics
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security Guidelines
              </TabsTrigger>
            </TabsList>
          </ScrollArea>

          {/* Model Management Tab */}
          <TabsContent value="model-management">
            <Card className="mb-4">
              <CardHeader>
                <div className="flex items-center gap-3">
                  {apiCategories[0].icon}
                  <div>
                    <CardTitle>{apiCategories[0].title}</CardTitle>
                    <CardDescription>{apiCategories[0].description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
            <ScrollArea className="h-[800px]">
              {(searchQuery ? filteredCategories[0]?.endpoints : apiCategories[0].endpoints)?.map((endpoint, idx) => (
                <EndpointCard key={idx} endpoint={endpoint} categoryTitle="model-management" />
              ))}
            </ScrollArea>
          </TabsContent>

          {/* Training & Evaluation Tab */}
          <TabsContent value="training">
            <Card className="mb-4">
              <CardHeader>
                <div className="flex items-center gap-3">
                  {apiCategories[1].icon}
                  <div>
                    <CardTitle>{apiCategories[1].title}</CardTitle>
                    <CardDescription>{apiCategories[1].description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
            <ScrollArea className="h-[800px]">
              {(searchQuery ? filteredCategories.find(c => c.title === 'Training & Evaluation')?.endpoints : apiCategories[1].endpoints)?.map((endpoint, idx) => (
                <EndpointCard key={idx} endpoint={endpoint} categoryTitle="training" />
              ))}
            </ScrollArea>
          </TabsContent>

          {/* Signing & Verification Tab */}
          <TabsContent value="signing">
            <Card className="mb-4">
              <CardHeader>
                <div className="flex items-center gap-3">
                  {apiCategories[2].icon}
                  <div>
                    <CardTitle>{apiCategories[2].title}</CardTitle>
                    <CardDescription>{apiCategories[2].description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
            <ScrollArea className="h-[800px]">
              {(searchQuery ? filteredCategories.find(c => c.title === 'Signing & Verification')?.endpoints : apiCategories[2].endpoints)?.map((endpoint, idx) => (
                <EndpointCard key={idx} endpoint={endpoint} categoryTitle="signing" />
              ))}
            </ScrollArea>
          </TabsContent>

          {/* Monitoring & Metrics Tab */}
          <TabsContent value="monitoring">
            <Card className="mb-4">
              <CardHeader>
                <div className="flex items-center gap-3">
                  {apiCategories[3].icon}
                  <div>
                    <CardTitle>{apiCategories[3].title}</CardTitle>
                    <CardDescription>{apiCategories[3].description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
            <ScrollArea className="h-[800px]">
              {(searchQuery ? filteredCategories.find(c => c.title === 'Monitoring & Metrics')?.endpoints : apiCategories[3].endpoints)?.map((endpoint, idx) => (
                <EndpointCard key={idx} endpoint={endpoint} categoryTitle="monitoring" />
              ))}
            </ScrollArea>
          </TabsContent>

          {/* Security Guidelines Tab */}
          <TabsContent value="security">
            <Card className="mb-4">
              <CardHeader>
                <div className="flex items-center gap-3">
                  {securityContent.icon}
                  <div>
                    <CardTitle>{securityContent.title}</CardTitle>
                    <CardDescription>{securityContent.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
            <ScrollArea className="h-[800px]">
              {securityContent.sections.map((section, sectionIdx) => (
                <Card key={sectionIdx} className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-xl">{section.title}</CardTitle>
                    <CardDescription>{section.content}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {section.items.map((item, itemIdx) => (
                      <div key={itemIdx}>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Code className="h-4 w-4 text-purple-500" />
                          {item.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {item.description}
                        </p>
                        <div className="relative">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute right-2 top-2 z-10"
                            onClick={() => copyToClipboard(item.code, `security-${sectionIdx}-${itemIdx}`)}
                          >
                            {copiedCode === `security-${sectionIdx}-${itemIdx}` ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <SyntaxHighlighter
                            language="python"
                            style={isDarkMode ? vscDarkPlus : vs}
                            customStyle={{
                              borderRadius: '0.5rem',
                              fontSize: '0.875rem',
                              padding: '1rem',
                              paddingTop: '2.5rem'
                            }}
                          >
                            {item.code}
                          </SyntaxHighlighter>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
