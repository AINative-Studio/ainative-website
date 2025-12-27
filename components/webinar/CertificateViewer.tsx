/**
 * CertificateViewer Component
 * View and download attendance certificate
 */

import React, { useState } from 'react';
import { Webinar } from '@/lib/webinarAPI';
import { downloadCertificate, generateCertificateId, CertificateData } from '@/lib/certificateGenerator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Download, Mail, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CertificateViewerProps {
  webinar: Webinar;
  userName: string;
  watchPercentage?: number;
}

export function CertificateViewer({ webinar, userName, watchPercentage = 100 }: CertificateViewerProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const certificateId = generateCertificateId(
    webinar.id.toString(),
    userName.replace(/\s+/g, '-').toLowerCase(),
    new Date(webinar.date)
  );

  const handleDownload = () => {
    setIsDownloading(true);
    try {
      const certificateData: CertificateData = {
        attendeeName: userName,
        webinarTitle: webinar.title,
        webinarDate: new Date(webinar.date),
        duration: webinar.duration,
        speakerName: webinar.speaker?.name || 'AINative Team',
        certificateId,
        completionPercentage: watchPercentage,
      };

      downloadCertificate(certificateData);
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Failed to generate certificate. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEmailCertificate = () => {
    alert('Email functionality would be implemented here. Certificate will be sent to your registered email.');
  };

  const handleVerify = () => {
    window.open(`/verify-certificate/${certificateId}`, '_blank');
  };

  if (watchPercentage < 70) {
    return (
      <Alert>
        <Award className="w-4 h-4" />
        <AlertDescription>
          Watch at least 70% of the webinar to earn your certificate. Current progress: {watchPercentage}%
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Award className="w-6 h-6 text-yellow-600" />
          <CardTitle>Certificate of Attendance</CardTitle>
        </div>
        <CardDescription>
          Congratulations! You have completed this webinar and earned a certificate.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Certificate Details</h3>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Recipient:</dt>
              <dd className="font-medium">{userName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Webinar:</dt>
              <dd className="font-medium">{webinar.title}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Completion:</dt>
              <dd className="font-medium">{watchPercentage}%</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Certificate ID:</dt>
              <dd className="font-mono text-xs">{certificateId}</dd>
            </div>
          </dl>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <Button onClick={handleDownload} disabled={isDownloading} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            {isDownloading ? 'Generating...' : 'Download Certificate (PDF)'}
          </Button>
          <Button variant="outline" onClick={handleEmailCertificate} className="w-full">
            <Mail className="w-4 h-4 mr-2" />
            Email Certificate
          </Button>
          <Button variant="outline" onClick={handleVerify} className="w-full">
            <ExternalLink className="w-4 h-4 mr-2" />
            Verify Certificate
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          This certificate can be verified at ainative.io/verify-certificate/{certificateId}
        </p>
      </CardContent>
    </Card>
  );
}
