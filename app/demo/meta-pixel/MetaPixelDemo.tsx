'use client';

import { useState } from 'react';
import {
  trackMetaEvent,
  trackMetaCustomEvent,
  grantMetaPixelConsent,
  revokeMetaPixelConsent,
  type MetaPixelEvent,
} from '@/components/analytics/MetaPixel';

export default function MetaPixelDemo() {
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [customEventName, setCustomEventName] = useState('');
  const [eventValue, setEventValue] = useState('0');

  const logEvent = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setEventLog((prev) => [`[${timestamp}] ${message}`, ...prev]);
  };

  const handleStandardEvent = (event: MetaPixelEvent) => {
    trackMetaEvent(event, {
      value: parseFloat(eventValue) || 0,
      currency: 'USD',
      content_name: `Test ${event}`,
    });
    logEvent(`Tracked standard event: ${event} (value: $${eventValue})`);
  };

  const handleCustomEvent = () => {
    if (!customEventName.trim()) {
      alert('Please enter a custom event name');
      return;
    }
    trackMetaCustomEvent(customEventName, {
      value: parseFloat(eventValue) || 0,
      currency: 'USD',
    });
    logEvent(`Tracked custom event: ${customEventName} (value: $${eventValue})`);
  };

  const handleGrantConsent = () => {
    grantMetaPixelConsent();
    logEvent('Granted Meta Pixel consent');
  };

  const handleRevokeConsent = () => {
    revokeMetaPixelConsent();
    logEvent('Revoked Meta Pixel consent');
  };

  const standardEvents: MetaPixelEvent[] = [
    'PageView',
    'ViewContent',
    'Search',
    'AddToCart',
    'InitiateCheckout',
    'Purchase',
    'Lead',
    'CompleteRegistration',
    'StartTrial',
    'Subscribe',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Meta Pixel Demo</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Test Meta Pixel conversion events and verify tracking in your browser console and Meta Events Manager
          </p>
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg inline-block">
            <p className="text-sm text-blue-300">Pixel ID: {process.env.NEXT_PUBLIC_META_PIXEL_ID || 'Not configured'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Event Configuration</h2>
              <label className="block text-sm font-medium text-gray-300 mb-2">Event Value (USD)</label>
              <input
                type="number"
                value={eventValue}
                onChange={(e) => setEventValue(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Standard Events</h2>
              <div className="grid grid-cols-2 gap-3">
                {standardEvents.map((event) => (
                  <button
                    key={event}
                    onClick={() => handleStandardEvent(event)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 text-sm"
                  >
                    {event}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Custom Events</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  value={customEventName}
                  onChange={(e) => setCustomEventName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter custom event name"
                />
                <button
                  onClick={handleCustomEvent}
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Track Custom Event
                </button>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Consent Management</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleGrantConsent}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Grant Consent
                </button>
                <button
                  onClick={handleRevokeConsent}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Revoke Consent
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Event Log</h2>
              <button
                onClick={() => setEventLog([])}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors duration-200"
              >
                Clear
              </button>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {eventLog.length === 0 ? (
                <p className="text-gray-400 text-sm italic">No events tracked yet. Click a button to test Meta Pixel events.</p>
              ) : (
                eventLog.map((log, index) => (
                  <div key={index} className="bg-gray-800/50 rounded p-3 text-sm font-mono text-gray-300 border border-gray-700/50">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
