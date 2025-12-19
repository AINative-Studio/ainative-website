import { SVGProps } from 'react';
import { IconBase } from '../IconBase';

/**
 * Warning Icon - Warning/caution status
 *
 * @usage
 * ```tsx
 * <WarningIcon className="h-5 w-5 text-yellow-500" />
 * ```
 */
export function WarningIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </IconBase>
  );
}
