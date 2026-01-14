'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  X,
  Clock,
  Sparkles,
  ExternalLink,
  Github,
  Heart,
  Bookmark,
  Share2,
  GitFork,
  Star,
} from 'lucide-react';
import { useShowcaseVideo, VideoAnnotation, VideoQuality } from '@/hooks/useShowcaseVideo';
import { VideoAnnotation as VideoAnnotationComponent } from './VideoAnnotation';
import { TechStackBadges } from './TechStackBadges';
import { cn } from '@/lib/utils';

export interface ShowcaseVideoData {
  id: number;
  title: string;
  company_name: string;
  developer_name: string | null;
  description: string;
  tech_stack: string[];
  demo_url: string | null;
  github_url: string | null;
  video_url?: string;
  video_thumbnail?: string;
  video_duration?: number;
  video_qualities?: VideoQuality[];
  annotations?: VideoAnnotation[];
  featured: boolean;
  slug: string | null;
  likes?: number;
  bookmarks?: number;
}

interface ShowcaseVideoCardProps {
  showcase: ShowcaseVideoData;
  onLike?: (id: number) => void;
  onBookmark?: (id: number) => void;
  onShare?: (showcase: ShowcaseVideoData) => void;
}

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);

const CardDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>
);

export function ShowcaseVideoCard({ showcase, onLike, onBookmark, onShare }: ShowcaseVideoCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [playbackMode, setPlaybackMode] = useState<'hover' | 'inline' | 'modal'>('hover');
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  const hasVideo = !!showcase.video_url;

  const inlineVideo = useShowcaseVideo({
    videoUrl: showcase.video_url || '',
    qualities: showcase.video_qualities,
    annotations: showcase.annotations,
    autoPlay: true,
    muted: false,
  });

  const modalVideo = useShowcaseVideo({
    videoUrl: showcase.video_url || '',
    qualities: showcase.video_qualities,
    annotations: showcase.annotations,
    autoPlay: true,
    muted: false,
  });

  useEffect(() => {
    if (isHovering && hasVideo && previewVideoRef.current) {
      hoverTimeoutRef.current = setTimeout(() => {
        previewVideoRef.current?.play();
      }, 500);
    } else if (!isHovering && previewVideoRef.current) {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      previewVideoRef.current.pause();
      previewVideoRef.current.currentTime = 0;
    }

    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [isHovering, hasVideo]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    onLike?.(showcase.id);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    onBookmark?.(showcase.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShare?.(showcase);
  };

  const handleCardClick = () => {
    if (hasVideo && !isExpanded) {
      setIsExpanded(true);
      setPlaybackMode('inline');
    }
  };

  const handlePlayInModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowModal(true);
    setPlaybackMode('modal');
  };

  const handleCollapseInline = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(false);
    inlineVideo.pause();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          className={cn(
            'h-full hover:shadow-xl transition-all flex flex-col cursor-pointer overflow-hidden',
            'border-2 hover:border-primary/50'
          )}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div
            className="aspect-video relative overflow-hidden bg-gradient-to-br from-primary/10 to-blue-500/10"
            onClick={handleCardClick}
          >
            {hasVideo ? (
              <>
                <video
                  ref={previewVideoRef}
                  src={showcase.video_url}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  poster={showcase.video_thumbnail}
                />

                <AnimatePresence>
                  {!isHovering && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/30"
                    >
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                        <Play className="h-8 w-8 text-primary ml-1" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {showcase.video_duration && (
                  <Badge className="absolute bottom-2 right-2 bg-black/70 text-white">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDuration(showcase.video_duration)}
                  </Badge>
                )}

                {showcase.featured && (
                  <Badge className="absolute top-2 right-2 bg-yellow-500 text-white z-10">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </>
            ) : (
              <>
                <img
                  src={showcase.video_thumbnail || `https://source.unsplash.com/random/800x450?tech,${showcase.id}`}
                  alt={showcase.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {showcase.featured && (
                  <Badge className="absolute top-2 right-2 bg-yellow-500 text-white z-10">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </>
            )}
          </div>

          <AnimatePresence>
            {isExpanded && hasVideo && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="relative bg-black aspect-video">
                  <video
                    ref={inlineVideo.videoRef}
                    src={showcase.video_url}
                    className="w-full h-full"
                    poster={showcase.video_thumbnail}
                  />

                  {showcase.annotations && (
                    <VideoAnnotationComponent annotations={inlineVideo.activeAnnotations} />
                  )}

                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                        onClick={inlineVideo.togglePlay}
                      >
                        {inlineVideo.isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                        onClick={inlineVideo.toggleMute}
                      >
                        {inlineVideo.isMuted ? (
                          <VolumeX className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </Button>

                      <div className="flex-1">
                        <input
                          type="range"
                          min="0"
                          max={inlineVideo.duration}
                          value={inlineVideo.currentTime}
                          onChange={(e) => inlineVideo.seek(parseFloat(e.target.value))}
                          className="w-full accent-primary"
                        />
                      </div>

                      <span className="text-white text-xs whitespace-nowrap">
                        {formatDuration(inlineVideo.currentTime)} / {formatDuration(inlineVideo.duration)}
                      </span>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                        onClick={handlePlayInModal}
                        title="Open in fullscreen modal"
                      >
                        <Maximize className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                        onClick={handleCollapseInline}
                        title="Collapse player"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <CardHeader className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">
                {showcase.company_name}
                {showcase.developer_name ? ` • ${showcase.developer_name}` : ''}
              </div>
            </div>

            <CardTitle className="mb-2 line-clamp-2">{showcase.title}</CardTitle>
            <CardDescription className="mb-4 line-clamp-3">{showcase.description}</CardDescription>

            <TechStackBadges techStack={showcase.tech_stack} maxVisible={3} />
          </CardHeader>

          <CardContent className="pt-0 space-y-3">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={cn('flex-1', isLiked && 'text-red-500')}
                onClick={handleLike}
              >
                <Heart className={cn('h-4 w-4 mr-1', isLiked && 'fill-current')} />
                {(showcase.likes || 0) + (isLiked ? 1 : 0)}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={cn('flex-1', isBookmarked && 'text-blue-500')}
                onClick={handleBookmark}
              >
                <Bookmark className={cn('h-4 w-4 mr-1', isBookmarked && 'fill-current')} />
                {(showcase.bookmarks || 0) + (isBookmarked ? 1 : 0)}
              </Button>

              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              {showcase.demo_url && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="flex-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <a href={showcase.demo_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Demo
                  </a>
                </Button>
              )}
              {showcase.github_url && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="flex-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <a href={showcase.github_url} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4 mr-1" />
                    Code
                  </a>
                </Button>
              )}
            </div>

            <Link href={`/showcases/${showcase.slug || showcase.id}`} className="block">
              <Button variant="default" size="sm" className="w-full">
                View Details
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-6xl p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-2xl">{showcase.title}</DialogTitle>
            <div className="text-sm text-muted-foreground">
              {showcase.company_name}
              {showcase.developer_name ? ` • ${showcase.developer_name}` : ''}
            </div>
          </DialogHeader>

          <div className="relative aspect-video bg-black">
            <video
              ref={modalVideo.videoRef}
              src={showcase.video_url}
              className="w-full h-full"
              poster={showcase.video_thumbnail}
            />

            {showcase.annotations && (
              <VideoAnnotationComponent annotations={modalVideo.activeAnnotations} />
            )}

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={modalVideo.togglePlay}
                >
                  {modalVideo.isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={modalVideo.toggleMute}
                >
                  {modalVideo.isMuted ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>

                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max={modalVideo.duration}
                    value={modalVideo.currentTime}
                    onChange={(e) => modalVideo.seek(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <span className="text-white text-sm">
                  {formatDuration(modalVideo.currentTime)} / {formatDuration(modalVideo.duration)}
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={modalVideo.toggleFullscreen}
                >
                  <Maximize className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-muted-foreground">{showcase.description}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Tech Stack</h4>
              <TechStackBadges techStack={showcase.tech_stack} showIcons showVersions />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
