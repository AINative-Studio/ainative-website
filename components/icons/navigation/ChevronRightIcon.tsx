import { SVGProps } from 'react';
import { IconBase } from '../IconBase';

/**
 * ChevronRight Icon - Forward navigation
 *
 * @usage
 * ```tsx
 * <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
 * ```
 */
export function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <polyline points="9 18 15 12 9 6" />
    </IconBase>
  );
}
