import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Build Semantic Search with ZeroDB | AI Native Studio',
  description: 'Build intelligent semantic search that understands meaning. ZeroDB makes vector search simple with a serverless API.',
  keywords: ['semantic search', 'vector search', 'embedding search', 'similarity search', 'ZeroDB semantic search', 'AI search'],
  alternates: { canonical: 'https://www.ainative.studio/use-cases/semantic-search' },
};

export default function SemanticSearchPage() {
  return (
    <div className="min-h-screen bg-[#0D1117] text-white pt-32 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/use-cases" className="text-gray-500 hover:text-white text-sm mb-6 block">← All Use Cases</Link>
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Build Semantic Search with ZeroDB</h1>
        <p className="text-xl text-gray-400 mb-8">Go beyond keyword matching. Build search that understands context, intent, and meaning — in minutes, not months.</p>
        <div className="space-y-8">
          <section><h2 className="text-2xl font-bold mb-3">What is Semantic Search?</h2><p className="text-gray-300">Traditional search matches keywords. Semantic search matches meaning. Users search for &quot;how to deploy AI agents&quot; and find content about &quot;agentic workflow deployment&quot; — even without exact keyword overlap. Powered by vector embeddings and similarity search.</p></section>
          <section><h2 className="text-2xl font-bold mb-3">How ZeroDB Makes It Easy</h2><p className="text-gray-300 mb-4">ZeroDB is a serverless vector database that handles embedding storage, similarity search, and hybrid queries — all through a simple REST API.</p>
            <div className="bg-[#161B22] rounded-xl p-6 border border-gray-800 font-mono text-sm text-gray-300">
              <p className="text-gray-500"># Store an embedding</p>
              <p>POST /api/v1/projects/&#123;id&#125;/database/vectors/upsert</p>
              <p className="mt-3 text-gray-500"># Search by similarity</p>
              <p>POST /api/v1/projects/&#123;id&#125;/database/vectors/search</p>
            </div>
          </section>
        </div>
        <div className="mt-12 text-center">
          <a href="/products/zerodb" className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Explore ZeroDB →</a>
        </div>
      </div>
    </div>
  );
}
