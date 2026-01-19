'use client';

import { useEffect, useState } from 'react';
import { verifyAllAnalytics, type AnalyticsVerificationReport } from '@/lib/analytics';
import {
  trackGTMEvent,
  trackGA4Event,
  captureSentryTestMessage,
  openChatwoot,
} from '@/lib/analytics';

export default function AnalyticsVerifyClient() {
  const [report, setReport] = useState<AnalyticsVerificationReport | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const runVerification = () => {
    setIsRefreshing(true);
    const verificationReport = verifyAllAnalytics();
    setReport(verificationReport);
    setLastRefresh(new Date());
    setIsRefreshing(false);
  };

  // Run verification on mount
  useEffect(() => {
    runVerification();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const testGTMEvent = () => {
    trackGTMEvent('test_event', {
      source: 'analytics_verification_dashboard',
      timestamp: new Date().toISOString(),
    });
    alert('GTM test event sent! Check browser console and GTM debug mode.');
  };

  const testGA4Event = () => {
    trackGA4Event('test_event', {
      source: 'analytics_verification_dashboard',
      timestamp: new Date().toISOString(),
    });
    alert('GA4 test event sent! Check browser console and GA4 Real-Time reports.');
  };

  const testSentry = () => {
    const success = captureSentryTestMessage();
    if (success) {
      alert('Sentry test message sent! Check your Sentry dashboard.');
    } else {
      alert('Sentry is not configured. Check NEXT_PUBLIC_SENTRY_DSN environment variable.');
    }
  };

  const testChatwoot = () => {
    openChatwoot();
  };

  const getStatusColor = (isConfigured: boolean) => {
    return isConfigured ? 'text-green-500' : 'text-red-500';
  };

  const getStatusIcon = (isConfigured: boolean) => {
    return isConfigured ? '✓' : '✗';
  };

  const getOverallStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/20 text-green-500 border-green-500';
      case 'partial':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500';
      case 'failed':
        return 'bg-red-500/20 text-red-500 border-red-500';
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-vite-bg text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Analytics Verification Dashboard</h1>
          <p className="text-gray-400">
            Real-time verification of all analytics tracking services for Issue #330
          </p>
          {lastRefresh && (
            <p className="text-sm text-gray-500 mt-2">
              Last updated: {lastRefresh.toLocaleString()}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={runVerification}
            disabled={isRefreshing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh Verification'}
          </button>
        </div>

        {/* Overall Status */}
        {report && (
          <div className={`mb-8 p-6 rounded-lg border ${getOverallStatusBadge(report.overallStatus)}`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Overall Status: {report.overallStatus.toUpperCase()}
                </h2>
                <p className="text-sm opacity-90">
                  {report.summary.configured} of {report.summary.total} services configured
                </p>
              </div>
              <div className="text-6xl font-bold opacity-20">
                {getStatusIcon(report.overallStatus === 'success')}
              </div>
            </div>
          </div>
        )}

        {/* Service Cards */}
        {report && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Google Tag Manager */}
            <div className="bg-[#161B22] rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Google Tag Manager</h3>
                <span className={`text-3xl ${getStatusColor(report.gtm.isConfigured)}`}>
                  {getStatusIcon(report.gtm.isConfigured)}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">GTM ID:</span>
                  <span className="font-mono">{report.gtm.gtmId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">DataLayer Exists:</span>
                  <span className={getStatusColor(report.gtm.dataLayerExists)}>
                    {report.gtm.dataLayerExists ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Scripts Loaded:</span>
                  <span className={getStatusColor(report.gtm.scriptsLoaded > 0)}>
                    {report.gtm.scriptsLoaded}
                  </span>
                </div>
                {report.gtm.errors.length > 0 && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded">
                    <p className="text-red-500 font-semibold mb-2">Errors:</p>
                    <ul className="list-disc list-inside text-xs text-red-400 space-y-1">
                      {report.gtm.errors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {report.gtm.isConfigured && (
                  <button
                    onClick={testGTMEvent}
                    className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                  >
                    Send Test Event
                  </button>
                )}
              </div>
            </div>

            {/* Google Analytics 4 */}
            <div className="bg-[#161B22] rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Google Analytics 4</h3>
                <span className={`text-3xl ${getStatusColor(report.ga4.isConfigured)}`}>
                  {getStatusIcon(report.ga4.isConfigured)}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">GA4 ID:</span>
                  <span className="font-mono">{report.ga4.gaId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">gtag Exists:</span>
                  <span className={getStatusColor(report.ga4.gtagExists)}>
                    {report.ga4.gtagExists ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Scripts Loaded:</span>
                  <span className={getStatusColor(report.ga4.gaScriptsLoaded > 0)}>
                    {report.ga4.gaScriptsLoaded}
                  </span>
                </div>
                {report.ga4.errors.length > 0 && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded">
                    <p className="text-red-500 font-semibold mb-2">Errors:</p>
                    <ul className="list-disc list-inside text-xs text-red-400 space-y-1">
                      {report.ga4.errors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {report.ga4.isConfigured && (
                  <button
                    onClick={testGA4Event}
                    className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                  >
                    Send Test Event
                  </button>
                )}
              </div>
            </div>

            {/* Chatwoot */}
            <div className="bg-[#161B22] rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Chatwoot</h3>
                <span className={`text-3xl ${getStatusColor(report.chatwoot.isConfigured)}`}>
                  {getStatusIcon(report.chatwoot.isConfigured)}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Website Token:</span>
                  <span className="font-mono text-xs">{report.chatwoot.websiteToken.slice(0, 10)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Base URL:</span>
                  <span className="text-xs truncate max-w-[200px]">{report.chatwoot.baseUrl}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">SDK Exists:</span>
                  <span className={getStatusColor(report.chatwoot.chatwootExists)}>
                    {report.chatwoot.chatwootExists ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Widget Rendered:</span>
                  <span className={getStatusColor(report.chatwoot.widgetRendered)}>
                    {report.chatwoot.widgetRendered ? 'Yes' : 'No'}
                  </span>
                </div>
                {report.chatwoot.errors.length > 0 && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded">
                    <p className="text-red-500 font-semibold mb-2">Errors:</p>
                    <ul className="list-disc list-inside text-xs text-red-400 space-y-1">
                      {report.chatwoot.errors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {report.chatwoot.isConfigured && (
                  <button
                    onClick={testChatwoot}
                    className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                  >
                    Open Widget
                  </button>
                )}
              </div>
            </div>

            {/* Sentry */}
            <div className="bg-[#161B22] rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Sentry</h3>
                <span className={`text-3xl ${getStatusColor(report.sentry.isConfigured)}`}>
                  {getStatusIcon(report.sentry.isConfigured)}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">DSN Configured:</span>
                  <span className={getStatusColor(Boolean(report.sentry.dsn))}>
                    {report.sentry.dsn ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Sentry Exists:</span>
                  <span className={getStatusColor(report.sentry.sentryExists)}>
                    {report.sentry.sentryExists ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Client Initialized:</span>
                  <span className={getStatusColor(report.sentry.clientInitialized)}>
                    {report.sentry.clientInitialized ? 'Yes' : 'No'}
                  </span>
                </div>
                {report.sentry.errors.length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                    <p className="text-yellow-500 font-semibold mb-2">Notices:</p>
                    <ul className="list-disc list-inside text-xs text-yellow-400 space-y-1">
                      {report.sentry.errors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <button
                  onClick={testSentry}
                  className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                >
                  Send Test Message
                </button>
              </div>
            </div>

            {/* Vercel Speed Insights */}
            <div className="bg-[#161B22] rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Vercel Speed Insights</h3>
                <span className={`text-3xl ${getStatusColor(report.speedInsights.isConfigured)}`}>
                  {getStatusIcon(report.speedInsights.isConfigured)}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Package Installed:</span>
                  <span className={getStatusColor(report.speedInsights.packageInstalled)}>
                    {report.speedInsights.packageInstalled ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Web Vitals Active:</span>
                  <span className={getStatusColor(report.speedInsights.webVitalsExists)}>
                    {report.speedInsights.webVitalsExists ? 'Yes' : 'No'}
                  </span>
                </div>
                {report.speedInsights.errors.length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                    <p className="text-yellow-500 font-semibold mb-2">Notices:</p>
                    <ul className="list-disc list-inside text-xs text-yellow-400 space-y-1">
                      {report.speedInsights.errors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded text-xs">
                  <p className="text-blue-400">
                    Speed Insights automatically tracks Web Vitals when deployed on Vercel.
                    Check Vercel Dashboard for metrics.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Debug Information */}
        {report && (
          <div className="mt-8 bg-[#161B22] rounded-lg p-6 border border-gray-800">
            <h3 className="text-xl font-bold mb-4">Debug Information</h3>
            <pre className="text-xs overflow-auto p-4 bg-black/50 rounded border border-gray-700">
              {JSON.stringify(report, null, 2)}
            </pre>
          </div>
        )}

        {/* Environment Variables Reference */}
        <div className="mt-8 bg-[#161B22] rounded-lg p-6 border border-gray-800">
          <h3 className="text-xl font-bold mb-4">Required Environment Variables</h3>
          <div className="space-y-2 text-sm font-mono">
            <div className="flex gap-4">
              <span className="text-gray-400 w-64">NEXT_PUBLIC_GTM_ID</span>
              <span>GTM-MJKQDBGV (default)</span>
            </div>
            <div className="flex gap-4">
              <span className="text-gray-400 w-64">NEXT_PUBLIC_GA_ID</span>
              <span>G-ML0XEBPZV2 (default)</span>
            </div>
            <div className="flex gap-4">
              <span className="text-gray-400 w-64">NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN</span>
              <span>XfqwZwqj9pcjyrFe4gsPRCff (default)</span>
            </div>
            <div className="flex gap-4">
              <span className="text-gray-400 w-64">NEXT_PUBLIC_CHATWOOT_BASE_URL</span>
              <span>https://chat.ainative.studio (default)</span>
            </div>
            <div className="flex gap-4">
              <span className="text-gray-400 w-64">NEXT_PUBLIC_SENTRY_DSN</span>
              <span className="text-yellow-500">Optional - Configure for error tracking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
