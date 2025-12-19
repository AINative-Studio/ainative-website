import { SVGProps } from 'react';
import { IconBase } from '../IconBase';

/**
 * TrendingUp Icon - Growth/trending dashboard
 *
 * @usage
 * ```tsx
 * <TrendingUpIcon className="h-5 w-5 text-green-500" />
 * ```
 */
export function TrendingUpIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </IconBase>
  );
}
