'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  Copy,
  Github,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { strapiClient, Tutorial as StrapiTutorial } from '@/lib/strapi-client';
import { getUnsplashImageUrl } from '@/lib/unsplash';

// Extended Tutorial type with additional fields that may come from Strapi
interface TutorialData extends StrapiTutorial {
  learning_objectives?: string[];
  github_repo?: string;
  demo_url?: string;
  prerequisites?: string;
}

interface TutorialDetailClientProps {
  slug: string;
}

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);

export default function TutorialDetailClient({ slug }: TutorialDetailClientProps) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [tutorial, setTutorial] = useState<TutorialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchTutorial();
    }
  }, [slug]);

  const fetchTutorial = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await strapiClient.getTutorial(slug);
      if (data) {
        setTutorial(data);
      } else {
        setError('Tutorial not found');
      }
    } catch (err) {
      console.error('Failed to fetch tutorial:', err);
      setError('Failed to load tutorial. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-900/30 text-green-400';
      case 'intermediate': return 'bg-yellow-900/30 text-yellow-400';
      case 'advanced': return 'bg-red-900/30 text-red-400';
      default: return 'bg-[#2D333B] text-gray-400';
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const match = part.match(/```(\w+)?\n([\s\S]*?)```/);
        if (match) {
          const language = match[1] || 'text';
          const code = match[2];
          return (
            <div key={index} className="relative my-6 group">
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={() => copyToClipboard(code)}
              >
                <Copy className="h-4 w-4 mr-1" />
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                customStyle={{ borderRadius: '0.5rem', padding: '1.5rem', fontSize: '0.875rem' }}
              >
                {code}
              </SyntaxHighlighter>
            </div>
          );
        }
      }
      const lines = part.split('\n');
      return (
        <div key={index}>
          {lines.map((line, lineIndex) => {
            if (line.startsWith('# ')) return <h1 key={lineIndex} className="text-3xl font-bold mt-8 mb-4">{line.substring(2)}</h1>;
            if (line.startsWith('## ')) return <h2 key={lineIndex} className="text-2xl font-semibold mt-6 mb-3">{line.substring(3)}</h2>;
            if (line.startsWith('### ')) return <h3 key={lineIndex} className="text-xl font-semibold mt-4 mb-2">{line.substring(4)}</h3>;
            if (line.match(/^\d+\./)) return <li key={lineIndex} className="ml-6 mb-2">{line.substring(line.indexOf('.') + 2)}</li>;
            if (line.trim()) return <p key={lineIndex} className="mb-4 leading-relaxed text-muted-foreground">{line}</p>;
            return null;
          })}
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-vite-bg">
        <main className="container mx-auto px-4 py-20 mt-16">
          <Link href="/tutorials">
            <Button variant="ghost" className="mb-6 text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />Back to Tutorials
            </Button>
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="aspect-video w-full rounded-lg bg-[#161B22]" />
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-12 w-full mb-4" />
                <Skeleton className="h-12 w-3/4 mb-4" />
                <div className="flex gap-4 mb-8">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>

              <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-64 w-full" />
              </div>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><Skeleton className="h-5 w-24" /></CardHeader>
                <CardContent><Skeleton className="h-16 w-full" /></CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !tutorial) {
    return (
      <div className="min-h-screen bg-vite-bg">
        <main className="container mx-auto px-4 py-20 mt-16">
          <Link href="/tutorials">
            <Button variant="ghost" className="mb-6 text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />Back to Tutorials
            </Button>
          </Link>

          <div className="max-w-2xl mx-auto">
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-300 mb-2">
                {error === 'Tutorial not found' ? 'Tutorial Not Found' : 'Error Loading Tutorial'}
              </h3>
              <p className="text-red-400 mb-6">
                {error || 'The tutorial you are looking for could not be loaded.'}
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="border-[#2D333B] text-gray-300"
                >
                  Go Back
                </Button>
                {error !== 'Tutorial not found' && (
                  <Button
                    onClick={fetchTutorial}
                    className="bg-[#4B6FED] hover:bg-[#4B6FED]/80 text-white"
                  >
                    Try Again
                  </Button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vite-bg">
      <main className="container mx-auto px-4 py-20 mt-16">
        <Link href="/tutorials">
          <Button variant="ghost" className="mb-6 text-gray-400 hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />Back to Tutorials
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              {/* Hero Image */}
              <div className="aspect-video bg-gradient-to-br from-[#4B6FED]/20 to-[#8A63F4]/20 overflow-hidden rounded-lg mb-8 border border-[#2D333B]">
                <img
                  src={getUnsplashImageUrl(tutorial.id, 1200, 600)}
                  alt={tutorial.title}
                  className="w-full h-full object-cover object-center"
                  loading="eager"
                />
              </div>

              <div className="mb-8">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {tutorial.difficulty && <Badge className={getDifficultyColor(tutorial.difficulty)}>{tutorial.difficulty}</Badge>}
                  {tutorial.tags && tutorial.tags.map((tag, i) => <Badge key={i} variant="outline" className="border-[#2D333B] text-gray-300">{tag.name}</Badge>)}
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">{tutorial.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-400">
                  <div className="flex items-center"><Clock className="h-4 w-4 mr-1" />{tutorial.duration || 30} minutes</div>
                  {tutorial.github_repo && (
                    <a href={tutorial.github_repo} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-[#8AB4FF] transition-colors">
                      <Github className="h-4 w-4 mr-1" />Code Repository
                    </a>
                  )}
                  {tutorial.demo_url && (
                    <a href={tutorial.demo_url} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-[#8AB4FF] transition-colors">
                      <ExternalLink className="h-4 w-4 mr-1" />Live Demo
                    </a>
                  )}
                </div>
              </div>

              <div className="prose prose-lg prose-invert max-w-none">{renderContent(tutorial.content)}</div>

              <Separator className="my-8 bg-[#2D333B]" />

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Tutorial completed?</span>
                <Button onClick={() => setProgress(100)} disabled={progress === 100} className="bg-[#4B6FED] hover:bg-[#4B6FED]/80 text-white">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {progress === 100 ? 'Completed!' : 'Mark as Complete'}
                </Button>
              </div>
            </motion.article>
          </div>

          <div className="space-y-6">
            {tutorial.learning_objectives && tutorial.learning_objectives.length > 0 && (
              <Card className="bg-[#161B22] border-[#2D333B]">
                <CardHeader><CardTitle className="text-base text-white">Learning Objectives</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {tutorial.learning_objectives.map((objective, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-[#4B6FED] flex-shrink-0" />
                      <span className="text-sm text-gray-300">{objective}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {tutorial.prerequisites && (
              <Card className="bg-[#161B22] border-[#2D333B]">
                <CardHeader><CardTitle className="text-base text-white">Prerequisites</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-gray-400">{tutorial.prerequisites}</p></CardContent>
              </Card>
            )}

            {tutorial.category && (
              <Card className="bg-[#161B22] border-[#2D333B]">
                <CardHeader><CardTitle className="text-base text-white">Category</CardTitle></CardHeader>
                <CardContent>
                  <Badge variant="outline" className="text-sm border-[#2D333B] text-gray-300">{tutorial.category.name}</Badge>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
