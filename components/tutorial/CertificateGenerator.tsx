'use client';

/**
 * CertificateGenerator Component
 * Generates and downloads PDF certificates for completed tutorials
 */

import React, { useState } from 'react';
import { CertificateData } from '@/types/tutorial';
import { Download, Award, Check } from 'lucide-react';

interface CertificateGeneratorProps {
  certificateData: CertificateData;
  onDownload?: () => void;
  className?: string;
}

export function CertificateGenerator({
  certificateData,
  onDownload,
  className = '',
}: CertificateGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [userName, setUserName] = useState(certificateData.userName || '');

  /**
   * Generate certificate as HTML canvas and download as image
   * In production, this would use jsPDF or a backend service
   */
  const generateCertificate = async () => {
    if (!userName.trim()) {
      alert('Please enter your name to generate the certificate');
      return;
    }

    setIsGenerating(true);

    try {
      // Create canvas for certificate
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 850;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 8;
      ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

      // Inner border
      ctx.strokeStyle = '#f0f0f0';
      ctx.lineWidth = 2;
      ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

      // Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 60px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('CERTIFICATE OF COMPLETION', canvas.width / 2, 150);

      // Award icon (simple representation)
      ctx.beginPath();
      ctx.arc(canvas.width / 2, 250, 50, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd700';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.stroke();

      // This certifies text
      ctx.fillStyle = '#ffffff';
      ctx.font = '28px Arial';
      ctx.fillText('This certifies that', canvas.width / 2, 350);

      // User name
      ctx.font = 'bold 48px Arial';
      ctx.fillText(userName, canvas.width / 2, 420);

      // Underline for name
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      const nameWidth = ctx.measureText(userName).width;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - nameWidth / 2, 435);
      ctx.lineTo(canvas.width / 2 + nameWidth / 2, 435);
      ctx.stroke();

      // Completion text
      ctx.font = '28px Arial';
      ctx.fillText('has successfully completed the tutorial', canvas.width / 2, 500);

      // Tutorial title
      ctx.font = 'bold 36px Arial';
      ctx.fillText(certificateData.tutorialTitle, canvas.width / 2, 560);

      // Details
      ctx.font = '24px Arial';
      ctx.fillStyle = '#f0f0f0';

      const details = [
        `Difficulty Level: ${certificateData.difficulty.charAt(0).toUpperCase() + certificateData.difficulty.slice(1)}`,
        `Duration: ${formatDuration(certificateData.duration)}`,
        `Completion Date: ${certificateData.completionDate}`,
      ];

      details.forEach((detail, index) => {
        ctx.fillText(detail, canvas.width / 2, 630 + index * 35);
      });

      // Certificate ID
      ctx.font = '18px monospace';
      ctx.fillStyle = '#cccccc';
      ctx.fillText(`Certificate ID: ${certificateData.certificateId}`, canvas.width / 2, 760);

      // Signature line (simple)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 150, 800);
      ctx.lineTo(canvas.width / 2 + 150, 800);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '20px Arial';
      ctx.fillText('AINative Platform', canvas.width / 2, 825);

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `certificate-${certificateData.certificateId}.png`;
          link.click();
          URL.revokeObjectURL(url);

          onDownload?.();
        }
      }, 'image/png');

      setTimeout(() => setIsGenerating(false), 1000);
    } catch (error) {
      console.error('Failed to generate certificate:', error);
      alert('Failed to generate certificate. Please try again.');
      setIsGenerating(false);
    }
  };

  /**
   * Format duration in minutes to readable string
   */
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} minutes`;
  };

  return (
    <div className={`certificate-generator ${className}`}>
      <div className="certificate-generator__header">
        <div className="certificate-generator__icon">
          <Award size={32} />
        </div>
        <div className="certificate-generator__content">
          <h3 className="certificate-generator__title">Congratulations!</h3>
          <p className="certificate-generator__subtitle">
            You have completed this tutorial and earned a certificate
          </p>
        </div>
      </div>

      <div className="certificate-generator__preview">
        <div className="certificate-preview">
          <div className="certificate-preview__badge">
            <Check size={48} />
          </div>
          <h4 className="certificate-preview__title">Certificate of Completion</h4>
          <div className="certificate-preview__details">
            <p>
              <strong>{certificateData.tutorialTitle}</strong>
            </p>
            <p>
              Difficulty: {certificateData.difficulty.charAt(0).toUpperCase() + certificateData.difficulty.slice(1)}
            </p>
            <p>Duration: {formatDuration(certificateData.duration)}</p>
            <p>Completed: {certificateData.completionDate}</p>
          </div>
        </div>
      </div>

      <div className="certificate-generator__form">
        <label className="certificate-generator__label">
          Your Name (as it will appear on the certificate)
          <input
            type="text"
            className="certificate-generator__input"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your full name"
            maxLength={50}
          />
        </label>

        <button
          className="certificate-generator__download-btn"
          onClick={generateCertificate}
          disabled={isGenerating || !userName.trim()}
        >
          {isGenerating ? (
            <>
              <div className="certificate-generator__spinner" />
              Generating...
            </>
          ) : (
            <>
              <Download size={20} />
              Download Certificate
            </>
          )}
        </button>

        <p className="certificate-generator__note">
          Your certificate will be downloaded as a high-quality PNG image. You can print it or share
          it on social media.
        </p>
      </div>

      <style jsx>{`
        .certificate-generator {
          background: var(--background);
          border-radius: 12px;
          border: 1px solid var(--border);
          overflow: hidden;
        }

        .certificate-generator__header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
          border-bottom: 1px solid var(--border);
        }

        .certificate-generator__icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          flex-shrink: 0;
        }

        .certificate-generator__content {
          flex: 1;
        }

        .certificate-generator__title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .certificate-generator__subtitle {
          font-size: 0.9375rem;
          color: var(--muted-foreground);
        }

        .certificate-generator__preview {
          padding: 2rem;
          display: flex;
          justify-content: center;
        }

        .certificate-preview {
          width: 100%;
          max-width: 500px;
          aspect-ratio: 1.41;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 8px;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          text-align: center;
          position: relative;
          box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
        }

        .certificate-preview::before {
          content: '';
          position: absolute;
          inset: 12px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }

        .certificate-preview__badge {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          border: 3px solid white;
        }

        .certificate-preview__title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .certificate-preview__details {
          font-size: 0.9375rem;
        }

        .certificate-preview__details p {
          margin-bottom: 0.5rem;
        }

        .certificate-generator__form {
          padding: 2rem;
          border-top: 1px solid var(--border);
        }

        .certificate-generator__label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: var(--foreground);
        }

        .certificate-generator__input {
          width: 100%;
          padding: 0.75rem 1rem;
          font-size: 0.9375rem;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--background);
          color: var(--foreground);
          margin-top: 0.5rem;
          margin-bottom: 1.5rem;
          transition: border-color 0.2s ease;
        }

        .certificate-generator__input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
        }

        .certificate-generator__download-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.875rem 1.5rem;
          font-size: 1rem;
          font-weight: 600;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 1rem;
        }

        .certificate-generator__download-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        .certificate-generator__download-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .certificate-generator__spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .certificate-generator__note {
          font-size: 0.8125rem;
          color: var(--muted-foreground);
          text-align: center;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .certificate-generator__header {
            flex-direction: column;
            text-align: center;
          }

          .certificate-preview {
            padding: 1.5rem;
          }

          .certificate-preview__title {
            font-size: 1.125rem;
          }

          .certificate-preview__details {
            font-size: 0.8125rem;
          }
        }
      `}</style>
    </div>
  );
}

export default CertificateGenerator;
