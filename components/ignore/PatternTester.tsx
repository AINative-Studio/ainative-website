/**
 * Pattern Tester Component
 *
 * Test ignore patterns against file paths
 */

'use client';

import { useState, useEffect } from 'react';
import { IgnoreFileService, IgnoreResult } from '@/lib/ignore-file-service';

interface PatternTesterProps {
  projectRoot?: string;
}

export function PatternTester({ projectRoot }: PatternTesterProps) {
  const [service, setService] = useState<IgnoreFileService | null>(null);
  const [testPath, setTestPath] = useState('');
  const [result, setResult] = useState<IgnoreResult | null>(null);
  const [recentTests, setRecentTests] = useState<Array<{ path: string; result: IgnoreResult }>>([]);

  // Initialize service
  useEffect(() => {
    const initService = async () => {
      const ignoreService = new IgnoreFileService({ projectRoot });
      await ignoreService.initialize();
      setService(ignoreService);
    };

    initService();
  }, [projectRoot]);

  const handleTest = () => {
    if (!service || !testPath) return;

    const testResult = service.checkPath(testPath);
    setResult(testResult);

    // Add to recent tests
    setRecentTests(prev => [
      { path: testPath, result: testResult },
      ...prev.slice(0, 9), // Keep last 10 tests
    ]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTest();
    }
  };

  const handleRetest = (path: string) => {
    setTestPath(path);
    if (service) {
      const testResult = service.checkPath(path);
      setResult(testResult);
    }
  };

  return (
    <div className="pattern-tester">
      <div className="header">
        <h2>Pattern Tester</h2>
        <p className="subtitle">
          Test if a file path would be ignored
        </p>
      </div>

      {/* Test Input */}
      <div className="test-section">
        <div className="input-group">
          <input
            type="text"
            value={testPath}
            onChange={e => setTestPath(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter file path (e.g., src/config/.env.local)"
            className="test-input"
          />
          <button onClick={handleTest} className="btn-test">
            Test Path
          </button>
        </div>

        {/* Common Examples */}
        <div className="examples">
          <span className="examples-label">Examples:</span>
          <button
            onClick={() => setTestPath('node_modules/package/index.js')}
            className="example-btn"
          >
            node_modules/package/index.js
          </button>
          <button
            onClick={() => setTestPath('.env.local')}
            className="example-btn"
          >
            .env.local
          </button>
          <button
            onClick={() => setTestPath('src/components/Button.tsx')}
            className="example-btn"
          >
            src/components/Button.tsx
          </button>
          <button
            onClick={() => setTestPath('.next/cache/webpack.js')}
            className="example-btn"
          >
            .next/cache/webpack.js
          </button>
        </div>
      </div>

      {/* Test Result */}
      {result && (
        <div className={`result-section ${result.ignored ? 'result-ignored' : 'result-allowed'}`}>
          <div className="result-header">
            <div className="result-status">
              {result.ignored ? (
                <>
                  <span className="status-icon status-ignored">✗</span>
                  <span className="status-text">IGNORED</span>
                </>
              ) : (
                <>
                  <span className="status-icon status-allowed">✓</span>
                  <span className="status-text">ALLOWED</span>
                </>
              )}
            </div>

            <div className="result-permission">
              Permission: <strong>{result.permission || 'none'}</strong>
            </div>
          </div>

          <div className="result-details">
            {result.reason && (
              <div className="detail-row">
                <span className="detail-label">Reason:</span>
                <span className="detail-value">{result.reason}</span>
              </div>
            )}

            {result.rule && (
              <>
                <div className="detail-row">
                  <span className="detail-label">Matched Pattern:</span>
                  <code className="detail-code">{result.rule.pattern}</code>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Rule Type:</span>
                  <span className={`rule-type type-${result.rule.type}`}>
                    {result.rule.type}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Source:</span>
                  <span className="detail-value">{result.rule.source}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Priority:</span>
                  <span className="detail-value">{result.rule.priority}</span>
                </div>

                {result.rule.reason && (
                  <div className="detail-row">
                    <span className="detail-label">Rule Reason:</span>
                    <span className="detail-value">{result.rule.reason}</span>
                  </div>
                )}
              </>
            )}

            {!result.rule && !result.ignored && (
              <div className="detail-row">
                <span className="detail-value">
                  No ignore rules match this path. File is accessible.
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Tests */}
      {recentTests.length > 0 && (
        <div className="recent-tests">
          <h3>Recent Tests</h3>

          <div className="tests-list">
            {recentTests.map((test, index) => (
              <div key={index} className="test-item">
                <div className="test-path">
                  <span className={`test-icon ${test.result.ignored ? 'icon-ignored' : 'icon-allowed'}`}>
                    {test.result.ignored ? '✗' : '✓'}
                  </span>
                  <code>{test.path}</code>
                </div>

                <div className="test-actions">
                  <button
                    onClick={() => handleRetest(test.path)}
                    className="btn-retest"
                  >
                    Retest
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .pattern-tester {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }

        .header {
          margin-bottom: 2rem;
        }

        .header h2 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .subtitle {
          color: #666;
          font-size: 1rem;
        }

        .test-section {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .input-group {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .test-input {
          flex: 1;
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 6px;
          font-size: 1rem;
          font-family: monospace;
        }

        .test-input:focus {
          outline: none;
          border-color: #2563eb;
        }

        .btn-test {
          padding: 0.75rem 1.5rem;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-test:hover {
          background: #1d4ed8;
        }

        .examples {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          align-items: center;
        }

        .examples-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #6b7280;
        }

        .example-btn {
          padding: 0.25rem 0.75rem;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          font-size: 0.75rem;
          font-family: monospace;
          cursor: pointer;
          transition: all 0.2s;
        }

        .example-btn:hover {
          background: #e5e7eb;
          border-color: #d1d5db;
        }

        .result-section {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border-left: 4px solid;
        }

        .result-ignored {
          border-left-color: #dc2626;
        }

        .result-allowed {
          border-left-color: #16a34a;
        }

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .result-status {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .status-icon {
          font-size: 1.5rem;
          font-weight: bold;
        }

        .status-ignored {
          color: #dc2626;
        }

        .status-allowed {
          color: #16a34a;
        }

        .status-text {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .result-permission {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .result-permission strong {
          color: #111827;
        }

        .result-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .detail-row {
          display: flex;
          align-items: baseline;
          gap: 0.75rem;
        }

        .detail-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          min-width: 140px;
        }

        .detail-value {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .detail-code {
          background: #f3f4f6;
          padding: 0.25rem 0.5rem;
          border-radius: 3px;
          font-family: monospace;
          font-size: 0.875rem;
        }

        .rule-type {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: 3px;
          text-transform: uppercase;
        }

        .type-exclude {
          background: #fee2e2;
          color: #991b1b;
        }

        .type-include {
          background: #d1fae5;
          color: #065f46;
        }

        .type-readonly {
          background: #fef3c7;
          color: #92400e;
        }

        .type-noai {
          background: #fecaca;
          color: #7f1d1d;
        }

        .recent-tests {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .recent-tests h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .tests-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .test-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .test-item:hover {
          background: #f3f4f6;
        }

        .test-path {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
        }

        .test-icon {
          font-weight: bold;
        }

        .icon-ignored {
          color: #dc2626;
        }

        .icon-allowed {
          color: #16a34a;
        }

        .test-path code {
          font-size: 0.875rem;
          color: #374151;
        }

        .btn-retest {
          padding: 0.25rem 0.75rem;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-retest:hover {
          background: #e5e7eb;
        }

        @media (max-width: 768px) {
          .input-group {
            flex-direction: column;
          }

          .result-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }

          .detail-row {
            flex-direction: column;
            gap: 0.25rem;
          }

          .detail-label {
            min-width: auto;
          }

          .test-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
