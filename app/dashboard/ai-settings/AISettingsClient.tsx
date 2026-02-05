'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { aiRegistryService, RegisterModelData } from '@/lib/ai-registry-service';
import { Brain, Plus, Star, CheckCircle2, Settings, Zap, Eye } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

interface RegisterModelFormData {
  name: string;
  provider: string;
  model_identifier: string;
  capabilities: string[];
  max_tokens: string;
  api_key: string;
}

export default function AISettingsClient() {
  const queryClient = useQueryClient();
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [formData, setFormData] = useState<RegisterModelFormData>({
    name: '',
    provider: '',
    model_identifier: '',
    capabilities: [],
    max_tokens: '',
    api_key: '',
  });

  // Fetch models
  const { data: modelsData, isLoading, error } = useQuery({
    queryKey: ['ai-models'],
    queryFn: () => aiRegistryService.listModels(),
  });

  // Register model mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterModelData) => aiRegistryService.registerModel(data),
    onSuccess: async () => {
      // Wait for cache invalidation and refetch to complete before closing dialog
      // This fixes issue #524 - ensures newly registered models appear in the list immediately
      await queryClient.invalidateQueries({ queryKey: ['ai-models'] });
      setIsRegisterDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      // Keep dialog open on error so user can retry
      console.error('Failed to register model:', error);
    },
  });

  // Switch default model mutation
  const switchMutation = useMutation({
    mutationFn: (modelId: number) => aiRegistryService.switchDefaultModel(modelId),
    onSuccess: async () => {
      // Wait for cache invalidation and refetch to complete
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

  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'openai':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'anthropic':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'meta':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'google':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>Failed to load AI models</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const models = modelsData?.models || [];
  const defaultModel = models.find(m => m.is_default);

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">AI Model Settings</h1>
            <p className="text-muted-foreground">
              Manage your AI model registry and configure default models
            </p>
          </div>
          <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Register Model
              </Button>
            </DialogTrigger>
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
                    {['text-generation', 'reasoning', 'vision', 'code', 'audio'].map((cap) => (
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
      </motion.div>

      {/* Default Model Card */}
      {defaultModel && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary fill-primary" />
                <CardTitle>Default Model</CardTitle>
              </div>
              <CardDescription>
                This model is used by default for all AI operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Brain className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="font-semibold text-lg">{defaultModel.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProviderColor(defaultModel.provider)}`}>
                          {defaultModel.provider}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {defaultModel.model_identifier}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Max Tokens: {defaultModel.max_tokens.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {defaultModel.capabilities.map((cap) => (
                      <span key={cap} className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Models Grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        <h2 className="text-2xl font-bold mb-4">All Models ({models.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model) => (
            <motion.div key={model.id} variants={fadeUp}>
              <Card className={model.is_default ? 'border-primary' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      <CardTitle className="text-lg">{model.name}</CardTitle>
                    </div>
                    {model.is_default && (
                      <Star className="h-5 w-5 text-primary fill-primary" />
                    )}
                  </div>
                  <CardDescription>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getProviderColor(model.provider)}`}>
                      {model.provider}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground font-mono text-xs">
                        {model.model_identifier}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground text-xs">
                        Max: {model.max_tokens.toLocaleString()} tokens
                      </span>
                    </div>
                    {model.usage_count !== undefined && (
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground text-xs">
                          Used {model.usage_count.toLocaleString()} times
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {model.capabilities.map((cap) => (
                      <span key={cap} className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs">
                        {cap}
                      </span>
                    ))}
                  </div>
                  {!model.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => handleSwitchDefault(model.id, model.name)}
                      disabled={switchMutation.isPending}
                    >
                      Set as Default
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {models.length === 0 && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Brain className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Models Registered</h3>
              <p className="text-muted-foreground text-center mb-6">
                Get started by registering your first AI model
              </p>
              <Button onClick={() => setIsRegisterDialogOpen(true)} className="gap-2">
                <Plus className="h-5 w-5" />
                Register Model
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
