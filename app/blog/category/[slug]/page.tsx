import { Metadata } from 'next';
import Link from 'next/link';

interface Props { params: Promise<{ slug: string }> }

const CATEGORIES: Record<string, string> = {
  'tutorial': 'Tutorial',
  'product-updates': 'Product Updates',
  'developer-stories': 'Developer Stories',
  'case-studies': 'Case Studies',
  'ai-agents': 'AI Agents',
  'announcements': 'Announcements',
};

export async function generateStaticParams() {
  return Object.keys(CATEGORIES).map(slug => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const name = CATEGORIES[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return {
    title: `${name} | AINative Blog`,
    description: `Browse all ${name} articles on the AINative Blog.`,
    alternates: { canonical: `https://www.ainative.studio/blog/category/${slug}` },
  };
}

export default async function BlogCategoryPage({ params }: Props) {
  const { slug } = await params;
  const name = CATEGORIES[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="min-h-screen bg-[#0D1117] text-white pt-32 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <Link href="/blog/category" className="text-gray-500 hover:text-white text-sm mb-6 block">← All Categories</Link>
        <h1 className="text-4xl font-bold mb-4">{name}</h1>
        <p className="text-xl text-gray-400 mb-8">Browse all {name} articles</p>
        <p className="text-gray-500">Blog posts filtered by category will appear here. <Link href="/blog" className="text-blue-400 hover:underline">Browse all posts →</Link></p>
      </div>
    </div>
  );
}
