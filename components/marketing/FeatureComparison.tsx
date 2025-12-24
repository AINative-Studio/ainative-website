'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

// Comparison data against competitors
const comparisonData = {
  features: [
    { name: 'AI Code Completion', category: 'Core' },
    { name: 'Codebase Understanding', category: 'Core' },
    { name: 'Multi-file Context', category: 'Core' },
    { name: 'Natural Language Coding', category: 'Core' },
    { name: 'Multi-Agent Development', category: 'Advanced' },
    { name: 'Quantum Acceleration', category: 'Advanced' },
    { name: 'Vector Database (ZeroDB)', category: 'Platform' },
    { name: 'AI Kit NPM Packages', category: 'Platform' },
    { name: 'Custom Agent Creation', category: 'Platform' },
    { name: 'Free Tier Available', category: 'Pricing' },
    { name: 'On-Premise Deployment', category: 'Enterprise' },
    { name: 'SOC2 Compliance', category: 'Enterprise' },
  ],
  competitors: [
    {
      name: 'AI Native Studio',
      highlight: true,
      features: {
        'AI Code Completion': true,
        'Codebase Understanding': true,
        'Multi-file Context': true,
        'Natural Language Coding': true,
        'Multi-Agent Development': true,
        'Quantum Acceleration': true,
        'Vector Database (ZeroDB)': true,
        'AI Kit NPM Packages': true,
        'Custom Agent Creation': true,
        'Free Tier Available': true,
        'On-Premise Deployment': true,
        'SOC2 Compliance': true,
      },
    },
    {
      name: 'Cursor',
      features: {
        'AI Code Completion': true,
        'Codebase Understanding': true,
        'Multi-file Context': true,
        'Natural Language Coding': true,
        'Multi-Agent Development': false,
        'Quantum Acceleration': false,
        'Vector Database (ZeroDB)': false,
        'AI Kit NPM Packages': false,
        'Custom Agent Creation': false,
        'Free Tier Available': 'limited',
        'On-Premise Deployment': false,
        'SOC2 Compliance': true,
      },
    },
    {
      name: 'GitHub Copilot',
      features: {
        'AI Code Completion': true,
        'Codebase Understanding': 'partial',
        'Multi-file Context': 'partial',
        'Natural Language Coding': true,
        'Multi-Agent Development': false,
        'Quantum Acceleration': false,
        'Vector Database (ZeroDB)': false,
        'AI Kit NPM Packages': false,
        'Custom Agent Creation': false,
        'Free Tier Available': false,
        'On-Premise Deployment': true,
        'SOC2 Compliance': true,
      },
    },
    {
      name: 'Windsurf',
      features: {
        'AI Code Completion': true,
        'Codebase Understanding': true,
        'Multi-file Context': true,
        'Natural Language Coding': true,
        'Multi-Agent Development': 'partial',
        'Quantum Acceleration': false,
        'Vector Database (ZeroDB)': false,
        'AI Kit NPM Packages': false,
        'Custom Agent Creation': 'partial',
        'Free Tier Available': true,
        'On-Premise Deployment': false,
        'SOC2 Compliance': false,
      },
    },
  ],
};

const categoryColors: Record<string, string> = {
  Core: 'bg-blue-500/20 text-blue-400',
  Advanced: 'bg-purple-500/20 text-purple-400',
  Platform: 'bg-green-500/20 text-green-400',
  Pricing: 'bg-yellow-500/20 text-yellow-400',
  Enterprise: 'bg-red-500/20 text-red-400',
};

interface FeatureComparisonProps {
  className?: string;
  showAll?: boolean;
}

export default function FeatureComparison({ className = '', showAll = false }: FeatureComparisonProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...new Set(comparisonData.features.map((f) => f.category))];
  const filteredFeatures =
    selectedCategory === 'all'
      ? comparisonData.features
      : comparisonData.features.filter((f) => f.category === selectedCategory);

  const renderFeatureValue = (value: boolean | string | undefined) => {
    if (value === true) {
      return <span className="text-green-400 text-xl">✓</span>;
    }
    if (value === false) {
      return <span className="text-gray-600 text-xl">✕</span>;
    }
    if (value === 'partial' || value === 'limited') {
      return <span className="text-yellow-400 text-sm">Partial</span>;
    }
    return <span className="text-gray-600">—</span>;
  };

  return (
    <section className={`py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How We Compare
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            See how AI Native Studio stacks up against other AI coding tools
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {category === 'all' ? 'All Features' : category}
            </button>
          ))}
        </div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="overflow-x-auto"
        >
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-4 px-4 text-gray-400 font-medium">Feature</th>
                {comparisonData.competitors.map((competitor) => (
                  <th
                    key={competitor.name}
                    className={`text-center py-4 px-4 font-semibold ${
                      competitor.highlight
                        ? 'text-purple-400 bg-purple-500/10 rounded-t-lg'
                        : 'text-gray-300'
                    }`}
                  >
                    {competitor.name}
                    {competitor.highlight && (
                      <span className="block text-xs text-purple-300 mt-1">Recommended</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredFeatures.map((feature, index) => (
                <motion.tr
                  key={feature.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <span className="text-white">{feature.name}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          categoryColors[feature.category] || 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {feature.category}
                      </span>
                    </div>
                  </td>
                  {comparisonData.competitors.map((competitor) => (
                    <td
                      key={competitor.name}
                      className={`text-center py-4 px-4 ${
                        competitor.highlight ? 'bg-purple-500/5' : ''
                      }`}
                    >
                      {renderFeatureValue(
                        competitor.features[feature.name as keyof typeof competitor.features]
                      )}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-gray-400 mb-4">
            Ready to experience the difference?
          </p>
          <a
            href="/download"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Try AI Native Studio Free
            <span>→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// Simple feature highlight for marketing pages
export function FeatureHighlight({
  title,
  description,
  icon,
  competitors,
}: {
  title: string;
  description: string;
  icon: string;
  competitors?: string[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 mb-4">{description}</p>
      {competitors && (
        <p className="text-sm text-purple-400">
          Unlike {competitors.join(', ')}, we offer this feature.
        </p>
      )}
    </motion.div>
  );
}
