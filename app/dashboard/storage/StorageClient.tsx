'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HardDrive, Upload, Download, Trash2, RefreshCw, AlertCircle,
  X, Activity, Folder, Clock, Eye, Copy, Check, FileText,
  Image, Video, Music, Archive, Code, File, Search, Filter,
  BarChart3, Database, Zap
} from 'lucide-react';
import {
  storageService,
  StorageBucket,
  StorageFile,
  FileStatsResponse,
} from '@/lib/storage-service';

type Tab = 'files' | 'buckets' | 'stats';

const emptyStats: FileStatsResponse = {
  total_files: 0,
  total_size_bytes: 0,
  total_size_mb: 0,
  average_file_size_bytes: 0,
  largest_file_bytes: 0,
  by_content_type: [],
};

export default function StorageClient() {
  const [buckets, setBuckets] = useState<StorageBucket[]>([]);
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [stats, setStats] = useState<FileStatsResponse>(emptyStats);
  const [activeTab, setActiveTab] = useState<Tab>('files');
  const [selectedFile, setSelectedFile] = useState<StorageFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Upload states
  const [showUpload, setShowUpload] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) return <Image className="w-5 h-5 text-blue-400" />;
    if (contentType.startsWith('video/')) return <Video className="w-5 h-5 text-purple-400" />;
    if (contentType.startsWith('audio/')) return <Music className="w-5 h-5 text-pink-400" />;
    if (contentType.includes('pdf')) return <FileText className="w-5 h-5 text-red-400" />;
    if (contentType.includes('zip') || contentType.includes('archive'))
      return <Archive className="w-5 h-5 text-yellow-400" />;
    if (contentType.includes('json') || contentType.includes('xml'))
      return <Code className="w-5 h-5 text-green-400" />;
    return <File className="w-5 h-5 text-gray-400" />;
  };

  // ===== Data fetching =====

  const fetchBuckets = useCallback(async () => {
    try {
      const response = await storageService.listBuckets();
      setBuckets(response.buckets || []);
    } catch (err) {
      console.error('Failed to fetch buckets:', err);
      setError('Failed to load storage buckets');
    }
  }, []);

  const fetchFiles = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await storageService.listFiles({
        page,
        page_size: 20,
      });
      setFiles(response.files || []);
      setHasMore(response.has_more || false);
      setCurrentPage(page);
    } catch (err) {
      console.error('Failed to fetch files:', err);
      setError('Failed to load files');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await storageService.getFileStats();
      setStats(response);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError('Failed to load statistics');
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchFiles();
    fetchBuckets();
    fetchStats();
  }, [fetchFiles, fetchBuckets, fetchStats]);

  // ===== File Operations =====

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const file = selectedFiles[0];

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await storageService.uploadFile(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Refresh file list
      await fetchFiles();
      await fetchStats();

      setTimeout(() => {
        setShowUpload(false);
        setUploadProgress(0);
      }, 1000);
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownloadFile = async (file: StorageFile) => {
    try {
      await storageService.downloadFile(file.id, file.name);
    } catch (err) {
      console.error('Download failed:', err);
      setError('Failed to download file');
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      await storageService.deleteFile(fileId);
      await fetchFiles();
      await fetchStats();
      setSelectedFile(null);
    } catch (err) {
      console.error('Delete failed:', err);
      setError('Failed to delete file');
    }
  };

  const handleRefresh = () => {
    fetchFiles();
    fetchBuckets();
    fetchStats();
  };

  // ===== Filtering =====

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ===== Render =====

  const tabs = [
    { id: 'files' as const, label: 'Files', icon: Folder },
    { id: 'buckets' as const, label: 'Buckets', icon: Database },
    { id: 'stats' as const, label: 'Statistics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <HardDrive className="w-8 h-8 text-primary" />
              Storage Dashboard
            </h1>
            <p className="text-gray-400">
              Manage your files, buckets, and storage usage
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors"
            >
              <Upload className="w-5 h-5" />
              Upload File
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
              className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-200">{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-300"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <File className="w-5 h-5 text-blue-400" />
              <span className="text-gray-400 text-sm">Total Files</span>
            </div>
            <p className="text-2xl font-bold text-white">{formatNumber(stats.total_files)}</p>
          </div>
          <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <HardDrive className="w-5 h-5 text-green-400" />
              <span className="text-gray-400 text-sm">Total Storage</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {storageService.formatBytes(stats.total_size_bytes)}
            </p>
          </div>
          <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-purple-400" />
              <span className="text-gray-400 text-sm">Avg File Size</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {storageService.formatBytes(stats.average_file_size_bytes)}
            </p>
          </div>
          <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-400 text-sm">Largest File</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {storageService.formatBytes(stats.largest_file_bytes)}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-gray-700">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-primary'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* Files Tab */}
          {activeTab === 'files' && (
            <motion.div
              key="files"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Search Bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>

              {/* Files List */}
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="text-center py-20">
                  <Folder className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg mb-2">No files found</p>
                  <p className="text-gray-500 text-sm">
                    {searchQuery ? 'Try a different search term' : 'Upload your first file to get started'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFiles.map((file) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors cursor-pointer"
                      onClick={() => setSelectedFile(file)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          {getFileIcon(file.content_type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{file.name}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-gray-400 text-sm">
                                {storageService.formatBytes(file.size_bytes)}
                              </span>
                              <span className="text-gray-500 text-xs">
                                {formatDate(file.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(file.id);
                            }}
                            className="p-2 hover:bg-gray-700 rounded transition-colors"
                            title="Copy ID"
                          >
                            {copiedId === file.id ? (
                              <Check className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadFile(file);
                            }}
                            className="p-2 hover:bg-gray-700 rounded transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFile(file.id);
                            }}
                            className="p-2 hover:bg-gray-700 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {(currentPage > 1 || hasMore) && (
                <div className="flex items-center justify-center gap-3 pt-4">
                  <button
                    onClick={() => fetchFiles(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-gray-400">Page {currentPage}</span>
                  <button
                    onClick={() => fetchFiles(currentPage + 1)}
                    disabled={!hasMore}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Buckets Tab */}
          {activeTab === 'buckets' && (
            <motion.div
              key="buckets"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {buckets.length === 0 ? (
                <div className="text-center py-20">
                  <Database className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg mb-2">No buckets found</p>
                  <p className="text-gray-500 text-sm">Create a bucket to organize your files</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {buckets.map((bucket) => (
                    <motion.div
                      key={bucket.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-6 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Database className="w-6 h-6 text-primary" />
                        <h3 className="text-lg font-semibold text-white truncate">
                          {bucket.name}
                        </h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Files</span>
                          <span className="text-white font-medium">{bucket.file_count}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Size</span>
                          <span className="text-white font-medium">
                            {storageService.formatBytes(bucket.total_size_bytes)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Created</span>
                          <span className="text-gray-500 text-xs">
                            {new Date(bucket.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Storage by Content Type */}
              <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Storage by Content Type
                </h3>
                {stats.by_content_type.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No data available</p>
                ) : (
                  <div className="space-y-3">
                    {stats.by_content_type.map((item, index) => {
                      const percentage = (item.total_bytes / stats.total_size_bytes) * 100;
                      return (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-300 text-sm">{item.content_type}</span>
                            <span className="text-gray-400 text-sm">
                              {storageService.formatBytes(item.total_bytes)} ({item.count} files)
                            </span>
                          </div>
                          <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                              className="h-full bg-gradient-to-r from-primary to-blue-500"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Storage Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Storage Summary</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Total Files</span>
                      <span className="text-white font-medium">{stats.total_files}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Total Size</span>
                      <span className="text-white font-medium">
                        {storageService.formatBytes(stats.total_size_bytes)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Average File Size</span>
                      <span className="text-white font-medium">
                        {storageService.formatBytes(stats.average_file_size_bytes)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Largest File</span>
                      <span className="text-white font-medium">
                        {storageService.formatBytes(stats.largest_file_bytes)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Storage Health</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400">Status</span>
                        <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm font-medium">
                          Healthy
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400">Last Updated</span>
                        <span className="text-white text-sm">
                          {new Date().toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Modal */}
        <AnimatePresence>
          {showUpload && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => !isUploading && setShowUpload(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Upload File</h3>
                  <button
                    onClick={() => !isUploading && setShowUpload(false)}
                    className="text-gray-400 hover:text-white"
                    disabled={isUploading}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-300 mb-1">Click to select a file</p>
                    <p className="text-gray-500 text-sm">or drag and drop</p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />

                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Uploading...</span>
                        <span className="text-white font-medium">{uploadProgress}%</span>
                      </div>
                      <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          className="h-full bg-gradient-to-r from-primary to-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* File Detail Modal */}
        <AnimatePresence>
          {selectedFile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedFile(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-lg w-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    File Details
                  </h3>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-900 rounded-lg">
                    {getFileIcon(selectedFile.content_type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{selectedFile.name}</p>
                      <p className="text-gray-400 text-sm">{selectedFile.content_type}</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">File ID</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-mono text-xs">
                          {selectedFile.id.slice(0, 8)}...
                        </span>
                        <button
                          onClick={() => handleCopy(selectedFile.id)}
                          className="text-gray-400 hover:text-white"
                        >
                          {copiedId === selectedFile.id ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Size</span>
                      <span className="text-white">
                        {storageService.formatBytes(selectedFile.size_bytes)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Created</span>
                      <span className="text-white">{formatDate(selectedFile.created_at)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Updated</span>
                      <span className="text-white">{formatDate(selectedFile.updated_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-gray-700">
                    <button
                      onClick={() => handleDownloadFile(selectedFile)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={() => handleDeleteFile(selectedFile.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
