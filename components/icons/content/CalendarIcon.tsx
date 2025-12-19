import { SVGProps } from 'react';
import { IconBase } from '../IconBase';

/**
 * Calendar Icon - Date/calendar content
 *
 * @usage
 * ```tsx
 * <CalendarIcon className="h-4 w-4 text-muted-foreground" />
 * ```
 */
export function CalendarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </IconBase>
  );
}
