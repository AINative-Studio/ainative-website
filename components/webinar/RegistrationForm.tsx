/**
 * RegistrationForm Component
 * Handle webinar registration with validation
 */

import React, { useState } from 'react';
import { Webinar } from '@/lib/webinarAPI';
import { useWebinarRegistration, RegistrationFormData } from '@/hooks/useWebinarRegistration';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface RegistrationFormProps {
  webinar: Webinar;
  onSuccess?: () => void;
}

export function RegistrationForm({ webinar, onSuccess }: RegistrationFormProps) {
  const { register, isRegistering, isRegistered, errors, registrationStatus } = useWebinarRegistration(webinar);
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: '',
    email: '',
    company: '',
    jobTitle: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await register(formData);
    if (result.success && onSuccess) {
      onSuccess();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getFieldError = (field: string) => {
    return errors.find((err) => err.field === field)?.message;
  };

  if (isRegistered) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle2 className="w-5 h-5" />
            <CardTitle>Registration Successful!</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-green-700 mb-4">
            You are registered for this webinar. A confirmation email and calendar invite have been sent to your email address.
          </p>
          <Alert>
            <AlertDescription>
              We will send you reminder emails 24 hours and 1 hour before the webinar starts.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register for this Webinar</CardTitle>
        <CardDescription>
          {registrationStatus === 'limited' && 'Limited spots remaining!'}
          {registrationStatus === 'full' && 'This webinar is full'}
          {registrationStatus === 'open' && 'Reserve your spot now'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              disabled={isRegistering}
              className={getFieldError('name') ? 'border-red-500' : ''}
            />
            {getFieldError('name') && (
              <p className="text-sm text-red-600 mt-1">{getFieldError('name')}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              disabled={isRegistering}
              className={getFieldError('email') ? 'border-red-500' : ''}
            />
            {getFieldError('email') && (
              <p className="text-sm text-red-600 mt-1">{getFieldError('email')}</p>
            )}
          </div>

          <div>
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              name="company"
              type="text"
              value={formData.company}
              onChange={handleChange}
              placeholder="Acme Inc."
              disabled={isRegistering}
            />
          </div>

          <div>
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input
              id="jobTitle"
              name="jobTitle"
              type="text"
              value={formData.jobTitle}
              onChange={handleChange}
              placeholder="Software Engineer"
              disabled={isRegistering}
            />
          </div>

          {errors.find((e) => e.field === 'general') && (
            <Alert variant="destructive">
              <AlertDescription>
                {errors.find((e) => e.field === 'general')?.message}
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isRegistering}>
            {isRegistering && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isRegistering ? 'Registering...' : 'Complete Registration'}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            By registering, you agree to receive webinar-related emails.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
