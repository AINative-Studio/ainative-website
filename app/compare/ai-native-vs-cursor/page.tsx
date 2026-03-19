import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AI Native Studio vs Cursor: Complete Comparison 2026 | Best AI IDE',
  description: 'Compare AI Native Studio and Cursor side-by-side. Multi-agent AI, ZeroDB, MCP hosting, and Agent Swarm vs single-agent editing.',
  keywords: ['Cursor alternative', 'AI IDE comparison', 'best AI code editor 2026', 'Cursor vs AINative', 'AI Native Studio features'],
  openGraph: { title: 'AI Native Studio vs Cursor: Complete Comparison', type: 'article' },
  alternates: { canonical: 'https://www.ainative.studio/compare/ai-native-vs-cursor' },
};

const features = [
  ['Multi-Agent AI (Agent Swarm)', true, false],
  ['ZeroDB Vector Database', true, false],
  ['MCP Server Hosting', true, false],
  ['Quantum Neural Networks', true, false],
  ['AI Kit NPM Packages (14+)', true, false],
  ['Built-in Memory System', true, false],
  ['OpenClaw Strategy Support', true, false],
  ['Code Completion', true, true],
  ['Chat with Codebase', true, true],
  ['Multi-Model Support', true, true],
  ['Free Tier', true, true],
  ['VS Code Compatible', true, true],
];

export default function CursorComparison() {
  return (
    <div className="min-h-screen bg-[#0D1117] text-white pt-32 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/compare" className="text-gray-500 hover:text-white text-sm mb-6 block">← All Comparisons</Link>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">AI Native Studio vs Cursor</h1>
        <p className="text-xl text-gray-400 mb-12">The complete AI development platform vs a code editor with AI</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-4 px-4 text-gray-400 font-medium">Feature</th>
                <th className="py-4 px-4 text-center text-blue-400 font-bold">AI Native Studio</th>
                <th className="py-4 px-4 text-center text-gray-400 font-medium">Cursor</th>
              </tr>
            </thead>
            <tbody>
              {features.map(([name, ain, cursor]) => (
                <tr key={String(name)} className="border-b border-gray-800/50">
                  <td className="py-3 px-4 text-gray-300">{String(name)}</td>
                  <td className="py-3 px-4 text-center">{ain ? <span className="text-green-400">✓</span> : <span className="text-gray-600">✗</span>}</td>
                  <td className="py-3 px-4 text-center">{cursor ? <span className="text-green-400">✓</span> : <span className="text-gray-600">✗</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to go beyond code editing?</h2>
          <p className="text-gray-400 mb-6">AI Native Studio is a complete AI development platform — not just an editor.</p>
          <a href="/signup" className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Try AI Native Studio Free →</a>
        </div>
      </div>
    </div>
  );
}
