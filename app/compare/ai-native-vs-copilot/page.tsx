import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AI Native Studio vs GitHub Copilot: AI Coding Tools Compared 2026',
  description: 'Compare AI Native Studio and GitHub Copilot. Full AI platform with Agent Swarm, ZeroDB, MCP vs inline code suggestions.',
  keywords: ['GitHub Copilot alternative', 'AI coding assistant comparison', 'best AI coding tool 2026', 'Copilot vs AINative'],
  openGraph: { title: 'AI Native Studio vs GitHub Copilot: AI Coding Compared', type: 'article' },
  alternates: { canonical: 'https://www.ainative.studio/compare/ai-native-vs-copilot' },
};

const features = [
  ['Agent Swarm (Multi-Agent)', true, false],
  ['ZeroDB Vector Database', true, false],
  ['MCP Server Hosting', true, false],
  ['AI Kit (14 NPM packages)', true, false],
  ['OpenClaw Strategy', true, false],
  ['Multi-Model (GPT, Claude, Gemini, Llama, Mistral)', true, false],
  ['Code Completion', true, true],
  ['Chat with Code', true, true],
  ['PR Review', true, true],
  ['Free Tier', true, false],
  ['Enterprise SSO', true, true],
];

export default function CopilotComparison() {
  return (
    <div className="min-h-screen bg-[#0D1117] text-white pt-32 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/compare" className="text-gray-500 hover:text-white text-sm mb-6 block">← All Comparisons</Link>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">AI Native Studio vs GitHub Copilot</h1>
        <p className="text-xl text-gray-400 mb-12">A complete AI development platform vs an autocomplete assistant</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead><tr className="border-b border-gray-800"><th className="text-left py-4 px-4 text-gray-400">Feature</th><th className="py-4 px-4 text-center text-blue-400 font-bold">AI Native Studio</th><th className="py-4 px-4 text-center text-gray-400">GitHub Copilot</th></tr></thead>
            <tbody>
              {features.map(([name, ain, cop]) => (
                <tr key={String(name)} className="border-b border-gray-800/50">
                  <td className="py-3 px-4 text-gray-300">{String(name)}</td>
                  <td className="py-3 px-4 text-center">{ain ? <span className="text-green-400">✓</span> : <span className="text-gray-600">✗</span>}</td>
                  <td className="py-3 px-4 text-center">{cop ? <span className="text-green-400">✓</span> : <span className="text-gray-600">✗</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-12 text-center">
          <a href="/signup" className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Switch to AI Native Studio →</a>
        </div>
      </div>
    </div>
  );
}
