'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, Layers, Search, Plus, Trash2, RefreshCw, Download,
  Upload, Play, AlertCircle, X, Activity, Settings,
  Folder, Clock, HardDrive, Zap, Eye, Copy, Check
} from 'lucide-react';
import {
  zerodbService,
  Namespace,
  DatabaseStats,
  VectorEntry,
  QueryResult,
  DataFormat,
} from '@/lib/zerodb-service';

const emptyStats: DatabaseStats = {
  total_vectors: 0,
  total_namespaces: 0,
  total_storage_mb: 0,
  avg_query_latency_ms: 0,
  queries_last_24h: 0,
  writes_last_24h: 0,
  by_namespace: [],
  index_health: 'optimal',
};

type Tab = 'namespaces' | 'query' | 'vectors' | 'import-export';

export default function ZeroDBClient() {
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [stats, setStats] = useState<DatabaseStats>(emptyStats);
  const [vectors, setVectors] = useState<VectorEntry[]>([]);
  const [queryResults, setQueryResults] = useState<QueryResult[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('namespaces');
  const [selectedNamespace, setSelectedNamespace] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal states
  const [showCreateNamespace, setShowCreateNamespace] = useState(false);
  const [newNamespaceName, setNewNamespaceName] = useState('');
  const [newNamespaceDimensions, setNewNamespaceDimensions] = useState(1536);
  const [queryText, setQueryText] = useState('');
  const [topK, setTopK] = useState(10);

  // Import/Export states
  const [importFormat, setImportFormat] = useState<DataFormat>('json');
  const [exportFormat, setExportFormat] = useState<DataFormat>('json');
  const [includeVectors, setIncludeVectors] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ===== Data fetching =====

  const fetchNamespaces = useCallback(async () => {
    try {
      const response = await zerodbService.listNamespaces();
      setNamespaces(response.namespaces || []);
      if (!selectedNamespace && response.namespaces?.length > 0) {
        setSelectedNamespace(response.namespaces[0].name);
      }
    } catch (err) {
      console.error('Failed to fetch namespaces:', err);
      setError('Failed to load namespaces');
    }
  }, [selectedNamespace]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await zerodbService.getStats();
      setStats(response as DatabaseStats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  const fetchVectors = useCallback(async () => {
    if (!selectedNamespace) return;
    try {
      const response = await zerodbService.listVectors({
        namespace: selectedNamespace,
        page: 1,
        page_size: 50,
      });
      setVectors(response.vectors || []);
    } catch (err) {
      console.error('Failed to fetch vectors:', err);
    }
  }, [selectedNamespace]);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([fetchNamespaces(), fetchStats()]);
      if (activeTab === 'vectors') {
        await fetchVectors();
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchNamespaces, fetchStats, fetchVectors, activeTab]);

  // Initial data load
  useEffect(() => {
    handleRefresh();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch vectors when namespace changes or vectors tab is selected
  useEffect(() => {
    if (activeTab === 'vectors' && selectedNamespace) {
      fetchVectors();
    }
  }, [activeTab, selectedNamespace, fetchVectors]);

  // ===== Action handlers =====

  const handleCreateNamespace = async () => {
    if (!newNamespaceName) return;
    try {
      setIsLoading(true);
      await zerodbService.createNamespace({
        name: newNamespaceName,
        dimensions: newNamespaceDimensions,
      });
      setShowCreateNamespace(false);
      setNewNamespaceName('');
      await fetchNamespaces();
      await fetchStats();
    } catch (err) {
      setError('Failed to create namespace');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNamespace = async (name: string) => {
    try {
      await zerodbService.deleteNamespace(name);
      if (selectedNamespace === name) {
        const remaining = namespaces.filter((n) => n.name !== name);
        setSelectedNamespace(remaining[0]?.name || '');
      }
      await fetchNamespaces();
      await fetchStats();
    } catch (err) {
      setError('Failed to delete namespace');
    }
  };

  const handleExecuteQuery = async () => {
    if (!queryText) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await zerodbService.executeQuery({
        namespace: selectedNamespace,
        vector: [],
        top_k: topK,
        include_metadata: true,
        filter: { query_text: queryText },
      });
      setQueryResults(response.results || []);
    } catch (err) {
      setError('Query execution failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVector = async (vectorId: string) => {
    if (!selectedNamespace) return;
    try {
      await zerodbService.deleteVector(vectorId, selectedNamespace);
      setVectors(vectors.filter((v) => v.id !== vectorId));
      await fetchStats();
    } catch (err) {
      setError('Failed to delete vector');
    }
  };

  const handleExport = async () => {
    if (!selectedNamespace) return;
    try {
      setIsExporting(true);
      setError(null);
      const response = await zerodbService.exportData({
        namespace: selectedNamespace,
        format: exportFormat,
        include_vectors: includeVectors,
      });
      if (response.download_url) {
        window.open(response.download_url, '_blank');
      }
    } catch (err) {
      setError('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const healthColors = {
    optimal: { bg: 'bg-green-500/20', text: 'text-green-400' },
    degraded: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
    rebuilding: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">ZeroDB Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Advanced vector database management and analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </motion.button>
        </div>
      </div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span className="text-red-400">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {isLoading && namespaces.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 text-primary animate-spin" />
          <span className="ml-3 text-gray-400">Loading ZeroDB data...</span>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg"
        >
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Layers className="w-4 h-4" />
            Vectors
          </div>
          <p className="text-2xl font-bold text-white">{formatNumber(stats.total_vectors)}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg"
        >
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Folder className="w-4 h-4" />
            Namespaces
          </div>
          <p className="text-2xl font-bold text-white">{stats.total_namespaces}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg"
        >
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <HardDrive className="w-4 h-4" />
            Storage
          </div>
          <p className="text-2xl font-bold text-white">{stats.total_storage_mb.toFixed(1)} MB</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg"
        >
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Zap className="w-4 h-4" />
            Avg Latency
          </div>
          <p className="text-2xl font-bold text-white">{stats.avg_query_latency_ms.toFixed(1)} ms</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg"
        >
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Activity className="w-4 h-4" />
            Queries (24h)
          </div>
          <p className="text-2xl font-bold text-white">{formatNumber(stats.queries_last_24h)}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg"
        >
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Settings className="w-4 h-4" />
            Index Health
          </div>
          <p className={`text-lg font-medium capitalize ${healthColors[stats.index_health].text}`}>
            {stats.index_health}
          </p>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-gray-800/50 rounded-lg w-fit">
        {(['namespaces', 'query', 'vectors', 'import-export'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'bg-primary text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {tab === 'namespaces' && <Folder className="w-4 h-4 inline-block mr-2" />}
            {tab === 'query' && <Search className="w-4 h-4 inline-block mr-2" />}
            {tab === 'vectors' && <Layers className="w-4 h-4 inline-block mr-2" />}
            {tab === 'import-export' && <Download className="w-4 h-4 inline-block mr-2" />}
            {tab.replace('-', '/')}
          </button>
        ))}
      </div>

      {/* Namespaces Tab */}
      {activeTab === 'namespaces' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Namespaces</h3>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateNamespace(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Namespace
            </motion.button>
          </div>

          {namespaces.length === 0 && !isLoading && (
            <div className="text-center py-12 text-gray-400">
              <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No namespaces found. Create one to get started.</p>
            </div>
          )}

          <div className="grid gap-4">
            {namespaces.map((namespace, index) => (
              <motion.div
                key={namespace.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 bg-gray-800/50 border rounded-lg cursor-pointer transition-all hover:border-primary/50 ${
                  selectedNamespace === namespace.name ? 'border-primary' : 'border-gray-700'
                }`}
                onClick={() => setSelectedNamespace(namespace.name)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <Database className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{namespace.name}</span>
                        <span className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300">
                          {namespace.dimensions}d
                        </span>
                      </div>
                      {namespace.description && (
                        <p className="text-sm text-gray-400 mt-1">{namespace.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          {formatNumber(namespace.vector_count)} vectors
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(namespace.updated_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNamespace(namespace.name);
                        setActiveTab('vectors');
                      }}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                      title="View Vectors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNamespace(namespace.name);
                      }}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete Namespace"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Query Tab */}
      {activeTab === 'query' && (
        <div className="space-y-4">
          <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Query Builder</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Namespace</label>
                  <select
                    value={selectedNamespace}
                    onChange={(e) => setSelectedNamespace(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                  >
                    {namespaces.map((ns) => (
                      <option key={ns.name} value={ns.name}>
                        {ns.name} ({formatNumber(ns.vector_count)} vectors)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Top K Results</label>
                  <input
                    type="number"
                    value={topK}
                    onChange={(e) => setTopK(parseInt(e.target.value) || 10)}
                    min={1}
                    max={100}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Query Text (will be embedded)</label>
                <textarea
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  placeholder="Enter text to search for similar vectors..."
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExecuteQuery}
                disabled={isLoading || !queryText}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                Execute Query
              </motion.button>
            </div>
          </div>

          {/* Query Results */}
          {queryResults.length > 0 && (
            <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">
                Results ({queryResults.length})
              </h3>
              <div className="space-y-3">
                {queryResults.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-gray-900 border border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono text-gray-300">{result.id}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          result.score >= 0.9 ? 'bg-green-500/20 text-green-400' :
                          result.score >= 0.8 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {(result.score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(result.id)}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                      >
                        {copiedId === result.id ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {result.metadata && (
                      <pre className="mt-2 text-xs text-gray-400 overflow-x-auto">
                        {JSON.stringify(result.metadata, null, 2)}
                      </pre>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Vectors Tab */}
      {activeTab === 'vectors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-white">Vector Browser</h3>
              <span className="px-2 py-0.5 bg-gray-700 rounded text-sm text-gray-300">
                {selectedNamespace || 'No namespace selected'}
              </span>
            </div>
          </div>

          {!selectedNamespace && (
            <div className="text-center py-12 text-gray-400">
              <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Select a namespace to browse vectors.</p>
            </div>
          )}

          {selectedNamespace && vectors.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No vectors found in this namespace.</p>
            </div>
          )}

          {vectors.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-700">
                    <th className="py-3 px-4 text-sm font-medium text-gray-400">ID</th>
                    <th className="py-3 px-4 text-sm font-medium text-gray-400">Metadata</th>
                    <th className="py-3 px-4 text-sm font-medium text-gray-400">Created</th>
                    <th className="py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vectors.map((vector) => (
                    <tr key={vector.id} className="border-b border-border hover:bg-gray-800/50">
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm text-white">{vector.id}</span>
                      </td>
                      <td className="py-3 px-4">
                        <pre className="text-xs text-gray-400 max-w-xs overflow-hidden text-ellipsis">
                          {JSON.stringify(vector.metadata)}
                        </pre>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-400">
                        {formatDate(vector.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopy(vector.id)}
                            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                          >
                            {copiedId === vector.id ? (
                              <Check className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteVector(vector.id)}
                            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Import/Export Tab */}
      {activeTab === 'import-export' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Import */}
          <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Upload className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Import Data</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Target Namespace</label>
                <select
                  value={selectedNamespace}
                  onChange={(e) => setSelectedNamespace(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                >
                  {namespaces.map((ns) => (
                    <option key={ns.name} value={ns.name}>{ns.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Format</label>
                <select
                  value={importFormat}
                  onChange={(e) => setImportFormat(e.target.value as DataFormat)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                >
                  <option value="json">JSON</option>
                  <option value="parquet">Parquet</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">Drag and drop or click to upload</p>
                <p className="text-xs text-gray-500 mt-1">Max file size: 100MB</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
              >
                Start Import
              </motion.button>
            </div>
          </div>

          {/* Export */}
          <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Download className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Export Data</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Source Namespace</label>
                <select
                  value={selectedNamespace}
                  onChange={(e) => setSelectedNamespace(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                >
                  {namespaces.map((ns) => (
                    <option key={ns.name} value={ns.name}>
                      {ns.name} ({formatNumber(ns.vector_count)} vectors)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Format</label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as DataFormat)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                >
                  <option value="json">JSON</option>
                  <option value="parquet">Parquet</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-400">
                  <input
                    type="checkbox"
                    checked={includeVectors}
                    onChange={(e) => setIncludeVectors(e.target.checked)}
                    className="rounded bg-gray-700 border-gray-600 text-primary focus:ring-primary"
                  />
                  Include vector embeddings
                </label>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExport}
                disabled={isExporting || !selectedNamespace}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isExporting ? 'Exporting...' : 'Generate Export'}
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {/* Create Namespace Modal */}
      <AnimatePresence>
        {showCreateNamespace && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setShowCreateNamespace(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-white mb-4">Create Namespace</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Name</label>
                  <input
                    type="text"
                    value={newNamespaceName}
                    onChange={(e) => setNewNamespaceName(e.target.value)}
                    placeholder="my-namespace"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Dimensions</label>
                  <select
                    value={newNamespaceDimensions}
                    onChange={(e) => setNewNamespaceDimensions(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                  >
                    <option value={384}>384 (BGE Small)</option>
                    <option value={768}>768 (BGE Base)</option>
                    <option value={1024}>1024 (BGE Large)</option>
                    <option value={1536}>1536 (OpenAI Ada-002)</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCreateNamespace(false)}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreateNamespace}
                    disabled={!newNamespaceName || isLoading}
                    className="flex-1 px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    Create
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
