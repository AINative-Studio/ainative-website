import { SVGProps } from 'react';
import { IconBase } from '../IconBase';

/**
 * Users Icon - Users/team dashboard
 *
 * @usage
 * ```tsx
 * <UsersIcon className="h-5 w-5 text-blue-400" />
 * ```
 */
export function UsersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </IconBase>
  );
}
