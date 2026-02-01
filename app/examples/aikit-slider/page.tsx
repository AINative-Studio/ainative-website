import { Metadata } from 'next';
import { DeveloperMarkupSettings } from '@/src/components/examples/DeveloperMarkupSettings';

export const metadata: Metadata = {
  title: 'AIKit Slider Example',
  description: 'Real-world integration example of AIKitSlider component for developer markup settings',
};

export default function AIKitSliderExamplePage() {
  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4">
      <div className="container mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">AIKit Slider Integration</h1>
          <p className="text-gray-400 text-lg">
            Live example of AIKitSlider component in a developer markup configuration panel
          </p>
        </div>
        <DeveloperMarkupSettings />
      </div>
    </div>
  );
}
