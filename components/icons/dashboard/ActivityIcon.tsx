import { SVGProps } from 'react';
import { IconBase } from '../IconBase';

/**
 * Activity Icon - Activity/pulse dashboard
 *
 * @usage
 * ```tsx
 * <ActivityIcon className="h-5 w-5 text-purple-500" />
 * ```
 */
export function ActivityIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </IconBase>
  );
}
