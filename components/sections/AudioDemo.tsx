'use client';

import { Card } from "@/components/ui/card";
import { Volume2, Code } from 'lucide-react';

const AudioDemo = () => {
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
      <div className="container-custom mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Make your content truly accessible.
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
            AccessKit provides accessibility string replacement in a number of scenarios including medical, math, measurement and more.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-primary/90 to-primary text-white">
              <div className="flex items-center mb-4">
                <Volume2 className="h-5 w-5 mr-2" />
                <span className="font-medium">Before AccessKit</span>
              </div>
              <p className="text-sm opacity-90">
                "Please contact us at four hundred fifteen billion five hundred fifty-five million one hundred twenty-one thousand twenty-one"
              </p>
            </Card>

            <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-secondary/90 to-secondary text-white">
              <div className="flex items-center mb-4">
                <Volume2 className="h-5 w-5 mr-2" />
                <span className="font-medium">After AccessKit</span>
              </div>
              <p className="text-sm opacity-90">
                "Please contact us at four one five, five five five, one two one two one"
              </p>
            </Card>
          </div>

          <Card className="border-0 shadow-lg bg-gray-50 dark:bg-gray-800">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Code className="h-5 w-5 mr-2 text-primary" />
                <span className="font-medium text-gray-800 dark:text-white">Implementation</span>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-100">
                  <code>{`import { useAccessKit } from '@accesskit/react';

function PhoneNumber({ number }) {
  const { formatPhoneNumber } = useAccessKit();

  return (
    <span aria-label={formatPhoneNumber(number)}>
      {number}
    </span>
  );
}`}</code>
                </pre>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AudioDemo;
