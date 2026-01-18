/**
 * Ignore Rule Editor Component
 *
 * Visual interface for managing ignore rules
 */

'use client';

import { useState, useEffect } from 'react';
import { IgnoreFileService, IgnoreRule, IgnoreType } from '@/lib/ignore-file-service';

interface IgnoreRuleEditorProps {
  projectRoot?: string;
  onRulesChange?: (rules: IgnoreRule[]) => void;
}

export function IgnoreRuleEditor({ projectRoot, onRulesChange }: IgnoreRuleEditorProps) {
  const [service, setService] = useState<IgnoreFileService | null>(null);
  const [rules, setRules] = useState<IgnoreRule[]>([]);
  const [newPattern, setNewPattern] = useState('');
  const [newType, setNewType] = useState<IgnoreType>('exclude');
  const [newReason, setNewReason] = useState('');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBuiltIn, setShowBuiltIn] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Initialize service
  useEffect(() => {
    const initService = async () => {
      const ignoreService = new IgnoreFileService({ projectRoot });
      await ignoreService.initialize();
      setService(ignoreService);
      setRules(ignoreService.getRules());
    };

    initService();
  }, [projectRoot]);

  // Notify parent of rule changes
  useEffect(() => {
    if (onRulesChange) {
      onRulesChange(rules);
    }
  }, [rules, onRulesChange]);

  const handleAddRule = () => {
    if (!service) return;

    // Validate pattern
    const validation = service.validatePattern(newPattern);
    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid pattern');
      return;
    }

    setValidationError(null);

    // Add rule
    service.addRule(newPattern, newType, newReason || undefined);

    // Update rules
    setRules(service.getRules());

    // Reset form
    setNewPattern('');
    setNewReason('');
  };

  const handleRemoveRule = (pattern: string) => {
    if (!service) return;

    service.removeRule(pattern);
    setRules(service.getRules());
  };

  const handleExport = () => {
    if (!service) return;

    const filename = `ainativeignore-export-${Date.now()}.txt`;
    service.exportRules(filename, showBuiltIn);

    alert(`Exported to ${filename}`);
  };

  // Filter rules
  const filteredRules = rules.filter(rule => {
    // Filter by source
    if (filterSource !== 'all' && rule.source !== filterSource) {
      return false;
    }

    // Filter by type
    if (filterType !== 'all' && rule.type !== filterType) {
      return false;
    }

    // Filter built-in
    if (!showBuiltIn && rule.source === 'built-in') {
      return false;
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        rule.pattern.toLowerCase().includes(query) ||
        rule.reason?.toLowerCase().includes(query) ||
        false
      );
    }

    return true;
  });

  // Group rules by source
  const rulesBySource = filteredRules.reduce((acc, rule) => {
    const source = rule.source;
    if (!acc[source]) {
      acc[source] = [];
    }
    acc[source].push(rule);
    return acc;
  }, {} as Record<string, IgnoreRule[]>);

  return (
    <div className="ignore-rule-editor">
      <div className="header">
        <h2>Ignore Rules Editor</h2>
        <p className="subtitle">
          Manage file access control patterns for AI tools
        </p>
      </div>

      {/* Add New Rule */}
      <div className="add-rule-section">
        <h3>Add New Rule</h3>

        <div className="form-grid">
          <div className="form-group">
            <label>Pattern</label>
            <input
              type="text"
              value={newPattern}
              onChange={e => setNewPattern(e.target.value)}
              placeholder="e.g., *.log, secrets.json, node_modules/**"
              className="pattern-input"
            />
            {validationError && (
              <div className="validation-error">{validationError}</div>
            )}
          </div>

          <div className="form-group">
            <label>Type</label>
            <select
              value={newType}
              onChange={e => setNewType(e.target.value as IgnoreType)}
              className="type-select"
            >
              <option value="exclude">Exclude</option>
              <option value="include">Include</option>
              <option value="readonly">Read-only</option>
              <option value="noai">No AI Access</option>
            </select>
          </div>

          <div className="form-group">
            <label>Reason (Optional)</label>
            <input
              type="text"
              value={newReason}
              onChange={e => setNewReason(e.target.value)}
              placeholder="Why this pattern should be ignored"
              className="reason-input"
            />
          </div>

          <div className="form-group">
            <button onClick={handleAddRule} className="btn-primary">
              Add Rule
            </button>
          </div>
        </div>
      </div>

      {/* Quick Templates */}
      <div className="templates-section">
        <h3>Quick Templates</h3>
        <div className="template-buttons">
          <button
            onClick={() => setNewPattern('*.log')}
            className="btn-template"
          >
            Log Files
          </button>
          <button
            onClick={() => {
              setNewPattern('.env*');
              setNewType('noai');
              setNewReason('Environment variables');
            }}
            className="btn-template"
          >
            Environment Files
          </button>
          <button
            onClick={() => {
              setNewPattern('**/*.tmp');
              setNewReason('Temporary files');
            }}
            className="btn-template"
          >
            Temp Files
          </button>
          <button
            onClick={() => setNewPattern('node_modules/**')}
            className="btn-template"
          >
            Node Modules
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-controls">
          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search patterns..."
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <label>Source</label>
            <select
              value={filterSource}
              onChange={e => setFilterSource(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Sources</option>
              <option value=".ainativeignore">.ainativeignore</option>
              <option value=".aiignore">.aiignore</option>
              <option value=".gitignore">.gitignore</option>
              <option value="built-in">Built-in</option>
              <option value="security">Security</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Type</label>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="exclude">Exclude</option>
              <option value="include">Include</option>
              <option value="readonly">Read-only</option>
              <option value="noai">No AI</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showBuiltIn}
                onChange={e => setShowBuiltIn(e.target.checked)}
              />
              Show Built-in Rules
            </label>
          </div>
        </div>
      </div>

      {/* Rules List */}
      <div className="rules-list">
        <div className="rules-header">
          <h3>Active Rules ({filteredRules.length})</h3>
          <button onClick={handleExport} className="btn-secondary">
            Export Rules
          </button>
        </div>

        {Object.entries(rulesBySource).map(([source, sourceRules]) => (
          <div key={source} className="source-group">
            <div className="source-header">
              <h4>{source}</h4>
              <span className="rule-count">{sourceRules.length} rules</span>
            </div>

            <div className="rules-table">
              {sourceRules.map((rule, index) => (
                <div key={`${rule.pattern}-${index}`} className="rule-row">
                  <div className="rule-content">
                    <div className="rule-pattern">
                      <code>{rule.pattern}</code>
                      <span className={`rule-type type-${rule.type}`}>
                        {rule.type}
                      </span>
                    </div>

                    {rule.reason && (
                      <div className="rule-reason">{rule.reason}</div>
                    )}

                    {rule.expiresAt && (
                      <div className="rule-expiry">
                        Expires: {new Date(rule.expiresAt).toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div className="rule-actions">
                    {rule.source !== 'built-in' && rule.source !== 'security' && (
                      <button
                        onClick={() => handleRemoveRule(rule.pattern)}
                        className="btn-remove"
                        title="Remove rule"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredRules.length === 0 && (
          <div className="empty-state">
            <p>No rules match your filters.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .ignore-rule-editor {
          max-width: 1200px;
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

        .add-rule-section,
        .templates-section,
        .filters-section,
        .rules-list {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 2fr auto;
          gap: 1rem;
          align-items: end;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: #333;
        }

        .pattern-input,
        .reason-input,
        .type-select,
        .search-input,
        .filter-select {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.875rem;
        }

        .validation-error {
          color: #dc2626;
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }

        .btn-primary,
        .btn-secondary,
        .btn-template,
        .btn-remove {
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #2563eb;
          color: white;
        }

        .btn-primary:hover {
          background: #1d4ed8;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        .btn-template {
          background: #f3f4f6;
          color: #374151;
          margin-right: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .btn-template:hover {
          background: #e5e7eb;
        }

        .btn-remove {
          background: #dc2626;
          color: white;
          padding: 0.25rem 0.75rem;
          font-size: 0.75rem;
        }

        .btn-remove:hover {
          background: #b91c1c;
        }

        .template-buttons {
          display: flex;
          flex-wrap: wrap;
        }

        .filter-controls {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr auto;
          gap: 1rem;
          align-items: end;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .rules-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .source-group {
          margin-bottom: 2rem;
        }

        .source-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 4px;
          margin-bottom: 0.5rem;
        }

        .source-header h4 {
          font-size: 1rem;
          font-weight: 600;
          text-transform: uppercase;
          color: #374151;
          margin: 0;
        }

        .rule-count {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .rules-table {
          border: 1px solid #e5e7eb;
          border-radius: 4px;
        }

        .rule-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .rule-row:last-child {
          border-bottom: none;
        }

        .rule-content {
          flex: 1;
        }

        .rule-pattern {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .rule-pattern code {
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

        .rule-reason {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .rule-expiry {
          font-size: 0.75rem;
          color: #f59e0b;
          margin-top: 0.25rem;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .form-grid,
          .filter-controls {
            grid-template-columns: 1fr;
          }

          .rule-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
