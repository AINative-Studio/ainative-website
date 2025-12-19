import { SVGProps } from 'react';
import { IconBase } from '../IconBase';

/**
 * ChevronDown Icon - Dropdown indicator
 *
 * @usage
 * ```tsx
 * <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
 * ```
 */
export function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <polyline points="6 9 12 15 18 9" />
    </IconBase>
  );
}
