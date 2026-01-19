import { Metadata } from 'next';
import ErrorClient from './ErrorClient';

export const metadata: Metadata = {
  title: 'Authentication Error',
  description: 'An error occurred during authentication.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ErrorPage() {
  return <ErrorClient />;
}
