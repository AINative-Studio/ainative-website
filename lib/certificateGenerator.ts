/**
 * Certificate Generator Utilities
 */

export interface CertificateData {
  id?: string;
  certificateId?: string;
  recipientName?: string;
  attendeeName?: string;
  webinarTitle: string;
  webinarDate: Date | string;
  duration: number;
  issuedAt?: Date;
  issuerName?: string;
  issuerTitle?: string;
  speakerName?: string;
  completionPercentage?: number;
}

export function generateCertificateId(
  webinarId?: string,
  userId?: string,
  date?: Date
): string {
  const timestamp = date ? date.getTime().toString(36) : Date.now().toString(36);
  const webinarPart = webinarId ? webinarId.substring(0, 4) : '';
  const userPart = userId ? userId.substring(0, 4) : '';
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `CERT-${webinarPart}${userPart}-${timestamp}-${randomStr}`.toUpperCase();
}

export function generateCertificateUrl(certificateId: string): string {
  return `${process.env.NEXT_PUBLIC_APP_URL || ''}/certificates/${certificateId}`;
}

export async function downloadCertificate(data: CertificateData): Promise<void> {
  // In a real implementation, this would generate a PDF
  // For now, we'll create a simple text-based certificate
  const recipientName = data.attendeeName || data.recipientName || 'Attendee';
  const certId = data.certificateId || data.id || generateCertificateId();
  const issuedDate = data.issuedAt ? data.issuedAt.toLocaleDateString() : new Date().toLocaleDateString();

  const content = `
=====================================
         CERTIFICATE OF COMPLETION
=====================================

This certifies that

${recipientName}

has successfully completed the webinar

"${data.webinarTitle}"

Date: ${typeof data.webinarDate === 'string' ? data.webinarDate : data.webinarDate.toLocaleDateString()}
Duration: ${data.duration} minutes
${data.completionPercentage !== undefined ? `Completion: ${data.completionPercentage}%` : ''}

Certificate ID: ${certId}
Issued on: ${issuedDate}

${data.speakerName ? `Presented by: ${data.speakerName}` : ''}
${data.issuerName ? `Issued by: ${data.issuerName}` : ''}
${data.issuerTitle ? data.issuerTitle : ''}

=====================================
`;

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `certificate-${certId}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function emailCertificate(data: CertificateData, email: string): Promise<boolean> {
  // This would send the certificate via email in a real implementation
  console.log('Emailing certificate to:', email, data);
  return true;
}

export function verifyCertificate(certificateId: string): Promise<CertificateData | null> {
  // This would verify the certificate against a database
  console.log('Verifying certificate:', certificateId);
  return Promise.resolve(null);
}
