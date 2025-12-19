import { SVGProps } from 'react';
import { IconBase } from '../IconBase';

/**
 * Home Icon - Home/dashboard navigation
 *
 * @usage
 * ```tsx
 * <HomeIcon className="h-5 w-5 text-primary" />
 * ```
 */
export function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </IconBase>
  );
}
