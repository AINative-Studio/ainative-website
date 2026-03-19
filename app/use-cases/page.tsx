import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AI Use Cases | AI Native Studio',
  description: 'Discover how to build semantic search, RAG applications, agent orchestration, and vector databases with AINative.',
  keywords: ['AI use cases', 'semantic search', 'RAG applications', 'agent orchestration', 'vector database'],
  alternates: { canonical: 'https://www.ainative.studio/use-cases' },
};

const useCases = [
  { title: 'Semantic Search', slug: 'semantic-search', description: 'Build intelligent search that understands meaning, not just keywords. Powered by ZeroDB vectors.', icon: '🔍' },
  { title: 'RAG Applications', slug: 'rag-applications', description: 'Retrieval-Augmented Generation for accurate, grounded AI responses using your own data.', icon: '🧠' },
  { title: 'Agent Orchestration', slug: 'agent-orchestration', description: 'Deploy multi-agent systems that take real-world actions. Your OpenClaw strategy starts here.', icon: '🤖' },
  { title: 'Vector Database', slug: 'vector-database', description: 'Store and search embeddings at scale. ZeroDB is the serverless vector database built for AI.', icon: '📊' },
];

export default function UseCasesPage() {
  return (
    <div className="min-h-screen bg-[#0D1117] text-white pt-32 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-4">AI Use Cases</h1>
        <p className="text-xl text-gray-400 mb-12">Build production AI applications with AINative</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {useCases.map(uc => (
            <Link key={uc.slug} href={`/use-cases/${uc.slug}`} className="block p-8 bg-[#161B22] border border-gray-800 rounded-xl hover:border-blue-500/50 transition-colors text-left">
              <div className="text-3xl mb-3">{uc.icon}</div>
              <h2 className="text-xl font-bold mb-2">{uc.title}</h2>
              <p className="text-gray-400">{uc.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
