import { SVGProps } from 'react';
import { IconBase } from '../IconBase';

/**
 * Database Icon - Database/storage feature
 *
 * @usage
 * ```tsx
 * <DatabaseIcon className="h-6 w-6 text-purple-500" />
 * ```
 */
export function DatabaseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </IconBase>
  );
}
