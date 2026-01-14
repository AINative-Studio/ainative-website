import { Metadata } from 'next';
import InvoiceDetailClient from './InvoiceDetailClient';

export const metadata: Metadata = {
  title: 'Invoice Details',
  description: 'View and manage invoice details and payments',
  robots: {
    index: false,
    follow: false,
  },
};

interface PageProps {
  params: {
    invoiceId: string;
  };
}

export default function InvoiceDetailPage({ params }: PageProps) {
  return <InvoiceDetailClient invoiceId={params.invoiceId} />;
}
