import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { FolderOpen, Upload } from 'lucide-react';

interface ObjectStorageProps {
  className?: string;
}

export const ObjectStorage: React.FC<ObjectStorageProps> = ({ className }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Object Storage (MinIO)
          </CardTitle>
          <CardDescription>
            File and object storage management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Upload className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Object Storage Dashboard</h3>
            <p>Bucket management, file uploads, and storage analytics</p>
            <p className="text-sm mt-2">Coming soon - integrate with StorageService API</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};