'use client';

import { useState } from 'react';
import { AIKitSlider } from '@/src/components/aikit/AIKitSlider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

/**
 * DeveloperMarkupSettings - Integration example for AIKitSlider
 *
 * This component demonstrates the AIKitSlider usage in a real-world scenario
 * for configuring developer markup percentages (Issue #175)
 *
 * Features:
 * - Multiple sliders for different markup categories
 * - Real-time price calculation
 * - Formatted value display
 * - Responsive design
 * - Dark theme compatible
 */
export function DeveloperMarkupSettings() {
  const [apiMarkup, setApiMarkup] = useState(15);
  const [trainingMarkup, setTrainingMarkup] = useState(20);
  const [storageMarkup, setStorageMarkup] = useState(10);
  const [computeMarkup, setComputeMarkup] = useState(25);

  const basePrices = {
    api: 100,
    training: 250,
    storage: 50,
    compute: 300,
  };

  const calculatePrice = (basePrice: number, markup: number) => {
    return (basePrice * (1 + markup / 100)).toFixed(2);
  };

  const totalBasePrice = Object.values(basePrices).reduce((sum, price) => sum + price, 0);
  const totalWithMarkup =
    parseFloat(calculatePrice(basePrices.api, apiMarkup)) +
    parseFloat(calculatePrice(basePrices.training, trainingMarkup)) +
    parseFloat(calculatePrice(basePrices.storage, storageMarkup)) +
    parseFloat(calculatePrice(basePrices.compute, computeMarkup));

  const averageMarkup = ((apiMarkup + trainingMarkup + storageMarkup + computeMarkup) / 4).toFixed(1);

  const resetToDefaults = () => {
    setApiMarkup(15);
    setTrainingMarkup(20);
    setStorageMarkup(10);
    setComputeMarkup(25);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-white">Developer Markup Configuration</CardTitle>
              <CardDescription className="text-gray-400">
                Set custom markup percentages for different service tiers
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Info Banner */}
          <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300">
              <p className="font-medium text-white mb-1">Developer Markup Guidelines</p>
              <p>
                Recommended markup range is 0-40%. Higher markups may affect customer adoption.
                All changes are applied immediately to new subscriptions.
              </p>
            </div>
          </div>

          {/* Markup Sliders */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* API Services */}
              <div className="space-y-4 p-4 bg-gray-800/50 rounded-lg">
                <div>
                  <h4 className="text-white font-medium mb-1">API Services</h4>
                  <p className="text-sm text-gray-400">
                    Base: ${basePrices.api}/mo → Final: ${calculatePrice(basePrices.api, apiMarkup)}/mo
                  </p>
                </div>
                <AIKitSlider
                  label="API Markup"
                  value={apiMarkup}
                  onChange={setApiMarkup}
                  min={0}
                  max={40}
                  step={0.5}
                  showValue={true}
                  formatValue={(v) => `${v}%`}
                />
              </div>

              {/* Training Services */}
              <div className="space-y-4 p-4 bg-gray-800/50 rounded-lg">
                <div>
                  <h4 className="text-white font-medium mb-1">Training Services</h4>
                  <p className="text-sm text-gray-400">
                    Base: ${basePrices.training}/mo → Final: ${calculatePrice(basePrices.training, trainingMarkup)}/mo
                  </p>
                </div>
                <AIKitSlider
                  label="Training Markup"
                  value={trainingMarkup}
                  onChange={setTrainingMarkup}
                  min={0}
                  max={40}
                  step={0.5}
                  showValue={true}
                  formatValue={(v) => `${v}%`}
                />
              </div>

              {/* Storage Services */}
              <div className="space-y-4 p-4 bg-gray-800/50 rounded-lg">
                <div>
                  <h4 className="text-white font-medium mb-1">Storage Services</h4>
                  <p className="text-sm text-gray-400">
                    Base: ${basePrices.storage}/mo → Final: ${calculatePrice(basePrices.storage, storageMarkup)}/mo
                  </p>
                </div>
                <AIKitSlider
                  label="Storage Markup"
                  value={storageMarkup}
                  onChange={setStorageMarkup}
                  min={0}
                  max={40}
                  step={0.5}
                  showValue={true}
                  formatValue={(v) => `${v}%`}
                />
              </div>

              {/* Compute Services */}
              <div className="space-y-4 p-4 bg-gray-800/50 rounded-lg">
                <div>
                  <h4 className="text-white font-medium mb-1">Compute Services</h4>
                  <p className="text-sm text-gray-400">
                    Base: ${basePrices.compute}/mo → Final: ${calculatePrice(basePrices.compute, computeMarkup)}/mo
                  </p>
                </div>
                <AIKitSlider
                  label="Compute Markup"
                  value={computeMarkup}
                  onChange={setComputeMarkup}
                  min={0}
                  max={40}
                  step={0.5}
                  showValue={true}
                  formatValue={(v) => `${v}%`}
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="p-6 bg-gradient-to-r from-[#4B6FED]/10 to-[#8A63F4]/10 border border-[#4B6FED]/20 rounded-lg">
            <h4 className="text-white font-semibold mb-4">Pricing Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-400">Total Base Price</p>
                <p className="text-2xl text-white font-bold">${totalBasePrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Total with Markup</p>
                <p className="text-2xl text-white font-bold">${totalWithMarkup.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Average Markup</p>
                <p className="text-2xl text-white font-bold">{averageMarkup}%</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="default"
              className="bg-gradient-to-r from-[#4B6FED] to-[#8A63F4] hover:opacity-90"
            >
              Save Configuration
            </Button>
            <Button
              variant="outline"
              onClick={resetToDefaults}
              className="border-gray-700 hover:bg-gray-800"
            >
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Example Card */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Integration Example</CardTitle>
          <CardDescription className="text-gray-400">
            How to use AIKitSlider in your components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
            <code className="text-gray-300">
{`import { AIKitSlider } from '@/components/aikit';

function MyComponent() {
  const [markup, setMarkup] = useState(15);

  return (
    <AIKitSlider
      label="Developer Markup"
      value={markup}
      onChange={setMarkup}
      min={0}
      max={40}
      step={0.5}
      showValue={true}
      formatValue={(v) => \`\${v}%\`}
    />
  );
}`}
            </code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
