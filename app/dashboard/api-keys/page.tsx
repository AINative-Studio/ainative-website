import { Metadata } from 'next';
import ApiKeysClient from './ApiKeysClient';

export const metadata: Metadata = {
  title: 'API Keys | AINative Dashboard',
  description: 'Manage authentication credentials for AINative services including ZeroDB and QNN.',
};

export default function ApiKeysPage() {
  return <ApiKeysClient />;
}
