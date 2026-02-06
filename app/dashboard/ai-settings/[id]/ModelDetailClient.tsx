'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { aiRegistryService, AIModel } from '@/lib/ai-registry-service';
import {
    Zap, Code, FileText, ArrowLeft, Copy, Check,
    Play, RotateCcw, Download, ChevronDown
} from 'lucide-react';

const CATEGORIES = ['All', 'Image', 'Video', 'Audio', 'Coding', 'Embedding'] as const;

type ActiveTab = 'playground' | 'api' | 'readme';
type ResultView = 'preview' | 'json';
type RunStatus = 'idle' | 'running' | 'complete' | 'error';

const STATUS_COLORS: Record<RunStatus, string> = {
    idle: 'bg-blue-400',
    running: 'bg-yellow-400 animate-pulse',
    complete: 'bg-green-400',
    error: 'bg-red-400',
};

const STATUS_LABELS: Record<RunStatus, string> = {
    idle: 'Idle',
    running: 'Running',
    complete: 'Complete',
    error: 'Error',
};

function getModelDescription(model: AIModel): string {
    const capStr = model.capabilities.join(', ');
    return `${model.name} is a ${model.provider} model with ${capStr} capabilities for ${capStr.includes('vision') ? 'image-to-' : ''}${capStr.includes('code') ? 'code ' : ''}${capStr.includes('text-generation') ? 'text ' : ''}generation.`;
}

interface ModelDetailClientProps {
    modelId: string;
}

