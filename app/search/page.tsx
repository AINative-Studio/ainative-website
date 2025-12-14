import { Metadata } from 'next';
import SearchClient from './SearchClient';

export const metadata: Metadata = {
  title: 'Search | AINative Studio',
  description: 'Semantic search across all community content - find blog posts, tutorials, showcases, and resources powered by AI.',
  openGraph: {
    title: 'AINative Search',
    description: 'Semantic search across all community content',
    type: 'website',
  },
};

export default function SearchPage() {
  return <SearchClient />;
}
