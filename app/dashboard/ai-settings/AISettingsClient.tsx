'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { aiRegistryService, RegisterModelData, AIModel } from '@/lib/ai-registry-service';
import { modelAggregatorService, UnifiedAIModel, ModelCategory } from '@/lib/model-aggregator-service';
import { Plus, CheckCircle2, Star, ChevronDown, ExternalLink, Crown } from 'lucide-react';

// Category filter tabs
const CATEGORIES: ModelCategory[] = ['All', 'Image', 'Video', 'Audio', 'Coding', 'Embedding'];

// Map display categories to model capabilities (as per spec)
const CATEGORY_MAP: Record<string, string[]> = {
    Image: ['image-generation', 'vision'],
    Video: ['video-generation', 'text-to-video', 'image-to-video'],
    Audio: ['audio', 'speech', 'transcription', 'translation', 'audio-generation', 'text-to-speech'],
    Coding: ['code', 'text-generation', 'code-generation'],
    Embedding: ['embedding', 'semantic-search'],
};

// Sort options
type SortOption = 'newest' | 'oldest' | 'name';

// Provider-based gradient thumbnails
const PROVIDER_GRADIENTS: Record<string, string> = {
    openai: 'from-emerald-600 to-teal-800',
    anthropic: 'from-amber-600 to-orange-800',
    meta: 'from-blue-600 to-indigo-800',
    google: 'from-red-500 to-rose-800',
    mistral: 'from-violet-600 to-purple-800',
    cohere: 'from-cyan-600 to-sky-800',
    stability: 'from-fuchsia-600 to-pink-800',
    default: 'from-slate-600 to-gray-800',
};

function getProviderGradient(provider: string): string {
    return PROVIDER_GRADIENTS[provider.toLowerCase()] || PROVIDER_GRADIENTS.default;
}

function getProviderInitials(provider: string): string {
    return provider.slice(0, 2).toUpperCase();
}

function getModelDescription(model: UnifiedAIModel): string {
    return model.description;
}

function getPrimaryTag(model: UnifiedAIModel): string {
    if (model.capabilities.length === 0) return 'general';
    const cap = model.capabilities[0];
    return cap.replace('_', '-').replace('generation', 'gen');
}

function formatPricing(model: UnifiedAIModel): string | null {
    if (!model.pricing) return null;
    return `$${model.pricing.usd.toFixed(3)} ${model.pricing.unit || ''}`;
}

function matchesCategory(model: UnifiedAIModel, category: ModelCategory): boolean {
    // ALWAYS return true for "All" category - this is critical
    if (category === 'All') {
        return true;
    }

    // Validate model has capabilities array
    if (!model || !Array.isArray(model.capabilities)) {
        console.warn('[matchesCategory] Invalid model or capabilities:', model);
        return false;
    }

    // Get target capabilities for the category
    const targetCaps = CATEGORY_MAP[category];

    // If category not found in map, don't filter (show all)
    if (!targetCaps || targetCaps.length === 0) {
        console.warn('[matchesCategory] Unknown category:', category);
        return true;
    }

    // Check if model has any of the target capabilities
    const matches = model.capabilities.some(cap => {
        if (typeof cap !== 'string') {
            console.warn('[matchesCategory] Invalid capability type:', cap);
            return false;
        }
        return targetCaps.some(target =>
            cap.toLowerCase().includes(target.toLowerCase())
        );
    });

    return matches;
}

interface RegisterModelFormData {
    name: string;
    provider: string;
    model_identifier: string;
    capabilities: string[];
    max_tokens: string;
    api_key: string;
}

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } }
};

const stagger = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.06 }
    }
};

