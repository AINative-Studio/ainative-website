import { SVGProps } from 'react';
import { IconBase } from '../IconBase';

/**
 * Info Icon - Information status
 *
 * @usage
 * ```tsx
 * <InfoIcon className="h-5 w-5 text-blue-500" />
 * ```
 */
export function InfoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </IconBase>
  );
}
