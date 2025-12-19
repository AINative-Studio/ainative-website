import { SVGProps } from 'react';
import { IconBase } from '../IconBase';

/**
 * Error Icon - Error/failure status
 *
 * @usage
 * ```tsx
 * <ErrorIcon className="h-5 w-5 text-red-500" />
 * ```
 */
export function ErrorIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </IconBase>
  );
}