export default function AISettingsClient() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [activeCategory, setActiveCategory] = useState<ModelCategory>('All');
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
    const [formData, setFormData] = useState<RegisterModelFormData>({
        name: '',
        provider: '',
        model_identifier: '',
        capabilities: [],
        max_tokens: '',
        api_key: '',
    });

    // Fetch all models from aggregation service
    const { data: allModels, isLoading, error } = useQuery({
        queryKey: ['ai-models-aggregated'],
        queryFn: async () => {
            console.log('[AISettings] Fetching models from aggregator service...');
            try {
                const models = await modelAggregatorService.aggregateAllModels();
                console.log('[AISettings] Models fetched successfully:', {
                    count: models.length,
                    isArray: Array.isArray(models),
                    firstModel: models[0],
                    dataType: typeof models,
                });
                return models;
            } catch (err) {
                console.error('[AISettings] Error fetching models:', err);
                throw err;
            }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        refetchOnMount: false, // Don't refetch on mount - use cached data
        refetchOnWindowFocus: false, // Don't refetch on window focus
        retry: 3, // Retry failed requests 3 times
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    const registerMutation = useMutation({
        mutationFn: (data: RegisterModelData) => aiRegistryService.registerModel(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['ai-models'] });
            setIsRegisterDialogOpen(false);
            resetForm();
        },
        onError: (error: Error) => {
            console.error('Failed to register model:', error);
        },
    });

    const switchMutation = useMutation({
        mutationFn: (modelId: number) => aiRegistryService.switchDefaultModel(modelId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['ai-models'] });
        },
    });

    const resetForm = () => {
        setFormData({
            name: '',
            provider: '',
            model_identifier: '',
            capabilities: [],
            max_tokens: '',
            api_key: '',
        });
    };

    const handleRegisterModel = () => {
        if (formData.name.trim() && formData.provider.trim() && formData.model_identifier.trim() && formData.max_tokens) {
            const data: RegisterModelData = {
                name: formData.name,
                provider: formData.provider,
                model_identifier: formData.model_identifier,
                capabilities: formData.capabilities,
                max_tokens: parseInt(formData.max_tokens),
                ...(formData.api_key && { api_key: formData.api_key }),
            };
            registerMutation.mutate(data);
        }
    };

    const handleSwitchDefault = (modelId: number, modelName: string) => {
        if (confirm(`Set "${modelName}" as the default model?`)) {
            switchMutation.mutate(modelId);
        }
    };

    const handleCapabilityToggle = (capability: string) => {
        setFormData(prev => ({
            ...prev,
            capabilities: prev.capabilities.includes(capability)
                ? prev.capabilities.filter(c => c !== capability)
                : [...prev.capabilities, capability]
        }));
    };

    // Defensive data extraction with validation
    const models = useMemo(() => {
        if (!allModels) {
            console.warn('[AISettings] No models data available yet');
            return [];
        }

        if (!Array.isArray(allModels)) {
            console.error('[AISettings] Invalid models data format:', allModels);
            return [];
        }

        console.log('[AISettings] Models loaded:', {
            count: allModels.length,
            isLoading,
            activeCategory,
        });

        return allModels;
    }, [allModels, isLoading, activeCategory]);

    const filteredAndSorted = useMemo(() => {
        try {
            console.log('[AISettings] Running filter:', {
                category: activeCategory,
                totalModels: models.length,
                sortBy,
            });

            // Validate models array
            if (!Array.isArray(models)) {
                console.error('[AISettings] Models is not an array:', models);
                return [];
            }

            // Filter models with error handling per model
            let result = models.filter(m => {
                try {
                    const matches = matchesCategory(m, activeCategory);
                    return matches;
                } catch (err) {
                    console.error('[AISettings] Error filtering model:', m, err);
                    return false;
                }
            });

            console.log('[AISettings] Filtered results:', {
                category: activeCategory,
                filteredCount: result.length,
                totalCount: models.length,
            });

            // Apply sorting
            switch (sortBy) {
                case 'newest':
                    // Sort by model order (hardcoded models come first, then by category)
                    result = [...result].reverse();
                    break;
                case 'oldest':
                    // Keep original order
                    result = [...result];
                    break;
                case 'name':
                    result = [...result].sort((a, b) => a.name.localeCompare(b.name));
                    break;
            }

            console.log('[AISettings] Final sorted results:', result.length);
            return result;
        } catch (error) {
            console.error('[AISettings] Error in filteredAndSorted:', error);
            return [];
        }
    }, [models, activeCategory, sortBy]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" role="progressbar"></div>
            </div>
        );
    }

    if (error) {
        console.error('[AISettings] Error loading models:', error);
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-3">
                    <p className="text-lg font-semibold text-red-400">Failed to load AI models</p>
                    <p className="text-sm text-gray-400">{(error as Error).message}</p>
                    <Button
                        onClick={() => {
                            console.log('[AISettings] Retry button clicked');
                            queryClient.invalidateQueries({ queryKey: ['ai-models-aggregated'] });
                        }}
                        variant="outline"
                        className="mt-4"
                    >
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    // Guard against empty models after loading
    if (!isLoading && models.length === 0) {
        console.warn('[AISettings] No models available after loading');
    }

    return (
        <div className="space-y-6">
            {/* Filter Bar */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                {/* Category Tabs */}
                <div className="flex items-center gap-1">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-1.5 text-sm rounded-md transition-all ${
                                activeCategory === cat
                                    ? 'bg-white text-gray-900 font-medium'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Right side: Learn more + Sort */}
                <div className="flex items-center gap-4">
                    <a
                        href="https://docs.ainative.studio/models"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:text-primary-light flex items-center gap-1 transition-colors"
                    >
                        Learn more
                        <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="appearance-none bg-white/5 border border-white/10 rounded-lg px-4 py-1.5 pr-8 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                        >
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                            <option value="name">Name</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Models Grid */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={stagger}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
                {/* CTA Card - Looking for another model? */}
                <motion.div variants={fadeUp}>
                    <button
                        onClick={() => setIsRegisterDialogOpen(true)}
                        className="w-full h-full min-h-[280px] rounded-xl border border-dashed border-white/20 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/30 transition-all flex flex-col items-center justify-center p-6 text-center group cursor-pointer"
                    >
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4 group-hover:bg-white/15 transition-colors">
                            <Plus className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
                        </div>
                        <p className="text-sm font-medium text-gray-300 mb-1">
                            Looking for another model?
                        </p>
                        <p className="text-xs text-gray-500 max-w-[200px]">
                            Request a public endpoint to be added to AINative Studio.
                        </p>
                    </button>
                </motion.div>

                {/* Model Cards */}
                {filteredAndSorted.map((model) => (
                    <motion.div key={model.id} variants={fadeUp}>
                        <div
                            className="rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all overflow-hidden group cursor-pointer"
                            onClick={() => router.push(`/dashboard/ai-settings/${model.slug}`)}
                        >
                            {/* Thumbnail */}
                            <div className={`relative h-36 ${model.thumbnail_url ? 'bg-cover bg-center' : `bg-gradient-to-br ${getProviderGradient(model.provider)}`} flex items-center justify-center overflow-hidden`}
                                style={model.thumbnail_url ? { backgroundImage: `url(${model.thumbnail_url})` } : undefined}
                            >
                                {!model.thumbnail_url && (
                                    <span className="text-3xl font-bold text-white/30 select-none">
                                        {getProviderInitials(model.provider)}
                                    </span>
                                )}
                                {model.is_default && (
                                    <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm rounded-full p-1">
                                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" data-testid="star-icon" />
                                    </div>
                                )}
                                {model.is_premium && (
                                    <div className="absolute top-2 left-2 bg-amber-500/20 backdrop-blur-sm rounded-md px-2 py-0.5 flex items-center gap-1">
                                        <Crown className="w-3 h-3 text-amber-400" />
                                        <span className="text-xs text-amber-300 font-medium">Premium</span>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-4 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="text-sm font-semibold text-white truncate flex-1">
                                        {model.name}
                                    </h3>
                                    {model.provider && (
                                        <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-gray-400 shrink-0">
                                            {model.provider}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                                    {getModelDescription(model)}
                                </p>
                                <div className="flex items-center justify-between pt-1">
                                    <span className="inline-block px-3 py-1 text-xs border border-white/15 rounded-md text-gray-400">
                                        {getPrimaryTag(model)}
                                    </span>
                                    {formatPricing(model) && (
                                        <span className="text-xs text-emerald-400 font-medium">
                                            {formatPricing(model)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Empty state */}
            {filteredAndSorted.length === 0 && models.length > 0 && (
                <div className="text-center py-16">
                    <p className="text-gray-400">No models found in the &quot;{activeCategory}&quot; category.</p>
                    <button
                        onClick={() => setActiveCategory('All')}
                        className="text-primary text-sm mt-2 hover:underline"
                    >
                        View all models
                    </button>
                </div>
            )}

            {models.length === 0 && (
                <div className="text-center py-16 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                        <Plus className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">No Models Registered</h3>
                    <p className="text-gray-400 text-sm">Get started by registering your first AI model</p>
                    <Button onClick={() => setIsRegisterDialogOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Register Model
                    </Button>
                </div>
            )}

            {/* Register Model Dialog */}
            <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Register New AI Model</DialogTitle>
                        <DialogDescription>
                            Add a new AI model to your registry
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Model Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g., GPT-4 Turbo"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="provider">Provider</Label>
                            <Select
                                value={formData.provider}
                                onValueChange={(value) => setFormData({ ...formData, provider: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select provider" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="openai">OpenAI</SelectItem>
                                    <SelectItem value="anthropic">Anthropic</SelectItem>
                                    <SelectItem value="meta">Meta</SelectItem>
                                    <SelectItem value="google">Google</SelectItem>
                                    <SelectItem value="mistral">Mistral</SelectItem>
                                    <SelectItem value="cohere">Cohere</SelectItem>
                                    <SelectItem value="stability">Stability</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="model_identifier">Model Identifier</Label>
                            <Input
                                id="model_identifier"
                                placeholder="e.g., gpt-4-turbo-preview"
                                value={formData.model_identifier}
                                onChange={(e) => setFormData({ ...formData, model_identifier: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="max_tokens">Max Tokens</Label>
                            <Input
                                id="max_tokens"
                                type="number"
                                placeholder="e.g., 128000"
                                value={formData.max_tokens}
                                onChange={(e) => setFormData({ ...formData, max_tokens: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Capabilities</Label>
                            <div className="flex flex-wrap gap-2">
                                {['text-generation', 'reasoning', 'vision', 'code', 'audio', 'embedding', 'image-generation', 'video-generation'].map((cap) => (
                                    <Button
                                        key={cap}
                                        type="button"
                                        variant={formData.capabilities.includes(cap) ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handleCapabilityToggle(cap)}
                                    >
                                        {formData.capabilities.includes(cap) && <CheckCircle2 className="h-4 w-4 mr-1" />}
                                        {cap}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="api_key">API Key (Optional)</Label>
                            <Input
                                id="api_key"
                                type="password"
                                placeholder="Enter API key if required"
                                value={formData.api_key}
                                onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsRegisterDialogOpen(false);
                                resetForm();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRegisterModel}
                            disabled={registerMutation.isPending}
                        >
                            {registerMutation.isPending ? 'Registering...' : 'Register Model'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
