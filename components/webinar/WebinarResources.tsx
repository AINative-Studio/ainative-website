/**
 * WebinarResources Component
 * Display downloadable resources for webinars
 */

import React from 'react';
import { WebinarResource } from '@/lib/webinarAPI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  FileText,
  Code,
  BookOpen,
  Database,
  Link as LinkIcon,
  Archive
} from 'lucide-react';

interface WebinarResourcesProps {
  resources: WebinarResource[];
  showDownloadAll?: boolean;
}

export function WebinarResources({ resources, showDownloadAll = true }: WebinarResourcesProps) {
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'slides':
        return <FileText className="w-10 h-10 text-blue-600" />;
      case 'code':
        return <Code className="w-10 h-10 text-green-600" />;
      case 'article':
        return <BookOpen className="w-10 h-10 text-purple-600" />;
      case 'dataset':
        return <Database className="w-10 h-10 text-orange-600" />;
      default:
        return <LinkIcon className="w-10 h-10 text-gray-600" />;
    }
  };

  const getResourceLabel = (type: string) => {
    switch (type) {
      case 'slides':
        return 'Presentation Slides';
      case 'code':
        return 'Code Repository';
      case 'article':
        return 'Article/Reading';
      case 'dataset':
        return 'Dataset';
      default:
        return 'Resource';
    }
  };

  const handleDownloadAll = () => {
    // In production, this would create a ZIP file with all resources
    resources.forEach((resource) => {
      if (resource.url) {
        window.open(resource.url, '_blank');
      }
    });
  };

  if (resources.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Archive className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No resources available for this webinar</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Downloadable Resources</CardTitle>
            <CardDescription>
              Materials and files shared during this webinar
            </CardDescription>
          </div>
          {showDownloadAll && resources.length > 1 && (
            <Button variant="outline" size="sm" onClick={handleDownloadAll}>
              <Archive className="w-4 h-4 mr-2" />
              Download All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {resources.map((resource) => (
          <div
            key={resource.id || resource.url}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="flex-shrink-0">
                {getResourceIcon(resource.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {resource.title}
                  </h4>
                  <Badge variant="secondary" className="text-xs">
                    {getResourceLabel(resource.type)}
                  </Badge>
                </div>
                {resource.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {resource.description}
                  </p>
                )}
              </div>
            </div>
            <Button
              asChild
              size="sm"
              className="ml-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                download
              >
                <Download className="w-4 h-4 mr-2" />
                {resource.type === 'code' ? 'View' : 'Download'}
              </a>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
