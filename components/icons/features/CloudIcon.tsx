import { SVGProps } from 'react';
import { IconBase } from '../IconBase';

/**
 * Cloud Icon - Cloud services feature
 *
 * @usage
 * ```tsx
 * <CloudIcon className="h-6 w-6 text-blue-400" />
 * ```
 */
export function CloudIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    </IconBase>
  );
}
