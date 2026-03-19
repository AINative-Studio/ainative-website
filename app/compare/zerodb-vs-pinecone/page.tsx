import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'ZeroDB vs Pinecone: Vector Database Comparison 2026',
  description: 'Compare ZeroDB and Pinecone. Serverless vector database with SQL, NoSQL, file storage, and events vs vector-only SaaS.',
  keywords: ['Pinecone alternative', 'vector database comparison', 'best vector database 2026', 'ZeroDB vs Pinecone', 'serverless vector database'],
  openGraph: { title: 'ZeroDB vs Pinecone: Vector Database Comparison', type: 'article' },
  alternates: { canonical: 'https://www.ainative.studio/compare/zerodb-vs-pinecone' },
};

const features = [
  ['Vector Search', true, true],
  ['Serverless', true, true],
  ['Free Tier', true, true],
  ['SQL Tables', true, false],
  ['NoSQL Documents', true, false],
  ['File Storage (S3-compatible)', true, false],
  ['Event Streaming', true, false],
  ['Memory API', true, false],
  ['MCP Integration', true, false],
  ['Dedicated PostgreSQL', true, false],
  ['Multi-dimension Vectors', true, true],
  ['Hybrid Search', true, true],
];

export default function PineconeComparison() {
  return (
    <div className="min-h-screen bg-[#0D1117] text-white pt-32 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/compare" className="text-gray-500 hover:text-white text-sm mb-6 block">← All Comparisons</Link>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">ZeroDB vs Pinecone</h1>
        <p className="text-xl text-gray-400 mb-12">A complete serverless database vs a vector-only service</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead><tr className="border-b border-gray-800"><th className="text-left py-4 px-4 text-gray-400">Feature</th><th className="py-4 px-4 text-center text-blue-400 font-bold">ZeroDB</th><th className="py-4 px-4 text-center text-gray-400">Pinecone</th></tr></thead>
            <tbody>
              {features.map(([name, zdb, pine]) => (
                <tr key={String(name)} className="border-b border-gray-800/50">
                  <td className="py-3 px-4 text-gray-300">{String(name)}</td>
                  <td className="py-3 px-4 text-center">{zdb ? <span className="text-green-400">✓</span> : <span className="text-gray-600">✗</span>}</td>
                  <td className="py-3 px-4 text-center">{pine ? <span className="text-green-400">✓</span> : <span className="text-gray-600">✗</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Why choose between vector search and a real database?</h2>
          <a href="/products/zerodb" className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Explore ZeroDB →</a>
        </div>
      </div>
    </div>
  );
}
