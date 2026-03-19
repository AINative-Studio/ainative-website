import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Vector Database for AI Applications | ZeroDB by AI Native Studio',
  description: 'ZeroDB is the serverless vector database built for AI. Store embeddings, search semantically, and build intelligent apps.',
  keywords: ['vector database', 'embedding storage', 'vector database for AI', 'serverless vector database', 'ZeroDB', 'Pinecone alternative'],
  alternates: { canonical: 'https://www.ainative.studio/use-cases/vector-database' },
};

export default function VectorDatabasePage() {
  return (
    <div className="min-h-screen bg-[#0D1117] text-white pt-32 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/use-cases" className="text-gray-500 hover:text-white text-sm mb-6 block">← All Use Cases</Link>
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Vector Database for AI</h1>
        <p className="text-xl text-gray-400 mb-8">ZeroDB isn&apos;t just a vector database — it&apos;s a complete serverless data platform with vectors, SQL, NoSQL, file storage, and events in one API.</p>
        <div className="space-y-8">
          <section><h2 className="text-2xl font-bold mb-3">Why ZeroDB?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[['Vectors + SQL', 'Store embeddings alongside structured data. No separate database.'], ['Serverless', 'No infrastructure to manage. Scale automatically.'], ['File Storage', 'S3-compatible object storage built in.'], ['Event Streaming', 'Real-time events for reactive applications.'], ['Memory API', 'Persistent AI memory with semantic retrieval.'], ['MCP Ready', 'Native MCP integration for agent workflows.']].map(([t, d]) => (
                <div key={String(t)} className="bg-[#161B22] p-4 rounded-xl border border-gray-800"><h3 className="font-bold text-sm mb-1">{t}</h3><p className="text-gray-400 text-sm">{d}</p></div>
              ))}
            </div>
          </section>
        </div>
        <div className="mt-12 text-center">
          <a href="/products/zerodb" className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 mr-4">Explore ZeroDB →</a>
          <a href="/compare/zerodb-vs-pinecone" className="inline-block px-8 py-3 border border-gray-700 text-gray-300 rounded-lg font-medium hover:border-blue-500/50">ZeroDB vs Pinecone →</a>
        </div>
      </div>
    </div>
  );
}
