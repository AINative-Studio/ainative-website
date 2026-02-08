'use client';

import { ReadmeProps } from '../types';

/**
 * Info card component for model metadata
 */
function InfoCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-lg p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm text-white font-medium">{value}</p>
    </div>
  );
}

/**
 * Model Readme Component
 *
 * This component displays model documentation and metadata.
 *
 * Features:
 * - Model description and overview
 * - Technical specifications
 * - Capabilities and use cases
 * - Pricing information
 * - Metadata (provider, created date, usage count)
 * - Markdown rendering (TODO)
 *
 * Future enhancements:
 * - Full markdown rendering with syntax highlighting
 * - Expandable sections (Overview, Features, Parameters, etc.)
 * - Table of contents for long documentation
 */
export default function ModelReadme({ model, slug, expandMetadata = false }: ReadmeProps) {
  return (
    <div className="max-w-3xl space-y-6">
      {/* Model Overview */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-2">Overview</h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          {model.description ||
            `${model.name} is a ${model.provider} AI model for ${model.category.toLowerCase()} tasks.`}
        </p>
      </div>

      {/* Model Metadata Grid */}
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-3">Model Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoCard label="Provider" value={model.provider} />
          <InfoCard label="Model Identifier" value={model.model_identifier} />
          <InfoCard label="Category" value={model.category} />
          <InfoCard
            label="Max Tokens"
            value={model.max_tokens?.toLocaleString() || 'N/A'}
          />
          <InfoCard label="Default Model" value={model.is_default ? 'Yes' : 'No'} />
          <InfoCard
            label="Created"
            value={new Date(model.created_at).toLocaleDateString()}
          />
          {model.usage_count !== undefined && (
            <InfoCard label="Usage Count" value={model.usage_count.toLocaleString()} />
          )}
          {model.speed && <InfoCard label="Speed" value={model.speed} />}
          {model.quality && <InfoCard label="Quality" value={model.quality} />}
          {model.is_premium && <InfoCard label="Tier" value="Premium" />}
        </div>
      </div>

      {/* Capabilities */}
      {model.capabilities && model.capabilities.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">Capabilities</h3>
          <div className="flex flex-wrap gap-2">
            {model.capabilities.map((capability) => (
              <span
                key={capability}
                className="px-3 py-1 text-xs border border-white/15 rounded-md text-gray-400 bg-white/5"
              >
                {capability}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Pricing Information */}
      {model.pricing && (
        <div className="bg-white/[0.02] border border-white/10 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-medium text-white">Pricing</h3>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-gray-500">Credits</p>
              <p className="text-lg font-semibold text-white">
                {model.pricing.credits.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Cost (USD)</p>
              <p className="text-lg font-semibold text-white">
                ${model.pricing.usd.toFixed(4)}
              </p>
            </div>
            {model.pricing.unit && (
              <div>
                <p className="text-xs text-gray-500">Unit</p>
                <p className="text-sm text-gray-300">{model.pricing.unit}</p>
              </div>
            )}
          </div>

          {/* Pricing Tiers (for variable cost models) */}
          {model.pricing.tiers && model.pricing.tiers.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">Variable Pricing</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {model.pricing.tiers.map((tier, index) => (
                  <div
                    key={index}
                    className="bg-white/5 border border-white/10 rounded px-3 py-2"
                  >
                    <p className="text-xs text-gray-500">{tier.label}</p>
                    <p className="text-sm font-medium text-white">
                      ${tier.usd.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Parameters (if available) */}
      {model.parameters && model.parameters.length > 0 && (
        <div className="bg-white/[0.02] border border-white/10 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-medium text-white">Parameters</h3>
          <div className="space-y-3">
            {model.parameters.map((param, index) => (
              <div
                key={index}
                className="border-l-2 border-primary/30 pl-3 py-1 space-y-1"
              >
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono text-primary">{param.name}</code>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      param.required
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {param.required ? 'required' : 'optional'}
                  </span>
                  <span className="text-xs text-gray-500">{param.type}</span>
                </div>
                <p className="text-xs text-gray-400">{param.description}</p>
                {param.default !== undefined && (
                  <p className="text-xs text-gray-500">
                    Default: <code className="text-gray-400">{String(param.default)}</code>
                  </p>
                )}
                {(param.min !== undefined || param.max !== undefined) && (
                  <p className="text-xs text-gray-500">
                    Range: {param.min ?? '∞'} - {param.max ?? '∞'}
                  </p>
                )}
                {param.options && param.options.length > 0 && (
                  <p className="text-xs text-gray-500">
                    Options:{' '}
                    <code className="text-gray-400">
                      {param.options.map(String).join(', ')}
                    </code>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom README Content (Markdown) */}
      {model.readme && (
        <div className="bg-white/[0.02] border border-white/10 rounded-lg p-5 space-y-4">
          <h3 className="text-sm font-medium text-white">Documentation</h3>
          {/* TODO: Render markdown with proper syntax highlighting */}
          <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed">
            <pre className="whitespace-pre-wrap text-xs">{model.readme}</pre>
          </div>
        </div>
      )}

      {/* Use Cases */}
      <div className="bg-white/[0.02] border border-white/10 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-medium text-white">Common Use Cases</h3>
        <ul className="text-sm text-gray-400 space-y-2 list-disc list-inside">
          {/* TODO: Generate use cases based on model category and capabilities */}
          {model.category === 'Image' && (
            <>
              <li>Generate high-quality images from text descriptions</li>
              <li>Create artwork and illustrations</li>
              <li>Product visualization and mockups</li>
            </>
          )}
          {model.category === 'Video' && (
            <>
              <li>Animate static images with motion</li>
              <li>Generate video content from text prompts</li>
              <li>Create cinematic sequences</li>
            </>
          )}
          {model.category === 'Audio' && (
            <>
              <li>Transcribe audio and video files</li>
              <li>Translate speech to English</li>
              <li>Generate natural-sounding speech from text</li>
            </>
          )}
          {model.category === 'Coding' && (
            <>
              <li>Code generation and completion</li>
              <li>Bug fixing and code review</li>
              <li>Technical documentation</li>
            </>
          )}
          {model.category === 'Embedding' && (
            <>
              <li>Semantic search and similarity matching</li>
              <li>Document clustering and classification</li>
              <li>Recommendation systems</li>
            </>
          )}
        </ul>
      </div>

      {/* Best Practices */}
      <div className="bg-white/[0.02] border border-white/10 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-medium text-white">Best Practices</h3>
        <ul className="text-sm text-gray-400 space-y-2 list-disc list-inside">
          <li>Start with default parameters and adjust based on results</li>
          <li>Use negative prompts to avoid unwanted elements (image/video models)</li>
          <li>Monitor token usage and costs in the usage dashboard</li>
          <li>Cache results when appropriate to reduce API calls</li>
          <li>Review output quality before using in production</li>
        </ul>
      </div>

      {/* Additional Resources */}
      <div className="bg-white/[0.02] border border-white/10 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-medium text-white">Resources</h3>
        <div className="space-y-2">
          <a
            href="https://docs.ainative.studio/models"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-primary hover:underline"
          >
            Model Documentation →
          </a>
          <a
            href="https://docs.ainative.studio/api"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-primary hover:underline"
          >
            API Reference →
          </a>
          <a
            href="/dashboard/usage"
            className="block text-sm text-primary hover:underline"
          >
            View Usage & Billing →
          </a>
        </div>
      </div>
    </div>
  );
}
