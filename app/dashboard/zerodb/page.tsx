import { Metadata } from 'next';
import ZeroDBClient from './ZeroDBClient';

export const metadata: Metadata = {
  title: 'ZeroDB Dashboard | AINative Studio',
  description: 'Advanced vector database management with namespace explorer, query builder, and analytics',
};

export default function ZeroDBPage() {
  return <ZeroDBClient />;
}
