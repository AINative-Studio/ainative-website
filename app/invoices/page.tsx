import { Metadata } from 'next';
import InvoicesClient from './InvoicesClient';

export const metadata: Metadata = {
  title: 'Invoices | AINative Studio',
  description: 'Manage and track all your invoices. View, create, and organize billing documents.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function InvoicesPage() {
  return <InvoicesClient />;
}
