import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Compare AI Development Tools | AI Native Studio',
  description: 'See how AI Native Studio compares to Cursor, GitHub Copilot, and Pinecone. Feature-by-feature comparisons.',
  keywords: ['Cursor alternative', 'Copilot alternative', 'Pinecone alternative', 'AI IDE comparison'],
  alternates: { canonical: 'https://www.ainative.studio/compare' },
};

const comparisons = [
  { title: 'AI Native Studio vs Cursor', slug: 'ai-native-vs-cursor', description: 'Multi-agent AI, ZeroDB, MCP hosting vs single-agent code editing' },
  { title: 'ZeroDB vs Pinecone', slug: 'zerodb-vs-pinecone', description: 'Serverless vector database with SQL, NoSQL, files, events vs vector-only' },
  { title: 'AI Native Studio vs GitHub Copilot', slug: 'ai-native-vs-copilot', description: 'Full AI platform with Agent Swarm vs inline code suggestions' },
];

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-[#0D1117] text-white pt-32 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-4 text-center">Compare AI Tools</h1>
        <p className="text-xl text-gray-400 text-center mb-12">See how AINative stacks up against alternatives</p>
        <div className="grid gap-6">
          {comparisons.map(c => (
            <Link key={c.slug} href={`/compare/${c.slug}`} className="block p-6 bg-[#161B22] border border-gray-800 rounded-xl hover:border-blue-500/50 transition-colors">
              <h2 className="text-xl font-bold mb-2">{c.title}</h2>
              <p className="text-gray-400">{c.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
