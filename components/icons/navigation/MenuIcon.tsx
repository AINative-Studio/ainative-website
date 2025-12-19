import { SVGProps } from 'react';
import { IconBase } from '../IconBase';

/**
 * Menu Icon - Hamburger menu icon
 *
 * @usage
 * ```tsx
 * <MenuIcon className="h-6 w-6 text-gray-700" />
 * ```
 */
export function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </IconBase>
  );
}
