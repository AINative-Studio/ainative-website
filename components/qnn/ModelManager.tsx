import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Plus, Trash2, Calendar, Cpu, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Model {
  id: string;
  name: string;
  type: 'classification' | 'regression' | 'clustering';
  status: 'active' | 'training' | 'idle';
  createdAt: Date;
  accuracy?: number;
  repository?: string;
}

export default function ModelManager() {
  const [models] = useState<Model[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [newModelType, setNewModelType] = useState<Model['type']>('classification');

  const handleCreateModel = () => {
    // This will be connected to API by Agent 1
    console.log('Creating model:', { name: newModelName, type: newModelType });
    setIsCreateDialogOpen(false);
    setNewModelName('');
    setNewModelType('classification');
  };

  const handleDeleteModel = (modelId: string) => {
    // This will be connected to API by Agent 1
    console.log('Deleting model:', modelId);
  };

  const getStatusColor = (status: Model['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'training':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'idle':
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Model Management</CardTitle>
                <CardDescription>
                  Create, manage, and monitor your quantum neural network models
                </CardDescription>
              </div>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Model
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Model</DialogTitle>
                  <DialogDescription>
                    Configure your quantum neural network model. Choose a name and model type.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="model-name">Model Name</Label>
                    <Input
                      id="model-name"
                      placeholder="e.g., my-quantum-classifier"
                      value={newModelName}
                      onChange={(e) => setNewModelName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model-type">Model Type</Label>
                    <Select value={newModelType} onValueChange={(value) => setNewModelType(value as Model['type'])}>
                      <SelectTrigger id="model-type">
                        <SelectValue placeholder="Select model type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="classification">Classification</SelectItem>
                        <SelectItem value="regression">Regression</SelectItem>
                        <SelectItem value="clustering">Clustering</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateModel}
                    disabled={!newModelName.trim()}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    Create Model
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Models Grid */}
      {models.length === 0 ? (
        <Card className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardContent className="py-12">
            <div className="text-center">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-purple-500/10 to-blue-600/10 mb-4">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Models Yet</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                Create your first quantum neural network model to get started with training
              </p>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Model
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {models.map((model) => (
            <motion.div key={model.id} variants={itemVariants}>
              <Card className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:border-primary/40 transition-all group">
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <CardTitle className="text-lg">{model.name}</CardTitle>
                      </div>
                      <Badge className={`text-xs ${getStatusColor(model.status)}`}>
                        {model.status}
                      </Badge>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-red-500/10 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Model</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{model.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteModel(model.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <Cpu className="h-4 w-4" />
                      <span className="capitalize">{model.type}</span>
                    </div>

                    {model.accuracy && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Accuracy:</span>
                        <span className="font-semibold text-primary">{(model.accuracy * 100).toFixed(1)}%</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <Calendar className="h-4 w-4" />
                      <span>Created {formatDistanceToNow(model.createdAt, { addSuffix: true })}</span>
                    </div>

                    {model.repository && (
                      <div className="pt-2 border-t border-primary/10">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Repository:</p>
                        <p className="text-xs font-medium truncate">{model.repository}</p>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full hover:border-primary/40 hover:bg-primary/5"
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
