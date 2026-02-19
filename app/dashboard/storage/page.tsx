import { Metadata } from 'next';
import StorageClient from './StorageClient';

export const metadata: Metadata = {
  title: 'Storage Dashboard',
  description: 'Manage your file storage, upload and download files, view storage statistics and usage',
};

export default function StoragePage() {
  return <StorageClient />;
}
