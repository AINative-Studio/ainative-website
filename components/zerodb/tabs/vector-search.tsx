import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Textarea } from '../../ui/textarea';
import { AlertCircle, Search, Plus, Trash2, Brain, Zap, Play, Pause } from 'lucide-react';
import { Alert, AlertDescription } from '../../ui/alert';
import { Progress } from '../../ui/progress';
import { toast } from 'sonner';

import { 
  VectorService, 
  type VectorCollection, 
  type VectorCollectionCreateRequest,
  type VectorSearchRequest,
  type MLModel,
  type MLModelCreateRequest,
  type TrainingJob 
} from '../../../services/zerodb';

interface VectorSearchProps {
  className?: string;
}

export const VectorSearch: React.FC<VectorSearchProps> = ({ className }) => {
  const [selectedTab, setSelectedTab] = useState('collections');
  const [isCollectionDialogOpen, setIsCollectionDialogOpen] = useState(false);
  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);

  const queryClient = useQueryClient();

  // Queries
  const { data: collections = [], isLoading: isLoadingCollections } = useQuery({
    queryKey: ['vector-collections'],
    queryFn: () => VectorService.getCollections(),
  });

  const { data: models = [], isLoading: isLoadingModels } = useQuery({
    queryKey: ['ml-models'],
    queryFn: () => VectorService.getModels(),
  });

  const { data: trainingJobs = [], isLoading: isLoadingJobs } = useQuery({
    queryKey: ['training-jobs'],
    queryFn: () => VectorService.getTrainingJobs(),
  });

  // Mutations
  const createCollectionMutation = useMutation({
    mutationFn: VectorService.createCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vector-collections'] });
      setIsCollectionDialogOpen(false);
      toast.success('Vector collection created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create collection: ${error.message}`);
    },
  });

  const deleteCollectionMutation = useMutation({
    mutationFn: VectorService.deleteCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vector-collections'] });
      toast.success('Collection deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete collection: ${error.message}`);
    },
  });

  const createModelMutation = useMutation({
    mutationFn: VectorService.createModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ml-models'] });
      setIsModelDialogOpen(false);
      toast.success('ML model created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create model: ${error.message}`);
    },
  });

  const deleteModelMutation = useMutation({
    mutationFn: VectorService.deleteModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ml-models'] });
      toast.success('Model deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete model: ${error.message}`);
    },
  });

  const searchMutation = useMutation({
    mutationFn: VectorService.searchVectors,
    onSuccess: (data) => {
      setSearchResults(data);
      toast.success(`Found ${data.results.length} similar vectors`);
    },
    onError: (error: Error) => {
      toast.error(`Search failed: ${error.message}`);
    },
  });

  const createTrainingJobMutation = useMutation({
    mutationFn: VectorService.createTrainingJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-jobs'] });
      toast.success('Training job started successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to start training: ${error.message}`);
    },
  });

  const cancelTrainingJobMutation = useMutation({
    mutationFn: VectorService.cancelTrainingJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-jobs'] });
      toast.success('Training job cancelled');
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel training: ${error.message}`);
    },
  });

  // Form handlers
  const handleCreateCollection = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    createCollectionMutation.mutate({
      name: formData.get('name') as string,
      dimension: parseInt(formData.get('dimension') as string),
      distance_metric: formData.get('distance_metric') as 'cosine' | 'euclidean' | 'dot_product',
      metadata: {},
    });
  };

  const handleCreateModel = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    createModelMutation.mutate({
      name: formData.get('name') as string,
      model_type: formData.get('model_type') as any,
      framework: formData.get('framework') as any,
      model_path: formData.get('model_path') as string,
      input_dimension: formData.get('input_dimension') ? parseInt(formData.get('input_dimension') as string) : undefined,
      output_dimension: formData.get('output_dimension') ? parseInt(formData.get('output_dimension') as string) : undefined,
      metadata: {},
    });
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const vectorString = formData.get('vector') as string;
    let queryVector: number[] = [];
    
    try {
      queryVector = JSON.parse(vectorString);
      if (!Array.isArray(queryVector) || !queryVector.every(n => typeof n === 'number')) {
        throw new Error('Vector must be an array of numbers');
      }
    } catch (error) {
      toast.error('Invalid vector format. Please provide a valid JSON array of numbers.');
      return;
    }

    searchMutation.mutate({
      collection_name: formData.get('collection') as string,
      query_vector: queryVector,
      top_k: parseInt(formData.get('top_k') as string) || 10,
      include_metadata: true,
    });
  };

  const handleTrainingJob = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const configText = formData.get('training_config') as string;
    let config = {};
    try {
      if (configText.trim()) {
        config = JSON.parse(configText);
      }
    } catch (error) {
      toast.error('Invalid training configuration JSON');
      return;
    }

    createTrainingJobMutation.mutate({
      model_id: formData.get('model_id') as string,
      dataset_id: formData.get('dataset_id') as string || undefined,
      training_config: config,
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="collections">Vector Collections</TabsTrigger>
          <TabsTrigger value="search">Vector Search</TabsTrigger>
          <TabsTrigger value="models">ML Models</TabsTrigger>
          <TabsTrigger value="training">Training Jobs</TabsTrigger>
        </TabsList>

        {/* Vector Collections */}
        <TabsContent value="collections" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Vector Collections</h3>
            <Dialog open={isCollectionDialogOpen} onOpenChange={setIsCollectionDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Collection
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Vector Collection</DialogTitle>
                  <DialogDescription>
                    Create a new vector collection for storing embeddings
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateCollection} className="space-y-4">
                  <div>
                    <Label htmlFor="collection_name">Name *</Label>
                    <Input id="collection_name" name="name" required />
                  </div>
                  <div>
                    <Label htmlFor="dimension">Dimension *</Label>
                    <Input id="dimension" name="dimension" type="number" required placeholder="1536" />
                  </div>
                  <div>
                    <Label htmlFor="distance_metric">Distance Metric</Label>
                    <Select name="distance_metric" defaultValue="cosine">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cosine">Cosine</SelectItem>
                        <SelectItem value="euclidean">Euclidean</SelectItem>
                        <SelectItem value="dot_product">Dot Product</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={createCollectionMutation.isPending}>
                    {createCollectionMutation.isPending ? 'Creating...' : 'Create Collection'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {isLoadingCollections ? (
              <div>Loading collections...</div>
            ) : collections.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No vector collections found. Create your first collection to store embeddings.
                </AlertDescription>
              </Alert>
            ) : (
              collections.map((collection: VectorCollection) => (
                <Card key={collection.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{collection.name}</CardTitle>
                        <CardDescription>
                          {collection.vector_count} vectors | {collection.dimension}D | {collection.distance_metric}
                        </CardDescription>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteCollectionMutation.mutate(collection.id)}
                        disabled={deleteCollectionMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p><strong>ID:</strong> <code className="text-sm">{collection.id}</code></p>
                      <p><strong>Status:</strong> <Badge variant={collection.status === 'active' ? 'default' : 'secondary'}>{collection.status}</Badge></p>
                      <p><strong>Created:</strong> {new Date(collection.created_at).toLocaleString()}</p>
                      <p><strong>Updated:</strong> {new Date(collection.updated_at).toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Vector Search */}
        <TabsContent value="search" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Vector Search</h3>
            <Dialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Search className="w-4 h-4 mr-2" />
                  New Search
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Vector Similarity Search</DialogTitle>
                  <DialogDescription>
                    Search for similar vectors in a collection
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSearch} className="space-y-4">
                  <div>
                    <Label htmlFor="collection">Collection *</Label>
                    <Select name="collection" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select collection" />
                      </SelectTrigger>
                      <SelectContent>
                        {collections.map((collection: VectorCollection, index: number) => (
                          <SelectItem key={collection.id || `vector-collection-${index}`} value={collection.name}>
                            {collection.name} ({collection.dimension}D)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="vector">Query Vector (JSON array) *</Label>
                    <Textarea 
                      id="vector" 
                      name="vector" 
                      placeholder="[0.1, 0.2, 0.3, ...]"
                      rows={4}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="top_k">Top K Results</Label>
                    <Input id="top_k" name="top_k" type="number" defaultValue={10} min={1} max={100} />
                  </div>
                  <Button type="submit" disabled={searchMutation.isPending}>
                    {searchMutation.isPending ? 'Searching...' : 'Search Vectors'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {searchResults && (
            <Card>
              <CardHeader>
                <CardTitle>Search Results</CardTitle>
                <CardDescription>
                  Found {searchResults.results.length} results in {searchResults.query_time_ms}ms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {searchResults.results.map((result: any, index: number) => (
                    <div key={index} className="p-3 border rounded">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Result #{index + 1}</span>
                        <Badge variant="outline">Score: {result.score.toFixed(4)}</Badge>
                      </div>
                      <p><strong>ID:</strong> <code className="text-sm">{result.id}</code></p>
                      {result.metadata && (
                        <details className="mt-2">
                          <summary className="cursor-pointer font-medium text-sm">Metadata</summary>
                          <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">
                            {JSON.stringify(result.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ML Models */}
        <TabsContent value="models" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">ML Models</h3>
            <Dialog open={isModelDialogOpen} onOpenChange={setIsModelDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Model
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create ML Model</DialogTitle>
                  <DialogDescription>
                    Register a new machine learning model
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateModel} className="space-y-4">
                  <div>
                    <Label htmlFor="model_name">Name *</Label>
                    <Input id="model_name" name="name" required />
                  </div>
                  <div>
                    <Label htmlFor="model_type">Type *</Label>
                    <Select name="model_type" required>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="embedding">Embedding</SelectItem>
                        <SelectItem value="classification">Classification</SelectItem>
                        <SelectItem value="regression">Regression</SelectItem>
                        <SelectItem value="clustering">Clustering</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="framework">Framework *</Label>
                    <Select name="framework" required>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="huggingface">HuggingFace</SelectItem>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="model_path">Model Path *</Label>
                    <Input id="model_path" name="model_path" required placeholder="sentence-transformers/all-MiniLM-L6-v2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="input_dimension">Input Dimension</Label>
                      <Input id="input_dimension" name="input_dimension" type="number" />
                    </div>
                    <div>
                      <Label htmlFor="output_dimension">Output Dimension</Label>
                      <Input id="output_dimension" name="output_dimension" type="number" />
                    </div>
                  </div>
                  <Button type="submit" disabled={createModelMutation.isPending}>
                    {createModelMutation.isPending ? 'Creating...' : 'Create Model'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {isLoadingModels ? (
              <div>Loading models...</div>
            ) : models.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No ML models found. Create your first model to start generating embeddings.
                </AlertDescription>
              </Alert>
            ) : (
              models.map((model: MLModel) => (
                <Card key={model.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{model.name}</CardTitle>
                        <CardDescription>
                          {model.model_type} | {model.framework} | {model.input_dimension || '?'}D → {model.output_dimension || '?'}D
                        </CardDescription>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteModelMutation.mutate(model.id)}
                        disabled={deleteModelMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p><strong>Path:</strong> <code className="text-sm">{model.model_path}</code></p>
                      <p><strong>Status:</strong> <Badge variant={model.status === 'active' ? 'default' : 'secondary'}>{model.status}</Badge></p>
                      {model.accuracy && <p><strong>Accuracy:</strong> {(model.accuracy * 100).toFixed(2)}%</p>}
                      <p><strong>Created:</strong> {new Date(model.created_at).toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Training Jobs */}
        <TabsContent value="training" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Training Jobs</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Brain className="w-4 h-4 mr-2" />
                  Start Training
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start Training Job</DialogTitle>
                  <DialogDescription>
                    Train or fine-tune a machine learning model
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleTrainingJob} className="space-y-4">
                  <div>
                    <Label htmlFor="job_model_id">Model *</Label>
                    <Select name="model_id" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        {models.map((model: MLModel, index: number) => (
                          <SelectItem key={model.id || `model-${index}`} value={model.id}>
                            {model.name} ({model.model_type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dataset_id">Dataset ID (optional)</Label>
                    <Input id="dataset_id" name="dataset_id" />
                  </div>
                  <div>
                    <Label htmlFor="training_config">Training Config (JSON)</Label>
                    <Textarea 
                      id="training_config" 
                      name="training_config" 
                      placeholder='{"learning_rate": 0.001, "batch_size": 32, "epochs": 10}'
                      rows={4}
                    />
                  </div>
                  <Button type="submit" disabled={createTrainingJobMutation.isPending}>
                    {createTrainingJobMutation.isPending ? 'Starting...' : 'Start Training'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {isLoadingJobs ? (
              <div>Loading training jobs...</div>
            ) : trainingJobs.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No training jobs found. Start your first training job to improve model performance.
                </AlertDescription>
              </Alert>
            ) : (
              trainingJobs.map((job: TrainingJob) => (
                <Card key={job.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Training Job</CardTitle>
                        <div className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span>Model: {job.model_id}</span>
                            <span>•</span>
                            <span>Status:</span>
                            <Badge 
                              variant={job.status === 'completed' ? 'default' : 
                                     job.status === 'running' ? 'secondary' : 
                                     job.status === 'failed' ? 'destructive' : 'outline'}
                            >
                              {job.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {job.status === 'running' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cancelTrainingJobMutation.mutate(job.id)}
                          disabled={cancelTrainingJobMutation.isPending}
                        >
                          <Pause className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{job.progress}%</span>
                        </div>
                        <Progress value={job.progress} className="h-2" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {job.accuracy && <p><strong>Accuracy:</strong> {(job.accuracy * 100).toFixed(2)}%</p>}
                        {job.loss && <p><strong>Loss:</strong> {job.loss.toFixed(6)}</p>}
                      </div>
                      <p className="text-sm"><strong>Created:</strong> {new Date(job.created_at).toLocaleString()}</p>
                      {job.error_message && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{job.error_message}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};