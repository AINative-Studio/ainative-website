/**
 * Custom hook for webinar registration
 * Handles registration state, validation, and submission
 */

import { useState, useCallback } from 'react';
import { registerForWebinar, Webinar } from '@/lib/webinarAPI';
import { generateICalFile, downloadICalFile, CalendarEventData } from '@/lib/calendarGenerator';

export interface RegistrationFormData {
  name: string;
  email: string;
  company?: string;
  jobTitle?: string;
}

export interface RegistrationError {
  field: string;
  message: string;
}

export function useWebinarRegistration(webinar: Webinar) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [errors, setErrors] = useState<RegistrationError[]>([]);
  const [registrationData, setRegistrationData] = useState<RegistrationFormData | null>(null);

  const validateForm = useCallback((data: RegistrationFormData): RegistrationError[] => {
    const errors: RegistrationError[] = [];

    if (!data.name || data.name.trim().length < 2) {
      errors.push({
        field: 'name',
        message: 'Please enter your full name',
      });
    }

    if (!data.email || !isValidEmail(data.email)) {
      errors.push({
        field: 'email',
        message: 'Please enter a valid email address',
      });
    }

    return errors;
  }, []);

  const register = useCallback(
    async (formData: RegistrationFormData) => {
      setIsRegistering(true);
      setErrors([]);

      try {
        const validationErrors = validateForm(formData);
        if (validationErrors.length > 0) {
          setErrors(validationErrors);
          setIsRegistering(false);
          return { success: false, errors: validationErrors };
        }

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

        const result = await registerForWebinar(webinar.id, formData);

        if (result.success) {
          setIsRegistered(true);
          setRegistrationData(formData);

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

          try {
            const icsContent = await generateICalFile(calendarData);
            downloadICalFile(icsContent, `webinar-${webinar.slug}.ics`);
          } catch (error) {
            console.error('Error generating calendar file:', error);
          }

          return { success: true, data: result };
        }

        return { success: false };
      } catch (error) {
        console.error('Registration error:', error);
        const generalError: RegistrationError = {
          field: 'general',
          message: 'Registration failed. Please try again.',
        };
        setErrors([generalError]);
        return { success: false, errors: [generalError] };
      } finally {
        setIsRegistering(false);
      }
    },
    [webinar, validateForm]
  );

  const isFull = useCallback(() => {
    return (
      webinar.max_attendees !== undefined &&
      webinar.max_attendees > 0 &&
      (webinar.current_attendees ?? 0) >= webinar.max_attendees
    );
  }, [webinar]);

  const getSpotsRemaining = useCallback(() => {
    if (webinar.max_attendees === undefined || webinar.max_attendees === 0) {
      return null;
    }
    return Math.max(0, webinar.max_attendees - (webinar.current_attendees ?? 0));
  }, [webinar]);

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

  const reset = useCallback(() => {
    setIsRegistering(false);
    setIsRegistered(false);
    setErrors([]);
    setRegistrationData(null);
  }, []);

  return {
    register,
    isRegistering,
    isRegistered,
    errors,
    registrationData,
    isFull: isFull(),
    spotsRemaining: getSpotsRemaining(),
    registrationStatus: getRegistrationStatus(),
    reset,
  };
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
