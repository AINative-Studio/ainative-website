'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Upload, Video, Trash2, Settings, Film, Clock, HardDrive, CheckCircle, XCircle, Loader2, Grid3x3, List, Zap, FileVideo } from 'lucide-react';
import videoService, { Video as VideoType, ProcessingOptions } from '@/lib/video-service';

const mockVideos: VideoType[] = [
  {
    id: 'video-1', name: 'Product Demo', originalName: 'product_demo_2024.mp4',
    description: 'AI Native Studio product demonstration video', status: 'completed',
    format: 'mp4', resolution: '1080p', duration: 245, fileSize: 125000000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'video-2', name: 'Tutorial: Getting Started', originalName: 'tutorial.mov',
    description: 'Beginner tutorial', status: 'processing', format: 'mov', resolution: '720p',
    duration: 180, fileSize: 89000000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400',
    processingProgress: 65, processingStage: 'Transcoding to MP4',
    createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date().toISOString(),
  },
];

export default function VideoProcessingClient() {
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [processingOptionsOpen, setProcessingOptionsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [videoName, setVideoName] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingOptions, setProcessingOptions] = useState<ProcessingOptions>({
    resolution: '1080p', format: 'mp4', extractThumbnail: true,
    thumbnailTimestamp: 5, quality: 'high', codec: 'h264',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: videoLibrary, isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      try {
        return await videoService.getVideoLibrary();
      } catch {
        return { videos: mockVideos, total: mockVideos.length, page: 1, pageSize: 20 };
      }
    },
    enabled: mounted,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsUploading(true);
      try {
        return await videoService.uploadVideo({ file, name: videoName || file.name, description: videoDescription });
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      setSelectedFile(null);
      setVideoName('');
      setVideoDescription('');
    },
  });

  const processMutation = useMutation({
    mutationFn: ({ videoId, options }: { videoId: string; options: ProcessingOptions }) =>
      videoService.processVideo(videoId, { options }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      setProcessingOptionsOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (videoId: string) => videoService.deleteVideo(videoId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['videos'] }),
  });

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!videoName) setVideoName(file.name.replace(/\.[^/.]+$/, ''));
    }
  }, [videoName]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      if (!videoName) setVideoName(file.name.replace(/\.[^/.]+$/, ''));
    }
  }, [videoName]);

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 Bytes';
    const k = 1024, sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s % 60}s`;
    return `${s}s`;
  };

  const getStatusBadge = (status: VideoType['status']) => {
    const variants = {
      uploading: { variant: 'secondary' as const, icon: <Upload className="h-3 w-3 mr-1" /> },
      processing: { variant: 'default' as const, icon: <Loader2 className="h-3 w-3 mr-1 animate-spin" /> },
      completed: { variant: 'outline' as const, icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      failed: { variant: 'destructive' as const, icon: <XCircle className="h-3 w-3 mr-1" /> },
    };
    const { variant, icon } = variants[status];
    return <Badge variant={variant} className="flex items-center w-fit">{icon}{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const videos = videoLibrary?.videos || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Video Processing</h1>
              <p className="text-gray-400 mt-2">Upload, process, and manage your video content</p>
            </div>
            <div className="flex gap-2">
              <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}><Grid3x3 className="h-4 w-4" /></Button>
              <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}><List className="h-4 w-4" /></Button>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="library" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
            <TabsTrigger value="library"><FileVideo className="h-4 w-4 mr-2" />Video Library</TabsTrigger>
            <TabsTrigger value="upload"><Upload className="h-4 w-4 mr-2" />Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="library">
            {isLoading ? (
              <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-purple-400" /></div>
            ) : videos.length === 0 ? (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="flex flex-col items-center justify-center h-64">
                  <Video className="h-16 w-16 text-gray-600 mb-4" />
                  <p className="text-gray-400">No videos yet. Upload your first video!</p>
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {videos.map((video) => (
                  <Card key={video.id} className="bg-gray-800/50 border-gray-700 hover:border-purple-500 transition-all">
                    {viewMode === 'grid' && (
                      <div className="relative aspect-video bg-gray-900">
                        {video.thumbnailUrl ? (
                          <Image src={video.thumbnailUrl} alt={video.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                        ) : (
                          <div className="flex items-center justify-center h-full"><Film className="h-12 w-12 text-gray-600" /></div>
                        )}
                        <div className="absolute top-2 right-2">{getStatusBadge(video.status)}</div>
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{video.name}</CardTitle>
                        {viewMode === 'list' && getStatusBadge(video.status)}
                      </div>
                      <CardDescription className="line-clamp-2">{video.description || 'No description'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-gray-400">
                        <div className="flex justify-between">
                          <span className="flex items-center"><Clock className="h-3 w-3 mr-1" />{formatDuration(video.duration)}</span>
                          <span className="flex items-center"><HardDrive className="h-3 w-3 mr-1" />{formatFileSize(video.fileSize)}</span>
                        </div>
                        <div className="flex justify-between">
                          <Badge variant="outline" className="text-xs">{video.format.toUpperCase()}</Badge>
                          <Badge variant="outline" className="text-xs">{video.resolution}</Badge>
                        </div>
                        {video.processingProgress !== undefined && (
                          <div className="space-y-1">
                            <Progress value={video.processingProgress} className="h-2" />
                            <p className="text-xs text-center">{video.processingStage}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => { setSelectedVideo(video); setProcessingOptionsOpen(true); }} disabled={video.status === 'processing'}>
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => deleteMutation.mutate(video.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle>Upload Video</CardTitle>
                <CardDescription>Upload your video file to start processing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${selectedFile ? 'border-purple-500 bg-purple-500/10' : 'border-gray-600 hover:border-gray-500'}`} onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
                  <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
                  {selectedFile ? (
                    <div className="space-y-4">
                      <FileVideo className="h-16 w-16 text-purple-400 mx-auto" />
                      <div>
                        <p className="text-lg font-semibold">{selectedFile.name}</p>
                        <p className="text-sm text-gray-400">{formatFileSize(selectedFile.size)}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setSelectedFile(null)}>Remove</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-16 w-16 text-gray-600 mx-auto" />
                      <div>
                        <p className="text-lg font-semibold mb-2">Drag and drop your video here</p>
                        <p className="text-sm text-gray-400 mb-4">or</p>
                        <Button onClick={() => fileInputRef.current?.click()} variant="outline">Browse Files</Button>
                      </div>
                      <p className="text-xs text-gray-500">Supported: MP4, MOV, AVI, WEBM (Max: 5GB)</p>
                    </div>
                  )}
                </div>
                {selectedFile && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Video Name</Label>
                        <Input value={videoName} onChange={(e) => setVideoName(e.target.value)} placeholder="Enter video name" className="bg-gray-900/50 border-gray-700" />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea value={videoDescription} onChange={(e) => setVideoDescription(e.target.value)} placeholder="Optional description" className="bg-gray-900/50 border-gray-700" rows={3} />
                      </div>
                    </div>
                    <Button onClick={() => selectedFile && uploadMutation.mutate(selectedFile)} disabled={!selectedFile || !videoName || isUploading} className="w-full">
                      {isUploading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading...</> : <><Upload className="h-4 w-4 mr-2" />Upload Video</>}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={processingOptionsOpen} onOpenChange={setProcessingOptionsOpen}>
          <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle>Video Processing Options</DialogTitle>
              <DialogDescription>Configure processing for {selectedVideo?.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Resolution</Label>
                  <Select value={processingOptions.resolution} onValueChange={(value: any) => setProcessingOptions({ ...processingOptions, resolution: value })}>
                    <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="480p">480p</SelectItem>
                      <SelectItem value="720p">720p (HD)</SelectItem>
                      <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                      <SelectItem value="4k">4K</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select value={processingOptions.format} onValueChange={(value: any) => setProcessingOptions({ ...processingOptions, format: value })}>
                    <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="mp4">MP4</SelectItem>
                      <SelectItem value="webm">WebM</SelectItem>
                      <SelectItem value="mov">MOV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quality</Label>
                  <Select value={processingOptions.quality} onValueChange={(value: any) => setProcessingOptions({ ...processingOptions, quality: value })}>
                    <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Codec</Label>
                  <Select value={processingOptions.codec} onValueChange={(value: any) => setProcessingOptions({ ...processingOptions, codec: value })}>
                    <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="h264">H.264</SelectItem>
                      <SelectItem value="h265">H.265</SelectItem>
                      <SelectItem value="vp9">VP9</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => selectedVideo && processMutation.mutate({ videoId: selectedVideo.id, options: processingOptions })} disabled={processMutation.isPending} className="flex-1">
                  {processMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</> : <><Zap className="h-4 w-4 mr-2" />Start Processing</>}
                </Button>
                <Button variant="outline" onClick={() => setProcessingOptionsOpen(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}