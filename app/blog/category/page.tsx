import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog Categories | AINative Studio',
  description: 'Browse blog posts by category. Tutorials, product updates, developer stories, case studies, and AI agents.',
  alternates: { canonical: 'https://www.ainative.studio/blog/category' },
};

const categories = [
  { name: 'Tutorial', slug: 'tutorial', icon: '📖', description: 'Step-by-step guides to build with AINative' },
  { name: 'Product Updates', slug: 'product-updates', icon: '🚀', description: 'Latest features and releases' },
  { name: 'Developer Stories', slug: 'developer-stories', icon: '💬', description: 'How developers build with AI Native Studio' },
  { name: 'Case Studies', slug: 'case-studies', icon: '📊', description: 'Real-world results from AINative users' },
  { name: 'AI Agents', slug: 'ai-agents', icon: '🤖', description: 'Agent architectures, patterns, and best practices' },
  { name: 'Announcements', slug: 'announcements', icon: '📣', description: 'News from the AINative team' },
];

export default function BlogCategoryIndexPage() {
  return (
    <div className="min-h-screen bg-[#0D1117] text-white pt-32 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/blog" className="text-gray-500 hover:text-white text-sm mb-6 block">← Back to Blog</Link>
        <h1 className="text-4xl font-bold mb-4 text-center">Blog Categories</h1>
        <p className="text-xl text-gray-400 text-center mb-12">Browse posts by topic</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(c => (
            <Link key={c.slug} href={`/blog/category/${c.slug}`} className="block p-6 bg-[#161B22] border border-gray-800 rounded-xl hover:border-blue-500/50 transition-colors">
              <div className="text-3xl mb-3">{c.icon}</div>
              <h2 className="text-lg font-bold mb-2">{c.name}</h2>
              <p className="text-sm text-gray-400">{c.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
