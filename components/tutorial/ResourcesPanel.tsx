'use client';

/**
 * ResourcesPanel Component
 * Display downloadable resources, GitHub repos, PDF slides, and other materials
 */

import React, { useState } from 'react';
import {
  Download,
  ExternalLink,
  FileText,
  Github,
  FolderArchive,
  File,
  BookOpen,
  Database,
  Code2,
} from 'lucide-react';

export interface Resource {
  id: string;
  title: string;
  description?: string;
  type: 'github' | 'pdf' | 'zip' | 'dataset' | 'code' | 'document' | 'link';
  url: string;
  size?: string;
  icon?: React.ReactNode;
}

interface ResourcesPanelProps {
  resources: Resource[];
  tutorialTitle?: string;
  className?: string;
}

export function ResourcesPanel({ resources, tutorialTitle, className = '' }: ResourcesPanelProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  /**
   * Get icon for resource type
   */
  const getResourceIcon = (resource: Resource): React.ReactNode => {
    if (resource.icon) return resource.icon;

    switch (resource.type) {
      case 'github':
        return <Github size={20} />;
      case 'pdf':
        return <FileText size={20} />;
      case 'zip':
        return <FolderArchive size={20} />;
      case 'dataset':
        return <Database size={20} />;
      case 'code':
        return <Code2 size={20} />;
      case 'document':
        return <BookOpen size={20} />;
      case 'link':
        return <ExternalLink size={20} />;
      default:
        return <File size={20} />;
    }
  };

  /**
   * Get badge color for resource type
   */
  const getResourceBadgeClass = (type: Resource['type']): string => {
    const classes: Record<Resource['type'], string> = {
      github: 'resource-badge--github',
      pdf: 'resource-badge--pdf',
      zip: 'resource-badge--zip',
      dataset: 'resource-badge--dataset',
      code: 'resource-badge--code',
      document: 'resource-badge--document',
      link: 'resource-badge--link',
    };
    return classes[type] || '';
  };

  /**
   * Handle resource download/open
   */
  const handleResourceClick = async (resource: Resource) => {
    setDownloadingId(resource.id);

    // Simulate download delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Open in new tab
    window.open(resource.url, '_blank', 'noopener,noreferrer');

    setDownloadingId(null);
  };

  /**
   * Download all resources as ZIP
   */
  const handleDownloadAll = () => {
    // In production, this would call an API endpoint that creates a ZIP
    // of all resources and returns the download URL
    alert('Download All functionality would package all resources into a ZIP file');
  };

  /**
   * Group resources by type
   */
  const groupedResources = resources.reduce((acc, resource) => {
    if (!acc[resource.type]) {
      acc[resource.type] = [];
    }
    acc[resource.type].push(resource);
    return acc;
  }, {} as Record<string, Resource[]>);

  const resourceTypeLabels: Record<string, string> = {
    github: 'GitHub Repositories',
    pdf: 'PDF Documents',
    zip: 'Downloadable Archives',
    dataset: 'Datasets',
    code: 'Code Samples',
    document: 'Documentation',
    link: 'External Links',
  };

  if (resources.length === 0) {
    return (
      <div className={`resources-panel ${className}`}>
        <div className="resources-panel__empty">
          <FolderArchive size={48} />
          <p>No resources available for this tutorial</p>
        </div>

        <style jsx>{`
          .resources-panel__empty {
            text-align: center;
            padding: 3rem 1rem;
            color: var(--muted-foreground);
          }

          .resources-panel__empty svg {
            margin-bottom: 1rem;
            opacity: 0.3;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`resources-panel ${className}`}>
      {/* Header */}
      <div className="resources-panel__header">
        <div className="resources-panel__title-section">
          <Download size={24} />
          <div>
            <h3 className="resources-panel__title">Tutorial Resources</h3>
            <p className="resources-panel__subtitle">
              Downloadable materials to help you follow along
            </p>
          </div>
        </div>

        {resources.length > 1 && (
          <button className="resources-panel__download-all" onClick={handleDownloadAll}>
            <FolderArchive size={18} />
            Download All
          </button>
        )}
      </div>

      {/* Resources List */}
      <div className="resources-panel__content">
        {Object.entries(groupedResources).map(([type, typeResources]) => (
          <div key={type} className="resources-panel__group">
            <h4 className="resources-panel__group-title">
              {resourceTypeLabels[type] || type}
            </h4>

            <div className="resources-panel__list">
              {typeResources.map((resource) => (
                <div key={resource.id} className="resource-item">
                  <div className="resource-item__icon">{getResourceIcon(resource)}</div>

                  <div className="resource-item__content">
                    <h5 className="resource-item__title">{resource.title}</h5>
                    {resource.description && (
                      <p className="resource-item__description">{resource.description}</p>
                    )}
                    <div className="resource-item__meta">
                      <span className={`resource-badge ${getResourceBadgeClass(resource.type)}`}>
                        {resource.type.toUpperCase()}
                      </span>
                      {resource.size && (
                        <span className="resource-item__size">{resource.size}</span>
                      )}
                    </div>
                  </div>

                  <button
                    className="resource-item__action"
                    onClick={() => handleResourceClick(resource)}
                    disabled={downloadingId === resource.id}
                    aria-label={`Download ${resource.title}`}
                  >
                    {downloadingId === resource.id ? (
                      <div className="resource-item__spinner" />
                    ) : resource.type === 'github' || resource.type === 'link' ? (
                      <ExternalLink size={18} />
                    ) : (
                      <Download size={18} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .resources-panel {
          background: var(--background);
          border-radius: 8px;
          border: 1px solid var(--border);
          overflow: hidden;
        }

        .resources-panel__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          background: var(--accent);
          border-bottom: 1px solid var(--border);
          gap: 1rem;
        }

        .resources-panel__title-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .resources-panel__title {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .resources-panel__subtitle {
          font-size: 0.8125rem;
          color: var(--muted-foreground);
        }

        .resources-panel__download-all {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: opacity 0.2s ease;
          white-space: nowrap;
        }

        .resources-panel__download-all:hover {
          opacity: 0.9;
        }

        .resources-panel__content {
          padding: 1.5rem;
        }

        .resources-panel__group {
          margin-bottom: 2rem;
        }

        .resources-panel__group:last-child {
          margin-bottom: 0;
        }

        .resources-panel__group-title {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--muted-foreground);
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .resources-panel__list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .resource-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .resource-item:hover {
          background: var(--accent);
          border-color: var(--primary);
        }

        .resource-item__icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: var(--primary);
          color: white;
          flex-shrink: 0;
        }

        .resource-item__content {
          flex: 1;
          min-width: 0;
        }

        .resource-item__title {
          font-size: 0.9375rem;
          font-weight: 500;
          margin-bottom: 0.25rem;
          line-height: 1.4;
        }

        .resource-item__description {
          font-size: 0.8125rem;
          color: var(--muted-foreground);
          line-height: 1.4;
          margin-bottom: 0.5rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .resource-item__meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .resource-badge {
          font-size: 0.6875rem;
          padding: 0.125rem 0.5rem;
          border-radius: 4px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .resource-badge--github {
          background: #333;
          color: white;
        }

        .resource-badge--pdf {
          background: #dc2626;
          color: white;
        }

        .resource-badge--zip {
          background: #f59e0b;
          color: white;
        }

        .resource-badge--dataset {
          background: #8b5cf6;
          color: white;
        }

        .resource-badge--code {
          background: #3b82f6;
          color: white;
        }

        .resource-badge--document {
          background: #10b981;
          color: white;
        }

        .resource-badge--link {
          background: #6366f1;
          color: white;
        }

        .resource-item__size {
          font-size: 0.75rem;
          color: var(--muted-foreground);
        }

        .resource-item__action {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 6px;
          border: 1px solid var(--border);
          background: var(--background);
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .resource-item__action:hover:not(:disabled) {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }

        .resource-item__action:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .resource-item__spinner {
          width: 18px;
          height: 18px;
          border: 2px solid var(--border);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .resources-panel__header {
            flex-direction: column;
            align-items: flex-start;
          }

          .resources-panel__download-all {
            width: 100%;
            justify-content: center;
          }

          .resource-item {
            flex-direction: column;
            align-items: flex-start;
          }

          .resource-item__action {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default ResourcesPanel;
