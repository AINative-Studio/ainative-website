import { SVGProps } from 'react';
import { IconBase } from '../IconBase';

/**
 * Check Icon - Success/complete status
 *
 * @usage
 * ```tsx
 * <CheckIcon className="h-5 w-5 text-green-500" />
 * ```
 */
export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <polyline points="20 6 9 17 4 12" />
    </IconBase>
  );
}
