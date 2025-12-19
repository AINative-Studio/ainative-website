import { SVGProps } from 'react';
import { IconBase } from '../IconBase';

/**
 * ChartBar Icon - Analytics/metrics dashboard
 *
 * @usage
 * ```tsx
 * <ChartBarIcon className="h-5 w-5 text-blue-500" />
 * ```
 */
export function ChartBarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </IconBase>
  );
}
