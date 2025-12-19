import { SVGProps } from 'react';
import { IconBase } from '../IconBase';

/**
 * Eye Icon - View/visibility content
 *
 * @usage
 * ```tsx
 * <EyeIcon className="h-4 w-4 text-muted-foreground" />
 * ```
 */
export function EyeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </IconBase>
  );
}
