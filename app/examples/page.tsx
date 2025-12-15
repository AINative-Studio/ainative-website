import { Metadata } from 'next';
import ExamplesClient from './ExamplesClient';

export const metadata: Metadata = {
  title: 'Code Examples Gallery | AINative Studio',
  description: 'Explore production-ready code examples and learn how to build amazing AI applications with AINative. Beginner to advanced tutorials with live demos.',
  openGraph: {
    title: 'AINative Code Examples Gallery',
    description: 'Production-ready code examples for building AI applications',
    type: 'website',
  },
};

export default function ExamplesPage() {
  return <ExamplesClient />;
}