export default function ModelDetailClient({ modelId }: ModelDetailClientProps) {
    const id = parseInt(modelId);

    const [activeTab, setActiveTab] = useState<ActiveTab>('playground');
    const [resultView, setResultView] = useState<ResultView>('preview');
    const [prompt, setPrompt] = useState('');
    const [negativePrompt, setNegativePrompt] = useState('');
    const [status, setStatus] = useState<RunStatus>('idle');
    const [result, setResult] = useState<string | null>(null);
    const [resultJson, setResultJson] = useState<object | null>(null);
    const [latency, setLatency] = useState<number | null>(null);
    const [tokensUsed, setTokensUsed] = useState<number | null>(null);
    const [copied, setCopied] = useState(false);

    const { data: model, isLoading, error } = useQuery({
        queryKey: ['ai-model', id],
        queryFn: () => aiRegistryService.getModelDetails(id),
    });

    const inferenceMutation = useMutation({
        mutationFn: () => aiRegistryService.multiModelInference({
            prompt,
            model_ids: [id],
            strategy: 'single',
        }),
        onMutate: () => {
            setStatus('running');
            setResult(null);
            setResultJson(null);
        },
        onSuccess: (data) => {
            setStatus('complete');
            const modelResult = data.results?.[0];
            if (modelResult) {
                setResult(modelResult.response);
                setLatency(modelResult.latency_ms);
                setTokensUsed(modelResult.tokens_used);
            }
            setResultJson(data);
        },
        onError: (err: Error) => {
            setStatus('error');
            setResult(`Error: ${err.message}`);
        },
    });

    const handleRun = () => {
        if (!prompt.trim()) return;
        inferenceMutation.mutate();
    };

    const handleReset = () => {
        setPrompt('');
        setNegativePrompt('');
        setStatus('idle');
        setResult(null);
        setResultJson(null);
        setLatency(null);
        setTokensUsed(null);
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !model) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <p className="text-lg font-semibold text-red-400">Model not found</p>
                <Link href="/dashboard/ai-settings" className="text-primary hover:underline text-sm">
                    Back to AI Models
                </Link>
            </div>
        );
    }

    const curlSnippet = `curl -X POST https://api.ainative.studio/v1/public/multi-model/inference \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Your prompt here",
    "model_ids": [${model.id}],
    "strategy": "single"
  }'`;

    const pythonSnippet = `import requests

response = requests.post(
    "https://api.ainative.studio/v1/public/multi-model/inference",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json",
    },
    json={
        "prompt": "Your prompt here",
        "model_ids": [${model.id}],
        "strategy": "single",
    },
)

print(response.json())`;

    const jsSnippet = `const response = await fetch(
  "https://api.ainative.studio/v1/public/multi-model/inference",
  {
    method: "POST",
    headers: {
      "Authorization": "Bearer YOUR_API_KEY",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: "Your prompt here",
      model_ids: [${model.id}],
      strategy: "single",
    }),
  }
);

const data = await response.json();
console.log(data);`;

    return (
        <div className="space-y-6">
            {/* Category Tabs */}
            <div className="flex items-center gap-1">
                <Link
                    href="/dashboard/ai-settings"
                    className="flex items-center gap-1 text-sm text-gray-400 hover:text-white mr-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Link>
                {CATEGORIES.map((cat) => (
                    <Link
                        key={cat}
                        href={`/dashboard/ai-settings?category=${cat}`}
                        className="px-4 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-all"
                    >
                        {cat}
                    </Link>
                ))}
            </div>

            {/* Model Header */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <h1 className="text-2xl font-bold text-white mb-1">{model.name}</h1>
                <p className="text-sm text-gray-400 max-w-3xl leading-relaxed">
                    {getModelDescription(model)}
                </p>
            </motion.div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-6 border-b border-white/10 pb-0">
                <button
                    onClick={() => setActiveTab('playground')}
                    className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'playground'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                >
                    <Zap className="w-4 h-4" />
                    Playground
                </button>
                <button
                    onClick={() => setActiveTab('api')}
                    className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'api'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                >
                    <Code className="w-4 h-4" />
                    API
                </button>
                <button
                    onClick={() => setActiveTab('readme')}
                    className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'readme'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                >
                    <FileText className="w-4 h-4" />
                    Readme
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'playground' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                    {/* Left Column - Input */}
                    <div className="space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-white">Input</h2>
                            <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
                                <FileText className="w-3.5 h-3.5" />
                                Request logs
                            </button>
                        </div>

                        {/* Prompt */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Prompt</label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Enter your prompt here..."
                                rows={5}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none transition-colors"
                            />
                        </div>

                        {/* Negative Prompt */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Negative prompt</label>
                            <input
                                type="text"
                                value={negativePrompt}
                                onChange={(e) => setNegativePrompt(e.target.value)}
                                placeholder=""
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                            />
                        </div>

                        {/* Parameters */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-300">Max Tokens</label>
                            <p className="text-xs text-gray-500">Limit the response length</p>
                            <div className="flex items-center gap-2">
                                {[256, 512, 1024, 2048].map((val) => (
                                    <button
                                        key={val}
                                        className="px-3 py-1.5 text-xs border border-white/15 rounded-md text-gray-400 hover:text-white hover:border-white/30 transition-colors"
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Additional Settings */}
                        <details className="group">
                            <summary className="flex items-center justify-between w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-300 cursor-pointer hover:bg-white/[0.07] transition-colors">
                                Additional settings
                                <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
                            </summary>
                            <div className="mt-2 p-4 bg-white/[0.02] border border-white/10 rounded-lg space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">Temperature</span>
                                    <span className="text-gray-300">0.7</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">Top P</span>
                                    <span className="text-gray-300">1.0</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">Strategy</span>
                                    <span className="text-gray-300">single</span>
                                </div>
                            </div>
                        </details>

                        {/* Pricing Info */}
                        <div className="bg-white/[0.02] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-gray-500">
                            Max {model.max_tokens.toLocaleString()} tokens per request
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleReset}
                                className="gap-1.5"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Reset
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleRun}
                                disabled={!prompt.trim() || status === 'running'}
                                className="gap-1.5"
                            >
                                <Play className="w-3.5 h-3.5" />
                                {status === 'running' ? 'Running...' : 'Run'}
                            </Button>
                        </div>
                    </div>

                    {/* Right Column - Result */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <h2 className="text-lg font-semibold text-white">Result</h2>
                                <span className="flex items-center gap-1.5 text-xs text-gray-400">
                                    <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[status]}`} />
                                    {STATUS_LABELS[status]}
                                </span>
                            </div>
                            {result && (
                                <button
                                    onClick={() => handleCopy(result)}
                                    className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    Download result
                                </button>
                            )}
                        </div>

                        {/* Preview / JSON Toggle */}
                        <div className="flex items-center gap-0 border-b border-white/10">
                            <button
                                onClick={() => setResultView('preview')}
                                className={`flex items-center gap-1.5 px-4 py-2 text-sm border-b-2 transition-colors ${
                                    resultView === 'preview'
                                        ? 'border-primary text-white'
                                        : 'border-transparent text-gray-400 hover:text-white'
                                }`}
                            >
                                <Play className="w-3 h-3" />
                                Preview
                            </button>
                            <button
                                onClick={() => setResultView('json')}
                                className={`px-4 py-2 text-sm border-b-2 transition-colors ${
                                    resultView === 'json'
                                        ? 'border-primary text-white'
                                        : 'border-transparent text-gray-400 hover:text-white'
                                }`}
                            >
                                JSON
                            </button>
                        </div>

                        {/* Result Display */}
                        <div className="min-h-[400px] bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
                            {status === 'idle' && (
                                <div className="flex items-center justify-center h-[400px] text-gray-500 text-sm">
                                    Run a prompt to see results here
                                </div>
                            )}

                            {status === 'running' && (
                                <div className="flex items-center justify-center h-[400px]">
                                    <div className="text-center space-y-3">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                        <p className="text-sm text-gray-400">Running inference...</p>
                                    </div>
                                </div>
                            )}

                            {(status === 'complete' || status === 'error') && resultView === 'preview' && (
                                <div className="p-5">
                                    {latency !== null && (
                                        <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                                            <span>Latency: {latency}ms</span>
                                            {tokensUsed !== null && <span>Tokens: {tokensUsed}</span>}
                                        </div>
                                    )}
                                    <div className={`text-sm leading-relaxed whitespace-pre-wrap ${status === 'error' ? 'text-red-400' : 'text-gray-200'}`}>
                                        {result || 'No response'}
                                    </div>
                                </div>
                            )}

                            {(status === 'complete' || status === 'error') && resultView === 'json' && (
                                <div className="p-5 relative">
                                    <button
                                        onClick={() => handleCopy(JSON.stringify(resultJson, null, 2))}
                                        className="absolute top-3 right-3 p-1.5 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
                                    >
                                        {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                                    </button>
                                    <pre className="text-xs text-gray-300 font-mono overflow-x-auto">
                                        {JSON.stringify(resultJson, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* API Tab */}
            {activeTab === 'api' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6 max-w-3xl"
                >
                    <div>
                        <h2 className="text-lg font-semibold text-white mb-1">API Reference</h2>
                        <p className="text-sm text-gray-400">
                            Use the following code snippets to integrate {model.name} into your application.
                        </p>
                    </div>

                    {/* cURL */}
                    <CodeBlock title="cURL" code={curlSnippet} onCopy={handleCopy} copied={copied} />

                    {/* Python */}
                    <CodeBlock title="Python" code={pythonSnippet} onCopy={handleCopy} copied={copied} />

                    {/* JavaScript */}
                    <CodeBlock title="JavaScript" code={jsSnippet} onCopy={handleCopy} copied={copied} />
                </motion.div>
            )}

            {/* Readme Tab */}
            {activeTab === 'readme' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="max-w-3xl space-y-6"
                >
                    <div>
                        <h2 className="text-lg font-semibold text-white mb-1">{model.name}</h2>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            {getModelDescription(model)}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoCard label="Provider" value={model.provider} />
                        <InfoCard label="Model Identifier" value={model.model_identifier} />
                        <InfoCard label="Max Tokens" value={model.max_tokens.toLocaleString()} />
                        <InfoCard label="Default Model" value={model.is_default ? 'Yes' : 'No'} />
                        <InfoCard label="Created" value={new Date(model.created_at).toLocaleDateString()} />
                        {model.usage_count !== undefined && (
                            <InfoCard label="Usage Count" value={model.usage_count.toLocaleString()} />
                        )}
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-300 mb-2">Capabilities</h3>
                        <div className="flex flex-wrap gap-2">
                            {model.capabilities.map((cap) => (
                                <span
                                    key={cap}
                                    className="px-3 py-1 text-xs border border-white/15 rounded-md text-gray-400"
                                >
                                    {cap}
                                </span>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

function CodeBlock({ title, code, onCopy, copied }: { title: string; code: string; onCopy: (text: string) => void; copied: boolean }) {
    return (
        <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
                <span className="text-sm font-medium text-gray-300">{title}</span>
                <button
                    onClick={() => onCopy(code)}
                    className="p-1 rounded hover:bg-white/10 transition-colors"
                >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                </button>
            </div>
            <pre className="p-4 text-xs text-gray-300 font-mono overflow-x-auto">
                {code}
            </pre>
        </div>
    );
}

function InfoCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-white/[0.02] border border-white/10 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-sm text-white font-medium">{value}</p>
        </div>
    );
}
