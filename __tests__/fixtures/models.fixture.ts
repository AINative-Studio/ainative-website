/**
 * Test fixtures for AI model data
 * Used for testing model-related components and services
 */

export interface ModelCapability {
  name: string;
  supported: boolean;
  details?: string;
}

export interface ModelPricing {
  inputTokens: number;
  outputTokens: number;
  currency: string;
  unit: string;
}

export interface Model {
  id: string;
  name: string;
  provider: string;
  version: string;
  description: string;
  capabilities: ModelCapability[];
  pricing: ModelPricing;
  contextWindow: number;
  maxOutputTokens: number;
  multimodal: boolean;
  trainingCutoff?: string;
  status: 'active' | 'deprecated' | 'beta';
  createdAt: Date;
  updatedAt: Date;
}

export interface ModelVersion {
  id: string;
  modelId: string;
  version: string;
  releaseDate: Date;
  changelog: string;
  deprecated: boolean;
}

export interface ModelUsage {
  modelId: string;
  userId: string;
  inputTokens: number;
  outputTokens: number;
  requestCount: number;
  cost: number;
  date: Date;
}

export const createModelCapability = (
  overrides?: Partial<ModelCapability>
): ModelCapability => ({
  name: 'text-generation',
  supported: true,
  details: 'Supports multi-turn conversations',
  ...overrides,
});

export const createModelPricing = (
  overrides?: Partial<ModelPricing>
): ModelPricing => ({
  inputTokens: 0.01,
  outputTokens: 0.03,
  currency: 'USD',
  unit: '1K tokens',
  ...overrides,
});

export const createModel = (overrides?: Partial<Model>): Model => ({
  id: 'model-gpt4',
  name: 'GPT-4',
  provider: 'OpenAI',
  version: 'gpt-4-0125-preview',
  description: 'Most capable GPT-4 model for complex tasks',
  capabilities: [
    createModelCapability({ name: 'text-generation', supported: true }),
    createModelCapability({ name: 'code-generation', supported: true }),
    createModelCapability({ name: 'image-understanding', supported: false }),
  ],
  pricing: createModelPricing(),
  contextWindow: 128000,
  maxOutputTokens: 4096,
  multimodal: false,
  trainingCutoff: '2023-12',
  status: 'active',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-01T00:00:00Z'),
  ...overrides,
});

export const models: Model[] = [
  createModel({
    id: 'model-gpt4',
    name: 'GPT-4',
    provider: 'OpenAI',
    version: 'gpt-4-0125-preview',
    multimodal: false,
  }),
  createModel({
    id: 'model-gpt4-vision',
    name: 'GPT-4 Vision',
    provider: 'OpenAI',
    version: 'gpt-4-vision-preview',
    multimodal: true,
    capabilities: [
      createModelCapability({ name: 'text-generation', supported: true }),
      createModelCapability({ name: 'image-understanding', supported: true }),
    ],
  }),
  createModel({
    id: 'model-claude',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    version: 'claude-3-opus-20240229',
    contextWindow: 200000,
    pricing: createModelPricing({ inputTokens: 0.015, outputTokens: 0.075 }),
  }),
  createModel({
    id: 'model-gemini',
    name: 'Gemini Pro',
    provider: 'Google',
    version: 'gemini-1.5-pro',
    contextWindow: 1000000,
    pricing: createModelPricing({ inputTokens: 0.0025, outputTokens: 0.01 }),
  }),
  createModel({
    id: 'model-llama',
    name: 'Llama 3',
    provider: 'Meta',
    version: 'llama-3-70b',
    contextWindow: 8192,
    pricing: createModelPricing({ inputTokens: 0.0007, outputTokens: 0.0009 }),
    status: 'beta',
  }),
];

export const deprecatedModel = createModel({
  id: 'model-gpt3',
  name: 'GPT-3.5',
  version: 'gpt-3.5-turbo',
  status: 'deprecated',
  updatedAt: new Date('2024-12-01T00:00:00Z'),
});

export const betaModel = createModel({
  id: 'model-gpt5',
  name: 'GPT-5',
  version: 'gpt-5-preview',
  status: 'beta',
});

export const createModelVersion = (
  overrides?: Partial<ModelVersion>
): ModelVersion => ({
  id: 'version-1',
  modelId: 'model-gpt4',
  version: '0125-preview',
  releaseDate: new Date('2025-01-25T00:00:00Z'),
  changelog: 'Improved reasoning and reduced hallucinations',
  deprecated: false,
  ...overrides,
});

export const modelVersions: ModelVersion[] = [
  createModelVersion({
    id: 'version-1',
    version: '0125-preview',
    releaseDate: new Date('2025-01-25T00:00:00Z'),
  }),
  createModelVersion({
    id: 'version-2',
    version: '1106-preview',
    releaseDate: new Date('2024-11-06T00:00:00Z'),
    deprecated: true,
  }),
  createModelVersion({
    id: 'version-3',
    version: '0613',
    releaseDate: new Date('2024-06-13T00:00:00Z'),
    deprecated: true,
  }),
];

export const createModelUsage = (
  overrides?: Partial<ModelUsage>
): ModelUsage => ({
  modelId: 'model-gpt4',
  userId: 'user-123',
  inputTokens: 1000,
  outputTokens: 500,
  requestCount: 10,
  cost: 0.025,
  date: new Date('2025-01-01T00:00:00Z'),
  ...overrides,
});

export const modelUsageData: ModelUsage[] = Array.from({ length: 30 }, (_, i) =>
  createModelUsage({
    inputTokens: 1000 + Math.floor(Math.random() * 5000),
    outputTokens: 500 + Math.floor(Math.random() * 2000),
    requestCount: 10 + Math.floor(Math.random() * 50),
    cost: 0.01 + Math.random() * 0.1,
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
  })
);

export const multimodalModels = models.filter((model) => model.multimodal);
export const activeModels = models.filter((model) => model.status === 'active');
export const modelsByProvider = {
  OpenAI: models.filter((m) => m.provider === 'OpenAI'),
  Anthropic: models.filter((m) => m.provider === 'Anthropic'),
  Google: models.filter((m) => m.provider === 'Google'),
  Meta: models.filter((m) => m.provider === 'Meta'),
};
