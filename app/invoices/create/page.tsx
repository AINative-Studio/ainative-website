import { Metadata } from 'next';
import CreateInvoiceClient from './CreateInvoiceClient';

export const metadata: Metadata = {
  title: 'Create Invoice',
  description: 'Create a new invoice and send it to your customer',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CreateInvoicePage() {
  return <CreateInvoiceClient />;
}
