/**
 * Model Aggregator Service
 *
 * Aggregates AI models from the registry and transforms them into
 * UnifiedAIModel format used by the model detail pages.
 */

import { aiRegistryService, AIModel } from './ai-registry-service';
import { UnifiedAIModel, ModelCategory } from '@/app/dashboard/ai-settings/[slug]/types';

/**
 * Category mapping from capabilities to display categories
 */
const CAPABILITY_TO_CATEGORY: Record<string, ModelCategory> = {
    'vision': 'Image',
    'image-generation': 'Image',
    'image': 'Image',
    'video': 'Video',
    'video-generation': 'Video',
    'audio': 'Audio',
    'speech': 'Audio',
    'audio-generation': 'Audio',
    'code': 'Coding',
    'code-generation': 'Coding',
    'embedding': 'Embedding',
    'embeddings': 'Embedding',
};

/**
 * Generate a URL-friendly slug from a model name and provider
 */
function generateSlug(model: AIModel): string {
    const base = `${model.provider}-${model.name}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    return base;
}

/**
 * Determine the display category from model capabilities
 */
function resolveCategory(capabilities: string[]): ModelCategory {
    for (const cap of capabilities) {
        const category = CAPABILITY_TO_CATEGORY[cap.toLowerCase()];
        if (category) return category;
    }
    return 'Coding'; // Default fallback
}

/**
 * Determine the API endpoint for a model
 */
function resolveEndpoint(model: AIModel): string {
    return `/v1/public/multi-model/models/${model.id}/inference`;
}

/**
 * Transform an AIModel into a UnifiedAIModel
 */
function transformModel(model: AIModel): UnifiedAIModel {
    const category = resolveCategory(model.capabilities);
    const slug = generateSlug(model);

    return {
        ...model,
        slug,
        category,
        description: `${model.provider} model with ${model.capabilities.join(', ')} capabilities. Max ${model.max_tokens.toLocaleString()} tokens.`,
        endpoint: resolveEndpoint(model),
        method: 'POST',
    };
}

/**
 * Model Aggregator Service
 */
class ModelAggregatorService {
    /**
     * Fetch all models and transform to UnifiedAIModel format
     */
    async aggregateAllModels(): Promise<UnifiedAIModel[]> {
        const response = await aiRegistryService.listModels();
        return response.models.map(transformModel);
    }
}

export const modelAggregatorService = new ModelAggregatorService();
