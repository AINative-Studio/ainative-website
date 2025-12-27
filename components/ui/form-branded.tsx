import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  error?: string;
  success?: string;
}

const FormSection = React.forwardRef<HTMLDivElement, FormSectionProps>(
  ({ className, title, description, error, success, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'w-full rounded-lg border border-[#31395a] bg-[#131726] p-6 shadow-lg',
          className
        )}
        {...props}
      >
        {(title || description) && (
          <div className="mb-6">
            {title && (
              <h3 className="text-lg font-semibold text-white mb-2">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}

        {children}

        {error && (
          <div
            className="mt-4 p-3 rounded-md bg-red-400/10 border border-red-400/20"
            role="alert"
            aria-live="polite"
          >
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div
            className="mt-4 p-3 rounded-md bg-green-400/10 border border-green-400/20"
            role="status"
            aria-live="polite"
          >
            <p className="text-sm text-green-400">{success}</p>
          </div>
        )}
      </div>
    );
  }
);
FormSection.displayName = 'FormSection';

export { FormSection };
