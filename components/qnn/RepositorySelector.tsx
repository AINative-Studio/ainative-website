import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  GitFork,
  Star,
  Code,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  CheckSquare,
  Square,
  SaveIcon,
  XCircle,
  Package,
  ArrowRight
} from 'lucide-react';
import { qnnApiClient } from '@/services/qnnApiClient';
import { useQNNContext } from '@/contexts/QNNContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Repository {
  id?: string;
  name: string;
  full_name: string;
  description: string;
  stargazers_count: number;
  language: string;
  clone_url: string;
  ssh_url: string;
  html_url: string;
  owner?: {
    login: string;
    avatar_url: string;
  };
  created_at?: string;
  updated_at?: string;
  pushed_at?: string;
  size?: number;
  category?: string;
}

export default function RepositorySelector() {
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    selectedRepositories,
    toggleRepositorySelection,
    clearRepositorySelection,
    isRepositorySelected,
    savedRepositories,
    setSavedRepositories
  } = useQNNContext();

  // Fetch repositories on component mount and when search/filter changes
  useEffect(() => {
    const fetchRepositories = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params: any = {
          min_stars: 100,
          limit: 50,
          sort_by: 'stars'
        };

        if (languageFilter && languageFilter !== 'all') {
          params.language = languageFilter;
        }

        console.log('🔍 Fetching repositories with params:', params);

        // Use search if query provided, otherwise list popular repos
        const response = searchQuery
          ? await qnnApiClient.searchRepositories({ query: searchQuery, ...params })
          : await qnnApiClient.listRepositories(params);

        console.log('📦 API Response:', response);

        const apiRepos = response.items || [];
        console.log(`✅ Setting ${apiRepos.length} repositories`);

        // Map API response to local Repository format
        const mappedRepos: Repository[] = apiRepos.map((repo) => ({
          id: repo.id || repo.fullName || `${repo.owner}-${repo.name}`,
          name: repo.name,
          full_name: repo.fullName,
          description: repo.description || '',
          stargazers_count: repo.stars,
          language: repo.language || '',
          clone_url: repo.url,
          ssh_url: repo.url,
          html_url: repo.url,
          owner: {
            login: repo.owner,
            avatar_url: ''
          },
          created_at: repo.createdAt,
          updated_at: repo.updatedAt
        }));

        setRepositories(mappedRepos);
      } catch (err: unknown) {
        console.error('Error fetching repositories:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch repositories. Please try again.';
        setError(errorMessage);

        // Fallback to sample data for demo purposes
        setRepositories([
          {
            id: '1',
            name: 'tensorflow',
            full_name: 'tensorflow/tensorflow',
            description: 'An Open Source Machine Learning Framework for Everyone',
            stargazers_count: 180000,
            language: 'Python',
            clone_url: 'https://github.com/tensorflow/tensorflow.git',
            ssh_url: 'git@github.com:tensorflow/tensorflow.git',
            html_url: 'https://github.com/tensorflow/tensorflow',
            owner: { login: 'tensorflow', avatar_url: 'https://avatars.githubusercontent.com/u/15658638' }
          },
          {
            id: '2',
            name: 'pytorch',
            full_name: 'pytorch/pytorch',
            description: 'Tensors and Dynamic neural networks in Python',
            stargazers_count: 75000,
            language: 'Python',
            clone_url: 'https://github.com/pytorch/pytorch.git',
            ssh_url: 'git@github.com:pytorch/pytorch.git',
            html_url: 'https://github.com/pytorch/pytorch',
            owner: { login: 'pytorch', avatar_url: 'https://avatars.githubusercontent.com/u/21003710' }
          },
          {
            id: '3',
            name: 'scikit-learn',
            full_name: 'scikit-learn/scikit-learn',
            description: 'Machine learning in Python',
            stargazers_count: 58000,
            language: 'Python',
            clone_url: 'https://github.com/scikit-learn/scikit-learn.git',
            ssh_url: 'git@github.com:scikit-learn/scikit-learn.git',
            html_url: 'https://github.com/scikit-learn/scikit-learn',
            owner: { login: 'scikit-learn', avatar_url: 'https://avatars.githubusercontent.com/u/365630' }
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRepositories();
  }, [searchQuery, languageFilter]);

  // Handle select all
  const handleSelectAll = () => {
    const allRepoIds = repositories.map(repo => repo.id!);
    const currentlySelectedIds = selectedRepositories.map(repo => repo.id);

    // If all are selected, deselect all
    const allSelected = allRepoIds.every(id => currentlySelectedIds.includes(id));

    if (allSelected) {
      // Deselect all current page repos
      repositories.forEach(repo => {
        if (isRepositorySelected(repo.id!)) {
          toggleRepositorySelection(repo as any);
        }
      });
    } else {
      // Select all repos on current page
      repositories.forEach(repo => {
        if (!isRepositorySelected(repo.id!)) {
          toggleRepositorySelection(repo as any);
        }
      });
    }
  };

  // Handle save repositories
  const handleSaveRepositories = () => {
    if (selectedRepositories.length === 0) {
      setError('Please select at least one repository before saving.');
      return;
    }

    setSavedRepositories(selectedRepositories);
    setSaveSuccess(true);

    // Clear success message after 5 seconds
    setTimeout(() => {
      setSaveSuccess(false);
    }, 5000);
  };

  // Check if all visible repos are selected
  const allVisibleSelected = useMemo(() => {
    if (repositories.length === 0) return false;
    return repositories.every(repo => isRepositorySelected(repo.id!));
  }, [repositories, selectedRepositories, isRepositorySelected]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const selectionCountVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-full bg-primary/10">
              <GitFork className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Repository Selection</CardTitle>
              <CardDescription>
                Select multiple GitHub repositories to train your quantum neural network
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters and Bulk Actions */}
      <Card className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Search and Language Filter */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search repositories (e.g., tensorflow, react, pytorch)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={languageFilter} onValueChange={setLanguageFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  <SelectItem value="Python">Python</SelectItem>
                  <SelectItem value="JavaScript">JavaScript</SelectItem>
                  <SelectItem value="TypeScript">TypeScript</SelectItem>
                  <SelectItem value="Java">Java</SelectItem>
                  <SelectItem value="Go">Go</SelectItem>
                  <SelectItem value="Rust">Rust</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Selection Controls */}
            {repositories.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="flex items-center gap-2"
                >
                  {allVisibleSelected ? (
                    <>
                      <CheckSquare className="h-4 w-4" />
                      Deselect All
                    </>
                  ) : (
                    <>
                      <Square className="h-4 w-4" />
                      Select All
                    </>
                  )}
                </Button>

                {selectedRepositories.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearRepositorySelection}
                    className="flex items-center gap-2 text-destructive hover:text-destructive"
                  >
                    <XCircle className="h-4 w-4" />
                    Clear Selection
                  </Button>
                )}

                <Separator orientation="vertical" className="h-6" />

                <AnimatePresence mode="wait">
                  {selectedRepositories.length > 0 && (
                    <motion.div
                      variants={selectionCountVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="flex items-center gap-2"
                    >
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        <Package className="h-3 w-3 mr-1" />
                        {selectedRepositories.length} selected
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="ml-2">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Success Alert */}
            <AnimatePresence>
              {saveSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Alert className="border-green-500/20 bg-green-500/10">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="ml-2">
                      <strong>Successfully saved {selectedRepositories.length} repositories for training!</strong>
                      <br />
                      You can now proceed to model creation.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Selection Summary */}
      <AnimatePresence>
        {selectedRepositories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Selected Repositories ({selectedRepositories.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {selectedRepositories.map((repo) => (
                      <motion.div
                        key={repo.id}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                      >
                        <Badge
                          variant="secondary"
                          className="bg-white/80 dark:bg-gray-700/80 px-3 py-1.5 text-sm flex items-center gap-2"
                        >
                          <Code className="h-3 w-3" />
                          {repo.name}
                          <button
                            onClick={() => toggleRepositorySelection(repo as any)}
                            className="ml-1 hover:text-destructive transition-colors"
                          >
                            <XCircle className="h-3 w-3" />
                          </button>
                        </Badge>
                      </motion.div>
                    ))}
                  </div>

                  <Separator />

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleSaveRepositories}
                      className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold"
                      size="lg"
                    >
                      <SaveIcon className="mr-2 h-5 w-5" />
                      Save Repositories for Training
                    </Button>

                    {savedRepositories.length > 0 && (
                      <Button
                        variant="outline"
                        size="lg"
                        className="flex-1 border-primary/40 hover:bg-primary/5"
                        asChild
                      >
                        <a href="#model-creation">
                          Proceed to Model Creation
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved Repositories Info */}
      <AnimatePresence>
        {savedRepositories.length > 0 && !saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Alert className="border-green-500/20 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="ml-2">
                <strong>{savedRepositories.length} repositories saved for training:</strong>
                <div className="mt-2 flex flex-wrap gap-2">
                  {savedRepositories.map((repo) => (
                    <Badge key={repo.id} variant="secondary" className="bg-white/80">
                      {repo.name}
                    </Badge>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border border-primary/20">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : repositories.length === 0 ? (
        <Card className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardContent className="py-12">
            <div className="text-center">
              <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                <GitFork className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Repositories Found</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Search for GitHub repositories to get started with quantum neural network training
              </p>
              <Button className="bg-primary hover:bg-primary/90 text-white">
                <Search className="mr-2 h-4 w-4" />
                Search GitHub
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {repositories.map((repo) => {
            const isSelected = isRepositorySelected(repo.id!);

            return (
              <motion.div key={repo.id} variants={itemVariants}>
                <Card
                  className={`border transition-all duration-300 hover:shadow-lg group cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary/5 dark:bg-primary/10 ring-2 ring-primary/20'
                      : 'border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:border-primary/40'
                  }`}
                  onClick={() => toggleRepositorySelection(repo as any)}
                >
                  <CardHeader>
                    <div className="flex items-start gap-3 mb-2">
                      <div className="pt-1">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleRepositorySelection(repo as any)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-5 w-5"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Code className="h-4 w-4 text-primary" />
                          <CardTitle className="text-lg">{repo.name}</CardTitle>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            >
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            </motion.div>
                          )}
                        </div>
                        <CardDescription className="text-sm line-clamp-2">
                          {repo.description || 'No description available'}
                        </CardDescription>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mt-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{repo.stargazers_count?.toLocaleString() || 0}</span>
                      </div>
                      {repo.language && (
                        <Badge variant="secondary" className="text-xs">
                          {repo.language}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                        className="hover:border-primary/40"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>

                      <div className="flex-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                        {repo.full_name}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
