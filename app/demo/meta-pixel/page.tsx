import type { Metadata } from 'next';
import MetaPixelDemo from './MetaPixelDemo';

export const metadata: Metadata = {
  title: 'Meta Pixel Demo',
  description: 'Test and verify Meta Pixel conversion tracking events',
  robots: {
    index: false,
    follow: false,
  },
};

export default function MetaPixelDemoPage() {
  return <MetaPixelDemo />;
}
