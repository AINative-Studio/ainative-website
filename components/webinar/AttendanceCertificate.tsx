/**
 * AttendanceCertificate Component
 * Displays certificate eligibility and download options for webinar attendees
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, Download, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { downloadCertificate, generateCertificateId, CertificateData } from '@/lib/certificateGenerator';

interface AttendanceCertificateProps {
  webinarId: string;
  webinarTitle: string;
  webinarDate: Date | string;
  duration: number;
  userName: string;
  userEmail: string;
  speakerName?: string;
  watchPercentage: number;
  isEligible?: boolean;
  minWatchPercentage?: number;
}

export function AttendanceCertificate({
  webinarId,
  webinarTitle,
  webinarDate,
  duration,
  userName,
  userEmail,
  speakerName,
  watchPercentage,
  isEligible,
  minWatchPercentage = 70,
}: AttendanceCertificateProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const eligible = isEligible ?? (watchPercentage >= minWatchPercentage);

  const certificateId = generateCertificateId(
    webinarId,
    userEmail.split('@')[0],
    new Date(webinarDate)
  );

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const certificateData: CertificateData = {
        certificateId,
        attendeeName: userName,
        webinarTitle,
        webinarDate,
        duration,
        speakerName,
        completionPercentage: watchPercentage,
        issuedAt: new Date(),
      };

      await downloadCertificate(certificateData);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Failed to generate certificate. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!eligible) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-yellow-600" />
            <CardTitle className="text-yellow-900">Certificate Not Yet Available</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-yellow-800 mb-4">
            Watch at least {minWatchPercentage}% of the webinar to earn your certificate of attendance.
          </p>
          <div className="bg-white rounded-lg p-4 border border-yellow-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Your Progress</span>
              <Badge variant="outline" className="bg-white">
                {watchPercentage}%
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-yellow-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${watchPercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {minWatchPercentage - watchPercentage}% more to unlock certificate
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-gradient-to-br from-green-50 to-blue-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Award className="w-6 h-6 text-green-600" />
          <CardTitle className="text-green-900">Certificate of Attendance</CardTitle>
        </div>
        <CardDescription className="text-green-700">
          Congratulations! You have completed this webinar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">You are eligible for a certificate</span>
        </div>

        <div className="bg-white rounded-lg p-4 border border-green-200">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Recipient:</dt>
              <dd className="font-medium text-gray-900">{userName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Webinar:</dt>
              <dd className="font-medium text-gray-900">{webinarTitle}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Completion:</dt>
              <dd className="font-medium text-green-600">{watchPercentage}%</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Certificate ID:</dt>
              <dd className="font-mono text-xs text-gray-700">{certificateId}</dd>
            </div>
          </dl>
        </div>

        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          size="lg"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Certificate...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download Certificate (PDF)
            </>
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          This certificate can be verified at ainative.studio/verify-certificate/{certificateId}
        </p>
      </CardContent>
    </Card>
  );
}
