import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Zap, Settings, AlertCircle, CheckCircle2, Rocket, Info } from 'lucide-react';

interface TrainingFormData {
  repository: string;
  model: string;
  epochs: number;
  batchSize: number;
  learningRate: number;
  optimizer: string;
  validationSplit: number;
}

export default function TrainingConfig() {
  const [formData, setFormData] = useState<TrainingFormData>({
    repository: '',
    model: '',
    epochs: 10,
    batchSize: 32,
    learningRate: 0.001,
    optimizer: 'adam',
    validationSplit: 0.2
  });

  const [errors, setErrors] = useState<Partial<Record<keyof TrainingFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TrainingFormData, string>> = {};

    if (!formData.repository) {
      newErrors.repository = 'Please select a repository';
    }
    if (!formData.model) {
      newErrors.model = 'Please select a model';
    }
    if (formData.epochs < 1 || formData.epochs > 1000) {
      newErrors.epochs = 'Epochs must be between 1 and 1000';
    }
    if (formData.batchSize < 1 || formData.batchSize > 512) {
      newErrors.batchSize = 'Batch size must be between 1 and 512';
    }
    if (formData.learningRate <= 0 || formData.learningRate > 1) {
      newErrors.learningRate = 'Learning rate must be between 0 and 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    // This will be connected to API by Agent 1
    console.log('Starting training with config:', formData);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
    }, 2000);
  };

  const updateFormData = <K extends keyof TrainingFormData>(
    key: K,
    value: TrainingFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    // Clear error for this field when user makes changes
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const estimatedTime = Math.ceil(formData.epochs * 2); // Rough estimate in minutes

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-full bg-primary/10">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Training Configuration</CardTitle>
              <CardDescription>
                Configure and start training your quantum neural network model
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Model Selection */}
            <Card className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Model Selection</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="repository">Repository</Label>
                  <Select
                    value={formData.repository}
                    onValueChange={(value) => updateFormData('repository', value)}
                  >
                    <SelectTrigger id="repository" className={errors.repository ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select a repository" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" disabled>
                        No repositories available
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.repository && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.repository}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Select
                    value={formData.model}
                    onValueChange={(value) => updateFormData('model', value)}
                  >
                    <SelectTrigger id="model" className={errors.model ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" disabled>
                        No models available
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.model && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.model}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Training Parameters */}
            <Card className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Training Parameters</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="epochs">Epochs</Label>
                    <Input
                      id="epochs"
                      type="number"
                      min="1"
                      max="1000"
                      value={formData.epochs}
                      onChange={(e) => updateFormData('epochs', parseInt(e.target.value) || 1)}
                      className={errors.epochs ? 'border-red-500' : ''}
                    />
                    {errors.epochs && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.epochs}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="batch-size">Batch Size</Label>
                    <Input
                      id="batch-size"
                      type="number"
                      min="1"
                      max="512"
                      value={formData.batchSize}
                      onChange={(e) => updateFormData('batchSize', parseInt(e.target.value) || 1)}
                      className={errors.batchSize ? 'border-red-500' : ''}
                    />
                    {errors.batchSize && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.batchSize}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="learning-rate">Learning Rate</Label>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {formData.learningRate.toFixed(4)}
                    </span>
                  </div>
                  <Slider
                    id="learning-rate"
                    min={0.0001}
                    max={0.1}
                    step={0.0001}
                    value={[formData.learningRate]}
                    onValueChange={([value]) => updateFormData('learningRate', value)}
                    className="py-4"
                  />
                  {errors.learningRate && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.learningRate}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="optimizer">Optimizer</Label>
                  <Select
                    value={formData.optimizer}
                    onValueChange={(value) => updateFormData('optimizer', value)}
                  >
                    <SelectTrigger id="optimizer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adam">Adam</SelectItem>
                      <SelectItem value="sgd">SGD</SelectItem>
                      <SelectItem value="rmsprop">RMSprop</SelectItem>
                      <SelectItem value="adagrad">Adagrad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="validation-split">Validation Split</Label>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {(formData.validationSplit * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Slider
                    id="validation-split"
                    min={0.1}
                    max={0.4}
                    step={0.05}
                    value={[formData.validationSplit]}
                    onValueChange={([value]) => updateFormData('validationSplit', value)}
                    className="py-4"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary & Actions */}
          <div className="space-y-6">
            <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Training Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Epochs:</span>
                    <Badge variant="secondary">{formData.epochs}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Batch Size:</span>
                    <Badge variant="secondary">{formData.batchSize}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Learning Rate:</span>
                    <Badge variant="secondary">{formData.learningRate.toFixed(4)}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Optimizer:</span>
                    <Badge variant="secondary" className="capitalize">{formData.optimizer}</Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Info className="h-4 w-4" />
                    <span>Estimated Time</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">{estimatedTime} min</p>
                </div>

                <Alert className="border-primary/20 bg-primary/5">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-xs">
                    Quantum acceleration enabled for faster training
                  </AlertDescription>
                </Alert>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                  disabled={isSubmitting || !formData.repository || !formData.model}
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="mr-2"
                      >
                        <Zap className="h-4 w-4" />
                      </motion.div>
                      Starting Training...
                    </>
                  ) : (
                    <>
                      <Rocket className="mr-2 h-4 w-4" />
                      Start Training
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-sm">Quick Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                <p>• Start with fewer epochs for faster iteration</p>
                <p>• Larger batch sizes require more memory</p>
                <p>• Lower learning rates provide more stable training</p>
                <p>• Adam optimizer works well for most cases</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
