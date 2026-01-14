'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Code, Sparkles, Zap, Info } from 'lucide-react';
import { VideoAnnotation as VideoAnnotationType } from '@/hooks/useShowcaseVideo';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';

interface VideoAnnotationProps {
  annotations: VideoAnnotationType[];
  onClose?: (annotationId: string) => void;
}

const annotationIcons = {
  feature: Sparkles,
  tech: Zap,
  code: Code,
  highlight: Info,
};

const annotationColors = {
  feature: 'from-purple-500/90 to-pink-500/90',
  tech: 'from-blue-500/90 to-cyan-500/90',
  code: 'from-green-500/90 to-emerald-500/90',
  highlight: 'from-yellow-500/90 to-orange-500/90',
};

const positionClasses = {
  'top-left': 'top-4 left-4',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
};

export function VideoAnnotation({ annotations, onClose }: VideoAnnotationProps) {
  return (
    <AnimatePresence>
      {annotations.map((annotation) => {
        const Icon = annotationIcons[annotation.type];
        const position = annotation.position || 'top-right';

        return (
          <motion.div
            key={annotation.id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={cn(
              'absolute z-50 max-w-md',
              positionClasses[position]
            )}
          >
            <Card
              className={cn(
                'border-0 shadow-2xl overflow-hidden',
                'bg-gradient-to-br backdrop-blur-lg',
                annotationColors[annotation.type]
              )}
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <h4 className="font-semibold text-white text-sm">
                      {annotation.title}
                    </h4>
                  </div>
                  {onClose && (
                    <button
                      onClick={() => onClose(annotation.id)}
                      className="text-white/80 hover:text-white transition-colors"
                      aria-label="Close annotation"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-2">
                <p className="text-white text-sm leading-relaxed mb-3">
                  {annotation.description}
                </p>

                {annotation.codeSnippet && (
                  <div className="rounded-lg overflow-hidden shadow-lg">
                    <div className="bg-gray-900 px-3 py-2 flex items-center justify-between">
                      <Badge variant="outline" className="text-xs border-gray-700 text-gray-300">
                        <Code className="h-3 w-3 mr-1" />
                        {annotation.language || 'code'}
                      </Badge>
                    </div>
                    <SyntaxHighlighter
                      language={annotation.language || 'javascript'}
                      style={vscDarkPlus}
                      customStyle={{
                        margin: 0,
                        padding: '1rem',
                        fontSize: '0.75rem',
                        maxHeight: '200px',
                      }}
                    >
                      {annotation.codeSnippet}
                    </SyntaxHighlighter>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
}

interface AnnotationTimelineProps {
  annotations: VideoAnnotationType[];
  duration: number;
  currentTime: number;
  onSeek: (timestamp: number) => void;
}

export function AnnotationTimeline({
  annotations,
  duration,
  currentTime,
  onSeek,
}: AnnotationTimelineProps) {
  return (
    <div className="relative w-full h-12 bg-gray-900/50 rounded-lg overflow-hidden">
      <div className="absolute inset-0 flex items-center px-2">
        <div className="w-full h-1 bg-gray-700 rounded-full relative">
          <motion.div
            className="absolute top-0 left-0 h-full bg-primary rounded-full"
            style={{ width: `${(currentTime / duration) * 100}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />

          {annotations.map((annotation) => {
            const position = (annotation.timestamp / duration) * 100;
            const Icon = annotationIcons[annotation.type];

            return (
              <button
                key={annotation.id}
                onClick={() => onSeek(annotation.timestamp)}
                className={cn(
                  'absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full',
                  'flex items-center justify-center transition-all',
                  'hover:scale-125 shadow-lg',
                  currentTime >= annotation.timestamp &&
                    currentTime < annotation.timestamp + annotation.duration
                    ? 'ring-2 ring-white scale-125'
                    : 'hover:ring-2 hover:ring-white/50'
                )}
                style={{ left: `${position}%` }}
                title={annotation.title}
                aria-label={`Jump to ${annotation.title}`}
              >
                <div
                  className={cn(
                    'w-full h-full rounded-full flex items-center justify-center',
                    'bg-gradient-to-br',
                    annotationColors[annotation.type]
                  )}
                >
                  <Icon className="h-3 w-3 text-white" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-2 pb-1 flex justify-between text-xs text-gray-400">
        <span>0:00</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
