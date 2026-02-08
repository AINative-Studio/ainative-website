'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Copy, Check, Download, Key } from 'lucide-react';
import { APIProps, APICodeFormat } from '../types';

/**
 * Generate curl command for model
 */
function generateCurlCommand(
  endpoint: string,
  method: string,
  modelSlug: string,
  modelName: string
): string {
  // TODO: Generate actual curl command based on model parameters
  // This should include:
  // - Correct endpoint URL
  // - Required headers (Authorization, Content-Type)
  // - Example request body with model-specific parameters

  return `curl -X ${method} https://api.ainative.studio${endpoint} \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -d '{
    "prompt": "Your prompt here",
    "max_tokens": 2048,
    "temperature": 0.7
  }'`;
}

/**
 * Generate POST /run format for model
 */
function generatePostRunFormat(
  endpoint: string,
  method: string,
  modelSlug: string,
  modelName: string
): string {
  // TODO: Generate actual POST format based on model parameters

  return `${method} ${endpoint}
Host: api.ainative.studio
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "prompt": "Your prompt here",
  "max_tokens": 2048,
  "temperature": 0.7
}`;
}

/**
 * Model API Component
 *
 * This component displays API integration code for the model.
 *
 * Features:
 * - Code snippet generation (curl, POST format)
 * - Copy to clipboard functionality
 * - Create API Key button (links to API keys page)
 * - Syntax highlighting (TODO)
 * - Download code snippet
 *
 * The code snippets are generated dynamically based on the model's
 * endpoint, method, and parameters.
 */
export default function ModelAPI({ model, slug, defaultFormat = 'curl' }: APIProps) {
  const [codeFormat, setCodeFormat] = useState<APICodeFormat>(defaultFormat);
  const [copied, setCopied] = useState(false);

  /**
   * Copy text to clipboard
   */
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate code snippets
  const curlSnippet = generateCurlCommand(
    model.endpoint || `/v1/models/${slug}`,
    model.method || 'POST',
    slug,
    model.name
  );

  const postRunSnippet = generatePostRunFormat(
    model.endpoint || `/v1/models/${slug}`,
    model.method || 'POST',
    slug,
    model.name
  );

  // Get current code snippet
  const currentSnippet = codeFormat === 'curl' ? curlSnippet : postRunSnippet;

  return (
    <div className="space-y-5">
      {/* Top Bar: Create API Key + Code Format Toggle */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Create API Key Button */}
        <Link
          href="/dashboard/api-keys"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a1730] hover:bg-[#252040] text-white text-sm font-medium rounded-lg border border-white/10 transition-colors"
        >
          <Key className="w-4 h-4" />
          Create an API Key
        </Link>

        {/* Code Format Toggle */}
        <div className="flex items-center gap-0">
          <button
            onClick={() => setCodeFormat('curl')}
            className={`px-6 py-2.5 text-sm font-medium rounded-l-lg transition-colors ${
              codeFormat === 'curl'
                ? 'bg-[#1a1730] text-white border border-white/10'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'
            }`}
          >
            Curl
          </button>
          <button
            onClick={() => setCodeFormat('postrun')}
            className={`px-6 py-2.5 text-sm font-medium rounded-r-lg transition-colors ${
              codeFormat === 'postrun'
                ? 'bg-[#1a1730] text-white border border-white/10'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'
            }`}
          >
            Post /Run
          </button>
        </div>
      </div>

      {/* Download Link */}
      <div className="flex justify-end">
        <button
          onClick={() => handleCopy(currentSnippet)}
          className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
        >
          <Download className="w-3.5 h-3.5" />
          Download {codeFormat === 'curl' ? 'curl' : 'request'}
        </button>
      </div>

      {/* Code Display */}
      <div className="relative bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
        {/* Code Label */}
        <span className="absolute top-4 right-5 text-xs text-gray-500 font-medium uppercase tracking-wider select-none">
          {codeFormat === 'curl' ? 'CURL' : 'POST'}
        </span>

        {/* Code Content */}
        <div className="p-6 pr-20 overflow-x-auto">
          <pre className="text-sm text-gray-200 font-mono whitespace-pre-wrap break-all leading-relaxed">
            {currentSnippet}
          </pre>
        </div>

        {/* Copy Button Overlay */}
        <button
          onClick={() => handleCopy(currentSnippet)}
          className="absolute top-4 right-16 p-1.5 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {/* Progress Bar at Bottom */}
        <div className="h-2 bg-[#1a1730] w-full rounded-b-xl" />
      </div>

      {/* Additional Information */}
      <div className="bg-white/[0.02] border border-white/10 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-medium text-white">API Endpoint</h3>
        <code className="block text-xs text-gray-400 font-mono bg-white/5 px-3 py-2 rounded">
          {model.endpoint || `/v1/models/${slug}`}
        </code>

        <h3 className="text-sm font-medium text-white mt-4">Authentication</h3>
        <p className="text-xs text-gray-400 leading-relaxed">
          All API requests require authentication using an API key. Include your API key in the{' '}
          <code className="bg-white/5 px-1.5 py-0.5 rounded">Authorization</code> header:
        </p>
        <code className="block text-xs text-gray-400 font-mono bg-white/5 px-3 py-2 rounded">
          Authorization: Bearer YOUR_API_KEY
        </code>

        <div className="pt-2">
          <Link
            href="/dashboard/api-keys"
            className="text-xs text-primary hover:underline"
          >
            Manage API Keys →
          </Link>
        </div>
      </div>

      {/* Example Response */}
      {model.example_response && (
        <div className="bg-white/[0.02] border border-white/10 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-medium text-white">Example Response</h3>
          <pre className="text-xs text-gray-400 font-mono bg-white/5 p-3 rounded overflow-x-auto">
            {model.example_response}
          </pre>
        </div>
      )}

      {/* Rate Limits & Best Practices */}
      <div className="bg-white/[0.02] border border-white/10 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-medium text-white">Best Practices</h3>
        <ul className="text-xs text-gray-400 space-y-2 list-disc list-inside">
          <li>Always handle errors and implement retry logic</li>
          <li>Use exponential backoff for rate limit errors</li>
          <li>Cache responses when appropriate to reduce costs</li>
          <li>Monitor your usage and set up billing alerts</li>
          <li>Never expose your API key in client-side code</li>
        </ul>

        <div className="pt-2">
          <a
            href="https://docs.ainative.studio/api/best-practices"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline"
          >
            View API Documentation →
          </a>
        </div>
      </div>
    </div>
  );
}
