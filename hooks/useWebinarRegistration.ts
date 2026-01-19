/**
 * Enhanced webinar registration hook
 * Handles registration state, Zod validation, Luma API integration, and email confirmation
 */

import { useState, useCallback } from 'react';
import { z } from 'zod';
import { Webinar } from '@/lib/webinarAPI';
import { generateICalFile, downloadICalFile, CalendarEventData } from '@/lib/calendarGenerator';

// Zod schema for form validation
export const registrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  questions: z.string().optional(),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

export interface RegistrationError {
  field: string;
  message: string;
}

export interface RegistrationResult {
  success: boolean;
  errors?: RegistrationError[];
  data?: {
    confirmationNumber?: string;
    registrationId?: string;
    message?: string;
  };
}

export function useWebinarRegistration(webinar: Webinar) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [errors, setErrors] = useState<RegistrationError[]>([]);
  const [registrationData, setRegistrationData] = useState<RegistrationFormData | null>(null);

  /**
   * Validate form data with Zod
   */
  const validateForm = useCallback((data: RegistrationFormData): RegistrationError[] => {
    const result = registrationSchema.safeParse(data);

    if (!result.success) {
      return result.error.errors.map(err => ({
        field: err.path[0] as string,
        message: err.message,
      }));
    }

    return [];
  }, []);

  /**
   * Register for webinar with Luma API integration
   */
  const register = useCallback(
    async (formData: RegistrationFormData): Promise<RegistrationResult> => {
      setIsRegistering(true);
      setErrors([]);

      try {
        // Validate with Zod
        const validationErrors = validateForm(formData);
        if (validationErrors.length > 0) {
          setErrors(validationErrors);
          setIsRegistering(false);
          return { success: false, errors: validationErrors };
        }

        // Check if webinar is full
        if (
          webinar.max_attendees !== undefined &&
          webinar.max_attendees > 0 &&
          (webinar.current_attendees ?? 0) >= webinar.max_attendees
        ) {
          const error: RegistrationError = {
            field: 'general',
            message: 'This webinar is full. Please join the waitlist.',
          };
          setErrors([error]);
          setIsRegistering(false);
          return { success: false, errors: [error] };
        }

        // Register via Luma API proxy
        const response = await fetch(`/api/luma/events/${webinar.id}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || 'Registration failed');
        }

        const result = await response.json();
        const registrationId = result.id || result.confirmationNumber || `REG-${Date.now()}`;

        // Send confirmation email
        try {
          await fetch('/api/webinars/send-confirmation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: formData.email,
              name: formData.name,
              webinarId: webinar.id,
              webinarTitle: webinar.title,
              webinarDate: webinar.date,
              registrationId,
            }),
          });
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
          // Don't fail registration if email fails
        }

        // Update state
        setIsRegistered(true);
        setRegistrationData(formData);

        // Auto-download calendar file
        try {
          const calendarData: CalendarEventData = {
            title: webinar.title,
            description: webinar.description,
            startDate: new Date(webinar.date),
            duration: webinar.duration,
            location: webinar.meeting_url || 'Online',
            url: webinar.meeting_url,
            organizer: webinar.speaker
              ? {
                  name: webinar.speaker.name,
                  email: 'events@ainative.io',
                }
              : undefined,
          };

          const icsContent = generateICalFile(calendarData);
          downloadICalFile(icsContent, `webinar-${webinar.slug || webinar.id}.ics`);
        } catch (calendarError) {
          console.error('Error generating calendar file:', calendarError);
          // Don't fail registration if calendar generation fails
        }

        return {
          success: true,
          data: {
            registrationId,
            confirmationNumber: registrationId,
            message: 'Registration successful! Check your email for confirmation.',
          },
        };
      } catch (error) {
        console.error('Registration error:', error);
        const generalError: RegistrationError = {
          field: 'general',
          message: error instanceof Error ? error.message : 'Registration failed. Please try again.',
        };
        setErrors([generalError]);
        return { success: false, errors: [generalError] };
      } finally {
        setIsRegistering(false);
      }
    },
    [webinar, validateForm]
  );

  /**
   * Download calendar file manually
   */
  const downloadCalendar = useCallback(async () => {
    try {
      const response = await fetch(`/api/webinars/${webinar.id}/calendar`);

      if (!response.ok) {
        throw new Error('Failed to generate calendar file');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `webinar-${webinar.slug || webinar.id}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading calendar file:', error);
      throw error;
    }
  }, [webinar.id, webinar.slug]);

  /**
   * Check if webinar is full
   */
  const isFull = useCallback(() => {
    return (
      webinar.max_attendees !== undefined &&
      webinar.max_attendees > 0 &&
      (webinar.current_attendees ?? 0) >= webinar.max_attendees
    );
  }, [webinar]);

  /**
   * Get remaining spots
   */
  const getSpotsRemaining = useCallback(() => {
    if (webinar.max_attendees === undefined || webinar.max_attendees === 0) {
      return null;
    }
    return Math.max(0, webinar.max_attendees - (webinar.current_attendees ?? 0));
  }, [webinar]);

  /**
   * Get registration status
   */
  const getRegistrationStatus = useCallback(() => {
    if (isFull()) {
      return 'full';
    }

    const spotsRemaining = getSpotsRemaining();
    if (spotsRemaining !== null && spotsRemaining <= 10) {
      return 'limited';
    }

    return 'open';
  }, [isFull, getSpotsRemaining]);

  /**
   * Reset registration state
   */
  const reset = useCallback(() => {
    setIsRegistering(false);
    setIsRegistered(false);
    setErrors([]);
    setRegistrationData(null);
  }, []);

  /**
   * Validate a single field or entire form
   */
  const validate = useCallback((data: RegistrationFormData) => {
    return registrationSchema.safeParse(data);
  }, []);

  return {
    register,
    downloadCalendar,
    isRegistering,
    isRegistered,
    errors,
    registrationData,
    isFull: isFull(),
    spotsRemaining: getSpotsRemaining(),
    registrationStatus: getRegistrationStatus(),
    reset,
    validate,
    validateForm,
  };
}
