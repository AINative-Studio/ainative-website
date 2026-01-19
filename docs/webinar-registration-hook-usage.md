# Webinar Registration Hook - Usage Guide

## Overview

The `useWebinarRegistration` hook provides comprehensive state management for webinar registration with Zod validation, Luma API integration, and email confirmation.

## Installation

Zod is already installed in this project.

```bash
npm install zod  # Already installed
```

## Basic Usage

```tsx
import { useWebinarRegistration } from '@/hooks/useWebinarRegistration';
import { Webinar } from '@/lib/webinarAPI';

function WebinarRegistrationForm({ webinar }: { webinar: Webinar }) {
  const {
    register,
    isRegistering,
    isRegistered,
    errors,
    downloadCalendar,
    validate,
  } = useWebinarRegistration(webinar);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = {
      name: 'John Doe',
      email: 'john@example.com',
      company: 'Acme Inc',
      jobTitle: 'Developer',
      questions: 'What topics will be covered?',
    };

    const result = await register(formData);

    if (result.success) {
      console.log('Registration successful!', result.data);
    }
  };

  if (isRegistered) {
    return (
      <div>
        <h2>You're Registered!</h2>
        <button onClick={downloadCalendar}>
          Download Calendar
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {errors.map(error => (
        <div key={error.field}>{error.message}</div>
      ))}
      {/* Form fields */}
      <button type="submit" disabled={isRegistering}>
        {isRegistering ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}
```

## Hook Return Values

### Functions

- **`register(formData: RegistrationFormData): Promise<RegistrationResult>`**
  - Validates form data with Zod
  - Submits registration to Luma API
  - Sends confirmation email
  - Auto-downloads calendar file
  - Returns success/error result

- **`downloadCalendar(): Promise<void>`**
  - Manually download calendar file
  - Fetches ICS file from `/api/webinars/{id}/calendar`

- **`validate(data: RegistrationFormData): SafeParseReturnType`**
  - Zod safeParse validation
  - Returns validation result without submitting

- **`validateForm(data: RegistrationFormData): RegistrationError[]`**
  - Returns array of field-specific errors
  - Empty array if validation passes

- **`reset(): void`**
  - Reset all state to initial values

### State

- **`isRegistering: boolean`**
  - True while registration is in progress

- **`isRegistered: boolean`**
  - True after successful registration

- **`errors: RegistrationError[]`**
  - Array of validation/registration errors
  - Each error has `field` and `message`

- **`registrationData: RegistrationFormData | null`**
  - Form data from successful registration

### Utility Values

- **`isFull: boolean`**
  - True if webinar is at max capacity

- **`spotsRemaining: number | null`**
  - Number of available spots
  - Null if unlimited

- **`registrationStatus: 'open' | 'limited' | 'full'`**
  - 'open': plenty of spots available
  - 'limited': 10 or fewer spots remaining
  - 'full': no spots available

## Validation Schema

```typescript
const registrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  questions: z.string().optional(),
});
```

## Form Validation Example

```tsx
import { registrationSchema } from '@/hooks/useWebinarRegistration';

function RegistrationForm() {
  const { register, validate, errors } = useWebinarRegistration(webinar);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    jobTitle: '',
    questions: '',
  });

  const handleChange = (field: string, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    // Real-time validation
    const result = validate(updated);
    if (!result.success) {
      console.log('Validation errors:', result.error.errors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await register(formData);

    if (result.success) {
      console.log('Registered!', result.data?.confirmationNumber);
    } else {
      console.error('Errors:', result.errors);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        required
      />
      {errors.find(e => e.field === 'name')?.message}

      <input
        type="email"
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
        required
      />
      {errors.find(e => e.field === 'email')?.message}

      {/* Additional fields */}

      <button type="submit" disabled={isRegistering}>
        Register
      </button>
    </form>
  );
}
```

## Error Handling

```tsx
function RegistrationForm() {
  const { register, errors } = useWebinarRegistration(webinar);

  // Field-specific errors
  const nameError = errors.find(e => e.field === 'name');
  const emailError = errors.find(e => e.field === 'email');
  const generalError = errors.find(e => e.field === 'general');

  return (
    <form>
      {generalError && (
        <div className="error">{generalError.message}</div>
      )}

      <input name="name" />
      {nameError && <span>{nameError.message}</span>}

      <input name="email" />
      {emailError && <span>{emailError.message}</span>}
    </form>
  );
}
```

## Registration Status Display

```tsx
function RegistrationStatus() {
  const { registrationStatus, spotsRemaining, isFull } = useWebinarRegistration(webinar);

  if (isFull) {
    return <div className="error">This webinar is full</div>;
  }

  if (registrationStatus === 'limited') {
    return (
      <div className="warning">
        Only {spotsRemaining} spots remaining!
      </div>
    );
  }

  return <div className="success">Registration open</div>;
}
```

## API Endpoints

### Email Confirmation

**Endpoint:** `POST /api/webinars/send-confirmation`

**Request:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "webinarId": "webinar-123",
  "webinarTitle": "AI Native Workshop",
  "webinarDate": "2026-02-15T14:00:00Z",
  "registrationId": "REG-123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Confirmation email sent successfully"
}
```

### Calendar Export

**Endpoint:** `GET /api/webinars/{id}/calendar`

**Response:**
- Content-Type: `text/calendar; charset=utf-8`
- Content-Disposition: `attachment; filename="webinar-{id}.ics"`
- Body: ICS calendar file

## Testing

Run the comprehensive test script:

```bash
./test/issue-339-webinar-registration-hook.test.sh
```

Tests validate:
- Zod schema implementation
- Luma API integration
- Email confirmation flow
- Calendar export functionality
- Error handling
- TypeScript types

## Integration Notes

### Luma API

The hook uses the existing Luma API proxy at `/api/luma/[...path]/route.ts` which handles:
- API key authentication
- Rate limiting
- Request proxying
- Error handling

### Email Service

The confirmation email endpoint at `/app/api/webinars/send-confirmation/route.ts` includes a TODO for email service integration. Integrate with your preferred email service (SendGrid, Resend, Postmark, etc.).

### Calendar Generation

Calendar files are generated using the `generateICalFile` function from `/lib/calendarGenerator.ts`, which creates RFC 5545 compliant iCalendar files.

## TypeScript Types

```typescript
interface RegistrationFormData {
  name: string;
  email: string;
  company?: string;
  jobTitle?: string;
  questions?: string;
}

interface RegistrationError {
  field: string;
  message: string;
}

interface RegistrationResult {
  success: boolean;
  errors?: RegistrationError[];
  data?: {
    confirmationNumber?: string;
    registrationId?: string;
    message?: string;
  };
}
```

## Best Practices

1. **Always validate before submission**
   ```tsx
   const result = validate(formData);
   if (!result.success) {
     // Show errors
     return;
   }
   await register(formData);
   ```

2. **Handle loading states**
   ```tsx
   <button disabled={isRegistering}>
     {isRegistering ? 'Registering...' : 'Register'}
   </button>
   ```

3. **Show success state**
   ```tsx
   {isRegistered && (
     <div>
       <h2>You're Registered!</h2>
       <button onClick={downloadCalendar}>
         Add to Calendar
       </button>
     </div>
   )}
   ```

4. **Display field-specific errors**
   ```tsx
   {errors.map(error => (
     <div key={error.field} className="error">
       {error.message}
     </div>
   ))}
   ```

5. **Check registration status before showing form**
   ```tsx
   {isFull ? (
     <div>This webinar is full</div>
   ) : (
     <RegistrationForm />
   )}
   ```
