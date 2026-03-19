import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Build RAG Applications with ZeroDB & AI Kit | AI Native Studio',
  description: 'Build Retrieval-Augmented Generation apps with ZeroDB for vectors and AI Kit for LLM integration. Ship RAG in days.',
  keywords: ['RAG tutorial', 'retrieval augmented generation', 'build RAG app', 'RAG with vector database', 'ZeroDB RAG', 'AI Kit RAG'],
  alternates: { canonical: 'https://www.ainative.studio/use-cases/rag-applications' },
};

export default function RAGPage() {
  return (
    <div className="min-h-screen bg-[#0D1117] text-white pt-32 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/use-cases" className="text-gray-500 hover:text-white text-sm mb-6 block">← All Use Cases</Link>
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Build RAG Applications</h1>
        <p className="text-xl text-gray-400 mb-8">Retrieval-Augmented Generation gives your AI access to your data. Build accurate, grounded chatbots and search systems.</p>
        <div className="space-y-8">
          <section><h2 className="text-2xl font-bold mb-3">The RAG Stack</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#161B22] p-6 rounded-xl border border-gray-800"><h3 className="font-bold text-blue-400 mb-2">1. Embed</h3><p className="text-gray-400 text-sm">Convert documents to vectors with AI Kit embedding models</p></div>
              <div className="bg-[#161B22] p-6 rounded-xl border border-gray-800"><h3 className="font-bold text-blue-400 mb-2">2. Store</h3><p className="text-gray-400 text-sm">Store vectors in ZeroDB with metadata and full-text search</p></div>
              <div className="bg-[#161B22] p-6 rounded-xl border border-gray-800"><h3 className="font-bold text-blue-400 mb-2">3. Retrieve</h3><p className="text-gray-400 text-sm">Query semantically, inject context, generate grounded answers</p></div>
            </div>
          </section>
        </div>
        <div className="mt-12 text-center">
          <a href="/products/zerodb" className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 mr-4">ZeroDB Vectors →</a>
          <a href="/ai-kit" className="inline-block px-8 py-3 border border-gray-700 text-gray-300 rounded-lg font-medium hover:border-blue-500/50">AI Kit Embeddings →</a>
        </div>
      </div>
    </div>
  );
}
